import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { instagramAccountId, content } = body

    if (!instagramAccountId || !content) {
      return NextResponse.json({ error: "Instagram account ID and content are required" }, { status: 400 })
    }

    // Get the Instagram account details from MongoDB
    const { db } = await connectToDatabase()
    const instagramAccount = await db.collection("instagramAccounts").findOne({
      instagramId: instagramAccountId,
    })

    if (!instagramAccount) {
      return NextResponse.json({ error: "Instagram account not found" }, { status: 404 })
    }

    // Get the page access token from MongoDB
    const page = await db.collection("facebookPages").findOne({
      pageId: instagramAccount.pageId,
    })

    if (!page) {
      return NextResponse.json({ error: "Facebook page not found" }, { status: 404 })
    }

    const accessToken = page.accessToken

    // Create a container for the media type
   const realImageUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTV4UlS1Ehv87B7_HRdQWlKz8Jw13A0zxuiuQ&s"; // Publicly accessible JPG/PNG

const containerResponse = await fetch(
  `https://graph.facebook.com/v18.0/${instagramAccountId}/media?image_url=${encodeURIComponent(
    realImageUrl,
  )}&caption=${encodeURIComponent(content)}&access_token=${accessToken}`,
  {
    method: "POST",
  },
);

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      console.error("Instagram container creation error:", errorData)
      return NextResponse.json(
        {
          error: `Failed to create Instagram media container: ${errorData.error?.message || "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    const containerData = await containerResponse.json()
    const containerId = containerData.id

    // Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish?creation_id=${containerId}&access_token=${accessToken}`,
      {
        method: "POST",
      },
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error("Instagram publish error:", errorData)
      return NextResponse.json(
        {
          error: `Failed to publish to Instagram: ${errorData.error?.message || "Unknown error"}`,
        },
        { status: 500 },
      )
    }

    const publishData = await publishResponse.json()

    // Store the publication record in MongoDB
    await db.collection("publications").insertOne({
      instagramAccountId,
      instagramUsername: instagramAccount.username,
      content,
      mediaId: publishData.id,
      timestamp: new Date(),
      status: "published",
    })

    return NextResponse.json({ success: true, mediaId: publishData.id })
  } catch (error) {
    console.error("Error publishing to Instagram:", error)
    return NextResponse.json({ error: `Failed to publish to Instagram: ${error.message}` }, { status: 500 })
  }
}
