"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function GlobalLoader() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mostrar loader al entrar en cualquier página
    setLoading(true);

    const timeout = setTimeout(() => {
      setLoading(false);
    }, 600); // tiempo mínimo visible

    return () => clearTimeout(timeout);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white">
      <div className="animate-zoomPulse">
        <Image
          src="/icon.png"
          alt="Loading"
          width={120}
          height={120}
          priority
        />
      </div>
    </div>
  );
}
