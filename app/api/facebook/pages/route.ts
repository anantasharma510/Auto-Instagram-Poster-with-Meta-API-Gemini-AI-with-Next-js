import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the Facebook access token from the session
    const accessToken = session.accessToken

    if (!accessToken) {
      return NextResponse.json({ error: "No access token found" }, { status: 400 })
    }

    // Call the Facebook Graph API to get user's pages
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: `Failed to fetch Facebook pages: ${errorData.error?.message || "Unknown error"}` },
        { status: 500 },
      )
    }

    const pagesData = await response.json()
    const pages = pagesData.data || []

    // Store pages data in MongoDB
    const { db } = await connectToDatabase()

    for (const page of pages) {
      await db.collection("facebookPages").updateOne(
        { pageId: page.id },
        {
          $set: {
            pageId: page.id,
            name: page.name,
            accessToken: page.access_token,
            lastUpdated: new Date(),
          },
        },
        { upsert: true },
      )
    }

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error fetching Facebook pages:", error)
    return NextResponse.json({ error: "Failed to fetch Facebook pages" }, { status: 500 })
  }
}
