"use server"

import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function loginWithFacebook() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "facebook",
    options: {
      scopes: "pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement",
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error("Facebook login error:", error)
    return { error: error.message }
  }

  redirect(data.url)
}

export async function logout() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  await supabase.auth.signOut()
  redirect("/")
}
