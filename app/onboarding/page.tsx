"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, User, DollarSign, Target, CheckCircle } from "lucide-react"

const FINANCIAL_GOALS = [
  "Emergency Fund",
  "Retirement Planning",
  "Home Purchase",
  "Debt Payoff",
  "Investment Growth",
  "Education Savings",
  "Travel Fund",
  "Business Investment",
]

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Form data
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    occupation: "",
  })

  const [financialInfo, setFinancialInfo] = useState({
    annualIncome: "",
    riskTolerance: "",
  })

  const [selectedGoals, setSelectedGoals] = useState<string[]>([])

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

  const handlePersonalInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (personalInfo.firstName && personalInfo.lastName && personalInfo.dateOfBirth) {
      setCurrentStep(2)
    }
  }

  const handleFinancialInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (financialInfo.annualIncome && financialInfo.riskTolerance) {
      setCurrentStep(3)
    }
  }

  const handleGoalsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedGoals.length > 0) {
      setCurrentStep(4)
    }
  }

  const handleFinalSubmit = async () => {
    setIsLoading(true)
    setError(null)
    const supabase = createClient()

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No authenticated user found")
      }

      // Create user profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: user.id,
        first_name: personalInfo.firstName,
        last_name: personalInfo.lastName,
        date_of_birth: personalInfo.dateOfBirth,
        phone: personalInfo.phone,
        occupation: personalInfo.occupation,
        annual_income: Number.parseFloat(financialInfo.annualIncome),
        risk_tolerance: financialInfo.riskTolerance,
        financial_goals: selectedGoals,
      })

      if (profileError) throw profileError

      // Create initial financial goals
      const goalInserts = selectedGoals.map((goal) => ({
        user_id: user.id,
        goal_name: goal,
        target_amount: 0, // User can set this later
        priority: "medium",
      }))

      if (goalInserts.length > 0) {
        const { error: goalsError } = await supabase.from("financial_goals").insert(goalInserts)
        if (goalsError) throw goalsError
      }

      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleGoal = (goal: string) => {
    setSelectedGoals((prev) => (prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]))
  }

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold text-foreground">FinanceAI</span>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Tell us a bit about yourself</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      required
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      required
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo((prev) => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    required
                    value={personalInfo.dateOfBirth}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="occupation">Occupation (Optional)</Label>
                  <Input
                    id="occupation"
                    value={personalInfo.occupation}
                    onChange={(e) => setPersonalInfo((prev) => ({ ...prev, occupation: e.target.value }))}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Financial Information */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Financial Information</CardTitle>
                  <CardDescription>Help us understand your financial situation</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFinancialInfoSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="annualIncome">Annual Income (USD)</Label>
                  <Input
                    id="annualIncome"
                    type="number"
                    placeholder="50000"
                    required
                    value={financialInfo.annualIncome}
                    onChange={(e) => setFinancialInfo((prev) => ({ ...prev, annualIncome: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="riskTolerance">Risk Tolerance</Label>
                  <Select
                    value={financialInfo.riskTolerance}
                    onValueChange={(value) => setFinancialInfo((prev) => ({ ...prev, riskTolerance: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your risk tolerance" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative - I prefer stable, low-risk investments</SelectItem>
                      <SelectItem value="moderate">
                        Moderate - I'm comfortable with some risk for better returns
                      </SelectItem>
                      <SelectItem value="aggressive">
                        Aggressive - I'm willing to take high risks for high returns
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1">
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Financial Goals */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Financial Goals</CardTitle>
                  <CardDescription>What are you hoping to achieve? (Select all that apply)</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGoalsSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  {FINANCIAL_GOALS.map((goal) => (
                    <div key={goal} className="flex items-center space-x-2">
                      <Checkbox
                        id={goal}
                        checked={selectedGoals.includes(goal)}
                        onCheckedChange={() => toggleGoal(goal)}
                      />
                      <Label htmlFor={goal} className="text-sm font-normal cursor-pointer">
                        {goal}
                      </Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={selectedGoals.length === 0}>
                    Continue
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Completion */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle>You're All Set!</CardTitle>
                  <CardDescription>Review your information and complete setup</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">Personal Information</h4>
                  <p className="text-sm text-muted-foreground">
                    {personalInfo.firstName} {personalInfo.lastName}
                    {personalInfo.occupation && ` • ${personalInfo.occupation}`}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Financial Profile</h4>
                  <p className="text-sm text-muted-foreground">
                    Annual Income: ${Number.parseInt(financialInfo.annualIncome).toLocaleString()} • Risk Tolerance:{" "}
                    {financialInfo.riskTolerance}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">Financial Goals</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedGoals.map((goal) => (
                      <span key={goal} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md">
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button onClick={handleFinalSubmit} className="flex-1" disabled={isLoading}>
                  {isLoading ? "Setting up your account..." : "Complete Setup"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
