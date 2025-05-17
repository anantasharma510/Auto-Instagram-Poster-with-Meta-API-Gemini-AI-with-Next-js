import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import Dashboard from "@/components/dashboard"
import { Suspense } from "react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
// console.log(session)
//   if (!session) {
//     redirect("/")
//   }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Dashboard />
    </Suspense>
  )
}
