"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile-form"
import { Button } from "@/components/ui/button"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("Silakan login dulu")
        window.location.href = "/"
        return
      }

      try {
        const res = await fetch("http://localhost:3000/users/profile", {
          headers: { Authorization: "Bearer " + token },
        })

        const data = await res.json()

        if (res.ok) {
          setUser(data)
          console.log(data)
        } else {
          alert("Token invalid atau expired. Silakan login ulang.")
          window.location.href = "/"
        }
      } catch (err) {
        console.error("Failed to fetch profile", err)
      }
    }

    loadProfile()
  }, [])
  function logout() {
    localStorage.removeItem('token')
    window.location.href = '/'
  }

  const handleResendVerification = async (email:string) => {
    try {
      // Get the user's email from your auth context or wherever it's stored
      const userEmail = email || '';
      
      const response = await axios.post(
        'http://localhost:3000/users/resend-verification',
        { email: userEmail },
        {
          headers: {
            'Content-Type': 'application/json',
            // Add authorization header if needed
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      console.log(response.data.message);
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to resend verification email');
    } finally {
      console.log("success")
    }
  };

  return (
    <div className="w-screen py-5 px-10">
      <h1 className="text-3xl font-bold mb-6">Complete Your Profile</h1>
      <p className="text-muted-foreground mb-8">
        Please provide additional information to complete your profile and get the most out of KAFConnect.
      </p>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your basic account information</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>
                      <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${user.isVerified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      <p className="font-medium">{user.isVerified ? 'Verified' : 'Not Verified'}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleResendVerification(user.email)} className={` bg-green-400 hover:bg-green-300 ${user.isVerified ? 'hidden' : ''}`}>
                        Verify Your Email
                      </Button>
                      <Button variant="destructive" onClick={logout}>Log Out</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Please provide your personal details to complete your profile</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>Set your job preferences to get better recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Please complete your personal information first before setting job preferences.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
