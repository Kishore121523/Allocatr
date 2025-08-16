"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"
import { useEffect, useState } from "react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Check on mount
    checkIsMobile()

    // Listen for resize events
    window.addEventListener('resize', checkIsMobile)
    
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={isMobile ? "top-center" : "bottom-right"}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "var(--border)",
          "--description-text": "var(--foreground)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--foreground)",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--foreground)",
          "--warning-bg": "var(--popover)",
          "--warning-text": "var(--foreground)",
          "--info-bg": "var(--popover)",
          "--info-text": "var(--foreground)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
