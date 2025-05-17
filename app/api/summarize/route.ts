import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { connectToDatabase } from "@/lib/mongodb"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    const systemInstruction = process.env.SYSTEM_INSTRUCTION || "You are a helpful assistant."

    if (!apiKey) {
      throw new Error("Missing Gemini API Key")
    }

    const body = await req.json()
    const { content } = body

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    console.log("🔍 Original Content:", content)

    const genAI = new GoogleGenerativeAI(apiKey)

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
      generationConfig: { temperature: 1.6 },
    })

    const prompt = `
      You are a professional social media content summarizer. 
      Your task is to summarize the following social media post into concise, engaging content 
      that fits Instagram's character limit (max 2200 characters). 
      Maintain the original message's key points and tone while making it more concise.
      Do not include hashtags unless they were in the original content.
      Do not add any additional commentary or notes.
      Just return the summarized content.

      Here's the content to summarize:
      ${content}
    `

    const result = await model.generateContent(prompt)
    const summary = result.response.text()

    console.log("✅ Summarized Content:", summary)

    // Save to MongoDB
    const { db } = await connectToDatabase()
    await db.collection("summarizations").insertOne({
      userId: session.user.id,
      originalContent: content,
      summarizedContent: summary,
      timestamp: new Date(),
      characterCount: {
        original: content.length,
        summarized: summary.length,
      },
    })

    return NextResponse.json({ summary })

  } catch (error: any) {
    console.error("❌ Error summarizing content:", error)
    return NextResponse.json({ error: "Failed to summarize content" }, { status: 500 })
  }
}
