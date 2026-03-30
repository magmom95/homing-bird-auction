import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 관리자: 경매 수정
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("auctions")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 관리자: 경매 삭제
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  // 연관 predictions 먼저 삭제
  await supabase.from("predictions").delete().eq("auction_id", id);

  const { error } = await supabase.from("auctions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
