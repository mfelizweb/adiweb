 "use client";

import { Suspense } from "react";
import SearchInner from "./SearchInner";
 
export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">...</div>}>
      <SearchInner />
    </Suspense>
  );
}
