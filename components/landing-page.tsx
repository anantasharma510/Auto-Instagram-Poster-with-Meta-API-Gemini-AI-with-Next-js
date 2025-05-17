"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { signIn } from "next-auth/react"
import { Facebook, ArrowRight, Link2, Sparkles, Send } from "lucide-react"
import { useState } from "react"

export default function LandingPage() {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    await signIn("facebook", { callbackUrl: "/dashboard" })
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 p-4 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-300/20 dark:bg-pink-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-700/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-5xl w-full text-center mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
          Instagram Content Summarizer
        </h1>
        <p className="text-xl md:text-2xl text-slate-700 dark:text-slate-300 mb-8 max-w-3xl mx-auto">
          Transform your long social media posts into concise, engaging content with AI and publish directly to
          Instagram
        </p>
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full mb-12">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
              <Link2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Connect</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Link your Facebook Business account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Securely connect your Facebook Business account to access your Instagram Business profiles with just a few
              clicks.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Summarize</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              AI-powered content summarization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Paste your long content and get AI-generated summaries that fit Instagram's character limits perfectly.
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="w-12 h-12 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center mb-4">
              <Send className="h-6 w-6 text-pink-600 dark:text-pink-400" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">Publish</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">Post directly to Instagram</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Publish your summarized content directly to your Instagram Business account with one click.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="relative z-10 mt-4">
        <Button
          onClick={handleSignIn}
          size="lg"
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-6 text-lg rounded-full"
          disabled={isLoading}
        >
          <Facebook className="mr-2 h-5 w-5" />
          {isLoading ? "Connecting..." : "Login with Facebook Business"}
          {!isLoading && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>

      <footer className="relative z-10 mt-16 text-center text-sm text-slate-500 dark:text-slate-400">
        <p>© {new Date().getFullYear()} Instagram Content Summarizer. All rights reserved.</p>
      </footer>
    </div>
  )
}
