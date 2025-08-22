import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">FinanceAI</span>
          </div>

          <Card className="border-border">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>We've sent you a confirmation link to complete your registration</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                Please check your email and click the confirmation link to activate your account. Once confirmed, you'll
                be redirected to complete your financial profile.
              </p>
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Didn't receive the email? Check your spam folder or{" "}
                  <Link href="/auth/sign-up" className="text-primary hover:underline">
                    try again
                  </Link>
                </p>
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
