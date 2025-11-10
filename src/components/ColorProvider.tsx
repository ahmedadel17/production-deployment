'use client'
import { useEffect, useState, ReactNode, useRef } from 'react'
import axios from 'axios'
import { generatePaletteFromHex } from '../../tailwindPlugins/colors' // 👈 تأكد من المسار الصحيح

type Props = {
  children: ReactNode
}

const SETTINGS_CACHE_KEY = 'app_settings_cache'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes in milliseconds

export default function ColorProvider({ children }: Props) {
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const fetchPromiseRef = useRef<Promise<void> | null>(null)

  useEffect(() => {
    setMounted(true)
    
    const fetchColors = async () => {
      // Check cache first
      try {
        const cached = localStorage.getItem(SETTINGS_CACHE_KEY)
        if (cached) {
          const { data, timestamp } = JSON.parse(cached)
          const now = Date.now()
          
          // Use cache if it's less than 5 minutes old
          if (now - timestamp < CACHE_DURATION) {
            applyColors(data)
            setLoading(false)
            return
          }
        }
      } catch {
        // Cache read failed, continue to fetch
      }

      // Prevent duplicate requests
      if (fetchPromiseRef.current) {
        await fetchPromiseRef.current
        return
      }

      // Create fetch promise
      fetchPromiseRef.current = (async () => {
        try {
          const res = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/settings`)
          const colors = res.data.data.settings

          // Cache the response
          try {
            localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify({
              data: colors,
              timestamp: Date.now()
            }))
          } catch {
            // Cache write failed, continue anyway
          }

          applyColors(colors)
          setLoading(false)
        } catch (err) {
          console.error('Failed to fetch colors:', err)
          setLoading(false)
        } finally {
          fetchPromiseRef.current = null
        }
      })()

      await fetchPromiseRef.current
    }

    const applyColors = (colors: Record<string, string>) => {
      const root = document.documentElement
      Object.entries(colors).forEach(([key, value]) => {
        if (
          key.endsWith('_color') ||
          key.startsWith('gradient_') ||
          key.startsWith('gray_') ||
          key.startsWith('green_') ||
          key.startsWith('red_')
        ) {
          // 👇 استخراج اسم المتغير
          let variableName = `--apicolor-${key}`
          if (key.endsWith('_color')) {
            variableName = `--apicolor-${key.replace('_color', '')}`
          }

          const colorValue = value as string
          root.style.setProperty(variableName, colorValue)

          // ✅ لو اللون الأساسي (مش gray ولا gradient)، نولّد تدرجاته
          if (key.endsWith('_color')) {
            const palette = generatePaletteFromHex(colorValue)
            Object.entries(palette).forEach(([step, shade]) => {
              root.style.setProperty(`--apicolor-${key.replace('_color', '')}_${step}`, shade as string)
            })
          }
        }
      })
    }

    fetchColors()
  }, [])

  // On server, always render children to avoid hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-900 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
      </div>
    )
  }

  return <>{children}</>
}
