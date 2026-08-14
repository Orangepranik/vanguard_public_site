import Image from "next/image";
import { IconTarget, IconTrident } from "./icons";

/* Смуга переваг — Figma catalog_page, фрейм "Advantages" */

const ITEMS: {
  icon: React.ReactNode;
  title: string;
  sub: string;
}[] = [
  {
    icon: <IconTrident className="h-[38px] w-[34px]" />,
    title: "Розроблено в Україні",
    sub: "Власне виробництво",
  },
  {
    icon: <IconTarget className="size-[42px]" />,
    title: "Випробувано в реальних умовах",
    sub: "Польові тести та досвід підрозділів",
  },
  {
    icon: (
      <Image src="/images/icons/adv-support.png" width={47} height={47} alt="" />
    ),
    title: "Технічна підтримка",
    sub: "Консультації та супровід",
  },
  {
    icon: (
      <Image src="/images/icons/adv-warranty.png" width={47} height={47} alt="" />
    ),
    title: "Гарантія якості",
    sub: "12 місяців гарантії",
  },
];

export default function AdvantagesStrip() {
  return (
    <section
      aria-label="Наші переваги"
      className="mt-8 rounded-[4px] border border-adv-line bg-adv px-5 py-3 lg:px-7"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4 xl:gap-8">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex items-center gap-2.5">
            <span className="flex size-[47px] shrink-0 items-center justify-center">
              {item.icon}
            </span>
            <span>
              <b className="block text-[12px] font-semibold leading-4 text-[#F0F1F2]">
                {item.title}
              </b>
              <span className="text-[10px] leading-[15px] text-[#969CA1]">
                {item.sub}
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
