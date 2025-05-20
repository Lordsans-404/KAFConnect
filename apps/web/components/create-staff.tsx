"use client"
import { Briefcase, CalendarIcon, PlusCircle, UserRoundCog } from "lucide-react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {  } from "@/components/register-form"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

export function CreateStaff({token}: {token:string}){
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const name = document.getElementById('name').value
    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const level = "staff" 

    const res = await fetch('http://localhost:3000/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, level }),
    })

    const data = await res.json()
    if (res.ok) {
      alert('Register Staff berhasil!')
      setIsLoading(false)
    } else {
      alert(data.message || 'Register gagal')
      setIsLoading(false)
    }
  }
  return(
  <Dialog>
    <DialogTrigger asChild>
      <Button
        variant="outline"
        className="h-auto py-3 px-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700 flex flex-col items-center justify-center space-y-1 w-full"
      >
        <UserRoundCog className="h-5 w-5 text-cyan-600 dark:text-cyan-400" />
        <span className="text-xs">New Staff</span>
      </Button>
    </DialogTrigger>
    <DialogContent  className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Register New Staff</DialogTitle> 
      </DialogHeader>
      <div className="grid gap-6 mt-5">
        <form onSubmit={onSubmit}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="first-name">Full Name</Label>
              <Input id="name" placeholder="John Cenna" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                placeholder="••••••••"
                type="password"
                autoCapitalize="none"
                autoComplete="new-password"
                required
              />
            </div>
            <Input
                id="level"
                type="hidden"
                value="staff"
              />
            <Button type="submit" className="w-full">
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
          </div>
        </form>
      </div>
    </DialogContent>
  </Dialog>
  )
}