import { redirect } from "next/navigation";

/** Единая страница входа — /login (админ и клиент). */
export default function AdminLoginPage() {
  redirect("/login?next=/admin");
}
