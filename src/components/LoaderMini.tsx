// components/LoaderMini.tsx (web)
"use client";

import Image from "next/image";

export default function LoaderMini() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-gray-50">
      <div className="animate-spin-slow">
        <Image
          src="/icon.png"
          alt="ADI Logo"
          width={90}
          height={90}
          className="opacity-90"
          style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.3))" }}
        />
      </div>
      {/* <p className="text-gray-600 mt-4 text-sm">Loading...</p> */}
      <style jsx>{`
        .animate-spin-slow {
          animation: spin 2s linear infinite;
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
