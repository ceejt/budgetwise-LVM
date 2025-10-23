import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="w-full max-w-md">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl" style={{ color: "#293F55" }}>
              Check Your Email
            </CardTitle>
            <CardDescription>We've sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please check your email and click the verification link to activate your account. Once verified, you can
              sign in to BudgetWise.
            </p>
            <Link href="/auth/signin" className="text-sm underline underline-offset-4" style={{ color: "#72ADFD" }}>
              Back to Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
