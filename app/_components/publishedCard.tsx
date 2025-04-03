"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Copy, LinkIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useClipboard } from "@/hooks/useClipboard"

interface PublishedCardProps {
  isPublished: boolean
  formUrl: string
}

const PublishedCard: React.FC<PublishedCardProps> = ({ isPublished, formUrl }) => {
  const clipboard = useClipboard()

  return (
    <>
      {isPublished && formUrl && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="mt-8 shadow-lg border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center">
                <Check className="h-5 w-5 mr-2 text-green-600" />
                Form Published Successfully
              </CardTitle>
              <CardDescription>
                Your form is now live and can be accessed using the URL below. Share this link with your respondents.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input value={formUrl} readOnly className="flex-grow bg-white dark:bg-gray-800 font-medium" />
                <Button
                  onClick={() => {
                    clipboard.copy(formUrl)
                    // Show visual feedback
                    const button = document.getElementById("copy-button")
                    if (button) {
                      button.classList.add("bg-green-100", "dark:bg-green-900/30")
                      setTimeout(() => {
                        button.classList.remove("bg-green-100", "dark:bg-green-900/30")
                      }, 1000)
                    }
                  }}
                  variant="outline"
                  id="copy-button"
                  className="transition-colors duration-300"
                >
                  {clipboard.copied ? (
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-1 text-green-600" />
                      <span className="text-green-600">Copied</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Copy className="h-4 w-4 mr-1" />
                      <span>Copy URL</span>
                    </div>
                  )}
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-900">
                <div className="flex items-center">
                  <LinkIcon className="h-5 w-5 mr-2 text-green-600" />
                  <span className="text-sm">Your form is now accessible to anyone with the link</span>
                </div>
                <Button
                  onClick={() => window.open(formUrl, "_blank")}
                  variant="secondary"
                  size="sm"
                  className="whitespace-nowrap"
                >
                  Open Form
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </>
  )
}

export default PublishedCard

