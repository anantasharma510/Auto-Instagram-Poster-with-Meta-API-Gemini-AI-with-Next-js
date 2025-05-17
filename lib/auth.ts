import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function getSession() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getUserId() {
  const session = await getSession()
  return session?.user?.id
}

export async function requireAuth() {
  const session = await getSession()
  if (!session) {
    redirect("/")
  }
  return session
}
