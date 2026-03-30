import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 현재 경매 1건 조회
export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("auctions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 관리자: 경매 등록
export async function POST(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase.from("auctions").insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
