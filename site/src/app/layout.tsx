import type { Metadata } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import ContactDialogProvider from "@/components/contact/ContactDialog";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-cond",
  subsets: ["latin", "cyrillic"],
  weight: ["700"],
});

export const metadata: Metadata = {
  title: "VANGUARD — радіоелектронні системи виявлення та протидії БПЛА",
  description:
    "Каталог продукції VANGUARD: детектори БПЛА, антени, РЕБ-системи та комплекти. Ukrainian Radioelectronic Systems.",
};

// Виставляє тему ДО промальовки (без блимання): світла за замовчуванням,
// темна — лише якщо користувач її раніше обрав (localStorage).
const themeInit = `try{if(localStorage.getItem('theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      suppressHydrationWarning
      className={`${inter.variable} ${robotoCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <ContactDialogProvider>{children}</ContactDialogProvider>
      </body>
    </html>
  );
}
