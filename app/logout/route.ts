import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ROLE_COOKIE, EMAIL_COOKIE } from "@/lib/auth";

export async function POST() {
  cookies().delete(ROLE_COOKIE);
  cookies().delete(EMAIL_COOKIE);
  redirect("/login");
}

export async function GET() {
  cookies().delete(ROLE_COOKIE);
  cookies().delete(EMAIL_COOKIE);
  redirect("/login");
}
