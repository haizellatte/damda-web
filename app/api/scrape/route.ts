import { NextRequest, NextResponse } from "next/server";
import * as cheerio from "cheerio";
import { SCRAPE_TIMEOUT_MS } from "@/lib/config";
import { extractMallKey } from "@/lib/format";
import ko from "@/locales/ko.json";
import type { ApiResponse, ScrapeResult } from "@/types";

const msg = ko.api.scrape;

// ─── 앱 전용 링크 패턴 감지 ────────────────────────────────────────────────────
// NOTE: applink.a-bly.com 은 현재 앱 딥링크이지만 향후 하이브리드 앱에서 처리 예정.
//       지금은 사전 차단 없이 fetch를 시도하고, 딥링크 리다이렉트 오류 시 catch에서 처리.

// ─── 스크래핑 전 URL 정제 (앱 유도 파라미터 제거) ────────────────────────────────

const APP_QUERY_PARAMS = ["applanding", "app_redirect", "from_app", "mapp", "app"];

const cleanFetchUrl = (url: string): string => {
  try {
    const u = new URL(url);
    APP_QUERY_PARAMS.forEach((p) => u.searchParams.delete(p));
    return u.toString();
  } catch {
    return url;
  }
};

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

const resolveUrl = (base: string, src: string | null | undefined): string | null => {
  if (!src || src.trim() === "") return null;
  if (src.startsWith("//")) return `https:${src}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  try {
    return new URL(src, base).toString();
  } catch {
    return null;
  }
};

const isWconceptHost = (hostname: string): boolean => {
  const h = hostname.toLowerCase();
  return h === "wconcept.co.kr" || h.endsWith(".wconcept.co.kr");
};

type WconceptItemJson = {
  FinalPrice?: number;
  CustomerPrice?: number;
  SalePrice?: number;
  ItemName?: string;
  BrandNameKr?: string;
  CategoryDepthname1?: string;
  CategoryDepthname2?: string;
  CategoryDepthname3?: string;
};

/** W컨셉 PC/모바일 — og:title 이 "[W CONCEPT]" 로만 오는 경우가 많아 GA 히든 필드·설명 메타를 사용 */
const extractWconceptProduct = (
  $: ReturnType<typeof cheerio.load>,
): { title: string | null; base_price: number | null; retail_category: string | null } => {
  const ogDesc = $(`meta[property="og:description"]`).attr("content")?.trim() ?? null;
  let title: string | null = ogDesc && ogDesc.length > 0 ? ogDesc : null;
  let base_price: number | null = null;
  let retail_category: string | null = null;

  const gaInput = $('input[name^="GA4ItemObj_"]').first();
  const rawJson = gaInput.attr("value");
  if (rawJson) {
    try {
      const j = JSON.parse(rawJson) as WconceptItemJson;
      const crumbs = [j.CategoryDepthname1, j.CategoryDepthname2, j.CategoryDepthname3].filter(
        (x): x is string => typeof x === "string" && x.trim() !== "",
      );
      if (crumbs.length) retail_category = crumbs.join(" > ");
      const fromJson = [j.BrandNameKr, j.ItemName].filter(Boolean).join(" ").trim();
      if (fromJson) title = fromJson;
      const fp = j.FinalPrice ?? j.CustomerPrice ?? j.SalePrice;
      if (typeof fp === "number" && !Number.isNaN(fp)) base_price = Math.round(fp);
    } catch {
      /* ignore */
    }
  }

  if (base_price == null) {
    const sale = $('input[name="saleprice"]').attr("value");
    if (sale) {
      const n = parseInt(sale, 10);
      if (!Number.isNaN(n)) base_price = n;
    }
  }

  if (!title || /^\[?\s*W\s*CONCEPT\s*\]?$/i.test(title.replace(/\s+/g, " ").trim())) {
    title = ogDesc;
  }

  return { title, base_price, retail_category };
};

const extractJsonLdProduct = (
  $: ReturnType<typeof cheerio.load>,
): Record<string, unknown> | null => {
  const scripts = $('script[type="application/ld+json"]');
  for (let i = 0; i < scripts.length; i++) {
    try {
      const raw = JSON.parse($(scripts[i]).text()) as unknown;
      const items: unknown[] = Array.isArray(raw) ? raw : [raw];
      for (const item of items) {
        if (!item || typeof item !== "object") continue;
        const r = item as Record<string, unknown>;
        if (Array.isArray(r["@graph"])) {
          const found = (r["@graph"] as unknown[]).find(
            (n) =>
              n && typeof n === "object" && (n as Record<string, unknown>)["@type"] === "Product",
          );
          if (found) return found as Record<string, unknown>;
        }
        if (r["@type"] === "Product") return r;
      }
    } catch { /* ignore */ }
  }
  return null;
};

const extractPriceFromJsonLd = (product: Record<string, unknown>): number | null => {
  const offers = product.offers;
  if (!offers) return null;
  const offer = (Array.isArray(offers) ? offers[0] : offers) as Record<string, unknown> | null;
  if (!offer) return null;
  const raw = offer.price ?? offer.lowPrice ?? offer.highPrice;
  if (raw == null) return null;
  const n = parseFloat(String(raw).replace(/[^0-9.]/g, ""));
  return Number.isNaN(n) ? null : n;
};

const extractImageFromJsonLd = (
  product: Record<string, unknown>,
  base: string,
): string | null => {
  const image = product.image;
  if (!image) return null;
  if (typeof image === "string") return resolveUrl(base, image);
  if (Array.isArray(image) && image.length > 0) return resolveUrl(base, String(image[0]));
  if (typeof image === "object") return resolveUrl(base, (image as Record<string, unknown>).url as string);
  return null;
};

// ─── GET /api/scrape ──────────────────────────────────────────────────────────

export const GET = async (req: NextRequest) => {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: msg.url_required },
      { status: 400 },
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: msg.invalid_url },
      { status: 400 },
    );
  }

  // URL 정제 (앱 유도 파라미터 제거 — W컨셉 ?applanding=Y 등)
  const fetchUrl = cleanFetchUrl(url);

  let html = "";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), SCRAPE_TIMEOUT_MS);

    const response = await fetch(fetchUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        "Accept-Encoding": "gzip, deflate, br",
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
        "Sec-Ch-Ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "none",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        Referer: `https://${parsedUrl.hostname}/`,
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json<ApiResponse<null>>(
        { ok: false, error: `${msg.http_error} (HTTP ${response.status})` },
        { status: 400 },
      );
    }

    html = await response.text();
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        return NextResponse.json<ApiResponse<null>>(
          { ok: false, error: msg.timeout },
          { status: 408 },
        );
      }
      // TypeError: URL scheme not supported — 앱 딥링크 리다이렉트 (예: ably://)
      if (
        error.name === "TypeError" ||
        error.message.includes("fetch failed") ||
        error.message.includes("scheme") ||
        error.message.includes("Invalid URL")
      ) {
        return NextResponse.json<ApiResponse<null>>(
          { ok: false, error: msg.app_link_error },
          { status: 400 },
        );
      }
    }
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: msg.request_error },
      { status: 500 },
    );
  }

  // ── Cloudflare 봇 챌린지 감지 ─────────────────────────────────────────────
  const isBotChallenge =
    html.includes("cf-browser-verification") ||
    html.includes("_cf_chl_opt") ||
    html.includes("Just a moment") ||
    (html.length < 3000 && html.includes("challenge"));

  if (isBotChallenge) {
    return NextResponse.json<ApiResponse<null>>(
      { ok: false, error: msg.bot_blocked },
      { status: 403 },
    );
  }

  const $ = cheerio.load(html);

  const og = (prop: string) => $(`meta[property="${prop}"]`).attr("content")?.trim() ?? null;
  const metaName = (name: string) => $(`meta[name="${name}"]`).attr("content")?.trim() ?? null;

  const jsonLdProduct = extractJsonLdProduct($);
  const jsonLdPrice = jsonLdProduct ? extractPriceFromJsonLd(jsonLdProduct) : null;
  const jsonLdImage = jsonLdProduct ? extractImageFromJsonLd(jsonLdProduct, url) : null;
  const jsonLdTitle = jsonLdProduct
    ? (jsonLdProduct.name as string | undefined)?.trim() ?? null
    : null;

  const h1Text = $("h1").first().text().trim();
  const titleTagText = $("title").text().trim();

  const title =
    jsonLdTitle ??
    og("og:title") ??
    metaName("twitter:title") ??
    (h1Text || null) ??
    titleTagText ??
    "";

  const rawImage =
    og("og:image:secure_url") ??
    og("og:image") ??
    metaName("twitter:image") ??
    metaName("twitter:image:src") ??
    $('meta[name="og:image"]').attr("content")?.trim() ??
    null;

  const image_url = resolveUrl(url, rawImage) ?? resolveUrl(url, jsonLdImage);

  const priceRaw =
    og("product:price:amount") ??
    og("og:price:amount") ??
    og("product:sale_price:amount") ??
    metaName("price") ??
    metaName("product:price") ??
    null;

  const metaPrice = priceRaw
    ? parseFloat(priceRaw.replace(/[^0-9.]/g, "")) || null
    : null;

  let base_price = metaPrice ?? jsonLdPrice;
  let finalTitle = title;
  let retail_category: string | null = null;

  if (isWconceptHost(parsedUrl.hostname)) {
    const w = extractWconceptProduct($);
    if (w.retail_category) retail_category = w.retail_category;
    if (w.title && w.title.trim()) finalTitle = w.title.trim();
    if (w.base_price != null) base_price = w.base_price;
  }

  const mall_name = extractMallKey(url);

  const result: ScrapeResult = {
    title: finalTitle,
    image_url,
    mall_name,
    base_price,
    retail_category,
  };

  if (process.env.NODE_ENV === "development") {
    console.log("[scrape]", fetchUrl, {
      title: finalTitle,
      image_url: !!image_url,
      base_price,
      retail_category,
    });
  }

  return NextResponse.json<ApiResponse<ScrapeResult>>({ ok: true, data: result });
};
