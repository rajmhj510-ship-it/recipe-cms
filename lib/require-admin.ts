import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, verifyAdminSession } from "@/lib/admin-auth";

export async function requireAdmin(): Promise<void> {
  const cookieStore = await cookies();
  const session = cookieStore.get(COOKIE_NAME)?.value;

  if (!(await verifyAdminSession(session))) {
    redirect("/admin/login");
  }
}
