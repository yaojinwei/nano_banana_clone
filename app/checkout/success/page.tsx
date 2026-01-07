import { redirect } from "next/navigation"

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { session_id: string }
}) {
  // In a real application, you would verify the session with Creem
  // and update the user's credits in the database

  if (!session_id) {
    redirect("/pricing")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-16">
      <div className="container mx-auto max-w-md px-4 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your credits have been added to your account.
          </p>
        </div>
        <div className="space-y-4">
          <a href="/generator" className="block w-full">
            <button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-lg">
              Start Creating
            </button>
          </a>
          <a href="/wallet" className="block">
            <button className="w-full h-12 border border-input bg-background hover:bg-accent hover:text-accent-foreground font-semibold rounded-lg">
              View Wallet
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}
