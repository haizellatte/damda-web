import { useMutation } from "@tanstack/react-query";
import { scrapeUrl } from "./scrape.api";

export const useScrapeUrl = () => {
  return useMutation({
    mutationFn: (url: string) => scrapeUrl(url),
  });
};
