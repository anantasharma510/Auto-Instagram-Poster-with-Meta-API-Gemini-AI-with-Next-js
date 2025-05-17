"use server"

import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { requireAuth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function getUserProfile() {
  const session = await requireAuth()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the Facebook access token from Supabase auth
  const {
    data: { provider_token },
  } = await supabase.auth.getSession()

  if (!provider_token) {
    throw new Error("No Facebook access token found")
  }

  // Call the Facebook Graph API to get user profile
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me?fields=id,name,email&access_token=${provider_token}`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch user profile from Facebook")
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
        supabaseUserId: session.user.id,
        lastLogin: new Date(),
      },
    },
    { upsert: true },
  )

  return userData
}

export async function getUserPages() {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the Facebook access token from Supabase auth
  const {
    data: { provider_token },
  } = await supabase.auth.getSession()

  if (!provider_token) {
    throw new Error("No Facebook access token found")
  }

  // Call the Facebook Graph API to get user's pages
  const response = await fetch(
    `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token&access_token=${provider_token}`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch user pages from Facebook")
  }

  const pagesData = await response.json()
  return pagesData.data || []
}

export async function getInstagramAccounts(pages) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Get the Facebook access token from Supabase auth
  const {
    data: { provider_token },
  } = await supabase.auth.getSession()

  if (!provider_token) {
    throw new Error("No Facebook access token found")
  }

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

  return instagramAccounts
}
