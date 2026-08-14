import { redirect } from "next/navigation";

// Головна сторінка за новим дизайном ще не надана власником —
// тимчасово ведемо відвідувача одразу в каталог.
export default function Home() {
  redirect("/catalog");
}
