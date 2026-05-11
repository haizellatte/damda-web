import { Suspense } from "react";
import ShelfListView from "@/components/product/shelfListView";

export const metadata = { title: "보관함 · 담다" };

const ShelfPage = () => (
  <Suspense>
    <ShelfListView />
  </Suspense>
);

export default ShelfPage;
