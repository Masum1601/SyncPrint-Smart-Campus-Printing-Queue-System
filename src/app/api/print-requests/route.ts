import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import {
  createPrintRequest,
  listPrintRequestsByUser,
} from "@/lib/print-requests/store";
import type { CreatePrintRequestInput } from "@/lib/print-requests/types";

export const runtime = "nodejs";

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
  const formData = await request.formData();
  const documentFile = formData.get("document");
  const printer = String(formData.get("printer") ?? "").trim();
  const copies = Number(formData.get("copies") ?? 0);
  const colorMode = String(formData.get("colorMode") ?? "").trim() as
    CreatePrintRequestInput["colorMode"];
  const duplex = String(formData.get("duplex") ?? "true") === "true";

  if (!(documentFile instanceof File) || documentFile.size === 0) {
    return NextResponse.json({ error: "Document upload is required." }, { status: 400 });
  }

  if (!documentFile.name.toLowerCase().endsWith(".pdf")) {
    return NextResponse.json({ error: "Only PDF uploads are supported." }, { status: 400 });
  }

  if (!printer) {
    return NextResponse.json({ error: "Printer selection is required." }, { status: 400 });
  }

  if (!copies || copies < 1) {
    return NextResponse.json({ error: "Copies must be at least 1." }, { status: 400 });
  }

  if (colorMode !== "Black and white" && colorMode !== "Color") {
    return NextResponse.json({ error: "Color mode is required." }, { status: 400 });
  }

  const ownerName =
    user?.fullName ??
    [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ??
    user?.username ??
    "Student";

  const printRequest = await createPrintRequest(
    {
      documentFile,
      printer,
      copies,
      colorMode,
      duplex,
    },
    userId,
    ownerName,
  );

  return NextResponse.json({ request: printRequest }, { status: 201 });
}
