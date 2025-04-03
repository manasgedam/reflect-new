"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

interface Form {
    id: string
    title: string
    responses: number
    updatedAt: string
    createdAt: string
    description?: string
}

export default function UserDashboard({ formId }: { formId: string }) {   
    const [form, setForm] = useState<Form | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
      async function fetchForm() {
        if (!formId) {
          console.error("No form ID provided");
          setLoading(false);
          return;
        }
        
        setLoading(true);
        try {
          const response = await fetch(`/api/forms/${formId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch form");
          }
  
          const data = await response.json();
          console.log("Form data:", data);
          
          setForm(data);
        } catch (error) {
          console.error(error);
          toast.error("Failed to fetch form");
        } finally {
          setLoading(false);
        }
      }
  
      fetchForm();
    }, [formId]);
  
    return (
      <div className="bg-background flex flex-col items-center mt-20 p-4">
        <div className="max-w-3xl w-full space-y-8 text-center">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
            Form Dashboard
          </h1>
          
          {loading ? (
            <p>Loading form data...</p>
          ) : form ? (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md text-left">
              <h2 className="text-2xl font-semibold mb-4">{form.title}</h2>
              {form.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4">{form.description}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Responses</p>
                  <p className="text-2xl font-bold">{form.responses}</p>
                </div>
                
                <div className="bg-white dark:bg-gray-700 p-4 rounded shadow">
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Last Updated</p>
                  <p className="text-sm font-medium">{new Date(form.updatedAt).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="mt-8 flex justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md mr-4">
                  View Responses
                </button>
                <button className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 px-4 py-2 rounded-md">
                  Edit Form
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-xl text-gray-600 dark:text-gray-400">Form not found.</p>
            </div>
          )}
        </div>
      </div>
    );
  }