// components/auth-modal-controller.tsx
"use client"

import { useState } from "react"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

type ModalType = "login" | "register" | null

export function AuthModalController() {
  const [open, setOpen] = useState(false)
  const [modalType, setModalType] = useState<ModalType>(null)

  function openModal(type: ModalType) {
    setModalType(type)
    setOpen(true)
  }

  function closeModal() {
    setOpen(false)
    setModalType(null)
  }

  return (
    <>
      {/* Trigger buttons */}
      <div className="flex gap-2">
        <Button variant="link" onClick={() => openModal("login")}>Login</Button>
        <Button variant="outline" onClick={() => openModal("register")}>Register</Button>
      </div>

      {/* The actual dialog */}
      <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) setModalType(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {modalType === "login" ? "Sign In" : "Create Account"}
            </DialogTitle>
          </DialogHeader>

          {modalType === "login" && (
            <LoginForm switchToRegister={() => openModal("register")} />
          )}

          {modalType === "register" && (
            <RegisterForm switchToLogin={() => openModal("login")} />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
