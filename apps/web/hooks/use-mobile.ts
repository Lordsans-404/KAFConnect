"use client"

import { useEffect, useState } from "react"

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Function to check if the viewport width is mobile-sized
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on initial render
    checkIsMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("resize", checkIsMobile)
    }
  }, [])

  return isMobile
}
