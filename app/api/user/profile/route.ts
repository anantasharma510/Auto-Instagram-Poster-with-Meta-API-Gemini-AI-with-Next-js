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

    // Call the Facebook Graph API to get user profile
    const response = await fetch(`https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${accessToken}`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: `Failed to fetch user profile: ${errorData.error?.message || "Unknown error"}` },
        { status: 500 },
      )
    }

    const userData = await response.json()

    // Store or update user data in MongoDB
    const { db } = await connectToDatabase()
    await db.collection("users").updateOne(
      { facebookId: userData.id },
      {
        $set: {
          facebookId: userData.id,
          name: userData.name,
          email: userData.email,
          lastLogin: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}
