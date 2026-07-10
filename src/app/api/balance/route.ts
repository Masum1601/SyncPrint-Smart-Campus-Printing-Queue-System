import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addUserBalance, getUserBalance } from "@/lib/print-requests/store";

export const runtime = "nodejs";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to view your balance." }, { status: 401 });
  }

  const balance = await getUserBalance(userId);
  return NextResponse.json({ balance });
}

export async function POST(request: Request) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Sign in to add balance." }, { status: 401 });
  }

  const payload = (await request.json()) as { amount?: number };
  const amount = Number(payload.amount ?? 0);

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: "Enter a valid balance amount." }, { status: 400 });
  }

  const amountUnits = Math.round(amount * 2);
  const balance = await addUserBalance(userId, amountUnits);
  return NextResponse.json({ balance }, { status: 201 });
}