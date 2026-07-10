import { NextResponse } from "next/server";
import { listPrinters } from "@/lib/print-requests/store";

export const runtime = "nodejs";

export async function GET() {
  const printers = await listPrinters();
  return NextResponse.json({ printers });
}