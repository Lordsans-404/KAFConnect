"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, User } from "lucide-react"

// Types matching your DTOs
interface AnswerDto {
  questionId: number
  choiceId: number
}

interface SubmitTestDto {
  testId: number
  userId: number
  answers: AnswerDto[]
}

// Mock data structure
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
  timeLimit: number // in minutes
  questions: Question[]
}

// Mock test data
const mockTest: Test = {
  id: 1,
  title: "JavaScript Fundamentals Assessment",
  description: "Test your knowledge of JavaScript basics and ES6+ features",
  timeLimit: 30,
  questions: [
    {
      id: 1,
      text: "What is the correct way to declare a variable in JavaScript ES6+?",
      choices: [
        { id: 1, text: "var myVariable = 'value'" },
        { id: 2, text: "let myVariable = 'value'" },
        { id: 3, text: "const myVariable = 'value'" },
        { id: 4, text: "Both let and const are correct" },
      ],
    },
    {
      id: 2,
      text: "Which method is used to add an element to the end of an array?",
      choices: [
        { id: 5, text: "array.push()" },
        { id: 6, text: "array.pop()" },
        { id: 7, text: "array.shift()" },
        { id: 8, text: "array.unshift()" },
      ],
    },
    {
      id: 3,
      text: "What does the '===' operator do in JavaScript?",
      choices: [
        { id: 9, text: "Checks for equality with type coercion" },
        { id: 10, text: "Checks for strict equality without type coercion" },
        { id: 11, text: "Assigns a value to a variable" },
        { id: 12, text: "Compares object references only" },
      ],
    },
    {
      id: 4,
      text: "Which of the following is NOT a JavaScript data type?",
      choices: [
        { id: 13, text: "string" },
        { id: 14, text: "boolean" },
        { id: 15, text: "integer" },
        { id: 16, text: "undefined" },
      ],
    },
  ],
}

export default function UserTestForm() {
  const [currentUser] = useState({ id: 123, name: "John Doe" }) // Mock user
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(mockTest.timeLimit * 60) // Convert to seconds

  // Calculate progress
  const progress = (Object.keys(answers).length / mockTest.questions.length) * 100
  const allQuestionsAnswered = Object.keys(answers).length === mockTest.questions.length

  // Handle answer selection
  const handleAnswerChange = (questionId: number, choiceId: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: choiceId,
    }))
  }

  // Submit test
  const handleSubmit = async () => {
    if (!allQuestionsAnswered) return

    setIsSubmitting(true)

    // Convert answers to DTO format
    const submitData: SubmitTestDto = {
      testId: mockTest.id,
      userId: currentUser.id,
      answers: Object.entries(answers).map(([questionId, choiceId]) => ({
        questionId: Number.parseInt(questionId),
        choiceId: choiceId,
      })),
    }

    try {
      // Simulate API call
      console.log("Submitting test:", submitData)

      // Replace with actual API call
      // const response = await fetch('/api/submit-test', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(submitData)
      // })

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsSubmitted(true)
    } catch (error) {
      console.error("Error submitting test:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

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
                <strong>Test:</strong> {mockTest.title}
                <br />
                <strong>Questions Answered:</strong> {Object.keys(answers).length} of {mockTest.questions.length}
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
                {mockTest.title}
              </CardTitle>
              <CardDescription>{mockTest.description}</CardDescription>
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
                {Object.keys(answers).length} of {mockTest.questions.length} questions
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* Questions */}
      <div className="space-y-6">
        {mockTest.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                Question {index + 1} of {mockTest.questions.length}
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
