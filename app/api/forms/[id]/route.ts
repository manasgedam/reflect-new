import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  if (request.method === "GET") {
    const id = (await params).id;
    const form = await prisma.form.findUnique({
      where: {
        id: (await params).id,
      },
    });

    return new Response(JSON.stringify(form), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}
