"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, ChevronLeft, ShoppingBag, AlertCircle } from "lucide-react";
import { useScrapeUrl } from "@/domains/scrape/scrape.hook";
import { useAddProduct } from "@/domains/products/products.hook";
import {
  scrapeUrlSchema,
  addProductSchema,
  type ScrapeUrlFormData,
  type AddProductFormData,
} from "@/schemas/product.schema";
import { MALL_NAMES } from "@/lib/config";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import type { ScrapeResult } from "@/types";

type Step = "url" | "preview";

type AddProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AddProductModal = ({ isOpen, onClose }: AddProductModalProps) => {
  const [step, setStep] = useState<Step>("url");
  const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
  const [imgError, setImgError] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { mutateAsync: scrape, isPending: isScraping, error: scrapeError } = useScrapeUrl();
  const { mutateAsync: addProduct, isPending: isSaving } = useAddProduct();

  const urlForm = useForm<ScrapeUrlFormData>({
    resolver: zodResolver(scrapeUrlSchema),
  });

  const previewForm = useForm<AddProductFormData>({
    resolver: zodResolver(addProductSchema),
  });

  /* 다음 오픈을 위해 닫힐 때 상태 초기화 — effect 안 setState 불필요 */
  const resetState = useCallback(() => {
    setStep("url");
    setScrapeResult(null);
    setImgError(false);
    setSaveError(null);
    setPartialWarning(null);
    urlForm.reset();
    previewForm.reset();
  }, [urlForm, previewForm]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isScraping || isSaving) return;
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) handleClose();
  };

  const [partialWarning, setPartialWarning] = useState<string | null>(null);

  const handleUrlSubmit = urlForm.handleSubmit(async ({ url }) => {
    setPartialWarning(null);
    try {
      const result = await scrape(url);
      setScrapeResult(result);
      setImgError(false);

      // 부분 스크래핑 감지 — 제목이 비어있거나 가격/이미지가 없으면 안내
      const missing: string[] = [];
      if (!result.title) missing.push("상품명");
      if (!result.image_url) missing.push("이미지");
      if (result.base_price == null) missing.push("가격");
      if (missing.length > 0) {
        setPartialWarning(`${missing.join(", ")} 정보를 가져오지 못했어요. 직접 입력해주세요.`);
      }

      previewForm.reset({
        url,
        title: result.title,
        image_url: result.image_url ?? "",
        mall_name: result.mall_name ?? "",
        base_price: result.base_price ?? undefined,
      });
      setStep("preview");
    } catch {
      // 에러는 scrapeError에서 처리됨
    }
  });

  const handlePreviewSubmit = previewForm.handleSubmit(async (data) => {
    setSaveError(null);
    try {
      await addProduct({
        url: data.url,
        title: data.title,
        image_url: data.image_url || null,
        mall_name: data.mall_name || null,
        category_id: data.category_id ?? null,
        base_price: data.base_price ?? null,
        retail_category: scrapeResult?.retail_category ?? null,
      });
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    }
  });

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-end bg-black/50 backdrop-blur-sm"
    >
      <div
        className="w-full max-h-[90dvh] overflow-y-auto rounded-t-2xl bg-card"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-border" />
        </div>

        {step === "url" ? (
          <UrlStep
            form={urlForm}
            onSubmit={handleUrlSubmit}
            onClose={handleClose}
            isLoading={isScraping}
            error={scrapeError?.message}
          />
        ) : (
          <PreviewStep
            form={previewForm}
            scrapeResult={scrapeResult}
            imgError={imgError}
            onImgError={() => setImgError(true)}
            onSubmit={handlePreviewSubmit}
            onBack={() => setStep("url")}
            isLoading={isSaving}
            error={saveError}
            warning={partialWarning}
          />
        )}
      </div>
    </div>
  );
};

// ─── URL 입력 스텝 ────────────────────────────────────────────────────────────

