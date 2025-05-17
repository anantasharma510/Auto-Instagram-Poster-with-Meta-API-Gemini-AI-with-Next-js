import type { NextAuthOptions } from "next-auth"
import FacebookProvider from "next-auth/providers/facebook"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "@/lib/mongodb-client"

export const authOptions: NextAuthOptions = {
    debug: true,
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "email,pages_show_list,instagram_basic,instagram_content_publish,pages_read_engagement,business_management",
        },
      },
    }),
  ],
callbacks: {
  async jwt({ token, account }) {
    if (account) {
       
      token.accessToken = account.access_token
      token.refreshToken = account.refresh_token
      token.expiresAt = account.expires_at
    }
    return token
  },
  async session({ session, token }) {
    session.accessToken = token.accessToken

    // ✅ Log the session when it is generated
    // console.log("SESSION:", session)

    return session
  },
},

  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
}
