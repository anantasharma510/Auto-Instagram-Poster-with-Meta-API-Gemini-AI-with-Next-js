import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default async function DebugPage() {
  // Get session server-side
  const session = await getServerSession(authOptions)
  
  if (!session) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTitle>Unauthorized</AlertTitle>
          <AlertDescription>
            You must be logged in to view debug information.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Debug data structure
  const debugData = {
    timestamp: new Date().toISOString(),
    steps: [] as any[],
    error: null as string | null
  }

  try {
    // Step 1: Session verification
    debugData.steps.push({
      step: "session_verification",
      startedAt: new Date().toISOString(),
      status: "success",
      user: {
        name: session.user?.name,
        email: session.user?.email
      }
    })

    // Step 2: Token verification
    debugData.steps.push({
      step: "token_verification",
      startedAt: new Date().toISOString()
    })

    const accessToken = session.accessToken
    if (!accessToken) {
      debugData.steps[1].status = "failed"
      debugData.steps[1].error = "No access token in session"
      throw new Error("Missing Facebook access token")
    }
    debugData.steps[1].status = "success"
    debugData.steps[1].tokenPreview = `${accessToken.substring(0, 5)}...${accessToken.slice(-5)}`

    // Step 3: Fetch Facebook pages directly from API
    debugData.steps.push({
      step: "fetch_facebook_pages",
      startedAt: new Date().toISOString()
    })

    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?fields=id,name,access_token,connected_instagram_account&access_token=${accessToken}`
    )

    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json()
      debugData.steps[2].status = "failed"
      debugData.steps[2].error = errorData.error
      throw new Error(`Facebook API error: ${errorData.error?.message || "Unknown error"}`)
    }

    const pagesData = await pagesResponse.json()
    debugData.steps[2].status = "success"
    debugData.steps[2].pagesCount = pagesData.data?.length || 0
    debugData.steps[2].samplePage = pagesData.data?.[0] || null

    // Step 4: Check Instagram connections
    debugData.steps.push({
      step: "instagram_connection_check",
      startedAt: new Date().toISOString(),
      pages: [] as any[],
      connectedAccounts: 0
    })

    const pages = pagesData.data || []
    const instagramAccounts = []

    for (const page of pages) {
      const pageDebug: any = {
        pageId: page.id,
        pageName: page.name,
        steps: [] as any[]
      }

      try {
        // Check Instagram connection
        pageDebug.steps.push({
          step: "fetch_instagram_connection",
          startedAt: new Date().toISOString()
        })

        const igConnectionResponse = await fetch(
          `https://graph.facebook.com/v18.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
        )

        if (!igConnectionResponse.ok) {
          const errorData = await igConnectionResponse.json()
          pageDebug.steps[0].status = "failed"
          pageDebug.steps[0].error = errorData.error
          continue
        }

        const connectionData = await igConnectionResponse.json()
        pageDebug.steps[0].status = "success"
        pageDebug.steps[0].hasConnection = !!connectionData.instagram_business_account

        if (!connectionData.instagram_business_account) {
          pageDebug.steps.push({
            step: "no_instagram_connection",
            status: "skipped",
            message: "No Instagram business account connected"
          })
          continue
        }

        // Verify Instagram account details
        pageDebug.steps.push({
          step: "verify_instagram_account",
          startedAt: new Date().toISOString(),
          igId: connectionData.instagram_business_account.id
        })

        const igAccountResponse = await fetch(
          `https://graph.facebook.com/v18.0/${connectionData.instagram_business_account.id}?fields=id,name,username,profile_picture_url,is_whatsapp_business_account&access_token=${page.access_token}`
        )

        if (!igAccountResponse.ok) {
          const errorData = await igAccountResponse.json()
          pageDebug.steps[1].status = "failed"
          pageDebug.steps[1].error = errorData.error
          continue
        }

        const igAccountData = await igAccountResponse.json()
        pageDebug.steps[1].status = "success"
        pageDebug.steps[1].accountData = {
          username: igAccountData.username,
          isBusiness: igAccountData.is_whatsapp_business_account,
          name: igAccountData.name
        }

        instagramAccounts.push({
          id: igAccountData.id,
          name: igAccountData.name,
          username: igAccountData.username,
          isBusinessAccount: true,
          profilePicture: igAccountData.profile_picture_url,
          pageId: page.id,
          pageName: page.name
        })

        debugData.steps[3].connectedAccounts++

      } catch (error) {
        pageDebug.steps.push({
          step: "error_handling",
          status: "error",
          error: error instanceof Error ? error.message : String(error)
        })
      }

      debugData.steps[3].pages.push(pageDebug)
    }

    // Add accounts to debug data
    debugData.accounts = instagramAccounts

  } catch (error) {
    debugData.error = error instanceof Error ? error.message : String(error)
    debugData.steps.push({
      step: "global_error_handling",
      status: "error",
      error: debugData.error
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Instagram Connection Debug</h1>
      
      {/* Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border p-4 rounded-lg">
              <h3 className="font-medium">Session</h3>
              <p className={debugData.steps[0]?.status === "success" ? "text-green-600" : "text-red-600"}>
                {debugData.steps[0]?.status === "success" ? "Valid" : "Invalid"}
              </p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="font-medium">Facebook Pages</h3>
              <p>{debugData.steps[2]?.pagesCount || 0}</p>
            </div>
            <div className="border p-4 rounded-lg">
              <h3 className="font-medium">Instagram Accounts</h3>
              <p>{debugData.steps[3]?.connectedAccounts || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {debugData.error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{debugData.error}</AlertDescription>
        </Alert>
      )}

      {/* Detailed Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Steps</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {debugData.steps.map((step, index) => (
            <div key={index} className="border p-4 rounded-lg">
              <h3 className="font-medium">
                Step {index + 1}: {step.step}
                <span className={`ml-2 text-sm ${
                  step.status === 'success' ? 'text-green-600' : 
                  step.status === 'failed' ? 'text-red-600' : 
                  'text-yellow-600'
                }`}>
                  ({step.status})
                </span>
              </h3>
              
              {step.error && (
                <div className="mt-2 p-2 bg-red-50 rounded">
                  <p className="text-red-600">{JSON.stringify(step.error, null, 2)}</p>
                </div>
              )}

              {step.pages && (
                <div className="mt-4 space-y-4">
                  <h4 className="font-medium">Page Connections:</h4>
                  {step.pages.map((page: any, pageIndex: number) => (
                    <div key={pageIndex} className="pl-4 border-l-2">
                      <p>
                        <span className="font-medium">{page.pageName}</span> ({page.pageId})
                      </p>
                      {page.steps.map((pageStep: any, stepIndex: number) => (
                        <div key={stepIndex} className="mt-2 pl-4 text-sm">
                          <p>
                            {pageStep.step}: 
                            <span className={`ml-2 ${
                              pageStep.status === 'success' ? 'text-green-600' : 
                              pageStep.status === 'failed' ? 'text-red-600' : 
                              'text-yellow-600'
                            }`}>
                              {pageStep.status}
                            </span>
                          </p>
                          {pageStep.error && (
                            <p className="text-red-500 text-xs mt-1">
                              {JSON.stringify(pageStep.error, null, 2)}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Raw Data (for detailed inspection) */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Raw Debug Data</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-gray-100 p-4 rounded overflow-x-auto">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}