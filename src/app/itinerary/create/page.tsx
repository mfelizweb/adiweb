 "use client";

import { Suspense } from "react";
import CreateItineraryInner from "./CreateItineraryInner";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export default function CreateItineraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"> ...</div>}>
      <CreateItineraryInner />
    </Suspense>
  );
}
