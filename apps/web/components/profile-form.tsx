"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export function ProfileForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // Get form data
    const formData = new FormData(event.currentTarget)

    try {
      // In a real application, you would send this data to your backend
      // await saveProfileData(formData)

      const phone = document.getElementById('phone').value
      const idNumber = document.getElementById('idNumber').value
      const address = document.getElementById('address').value
      const city = document.getElementById('city').value
      const state = document.getElementById('state').value
      const zipCode = document.getElementById('zipCode').value
      const bio = document.getElementById('bio').value


      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      })

      // Redirect to dashboard or home page
      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Something went wrong",
        description: "Your profile information could not be saved. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" name="phone" placeholder="0845 2425 2005" required disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">Identity Card Number</Label>
          <Input id="idNumber" name="idNumber" placeholder="0012233445566778" required disabled={isLoading} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          placeholder="Enter your full address"
          required
          disabled={isLoading}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="City" required disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State/Province</Label>
          <Input id="state" name="state" placeholder="State/Province" required disabled={isLoading} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="zipCode">Zip/Postal Code</Label>
          <Input id="zipCode" name="zipCode" placeholder="Zip/Postal Code" required disabled={isLoading} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself, your skills, and experience"
          disabled={isLoading}
          className="min-h-[150px]"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Profile"}
      </Button>
    </form>
  )
}
