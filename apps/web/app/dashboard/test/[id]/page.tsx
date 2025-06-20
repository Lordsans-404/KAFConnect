"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, XCircle, Clock, UserIcon, AlertTriangle, Trophy, Target, Calendar, Loader2 } from "lucide-react"

interface AnswerDto {
  questionId: number
  choiceId: number
}

interface SubmitTestDto {
  testId: number
  userId: number
  answers: AnswerDto[]
}

interface Choice {
  id: number
  text: string
  isCorrect?: boolean
}

interface Question {
  id: number
  text: string
  choices: Choice[]
}

interface Test {
  id: number
  title: string
  description?: string
  timeLimit?: number
  questions: Question[]
}

interface Submission {
  id: number
  test: {
    id: number
    title: string
  }
  user: {
    id: number
    email: string
    name: string
    level: string
    isVerified: boolean
  }
  submittedAt: string
  totalScore: number
}

interface TestData {
  test: Test
  user: {
    id: number
    email: string
    name: string
    level: string
    isVerified: boolean
  }
  submission?: Submission
}

const TIME_PER_QUESTION = 30

export default function UserTestForm() {
  const [currentUser, setUser] = useState<{
    id: number
    email: string
    name: string
    level: string
    isVerified: boolean
  } | null>(null)
  const [test, setTest] = useState<Test | null>(null)
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false) // Prevent multiple submissions
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [showResults, setShowResults] = useState(false)

  // Refs to prevent stale closures
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const hasSubmittedRef = useRef(false)
  const isSubmittingRef = useRef(false)

  const router = useParams()
  const searchParams = useSearchParams()
  const testId = Number(router.id)
  const viewResults = searchParams.get("results") === "true"

  // Memoized calculations
  const progress = useMemo(() => {
    return test ? (Object.keys(answers).length / test.questions.length) * 100 : 0
  }, [answers, test])

  const answeredCount = useMemo(() => Object.keys(answers).length, [answers])
  const totalQuestions = test?.questions.length || 0

  // Clear timer function
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // Handle answer change with useCallback
  const handleAnswerChange = useCallback((questionId: number, choiceId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }))
  }, [])

  // Optimized submit function
  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      // Prevent multiple submissions
      if (hasSubmittedRef.current || isSubmittingRef.current || !test || !currentUser) {
        return
      }

      console.log(autoSubmit ? "Auto-submitting test due to timeout" : "Manual test submission")

      // Set flags immediately to prevent race conditions
      hasSubmittedRef.current = true
      isSubmittingRef.current = true
      setHasSubmitted(true)
      setIsSubmitting(true)

      // Clear timer immediately
      clearTimer()

      const token = localStorage.getItem("token")
      const submitData: SubmitTestDto = {
        test: test.id,
        user: currentUser.id,
        answers: Object.entries(answers).map(([questionId, choiceId]) => ({
          question: Number.parseInt(questionId),
          selectedChoice: choiceId,
        })),
      }

      try {
        const response = await fetch(`http://localhost:3000/users/test/${testId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || "Failed to submit test")
        }

        const result = await response.json()
        setSubmission(result.submission)
        setShowResults(true)
      } catch (error: any) {
        console.error("Error submitting test:", error)
        setError(error.message || "Failed to submit test. Please try again.")

        // Reset flags on error to allow retry
        hasSubmittedRef.current = false
        setHasSubmitted(false)
      } finally {
        isSubmittingRef.current = false
        setIsSubmitting(false)
      }
    },
    [test, currentUser, answers, testId, clearTimer],
  )

  // Fetch test data with better error handling
  useEffect(() => {
    let isMounted = true

    const fetchTest = async () => {
      const token = localStorage.getItem("token")

      if (!token) {
        setError("No authentication token found")
        setIsLoading(false)
        return
      }

      try {
        const res = await fetch(`http://localhost:3000/users/test/${testId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: Failed to fetch test`)
        }

        const data: TestData = await res.json()

        if (!isMounted) return

        setTest(data.test)
        setUser(data.user)

        // If submission exists, show results immediately
        if (data.submission || viewResults) {
          setSubmission(data.submission)
          setShowResults(true)
          setHasSubmitted(true)
          hasSubmittedRef.current = true
        } else {
          // Set initial timer only if no submission exists
          const timeLimit = data.test.questions.length * TIME_PER_QUESTION
          setTimeRemaining(timeLimit)
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Something went wrong")
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchTest()

    return () => {
      isMounted = false
    }
  }, [testId, viewResults])

  // Timer effect with proper cleanup and prevention of multiple submissions
  useEffect(() => {
    // Don't start timer if already submitted, submitting, showing results, or no test
    if (!test || hasSubmittedRef.current || isSubmittingRef.current || showResults || timeRemaining <= 0) {
      return
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1

        // Auto-submit when time reaches 0, but only once
        if (newTime <= 0 && !hasSubmittedRef.current && !isSubmittingRef.current) {
          // Use setTimeout to avoid calling handleSubmit during state update
          setTimeout(() => handleSubmit(true), 0)
          return 0
        }

        return newTime
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [test, showResults, handleSubmit, timeRemaining])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer()
    }
  }, [clearTimer])

  // Memoized time formatting
  const formattedTime = useMemo(() => {
    const mins = Math.floor(timeRemaining / 60)
    const secs = timeRemaining % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }, [timeRemaining])

  const getTimeColor = useMemo(() => {
    if (timeRemaining <= 10) return "text-red-500"
    if (timeRemaining <= 15) return "text-amber-500"
    return "text-muted-foreground"
  }, [timeRemaining])

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }, [])

  const getScoreColor = useCallback((score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }, [])

  const getScoreBadgeVariant = useCallback((score: number, total: number) => {
    const percentage = (score / total) * 100
    if (percentage >= 80) return "default" as const
    if (percentage >= 60) return "secondary" as const
    return "destructive" as const
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading test...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <Card className="border-red-200">
          <CardContent className="pt-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!test || !currentUser) return null

  // Results View
  if (showResults && submission) {
    const scorePercentage = Math.round((submission.totalScore / totalQuestions) * 100)

    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Results Header */}
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="w-16 h-16 text-yellow-500" />
            </div>
            <CardTitle className="text-3xl font-bold">Test Results</CardTitle>
            <CardDescription className="text-lg">{test.title}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                  <div className="text-2xl font-bold">
                    {submission.totalScore}/{totalQuestions}
                  </div>
                  <p className="text-sm text-muted-foreground">Score</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <div className={`text-2xl font-bold ${getScoreColor(submission.totalScore, totalQuestions)}`}>
                    {scorePercentage}%
                  </div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                  <Badge variant={getScoreBadgeVariant(submission.totalScore, totalQuestions)} className="mt-2">
                    {scorePercentage >= 80 ? "Excellent" : scorePercentage >= 60 ? "Good" : "Needs Improvement"}
                  </Badge>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Calendar className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  <div className="text-sm font-medium">{formatDate(submission.submittedAt)}</div>
                  <p className="text-sm text-muted-foreground">Submitted</p>
                </CardContent>
              </Card>
            </div>

            {/* User Info */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Name:</strong> {currentUser.name}
                </div>
                <div>
                  <strong>Email:</strong> {currentUser.email}
                </div>
                <div>
                  <strong>Level:</strong>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {currentUser.level}
                  </Badge>
                </div>
                <div>
                  <strong>Status:</strong>
                  <Badge variant={currentUser.isVerified ? "default" : "secondary"} className="ml-2">
                    {currentUser.isVerified ? "Verified" : "Unverified"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Review */}
        <Card>
          <CardHeader>
            <CardTitle>Question Review</CardTitle>
            <CardDescription>Review your answers and see the correct solutions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {test.questions.map((question, index) => {
              const correctChoice = question.choices.find((choice) => choice.isCorrect)
              return (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-2">
                        Question {index + 1}: {question.text}
                      </h3>

                      <div className="space-y-2">
                        {question.choices.map((choice) => {
                          const isUserAnswer = answers[question.id] === choice.id
                          const isCorrectAnswer = choice.isCorrect

                          let bgColor = ""
                          let textColor = ""
                          let icon = null

                          if (isCorrectAnswer) {
                            bgColor = "bg-green-50 border-green-200"
                            textColor = "text-green-800"
                            icon = <CheckCircle className="w-4 h-4 text-green-600" />
                          } else if (isUserAnswer && !isCorrectAnswer) {
                            bgColor = "bg-red-50 border-red-200"
                            textColor = "text-red-800"
                            icon = <XCircle className="w-4 h-4 text-red-600" />
                          }

                          return (
                            <div
                              key={choice.id}
                              className={`p-3 rounded-lg border ${bgColor} ${textColor} flex items-center gap-2`}
                            >
                              {icon}
                              <span className="flex-1">{choice.text}</span>
                              {isUserAnswer && (
                                <Badge variant="outline" className="text-xs">
                                  Your Answer
                                </Badge>
                              )}
                              {isCorrectAnswer && (
                                <Badge variant="default" className="text-xs">
                                  Correct
                                </Badge>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                  {index < test.questions.length - 1 && <Separator />}
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center gap-4">
              <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
                Back to Dashboard
              </Button>
              <Button onClick={() => window.print()}>Print Results</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Test Completion Screen (before results are loaded)
  if (hasSubmitted && !showResults) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Completed!</h2>
            <p className="text-muted-foreground mb-4">Your test has been submitted successfully.</p>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Test:</strong> {test.title}
              </p>
              <p className="text-sm">
                <strong>Questions Answered:</strong> {answeredCount} of {totalQuestions}
              </p>
              <p className="text-sm">
                <strong>Submitted by:</strong> {currentUser.email}
              </p>
            </div>
            {isSubmitting ? (
              <div className="mt-4">
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Processing results...</p>
              </div>
            ) : (
              <Button className="mt-4" onClick={() => window.location.reload()}>
                View Results
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Test Taking View
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Time Warning */}
      {timeRemaining <= 15 && timeRemaining > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-amber-700">
              <AlertTriangle className="w-5 h-5" />
              <p className="font-medium">
                {timeRemaining <= 10 ? "⚠️ Less than 10 seconds remaining!" : "⏰ Less than 15 seconds remaining!"}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="w-5 h-5" />
                {test.title}
              </CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className={`flex items-center gap-2 text-sm font-mono text-xl ${getTimeColor}`}>
                <Clock className="w-5 h-5" />
                {formattedTime}
              </div>
              <p className="text-sm text-muted-foreground">
                Total Time ({test.questions.length} questions × 30 sec each)
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                Answered {answeredCount} of {test.questions.length} Questions
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      {test.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {index + 1} of {test.questions.length}
            </CardTitle>
            <CardDescription className="text-base font-medium text-foreground">{question.text}</CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id]?.toString() || ""}
              onValueChange={(value) => handleAnswerChange(question.id, Number.parseInt(value))}
              disabled={isSubmitting || hasSubmitted}
            >
              <div className="space-y-3">
                {question.choices.map((choice) => (
                  <div
                    key={choice.id}
                    className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      answers[question.id] === choice.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                    } ${isSubmitting || hasSubmitted ? "opacity-50" : ""}`}
                  >
                    <RadioGroupItem value={choice.id.toString()} id={`q${question.id}-c${choice.id}`} />
                    <Label htmlFor={`q${question.id}-c${choice.id}`} className="flex-1 cursor-pointer font-medium">
                      {choice.text}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </CardContent>
        </Card>
      ))}

      {/* Submit */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center">
            <Button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting || hasSubmitted}
              size="lg"
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Test"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
