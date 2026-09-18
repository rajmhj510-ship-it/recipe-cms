"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ContentProtection({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const protectedPage = !pathname.startsWith("/admin");

  useEffect(() => {
    if (!protectedPage) return;

    const preventContextMenu = (event: MouseEvent) => event.preventDefault();
    const preventDrag = (event: DragEvent) => event.preventDefault();

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("dragstart", preventDrag);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("dragstart", preventDrag);
    };
  }, [protectedPage]);

  return (
    <div className={protectedPage ? "content-protected" : undefined}>
      {children}
    </div>
  );
}
