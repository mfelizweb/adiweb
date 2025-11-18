"use client";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from "react";
import CallbackInner from "./callback-inner";
 

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen">
        <p>...</p>
      </div>
    }>
      <CallbackInner />
    </Suspense>
  );
}
