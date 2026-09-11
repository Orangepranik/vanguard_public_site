import type { Metadata } from "next";
import { Inter, Roboto_Condensed } from "next/font/google";
import ContactDialogProvider from "@/components/contact/ContactDialog";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, organizationLd } from "@/lib/seo";
import "./globals.css";

const TITLE = "VANGUARD — радіоелектронні системи виявлення та протидії БПЛА";

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
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "детектор дронів",
    "виявлення БПЛА",
    "антидрон",
    "КОЖАН",
    "РЕБ",
    "радіоелектронна боротьба",
    "засоби РЕБ",
    "тепловізор",
    "VANGUARD",
  ],
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "uk_UA",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: [
      { url: "/og.png", width: 1200, height: 630, alt: "VANGUARD — Ukrainian Radioelectronic Systems" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  // Верифікація Google Search Console: додати GOOGLE_SITE_VERIFICATION у deploy/.env
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
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
        <JsonLd data={organizationLd()} />
        <ContactDialogProvider>{children}</ContactDialogProvider>
      </body>
    </html>
  );
}
