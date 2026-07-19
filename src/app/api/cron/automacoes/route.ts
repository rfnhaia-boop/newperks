import { NextRequest, NextResponse } from "next/server";
import { processarAutomacoes } from "@/lib/automacoes";

export async function POST(req: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return NextResponse.json({ error: "CRON_SECRET não configurado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${segredo}`) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  return NextResponse.json(await processarAutomacoes());
}
