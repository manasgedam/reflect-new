"use client"

import type React from "react"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import { useClipboard } from "@/hooks/useClipboard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  PlusCircle,
  Trash2,
  ImageIcon,
  Video,
  Type,
  List,
  HelpCircle,
  Copy,
  Check,
  LinkIcon,
  X,
  Smile,
  Frown,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"
import { createForm } from "@/lib/actions/formAction"
import { FormSchema } from "@/lib/validations/formSchema"

export interface QuestionType {
  id: string;
  type: "multiple_choice" | "text" | "video" | "sentiment";
  text: string;
  required: boolean;
  options?: string[]; // Add this for multiple_choice questions
  image?: string;
}

export default function FormBuilder() {
  const [formImage, setFormImage] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState("Untitled Form")
  const [formDescription, setFormDescription] = useState("")
  const [questions, setQuestions] = useState<QuestionType[]>([])
  const [isPublished, setIsPublished] = useState(false)
  const [formUrl, setFormUrl] = useState("")
  const [activeTab, setActiveTab] = useState("edit")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})
  const clipboard = useClipboard()

  const formImageInputRef = useRef<HTMLInputElement>(null)

  const handleFormImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerFormImageUpload = () => {
    formImageInputRef.current?.click()
  }

  const removeFormImage = () => {
    setFormImage(null)
    if (formImageInputRef.current) {
      formImageInputRef.current.value = ""
    }
  }

  const addQuestion = (type: "multiple_choice" | "text" | "video" | "sentiment") => {
    const newQuestion: QuestionType = {
      id: Date.now().toString(),
      type,
      text: "",
      required: false,
    }

    if (type === "multiple_choice") {
      ;(newQuestion as any).options = ["Option 1"]
    }

    setQuestions([...questions, newQuestion])
  }

  const updateQuestion = (id: string, updates: Partial<QuestionType>) => {
    setQuestions(questions.map((q) => (q.id === id ? { ...q, ...updates } : q)))
  }

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id))
  }

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple_choice" && (q as any).options && (q as any).options.length < 4) {
          return {
            ...q,
            options: [...(q as any).options, `Option ${(q as any).options.length + 1}`],
          }
        }
        return q
      }),
    )
  }

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple_choice" && (q as any).options) {
          const newOptions = [...(q as any).options]
          newOptions[optionIndex] = value
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId && q.type === "multiple_choice" && (q as any).options) {
          const newOptions = (q as any).options.filter((_: any, index: number) => index !== optionIndex)
          return { ...q, options: newOptions }
        }
        return q
      }),
    )
  }

  const handleQuestionImageUpload = (questionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updateQuestion(questionId, { image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const triggerQuestionImageUpload = (questionId: string) => {
    const fileInput = document.getElementById(`question-image-upload-${questionId}`) as HTMLInputElement
    fileInput?.click()
  }

  const removeQuestionImage = (questionId: string) => {
    updateQuestion(questionId, { image: undefined })
    const fileInput = document.getElementById(`question-image-upload-${questionId}`) as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const toggleRequired = (questionId: string, required: boolean) => {
    updateQuestion(questionId, { required })
  }

  const validateForm = () => {
    // Reset validation errors
    setValidationErrors({})

    // Create the form data object
    const formData = {
      title: formTitle,
      description: formDescription,
      image: formImage || undefined,
      questions,
    }

    // Validate with Zod schema
    const result = FormSchema.safeParse(formData)

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors
      setValidationErrors(errors)

      // Show toast with validation error
      toast({
        title: "Validation Error",
        description: "Please fix the errors in your form before publishing.",
        variant: "destructive",
      })

      return false
    }

    return true
  }

  const handlePublish = async () => {
    // Validate the form
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Create the form data object
      const formData = {
        title: formTitle,
        description: formDescription,
        image: formImage || undefined,
        questions,
      }

      // Submit the form using the server action
      const result = await createForm(formData)

      if (result.success) {
        setIsPublished(true)
        setFormUrl(result.formUrl || "")

        // Copy to clipboard
        clipboard.copy(result.formUrl || "")

        toast({
          title: "Form Published",
          description: "Your form has been published successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to publish form",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error publishing form:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred while publishing your form.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnpublish = () => {
    setIsPublished(false)
    setFormUrl("")

    toast({
      title: "Form Unpublished",
      description: "Your form is no longer accessible to others.",
    })
  }

  const getSentimentEmoji = (value: number) => {
    switch (value) {
      case 1:
        return <Frown className="h-6 w-6 text-destructive" />
      case 2:
        return <Frown className="h-6 w-6 text-amber-500" />
      case 3:
        return <Smile className="h-6 w-6 text-amber-400" />
      case 4:
        return <Smile className="h-6 w-6 text-green-400" />
      case 5:
        return <Smile className="h-6 w-6 text-green-500" />
      default:
        return <Smile className="h-6 w-6 text-amber-400" />
    }
  }

  const getSentimentLabel = (value: number) => {
    switch (value) {
      case 1:
        return "Very Sad"
      case 2:
        return "Sad"
      case 3:
        return "Neutral"
      case 4:
        return "Happy"
      case 5:
        return "Very Happy"
      default:
        return "Neutral"
    }
  }

  const renderPreview = () => {
    return (
      <div className="space-y-6">
        {formImage && (
          <div className="relative">
            <img
              src={formImage || "/placeholder.svg"}
              alt="Form"
              className="w-full h-48 object-cover rounded-lg shadow-md"
            />
          </div>
        )}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{formTitle || "Untitled Form"}</CardTitle>
            {formDescription && <CardDescription>{formDescription}</CardDescription>}
          </CardHeader>
        </Card>

        {questions.map((question, index) => (
          <Card key={question.id}>
            <CardContent className="pt-6">
              {question.image && (
                <div className="mb-4">
                  <img
                    src={question.image || "/placeholder.svg"}
                    alt="Question"
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-medium">{question.text || `Question ${index + 1}`}</h3>
                {question.required && (
                  <Badge variant="destructive" className="h-5">
                    Required
                  </Badge>
                )}
              </div>

              {question.type === "multiple_choice" && (question as any).options && (
                <div className="space-y-2">
                  {(question as any).options.map((option: string, optionIndex: number) => (
                    <div key={optionIndex} className="flex items-center">
                      <div className="flex items-center space-x-2 p-3 rounded-md border">
                        <div className="h-4 w-4 rounded-full border border-primary"></div>
                        <span>{option}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {question.type === "text" && <Textarea placeholder="Your answer" className="w-full" />}

              {question.type === "video" && (
                <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                  <Video className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-muted-foreground">Record video response</span>
                </div>
              )}

              {question.type === "sentiment" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-2 mb-2">
                    <div className="flex items-center">
                      <Frown className="h-6 w-6 text-destructive" />
                      <span className="ml-1 text-sm">Very Sad</span>
                    </div>
                    <div className="flex items-center">
                      <Smile className="h-6 w-6 text-green-500" />
                      <span className="ml-1 text-sm">Very Happy</span>
                    </div>
                  </div>
                  <div className="flex justify-between gap-2">
                    {[
                      { value: 1, label: "Very Sad", icon: <Frown className="h-8 w-8 text-destructive" /> },
                      { value: 2, label: "Sad", icon: <Frown className="h-8 w-8 text-amber-500" /> },
                      { value: 3, label: "Neutral", icon: <Smile className="h-8 w-8 text-amber-400" /> },
                      { value: 4, label: "Happy", icon: <Smile className="h-8 w-8 text-green-400" /> },
                      { value: 5, label: "Very Happy", icon: <Smile className="h-8 w-8 text-green-500" /> },
                    ].map((emotion) => (
                      <div key={emotion.value} className="flex-1">
                        <button
                          type="button"
                          className="w-full flex flex-col items-center p-2 rounded-lg border-2 border-transparent hover:bg-muted/50 hover:border-muted-foreground/20 focus:outline-none"
                        >
                          {emotion.icon}
                          <span className="text-xs mt-1">{emotion.label}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardFooter className="flex justify-between pt-6">
            <Button variant="outline">Clear form</Button>
            <Button>Submit</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <div className="flex space-x-2">
              {!isPublished ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="default">Publish Form</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to publish this form?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will make your form accessible to others. You can unpublish it later if needed.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handlePublish} disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          "Publish"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button variant="destructive" onClick={handleUnpublish}>
                  Unpublish Form
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="edit" className="mt-0">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              {formImage && (
                <div className="mb-4 relative">
                  <img
                    src={formImage || "/placeholder.svg"}
                    alt="Form"
                    className="w-full h-48 object-cover rounded-lg shadow-md"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeFormImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <Card className="mb-8 shadow-lg border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="w-full">
                      <Input
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="text-8xl font-bold border-none focus-visible:ring-0 px-0"
                        placeholder="Enter form title"
                      />
                      {validationErrors.title && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.title[0]}</p>
                      )}
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFormImageUpload}
                            className="hidden"
                            id="form-image-upload"
                            ref={formImageInputRef}
                          />
                          <Button variant="outline" size="sm" onClick={triggerFormImageUpload}>
                            <ImageIcon className="h-4 w-4 mr-2" />
                            {formImage ? "Change Form Image" : "Add Form Image"}
                          </Button>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Upload an image to represent your form</p>
                      </TooltipContent>
                    </Tooltip>
                  </CardTitle>
                  <CardDescription>
                    <Textarea
                      placeholder="Form description (optional)"
                      className="w-full mt-2 resize-none"
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      rows={3}
                    />
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            {questions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card className="mb-6 shadow-md border-primary/10 relative overflow-hidden">
                  {question.required && (
                    <div className="absolute top-0 right-0">
                      <Badge variant="destructive" className="rounded-none rounded-bl-md">
                        Required
                      </Badge>
                    </div>
                  )}
                  <CardContent className="pt-6">
                    {question.image && (
                      <div className="mb-4 relative">
                        <img
                          src={question.image || "/placeholder.svg"}
                          alt="Question"
                          className="w-full h-48 object-cover rounded-lg shadow-sm"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeQuestionImage(question.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <div className="flex items-center mb-4">
                      <Label className="text-lg font-semibold">Question {index + 1}</Label>
                      <Select
                        value={question.type}
                        onValueChange={(value: "multiple_choice" | "text" | "video" | "sentiment") =>
                          updateQuestion(question.id, { type: value })
                        }
                      >
                        <SelectTrigger className="w-[180px] ml-4">
                          <SelectValue placeholder="Question Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="sentiment">Sentiment</SelectItem>
                        </SelectContent>
                      </Select>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="ml-2">
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Choose the type of question you want to ask</p>
                        </TooltipContent>
                      </Tooltip>
                      <div className="flex items-center ml-auto space-x-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`required-${question.id}`}
                            checked={question.required}
                            onCheckedChange={(checked) => toggleRequired(question.id, checked)}
                          />
                          <Label htmlFor={`required-${question.id}`} className="text-sm">
                            Required
                          </Label>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeQuestion(question.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mb-4">
                      <Input
                        value={question.text}
                        onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                        placeholder="Enter your question"
                      />
                      {validationErrors.questions && (
                        <p className="text-sm text-destructive mt-1">{validationErrors.questions[0]}</p>
                      )}
                    </div>
                    <div className="mb-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleQuestionImageUpload(question.id, e)}
                        className="hidden"
                        id={`question-image-upload-${question.id}`}
                      />
                      <Button variant="outline" size="sm" onClick={() => triggerQuestionImageUpload(question.id)}>
                        <ImageIcon className="h-4 w-4 mr-2" />
                        {question.image ? "Change Question Image" : "Add Question Image"}
                      </Button>
                    </div>
                    {question.type === "multiple_choice" && (
                      <div className="space-y-2">
                        {(question as any).options &&
                          (question as any).options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center">
                              <Input
                                value={option}
                                onChange={(e) => updateOption(question.id, optionIndex, e.target.value)}
                                placeholder={`Option ${optionIndex + 1}`}
                                className="mr-2"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(question.id, optionIndex)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        {(question as any).options && (question as any).options.length < 4 && (
                          <Button onClick={() => addOption(question.id)} variant="outline" size="sm">
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Add Option
                          </Button>
                        )}
                      </div>
                    )}
                    {question.type === "text" && (
                      <Textarea placeholder="Respondents will enter their answer here" className="w-full" disabled />
                    )}
                    {question.type === "video" && (
                      <div className="flex items-center justify-center h-32 bg-muted rounded-lg">
                        <Video className="h-8 w-8 text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Video response option</span>
                      </div>
                    )}
                    {question.type === "sentiment" && (
                      <div className="space-y-6 pt-2">
                        <div className="flex justify-between gap-2">
                          {[
                            { value: 1, label: "Very Sad", icon: <Frown className="h-8 w-8 text-destructive" /> },
                            { value: 2, label: "Sad", icon: <Frown className="h-8 w-8 text-amber-500" /> },
                            { value: 3, label: "Neutral", icon: <Smile className="h-8 w-8 text-amber-400" /> },
                            { value: 4, label: "Happy", icon: <Smile className="h-8 w-8 text-green-400" /> },
                            { value: 5, label: "Very Happy", icon: <Smile className="h-8 w-8 text-green-500" /> },
                          ].map((emotion) => (
                            <div key={emotion.value} className="flex-1">
                              <button
                                type="button"
                                className="w-full flex flex-col items-center p-3 rounded-lg border-2 border-transparent hover:bg-muted hover:border-primary/20 focus:outline-none focus:border-primary focus:bg-primary/5"
                              >
                                {emotion.icon}
                                <span className="text-xs mt-1">{emotion.label}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-muted-foreground text-center">
                          Click on an emotion to select it. Respondents will choose one option.
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Card className="p-4 shadow-md border-dashed border-2 border-primary/20 bg-muted/50">
                <div className="flex flex-wrap justify-center items-center gap-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => addQuestion("multiple_choice")}
                        variant="outline"
                        className="h-20 w-32 flex flex-col gap-2"
                      >
                        <List className="h-5 w-5" />
                        <span>Multiple Choice</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a multiple choice question</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => addQuestion("text")}
                        variant="outline"
                        className="h-20 w-32 flex flex-col gap-2"
                      >
                        <Type className="h-5 w-5" />
                        <span>Text</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a text response question</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => addQuestion("video")}
                        variant="outline"
                        className="h-20 w-32 flex flex-col gap-2"
                      >
                        <Video className="h-5 w-5" />
                        <span>Video</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add a video response question</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => addQuestion("sentiment")}
                        variant="outline"
                        className="h-20 w-32 flex flex-col gap-2"
                      >
                        <div className="flex space-x-1">
                          <Frown className="h-5 w-5 text-destructive" />
                          <Smile className="h-5 w-5 text-green-500" />
                        </div>
                        <span>Emotion Scale</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add an emotion rating question</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="preview" className="mt-0">
            {renderPreview()}
          </TabsContent>
        </Tabs>

        {isPublished && formUrl && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="mt-8 shadow-lg border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-900">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Check className="h-5 w-5 mr-2 text-green-600" />
                  Form Published
                </CardTitle>
                <CardDescription>Share this URL with others to allow them to fill out your form</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <Input value={formUrl} readOnly className="flex-grow bg-white dark:bg-gray-800" />
                  <Button onClick={() => clipboard.copy(formUrl)} variant="outline" size="icon">
                    {clipboard.copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button onClick={() => window.open(formUrl, "_blank")} variant="outline" size="icon">
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Open form in new tab</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {questions.length > 0 && questions.some((q) => !q.text) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6"
          >
            <div className="flex items-center p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950/20 dark:border-amber-900">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                Some questions don't have text. Make sure to fill in all question fields before publishing.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  )
}