type UrlStepProps = {
  form: ReturnType<typeof useForm<ScrapeUrlFormData>>;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  isLoading: boolean;
  error?: string;
};

const UrlStep = ({ form, onSubmit, onClose, isLoading, error }: UrlStepProps) => {
  const { register, formState: { errors } } = form;

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-2">
      <div className="flex items-center justify-between">
        <h2 id="modal-title" className="text-lg font-semibold text-foreground">
          URL로 상품 담기
        </h2>
        <button
          type="button"
          aria-label="닫기"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface"
        >
          <X size={18} />
        </button>
      </div>

      <p className="text-sm text-foreground-muted">
        쇼핑몰 상품 페이지의 URL을 붙여넣으면 상품 정보를 자동으로 가져와요.
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="상품 URL"
          placeholder="https://www.musinsa.com/..."
          error={errors.url?.message}
          disabled={isLoading}
          autoFocus
          {...register("url")}
        />
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive-subtle p-3 text-sm text-destructive">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" variant="primary" fullWidth loading={isLoading} disabled={isLoading}>
          {isLoading ? "상품 정보 가져오는 중..." : "상품 정보 가져오기"}
        </Button>
      </form>
    </div>
  );
};

// ─── 미리보기 스텝 ─────────────────────────────────────────────────────────────

type PreviewStepProps = {
  form: ReturnType<typeof useForm<AddProductFormData>>;
  scrapeResult: ScrapeResult | null;
  imgError: boolean;
  onImgError: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
  isLoading: boolean;
  error?: string | null;
  warning?: string | null;
};

const PreviewStep = ({
  form,
  scrapeResult,
  imgError,
  onImgError,
  onSubmit,
  onBack,
  isLoading,
  error,
  warning,
}: PreviewStepProps) => {
  const { register, formState: { errors } } = form;

  const mallLabel = scrapeResult?.mall_name
    ? (MALL_NAMES[scrapeResult.mall_name] ?? scrapeResult.mall_name)
    : null;

  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="이전 단계"
          onClick={onBack}
          disabled={isLoading}
          className="flex h-8 w-8 items-center justify-center rounded-full text-foreground-muted hover:bg-surface disabled:opacity-50"
        >
          <ChevronLeft size={20} />
        </button>
        <h2 id="modal-title" className="text-lg font-semibold text-foreground">
          상품 확인
        </h2>
      </div>

      {/* 이미지 미리보기 */}
      <div className="flex justify-center">
        <div className="relative h-40 w-40 overflow-hidden rounded-xl bg-surface">
          {scrapeResult?.image_url && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scrapeResult.image_url}
              alt="상품 이미지"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover"
              onError={onImgError}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-foreground-subtle">
              <ShoppingBag size={40} />
              <span className="text-xs">이미지 없음</span>
            </div>
          )}
        </div>
      </div>

      {mallLabel && (
        <div className="flex justify-center">
          <span className="rounded-full bg-primary-subtle px-3 py-1 text-xs font-medium text-primary">
            {mallLabel}
          </span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="상품명"
          error={errors.title?.message}
          disabled={isLoading}
          {...register("title")}
        />
        <Input
          label="가격 (선택)"
          type="number"
          placeholder="123000"
          hint="가격을 입력하지 않아도 담을 수 있어요"
          error={errors.base_price?.message}
          disabled={isLoading}
          {...register("base_price", {
            setValueAs: (v: string) => {
              if (v === "" || v == null) return undefined;
              const n = parseFloat(v);
              return Number.isNaN(n) ? undefined : n;
            },
          })}
        />
        {warning && (
          <div className="flex items-start gap-2 rounded-lg bg-warning-subtle p-3 text-sm text-warning">
            <span>⚠️</span>
            <span>{warning}</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-destructive-subtle p-3 text-sm text-destructive">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <Button type="submit" variant="primary" fullWidth loading={isLoading} disabled={isLoading}>
          {isLoading ? "저장 중..." : "담기"}
        </Button>
      </form>
    </div>
  );
};

export default AddProductModal;
