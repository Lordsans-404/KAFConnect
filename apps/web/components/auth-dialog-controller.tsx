// components/auth-modal-controller.tsx
"use client"

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

interface AuthModalControllerProps {
  open: boolean
  modalType: ModalType
  onOpenChange: (open: boolean) => void
  setModalType: (type: ModalType) => void
  showTriggerButtons?: boolean
}

export function AuthModalController({
  open,
  modalType,
  onOpenChange,
  setModalType,
  showTriggerButtons = true,
}: AuthModalControllerProps) {
  function openModal(type: ModalType) {
    setModalType(type)
    onOpenChange(true)
  }

  function closeModal() {
    onOpenChange(false)
    setModalType(null)
  }

  return (
    <>
      {/* Trigger buttons - optional */}
      {showTriggerButtons && (
        <div className="flex gap-2">
          <Button variant="link" onClick={() => openModal("login")}>Login</Button>
          <Button variant="outline" onClick={() => openModal("register")}>Register</Button>
        </div>
      )}

      {/* The actual dialog */}
      <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) setModalType(null) }}>
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