import { redirect } from "next/navigation"
import { getSession } from "@/app/(auth)/actions"

export default async function Home() {
  const session = await getSession()

  // Redirect authenticated users to dashboard, others to login
  if (session) {
    redirect("/oversikt")
  } else {
    redirect("/login")
  }
}
