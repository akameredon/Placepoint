import { connection } from "next/server";
import { databaseUrl, db } from "@/lib/db";
import { nipostMode } from "@/lib/nipost";

export async function GET() {
  await connection();
  let database = "off";
  if (databaseUrl()) {
    try {
      await (await db()).query("SELECT 1");
      database = "ok";
    } catch {
      database = "error";
    }
  }
  return Response.json({ ok: database === "ok", database, nipost: nipostMode() });
}
