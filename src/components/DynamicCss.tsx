'use client'

import React, { useEffect } from 'react'

type Props = { css?: string | null }

export default function DynamicCss({ css }: Props) {
  useEffect(() => {
    if (!css) return
    const styleEl = document.createElement('style')
    styleEl.setAttribute('data-dynamic-css', 'true')
    styleEl.textContent = css
    document.head.appendChild(styleEl)
    // Try to (re)initialize slider if present
    try {
      if (typeof (window as any).initSiteSlider === 'function') {
        ;(window as any).initSiteSlider()
      }
    } catch {}
    return () => {
      try {
        document.head.removeChild(styleEl)
      } catch {
        // ignore
      }
    }
  }, [css])

  return null
}


