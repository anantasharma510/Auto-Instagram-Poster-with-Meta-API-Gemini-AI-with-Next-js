"use server"
import { requireAuth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function publishToInstagram(instagramAccountId: string, content: string) {
  await requireAuth()

  try {
    // Get the Instagram account details from MongoDB
    const { db } = await connectToDatabase()
    const instagramAccount = await db.collection("instagramAccounts").findOne({ instagramId: instagramAccountId })

    if (!instagramAccount) {
      throw new Error("Instagram account not found")
    }

    // Create a container for the CAROUSEL_ALBUM media type
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media?image_url=https://placeholder.svg?height=1080&width=1080&caption=${encodeURIComponent(content)}&access_token=${instagramAccount.accessToken}`,
      {
        method: "POST",
      },
    )

    if (!containerResponse.ok) {
      const errorData = await containerResponse.json()
      console.error("Instagram container creation error:", errorData)
      throw new Error(`Failed to create Instagram media container: ${errorData.error?.message || "Unknown error"}`)
    }

    const containerData = await containerResponse.json()
    const containerId = containerData.id

    // Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}/media_publish?creation_id=${containerId}&access_token=${instagramAccount.accessToken}`,
      {
        method: "POST",
      },
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error("Instagram publish error:", errorData)
      throw new Error(`Failed to publish to Instagram: ${errorData.error?.message || "Unknown error"}`)
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

    return publishData
  } catch (error) {
    console.error("Error publishing to Instagram:", error)
    throw new Error(`Failed to publish to Instagram: ${error.message}`)
  }
}



