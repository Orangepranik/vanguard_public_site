"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/* Плавна поява на КОЖНІЙ навігації. key={pathname} змушує React перемонтувати
   обгортку при зміні маршруту, тож CSS-анімація входу (.page-enter у globals.css)
   надійно відтворюється щоразу. Модалки/дровери — у порталах до <body> (поза цим
   div), тож на переходах вони не анімуються. Flex-класи зберігають розкладку
   (main flex-1 → футер притиснутий донизу). */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div key={pathname} className="page-enter flex flex-1 flex-col">
      {children}
    </div>
  );
}
