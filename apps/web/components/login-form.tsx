"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function LoginForm({ switchToRegister }: { switchToRegister: () => void }) {
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value

    const res = await fetch('http://localhost:3000/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    if (res.ok) {
      alert('Login berhasil')
      localStorage.setItem('token', data.access_token)
      window.location.href = data.url
    } else {
      alert(data.message || 'Login gagal')
    }

    // Simulate login process
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="grid gap-6 mt-5">
      <form onSubmit={onSubmit}>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
            </div>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              autoCapitalize="none"
              autoComplete="current-password"
              disabled={isLoading}
              required
            />
          </div>
          <Button disabled={isLoading} type="submit" className="w-full">
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </form>
      <div className="mt-4 text-center text-sm">
        Don't have an account?{" "}
        <Button
          onClick={switchToRegister}
          variant="link"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign Up
        </Button>
      </div>
    </div>
  )
}
