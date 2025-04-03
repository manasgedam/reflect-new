"use client"

import { useState } from "react"

interface ClipboardResult {
  value: string
  copied: boolean
  copy: (text: string) => void
}

export const useClipboard = (): ClipboardResult => {
  const [value, setValue] = useState("")
  const [copied, setCopied] = useState(false)

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setValue(text)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 2000)
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err)
        setCopied(false)
      })
  }

  return {
    value,
    copied,
    copy,
  }
}

