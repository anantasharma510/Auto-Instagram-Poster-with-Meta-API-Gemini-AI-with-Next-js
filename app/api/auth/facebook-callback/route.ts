import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/?error=missing_code", request.url))
  }

  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      return NextResponse.redirect(new URL(`/?error=${error.message}`, request.url))
    }

    // Redirect to the dashboard on success
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error) {
    console.error("Error in Facebook callback:", error)
    return NextResponse.redirect(new URL("/?error=server_error", request.url))
  }
}
