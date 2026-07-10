import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createPrintRequest,
  listPrintRequestsByUser,
} from "@/lib/print-requests/store";
import type { CreatePrintRequestInput } from "@/lib/print-requests/types";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to view your print requests." }, { status: 401 });
  }

  const requests = await listPrintRequestsByUser(userId);
  return NextResponse.json({ requests });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to submit a print request." }, { status: 401 });
  }

  const user = await currentUser();
  const body = (await request.json()) as CreatePrintRequestInput;

  if (!body.document?.trim()) {
    return NextResponse.json({ error: "Document name is required." }, { status: 400 });
  }

  if (!body.printer?.trim()) {
    return NextResponse.json({ error: "Printer selection is required." }, { status: 400 });
  }

  if (!body.pages || body.pages < 1) {
    return NextResponse.json({ error: "Pages must be at least 1." }, { status: 400 });
  }

  if (!body.copies || body.copies < 1) {
    return NextResponse.json({ error: "Copies must be at least 1." }, { status: 400 });
  }

  const ownerName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ??
    user?.username ??
    "Student";

  const printRequest = await createPrintRequest(body, userId, ownerName);

  return NextResponse.json({ request: printRequest }, { status: 201 });
}
