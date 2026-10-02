import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getServerEnv } from "@/lib/env";

const COOKIE_NAME = "dandiyaa_admin";
const SESSION_AGE_SECONDS = 60 * 60 * 8;

function sign(value: string) {
  return createHmac("sha256", getServerEnv().ADMIN_SESSION_SECRET)
    .update(value)
    .digest("hex");
}

export function validateAdminPassword(candidate: string) {
  const expected = Buffer.from(getServerEnv().ADMIN_PASSWORD);
  const actual = Buffer.from(candidate);
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}

export async function createAdminSession() {
  const issuedAt = Date.now().toString();
  const payload = `${issuedAt}.${sign(issuedAt)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_AGE_SECONDS
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminSessionValid() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;

  const [issuedAt, signature] = raw.split(".");
  if (!issuedAt || !signature) return false;

  const age = Date.now() - Number(issuedAt);
  if (!Number.isFinite(age) || age < 0 || age > SESSION_AGE_SECONDS * 1000) {
    return false;
  }

  const expected = Buffer.from(sign(issuedAt));
  const actual = Buffer.from(signature);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
