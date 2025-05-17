import clientPromise from "@/lib/mongodb-client"

export async function connectToDatabase() {
  const client = await clientPromise
  const db = client.db("instagram-summarizer")
  return { client, db }
}
