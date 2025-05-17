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

    // First, get the user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token&access_token=${accessToken}`,
    )

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json()
      return NextResponse.json(
        { error: `Failed to fetch Facebook pages: ${errorData.error?.message || "Unknown error"}` },
        { status: 500 },
      )
    }

    const pagesData = await pagesResponse.json()
    const pages = pagesData.data || []

    const instagramAccounts = []

    // For each page, check if there's a connected Instagram account
    for (const page of pages) {
      try {
        const response = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account{id,name,username}&access_token=${page.access_token}`,
        )

        if (response.ok) {
          const data = await response.json()
          if (data.instagram_business_account) {
            // Get more details about the Instagram account
            const igResponse = await fetch(
              `https://graph.facebook.com/v18.0/${data.instagram_business_account.id}?fields=id,name,username,profile_picture_url&access_token=${page.access_token}`,
            )

            if (igResponse.ok) {
              const igData = await igResponse.json()
              instagramAccounts.push({
                id: igData.id,
                name: igData.name || data.instagram_business_account.name,
                username: igData.username,
                profilePicture: igData.profile_picture_url,
                pageId: page.id,
                pageName: page.name,
                accessToken: page.access_token,
              })

              // Store the Instagram account info in MongoDB
              const { db } = await connectToDatabase()
              await db.collection("instagramAccounts").updateOne(
                { instagramId: igData.id },
                {
                  $set: {
                    instagramId: igData.id,
                    name: igData.name,
                    username: igData.username,
                    profilePicture: igData.profile_picture_url,
                    pageId: page.id,
                    pageName: page.name,
                    lastUpdated: new Date(),
                  },
                },
                { upsert: true },
              )
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching Instagram account for page ${page.name}:`, error)
      }
    }

    return NextResponse.json(instagramAccounts)
  } catch (error) {
    console.error("Error fetching Instagram accounts:", error)
    return NextResponse.json({ error: "Failed to fetch Instagram accounts" }, { status: 500 })
  }
}
