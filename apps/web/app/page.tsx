"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronRight, Building2, Users, Search, Award, BarChart, Briefcase } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
// import { LoginModal } from "@/components/login-modal"
// import { RegisterModal } from "@/components/register-modal"
import {AuthModalController} from "@/components/auth-dialog-controller"

export default function LandingPage() {
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authModalType, setAuthModalType] = useState<"login" | "register" | null>(null)
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b sticky top-0 z-50 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-md">
        <div className="px-6 md:px-8 flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">KAFConnect</span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="#" className="text-sm font-medium hover:text-primary">
              Find Jobs
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              For Employers
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="#" className="text-sm font-medium hover:text-primary">
              About Us
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button 
              onClick={() => {
                setAuthModalType("login")
                setAuthModalOpen(true)
              }}
              variant="link"
            >
              Login
            </Button>
            <Button 
              onClick={() => {
                setAuthModalType("register")
                setAuthModalOpen(true)
              }}
              variant="outline"
              className="bg-dark"
            >
              Register
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <AuthModalController
          open={authModalOpen}
          modalType={authModalType}
          onOpenChange={setAuthModalOpen}
          setModalType={setAuthModalType}
          showTriggerButtons={false}
        />
        {/* Hero Section */}
        <section className="h-svh py-20 md:py-28 -mt-16 bg-[url('/bg-company.jpg')] bg-cover bg-center relative flex ">
          <div className="absolute inset-0 bg-black/50 z-0" />
          <div className="relative px-6 md:px-8 z-10 flex">
            <div className="grid gap-6 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl text-white font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                  Join Us, And Start Your New Journey
                </h1>
                <p className="max-w-[600px] md:text-xl text-gray-100">
                  Helps candidates to find the perfect job and land their dream roles.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button 
                    size="lg"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      setAuthModalType("register")
                      setAuthModalOpen(true)
                    }} >
                    Get Started
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Link href="#how-it-works">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      Learn More
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-muted py-12">
          <div className="px-6 md:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">10k+</h3>
                <p className="text-muted-foreground">Active Jobs</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">25k+</h3>
                <p className="text-muted-foreground">Job Seekers</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-3xl font-bold">95%</h3>
                <p className="text-muted-foreground">Success Rate</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="how-it-works" className="py-20">
          <div className="px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How KAFConnect Works</h2>
              <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px] mx-auto">
                This platform makes recruitment simple and effective for job seekers who want to join KAF.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Find Opportunities</h3>
                <p className="text-muted-foreground">
                  Browse thousands of roles listings tailored to your skills and experience.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Connect with Us</h3>
                <p className="text-muted-foreground">Directly communicate with hiring managers and recruiters.</p>
              </div>

              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Land Your Dream Job</h3>
                <p className="text-muted-foreground">
                  Get hired with our proven process and support throughout your journey.
                </p>
              </div>

              <div className="flex flex-col items-center text-center p-6 border rounded-lg">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-2">Talent Matching</h3>
                <p className="text-muted-foreground">
                  Our AI-powered system matches the right candidates with the right jobs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-muted py-20">
          <div className="px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Success Stories</h2>
              <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px] mx-auto">
                See what our employees say about their experience with KAFConnect.
              </p>
            </div>

            <div className="grid md:grid-cols-3 grid-cols-1 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 mr-3"></div>
                  <div>
                    <h4 className="font-semibold">Kelvin Firdaus</h4>
                    <p className="text-sm text-muted-foreground">Software Engineer</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Lorem ipsum dolor sit amet consectetur adipisicing, elit. Placeat aliquid dolore, quo!"
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 mr-3"></div>
                  <div>
                    <h4 className="font-semibold">Andrew Fisabilillah</h4>
                    <p className="text-sm text-muted-foreground">HR Director</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Delectus sunt, dignissimos laudantium."
                </p>
              </div>

              <div className="bg-background p-6 rounded-lg shadow-sm">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 mr-3"></div>
                  <div>
                    <h4 className="font-semibold">Farros Anwari</h4>
                    <p className="text-sm text-muted-foreground">Marketing Manager</p>
                  </div>
                </div>
                <p className="text-muted-foreground">
                  "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Voluptate molestias ratione eaque qui rem."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="px-6 md:px-8">
            <div className="bg-primary text-primary-foreground rounded-lg p-8 md:p-12 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl mb-4">
                Ready to join KAF and boost your career?
              </h2>
              <p className="mb-6 max-w-[600px] mx-auto text-primary-foreground/90 md:text-xl">
                Join thousands of successful job seekers on KAFConnect today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto"
                  onClick={() => {
                    setAuthModalType("register")
                    setAuthModalOpen(true)
                  }}
                >
                  Join Now
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="px-6 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">For Job Seekers</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Browse Jobs
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Career Resources
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Resume Tips
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Interview Prep
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    Accessibility
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Building2 className="h-5 w-5 text-primary" />
              <span className="font-bold">KAFConnect</span>
            </div>

            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} KAFConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
