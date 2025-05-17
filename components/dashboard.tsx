"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { signOut, useSession } from "next-auth/react"
import { Loader2, LogOut, Send, Sparkles, Instagram, User, Menu, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [user, setUser] = useState(null)
  const [pages, setPages] = useState([])
  const [instagramAccounts, setInstagramAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [originalContent, setOriginalContent] = useState("")
  const [summarizedContent, setSummarizedContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSummarizing, setIsSummarizing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [error, setError] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    async function fetchUserData() {
      try {
        setIsLoading(true)

        // Fetch user profile
        const userResponse = await fetch("/api/user/profile")
        if (!userResponse.ok) throw new Error("Failed to fetch user profile")
        const userData = await userResponse.json()
        setUser(userData)

        // Fetch Facebook pages
        const pagesResponse = await fetch("/api/facebook/pages")
        if (!pagesResponse.ok) throw new Error("Failed to fetch Facebook pages")
        const pagesData = await pagesResponse.json()
        setPages(pagesData)

        if (pagesData.length > 0) {
          // Fetch Instagram accounts
          const igResponse = await fetch("/api/instagram/accounts")
          if (!igResponse.ok) throw new Error("Failed to fetch Instagram accounts")
          const igData = await igResponse.json()
          setInstagramAccounts(igData)

          if (igData.length > 0) {
            setSelectedAccount(igData[0].id)
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err)
        setError("Failed to load your account data. Please try logging in again.")
      } finally {
        setIsLoading(false)
      }
    }

    if (session) {
      fetchUserData()
    }
  }, [session])

  useEffect(() => {
    setCharacterCount(summarizedContent.length)
  }, [summarizedContent])

  const handleSummarize = async () => {
    if (!originalContent.trim()) {
      toast({
        title: "Empty Content",
        description: "Please enter some content to summarize.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSummarizing(true)
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: originalContent }),
      })

      if (!response.ok) {
        throw new Error("Failed to summarize content")
      }

      const data = await response.json()
      setSummarizedContent(data.summary)
      toast({
        title: "Content Summarized",
        description: "Your content has been successfully summarized.",
      })
    } catch (err) {
      console.error("Error summarizing content:", err)
      toast({
        title: "Summarization Failed",
        description: "There was an error summarizing your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSummarizing(false)
    }
  }

  const handlePublish = async () => {
    if (!summarizedContent.trim()) {
      toast({
        title: "Empty Content",
        description: "Please summarize your content before publishing.",
        variant: "destructive",
      })
      return
    }

    if (!selectedAccount) {
      toast({
        title: "No Account Selected",
        description: "Please select an Instagram account to publish to.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsPublishing(true)
      const response = await fetch("/api/instagram/publish", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instagramAccountId: selectedAccount,
          content: summarizedContent,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to publish to Instagram")
      }

      toast({
        title: "Published Successfully",
        description: "Your content has been published to Instagram.",
      })
      // Reset form after successful publish
      setSummarizedContent("")
      setOriginalContent("")
    } catch (err) {
      console.error("Error publishing to Instagram:", err)
      toast({
        title: "Publishing Failed",
        description: err.message || "There was an error publishing to Instagram. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950">
        <div className="w-24 h-24 rounded-full bg-white/80 dark:bg-slate-800/80 shadow-xl flex items-center justify-center mb-8">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-200 mb-2">Loading your account</h2>
        <p className="text-slate-600 dark:text-slate-400">Please wait while we fetch your data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-10 left-10 w-64 h-64 bg-pink-300/20 dark:bg-pink-700/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-300/20 dark:bg-indigo-700/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Instagram className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="hidden md:block ml-4">
                <h1 className="text-xl font-bold text-slate-800 dark:text-white">Instagram Content Summarizer</h1>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {user && (
                <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                  <User className="h-4 w-4" />
                  <span>{user.name}</span>
                </div>
              )}
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="border-slate-300 dark:border-slate-700"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col space-y-3 px-2 pb-3">
                <h1 className="text-lg font-bold text-slate-800 dark:text-white">Instagram Content Summarizer</h1>
                {user && (
                  <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-300">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  size="sm"
                  className="border-slate-300 dark:border-slate-700 w-full justify-start"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6 border-0 shadow-lg">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {instagramAccounts.length === 0 && !isLoading && (
          <Alert className="mb-6 bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 border-0 shadow-lg">
            <AlertTitle className="font-bold">No Instagram Business Accounts Found</AlertTitle>
            <AlertDescription>
              Please make sure you have an Instagram Business account connected to your Facebook Page. You may need to
              reconnect with additional permissions.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="md:col-span-2 border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                  <Instagram className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Instagram Account</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Select the Instagram Business account you want to post to
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Select
                value={selectedAccount}
                onValueChange={setSelectedAccount}
                disabled={instagramAccounts.length === 0}
              >
                <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <SelectValue placeholder="Select an Instagram account" />
                </SelectTrigger>
                <SelectContent>
                  {instagramAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.username} ({account.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Original Content</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Paste your long social media post here
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter your content here..."
                className="min-h-[250px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                value={originalContent}
                onChange={(e) => setOriginalContent(e.target.value)}
                disabled={isSummarizing}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handleSummarize}
                disabled={isSummarizing || !originalContent.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
              >
                {isSummarizing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Summarizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Summarize
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 rounded-full bg-pink-100 dark:bg-pink-900/50 flex items-center justify-center">
                  <Send className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-800 dark:text-slate-100">Summarized Content</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    Edit if needed before publishing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${characterCount > 2200 ? "text-red-500 font-bold" : "text-slate-600 dark:text-slate-400"}`}
                >
                  {characterCount} / 2200 characters
                </span>
                <span
                  className={`text-xs ${characterCount > 2200 ? "text-red-500" : characterCount > 1800 ? "text-amber-500" : "text-green-500"}`}
                >
                  {characterCount > 2200 ? "Too long" : characterCount > 1800 ? "Almost full" : "Good length"}
                </span>
              </div>

              <Progress
                value={(characterCount / 2200) * 100}
                className="h-1.5"
                indicatorClassName={
                  characterCount > 2200 ? "bg-red-500" : characterCount > 1800 ? "bg-amber-500" : "bg-green-500"
                }
              />

              <Textarea
                placeholder="Summarized content will appear here..."
                className="min-h-[250px] bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                value={summarizedContent}
                onChange={(e) => setSummarizedContent(e.target.value)}
                disabled={isPublishing}
              />
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button
                onClick={handlePublish}
                disabled={isPublishing || !summarizedContent.trim() || !selectedAccount || characterCount > 2200}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white border-0"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Publish to Instagram
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <footer className="relative z-10 mt-8 py-6 border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} Instagram Content Summarizer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
