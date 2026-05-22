import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const sessionCookie = (await cookies()).get("session")?.value;
  const payload = sessionCookie ? await verifyToken(sessionCookie) : null;

  if (!payload) {
    redirect("/login");
  }
}
