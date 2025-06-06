"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProfileForm } from "@/components/profile-form"
import { UserProfile } from "@/components/user-profile"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function ProfilePage() {
  const [data, setData] = useState<any>(null)
  const [profile,setProfile] = useState<any>(null)
  const [message, setMessage] = useState('')
  const [token, setToken] = useState<any>(null)

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("token")
      setToken(token)
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
        const profile = await data.profile

        if (res.ok) {
          setData(data)
          setProfile(data.profile)
          console.log(data)
        } else {
          alert("Token invalid atau expired. Silakan login ulang.")
          window.location.href = "/"
          return
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

  const handleResendVerification = async (email: string) => {
    try {
      const userEmail = email || '';
      console.log("Resend Verification - Start");

      // Basic fetch() request
      const response = await fetch('http://localhost:3000/users/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ email: userEmail }),
      });

      // Check if the request succeeded (status 200-299)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Parse the JSON response
      const data = await response.json();
      console.log("Response:", data.message);
      setMessage(data.message);

    } catch (error) {
      console.error("Request failed:", error);
      setMessage(error.message || 'Failed to resend verification email');
    } finally {
      console.log("Request completed");
    }
  };

  return (
    <div className="w-auto py-5 px-10">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      {profile?(
        <p className="text-muted-foreground mb-8">
          Thanks For Providing Additional Information, We Promise To Protect Your Data
        </p>
      ):(
        <p className="text-muted-foreground mb-8">
          Please provide additional information to complete your profile and get the most out of KAFConnect.
        </p>
      )}
      <div className="grid gap-8 md:grid-cols-5 lg:grid-cols-3">
        <div className="md:col-span-2 lg:col-span-1">
          <Card className="h-full relative">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your basic account information</CardDescription>
            </CardHeader>
            <CardContent className="mb-4">
              {data ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                      </div>
                      <div className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-green-500 border-2 border-white" />
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                    <p className="font-medium">{data.user.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="font-medium">{data.user.email}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 w-2 rounded-full ${data.user.isVerified ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                      <p className="font-medium">{data.user.isVerified ? 'Verified' : 'Not Verified'}</p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => handleResendVerification(data.user.email)} className={` bg-green-400 hover:bg-green-300 ${data.user.isVerified ? 'hidden' : ''}`}>
                        Verify Your Email
                      </Button>
                    </div>
                  </div>
                  <div className="absolute bottom-5">
                    <div className="flex items-center gap-2">
                      <Button variant="destructive" onClick={logout}>Log Out</Button>
                      <Button variant="outline" className="bg-slate-300 text-dark"><Link href="/dashboard">Dashboard</Link></Button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">Loading...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3 lg:col-span-2">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="personal">Personal Information</TabsTrigger>
              {profile && <TabsTrigger value="edit-profile">Edit Profile Information</TabsTrigger>}
            </TabsList>

            <TabsContent value="personal">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  {profile ? (
                      <CardDescription>See Details Of Your Information</CardDescription>
                    ) : (
                      <CardDescription>Please provide your personal details to complete your profile</CardDescription>
                    )
                  }
                </CardHeader>
                <CardContent>
                  {profile ? (
                      <UserProfile userData={data}/>
                    ) : (
                      <ProfileForm token={token} data_user={data}/>
                    )
                  }
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="edit-profile">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Your Informations</CardTitle>
                  <CardDescription>Set your profile to get better recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileForm token={token} data_user={data}/>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
