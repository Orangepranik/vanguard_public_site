/* Вставка structured data (JSON-LD) у <head>/<body>. Серверний компонент.
   JSON.stringify не екранує < > & — тож рядок на кшталт "</script>" у даних міг би
   вирватися зі <script> (XSS). Екрануємо їх як \uXXXX (валідний JSON, Google читає
   без проблем). Достатньо < > & : всередині <script> сутності не декодуються, вихід
   із тегу дає лише "</script>". Char-class-регекс на одному рядку — щоб TSX-парсер
   не сплутав />/ із JSX і без U+2028/29, які самі є розривами рядка в JS. */
const LD_ESCAPE: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
};

function safeJsonLd(data: object): string {
  return JSON.stringify(data).replace(/[<>&]/g, (c) => LD_ESCAPE[c]);
}

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(data) }}
    />
  );
}
