"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { requireAuth } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export async function summarizeContent(content: string) {
  const session = await requireAuth()

  try {
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are a professional social media content summarizer. 
      Your task is to summarize long social media posts into concise, engaging content 
      that fits Instagram's character limit (max 2200 characters). 
      Maintain the original message's key points and tone while making it more concise.
      Do not include hashtags unless they were in the original content.
      Do not add any additional commentary or notes.
      Just return the summarized content.`,
      prompt: content,
    })

    // Store the summarization request in MongoDB
    const { db } = await connectToDatabase()
    await db.collection("summarizations").insertOne({
      userId: session.user.id,
      originalContent: content,
      summarizedContent: text,
      timestamp: new Date(),
      characterCount: {
        original: content.length,
        summarized: text.length,
      },
    })

    return text
  } catch (error) {
    console.error("Error summarizing content:", error)
    throw new Error("Failed to summarize content")
  }
}
