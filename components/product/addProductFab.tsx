import { Plus } from "lucide-react";

type AddProductFabProps = {
  onClick: () => void;
};

const AddProductFab = ({ onClick }: AddProductFabProps) => (
  <button
    type="button"
    aria-label="상품 담기"
    onClick={onClick}
    className="fixed bottom-6 right-5 z-20 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:bg-primary-hover active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
  >
    <Plus size={24} strokeWidth={2.5} />
  </button>
);

export default AddProductFab;
