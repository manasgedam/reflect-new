"use server";

import type { FormData } from "@/lib/validations/formSchema";
import { FormSubmissionSchema } from "@/lib/validations/formSchema";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { QuestionType } from "@prisma/client";

export async function createForm(formData: FormData) {
  try {
    // ✅ Step 1: Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, message: "You must be logged in to create a form." };
    }

    const userId = session.user.id;

    // ✅ Step 2: Validate form data using Zod
    const validationResult = FormSubmissionSchema.safeParse(formData);
    if (!validationResult.success) {
      return { success: false, errors: validationResult.error.flatten().fieldErrors };
    }

    const validatedData = validationResult.data;

    // ✅ Step 3: Define a mapping for question types
    const questionTypeMap: Record<string, QuestionType> = {
      text: QuestionType.TEXT,
      multiple_choice: QuestionType.MULTIPLE_CHOICE,
      sentiment: QuestionType.SENTIMENT,
      video: QuestionType.VIDEO,
    };

    console.log("Validated form data:", validatedData);

    // ✅ Step 4: Create form & questions in the database
    const savedForm = await prisma.form.create({
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        image: validatedData.image || null,
        userId: userId,
        questions: {
          create: validatedData.questions.map((question) => {
            const type = questionTypeMap[question.type?.toLowerCase()];

            if (!type) {
              throw new Error(`Invalid question type: ${question.type}`);
            }

            return {
              text: question.text,
              type: type,
              isRequired: question.required || false,
              image: question.image || null,
              multipleChoiceOptions: type === QuestionType.MULTIPLE_CHOICE 
                ? question.options?.map(option => option.text).filter(Boolean) || []
                : [],
            };
          }),
        },
      },
    });

    // ✅ Step 5: Return success response
    return {
      success: true,
      formId: savedForm.id,
      formUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/forms/${savedForm.id}`,
    };
  } catch (error) {
    console.error("Error in createForm action:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "An error occurred while creating the form.",
    };
  }
}
