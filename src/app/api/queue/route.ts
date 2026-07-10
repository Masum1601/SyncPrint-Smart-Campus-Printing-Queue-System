import { NextResponse } from "next/server";
import { deletePrintRequest, listPrintRequests } from "@/lib/print-requests/store";

export async function GET() {
  const requests = await listPrintRequests();
  return NextResponse.json({ requests });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Print job id is required." }, { status: 400 });
  }

  const deleted = await deletePrintRequest(id);

  if (!deleted) {
    return NextResponse.json({ error: "Print job was not found." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}