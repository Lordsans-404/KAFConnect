"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, User } from "lucide-react"

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
}

interface Question {
  id: number
  text: string
  choices: Choice[]
}

interface Test {
  id: number
  title: string
  description: string
  timeLimit: number
  questions: Question[]
}

export default function UserTestForm() {
  const [currentUser] = useState({ id: 123, name: "John Doe" })
  const [test, setTest] = useState<Test | null>(null)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const router = useParams() // from next/navigation
  const testId = Number(router.id)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const res = await fetch(`http://localhost:3000/users/test/${testId}`)
        if (!res.ok) throw new Error("Failed to fetch test")
        const data: Test = await res.json()
        setTest(data)
        setTimeRemaining(data.timeLimit * 60)
      } catch (err: any) {
        setError(err.message || "Something went wrong")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTest()
  }, [testId])

  const progress = test ? (Object.keys(answers).length / test.questions.length) * 100 : 0
  const allQuestionsAnswered = test ? Object.keys(answers).length === test.questions.length : false

  const handleAnswerChange = (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }))
  }

  const handleSubmit = async () => {
    if (!test || !allQuestionsAnswered) return

    setIsSubmitting(true)

    const submitData: SubmitTestDto = {
      testId: test.id,
      userId: currentUser.id,
      answers: Object.entries(answers).map(([questionId, choiceId]) => ({
        questionId: Number.parseInt(questionId),
        choiceId: choiceId,
      })),
    }

    try {
      console.log("Submitting test:", submitData)
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting test:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) return <p className="text-center mt-10">Loading test...</p>
  if (error) return <p className="text-center mt-10 text-red-600">Error: {error}</p>
  if (!test) return null

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Test Submitted Successfully!</h2>
            <p className="text-muted-foreground mb-4">
              Your answers have been recorded. You will receive your results shortly.
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm">
                <strong>Test:</strong> {test.title}
                <br />
                <strong>Questions Answered:</strong> {Object.keys(answers).length} of {test.questions.length}
                <br />
                <strong>Submitted by:</strong> {currentUser.name}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Test Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {test.title}
              </CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>
                {Object.keys(answers).length} of {test.questions.length} questions
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
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
              >
                <div className="space-y-3">
                  {question.choices.map((choice) => (
                    <div
                      key={choice.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                        answers[question.id] === choice.id ? "bg-primary/5 border-primary" : "hover:bg-muted/50"
                      }`}
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
      </div>

      {/* Submit Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Ready to submit?</p>
              <p className="text-sm text-muted-foreground">
                Make sure you've answered all questions before submitting.
              </p>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              size="lg"
              className="min-w-32"
            >
              {isSubmitting ? "Submitting..." : "Submit Test"}
            </Button>
          </div>
          {!allQuestionsAnswered && (
            <p className="text-sm text-amber-600 mt-2">Please answer all questions before submitting.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
