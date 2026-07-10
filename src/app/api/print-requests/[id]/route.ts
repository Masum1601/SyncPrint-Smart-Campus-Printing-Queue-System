import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getPrintRequestForUser } from "@/lib/print-requests/store";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to view this print request." }, { status: 401 });
  }

  const { id } = await context.params;
  const printRequest = await getPrintRequestForUser(id, userId);

  if (!printRequest) {
    return NextResponse.json({ error: "Print request not found." }, { status: 404 });
  }

  return NextResponse.json({ request: printRequest });
}
