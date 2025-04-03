import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Checking if the user is authenticated
  const session = await auth();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!session.user?.email) {
    return new Response(JSON.stringify({ error: "Users email not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === 'GET') {
    try {
      // Fetch forms for the logged-in user
      const forms = await prisma.form.findMany({
        where: {
          userId: session.user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      return new Response(JSON.stringify(forms), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Request error', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        })
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}


export async function DELETE(request: NextRequest) {
  // Checking if the user is authenticated
  const session = await auth();

  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!session.user?.email) {
    return new Response(JSON.stringify({ error: "Users email not found" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
    });
  }

  if (request.method === 'DELETE') {
    try {
      const { id } = await request.json()

      // Delete the form
      const form = await prisma.form.delete({
        where: {
          id: id
        }
      })

      return new Response(JSON.stringify(form), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Request error', error)
      return new Response(JSON.stringify({ error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
        })
    }
  } else {
    // Handle unsupported HTTP methods
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

