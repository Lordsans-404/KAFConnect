"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ProfileForm } from "./profile-form"
import {
  User,
  Phone,
  CreditCard,
  MapPin,
  Mail,
  Calendar,
  Briefcase,
  GraduationCap,
  Globe,
  FileText,
  Edit,
  BookText,
} from "lucide-react"

export function UserProfile({ initialData, userData, profileData }) {
  return (
    <div className="space-y-8">
      {/* Profile Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                  <p className="font-medium">
                    {userData.user.name}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Identity Card Number</p>
                  <p className="font-medium">{userData.profile?.idCardNumber || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <BookText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Bio</p>
                  <p className="font-medium">{userData.profile.bio}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">Contact & Location</h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="font-medium">{userData.user.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                  <p className="font-medium">{userData.profile?.phoneNumber || "Not provided"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Address</p>
                  <p className="font-medium">{userData.profile?.address || "Not provided"}</p>
                  <div className="pl-2">
                    <p className="text-sm font-medium text-muted-foreground">City</p>
                    <p className="font-medium pl-2">{userData.profile?.city || "Not provided"}</p>
                    <p className="text-sm font-medium text-muted-foreground">State</p>
                    <p className="font-medium pl-2">{userData.profile?.stateProvince || "Not provided"}</p>
                    <p className="text-sm font-medium text-muted-foreground">Zip Code</p>
                    <p className="font-medium pl-2">{userData.profile?.postalCode || "Not provided"}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
