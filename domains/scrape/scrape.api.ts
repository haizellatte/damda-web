import { API_ROUTES } from "@/lib/config";
import ko from "@/locales/ko.json";
import type { ApiResponse, ScrapeResult } from "@/types";

export const scrapeUrl = async (url: string): Promise<ScrapeResult> => {
  const response = await fetch(`${API_ROUTES.SCRAPE}?url=${encodeURIComponent(url)}`);

  if (!response.ok) {
    const result: ApiResponse<null> = await response.json().catch(() => ({
      ok: false,
      error: ko.api.scrape.failed,
    }));
    throw new Error(result.ok === false ? result.error : ko.api.scrape.failed);
  }

  const result: ApiResponse<ScrapeResult> = await response.json();

  if (!result.ok) {
    throw new Error(result.error);
  }

  return result.data;
};
