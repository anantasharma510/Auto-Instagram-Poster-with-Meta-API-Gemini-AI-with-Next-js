import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { publishToInstagram } from "@/lib/instagram-api"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if the user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the request body
    const body = await request.json()
    const { instagramAccountId, content } = body

    if (!instagramAccountId || !content) {
      return NextResponse.json({ error: "Instagram account ID and content are required" }, { status: 400 })
    }

    // Publish to Instagram
    const result = await publishToInstagram(instagramAccountId, content)

    return NextResponse.json({ success: true, result })
  } catch (error) {
    console.error("Error publishing to Instagram:", error)
    return NextResponse.json({ error: "Failed to publish to Instagram" }, { status: 500 })
  }
}
