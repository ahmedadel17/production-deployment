'use client'

import { useEffect } from 'react'

export default function RunSliderInit() {
  useEffect(() => {
    try {
      if (typeof (window as any).initSiteSlider === 'function') {
        ;(window as any).initSiteSlider()
      }
    } catch {}
  }, [])
  return null
}




