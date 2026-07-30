import { Suspense } from "react";
import HistoryContent from "./HistoryContent";
import LoadingCard from "@/components/ui/LoadingCard";

export default function HistoryPage() {
  return (
    <Suspense fallback={<LoadingCard rows={3} />}>
      <HistoryContent />
    </Suspense>
  );
}
