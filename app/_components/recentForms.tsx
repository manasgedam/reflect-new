"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  PlusCircle, 
  Search,
  Filter,
  MoreVertical,
  FileText,
  Copy,
  Trash2,
  ClipboardList,
  Loader2,
  Calendar,
  BarChart,
} from "lucide-react"
import Image from "next/image"
import { toast, Toaster } from "sonner"

// Form interface for type safety
  interface Form {
    id: string
    title: string
    responses: number
    updatedAt: string
    createdAt: string
    description?: string
  }

// Mock data for form templates
const formTemplates = [
  { id: 0, title: "Blank Form", description: "Start from scratch", image: "/placeholder.svg?height=100&width=200" },
  {
    id: 1,
    title: "Customer Feedback",
    description: "Gather insights from your customers",
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 2,
    title: "Event Registration",
    description: "Collect attendee information for your event",
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 3,
    title: "Job Application",
    description: "Streamline your hiring process",
    image: "/placeholder.svg?height=100&width=200",
  },
  {
    id: 4,
    title: "Quiz Template",
    description: "Create engaging quizzes for various purposes",
    image: "/placeholder.svg?height=100&width=200",
  },
]

export default function RecentForms() {
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [forms, setForms] = useState<Form[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"name" | "date" | "responses">("date")

  useEffect(() => {
    async function fetchForms() {
      setIsLoading(true)
      try {
        const response = await fetch("/api/forms")
        if (!response.ok) {
          throw new Error("Failed to fetch forms")
        }

        const data = await response.json()
        setForms(data)
      } catch (error) {
        console.error("Error fetching forms", error)
        toast.error("Failed to load your forms. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }
    fetchForms()
  }, [])

  // Handle template selection and navigation
  const handleTemplateSelect = (templateId: number) => {
    setSelectedTemplate(templateId)
    // You could also navigate directly to form builder with template ID
    // router.push(`/form-builder/new?template=${templateId}`)
  }

  // Handle form creation with selected template
  const handleCreateForm = () => {
    if (selectedTemplate !== null) {
      router.push(`/form-builder/new?template=${selectedTemplate}`)
    } else {
      router.push("/form-builder/new") // Default to blank template
    }
  }

  // Handle form deletion
  const handleDeleteForm = async (formId: string) => {
    try {
      // Show confirmation dialog
      if (!confirm("Are you sure you want to delete this form?")) {
        return
      }

      const response = await fetch(`/api/forms/${formId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete form")
      }

      // Remove form from state
      setForms(forms.filter((form) => form.id !== formId))

      toast.success("Form deleted successfully")
    } catch (error) {
      console.error("Error deleting form:", error)
      toast.error("Failed to delete form. Please try again.")
    }
  }

  // Handle form duplication
  const handleDuplicateForm = async (formId: string) => {
    try {
      const response = await fetch(`/api/forms/${formId}/duplicate`, {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to duplicate form")
      }

      const newForm = await response.json()

      // Add new form to state
      setForms([...forms, newForm])

      toast.success("Form duplicated successfully")
    } catch (error) {
      console.error("Error duplicating form:", error)
      toast.error("Failed to duplicate form. Please try again.")
    }
  }

  // Sort forms based on selected sort option
  const sortedForms = [...forms]
    .filter((form) => form.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "date":
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        case "responses":
          return b.responses - a.responses
        default:
          return 0
      }
    })

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold">Forms Dashboard</h1>
      </header>

      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Templates</h2>
          <Button onClick={handleCreateForm} disabled={isLoading} variant="outline">
            Use Selected Template
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {formTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                selectedTemplate === template.id ? "ring-2 ring-primary" : "hover:border-primary/50"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              <CardHeader className="p-0">
                <Image
                  src={template.image || "/placeholder.svg"}
                  alt={template.title}
                  width={200}
                  height={100}
                  className="w-full h-auto object-cover rounded-t-lg"
                />
              </CardHeader>
              <CardContent className="p-4">
                <CardTitle className="text-sm mb-2">{template.title}</CardTitle>
                <p className="text-xs text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-grow">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search forms"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setSortBy("name")}>Sort by Name</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy("date")}>Sort by Date</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setSortBy("responses")}>Sort by Responses</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Button onClick={() => router.push("/form-builder")}>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Form
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Your Forms</CardTitle>
            <CardDescription>
              {forms.length} {forms.length === 1 ? "form" : "forms"} total
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sortedForms.length > 0 ? (
            <ScrollArea className="h-[400px]">
              {sortedForms.map((form, index) => (
                <div key={form.id} className="transition-colors">
                  <div
                    className="flex items-center justify-between p-4 hover:bg-accent rounded-md transition-colors cursor-pointer group"
                    onClick={() => router.push(`/user-dashboard/${form.id}`)}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="bg-primary/10 p-2 rounded-md">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium group-hover:text-primary transition-colors">{form.title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground space-x-4">
                          <span className="flex items-center">
                            <BarChart className="h-3 w-3 mr-1" />
                            {form.responses} responses
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Updated {formatDate(form.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleDuplicateForm(form.id)}>
                            <Copy className="mr-2 h-4 w-4" /> Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteForm(form.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {index < sortedForms.length - 1 && <Separator />}
                </div>
              ))}
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4 mb-4">
                <ClipboardList className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No forms yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                You haven't created any forms yet. Get started by creating your first form using one of our templates.
              </p>
              <Button size="lg" onClick={() => router.push("/form-builder/new")}>
                <PlusCircle className="mr-2 h-5 w-5" /> Create Your First Form
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      <Toaster position="top-right" />
    </div>
  )
}

