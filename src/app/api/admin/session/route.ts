import { NextResponse } from "next/server";
import {
  clearAdminSession,
  createAdminSession,
  validateAdminPassword
} from "@/lib/admin-session";
import { adminLoginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const parsed = adminLoginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !validateAdminPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
  }

  await createAdminSession();
  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  await clearAdminSession();
  return NextResponse.json({ ok: true });
}
