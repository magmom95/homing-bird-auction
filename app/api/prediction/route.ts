import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 예측 제출
export async function POST(req: Request) {
  const body = await req.json();
  const { auction_id, email, nickname, predicted_price } = body;

  if (!auction_id || !email || !predicted_price) {
    return NextResponse.json({ error: "필수 항목을 입력해주세요." }, { status: 400 });
  }

  const supabase = createAdminClient();

  // 중복 참여 확인
  const { data: existing } = await supabase
    .from("predictions")
    .select("id")
    .eq("auction_id", auction_id)
    .eq("email", email)
    .single();

  if (existing) {
    return NextResponse.json({ error: "이미 참여하셨습니다." }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("predictions")
    .insert([{ auction_id, email, nickname, predicted_price }])
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// 관리자: 입찰 데이터 조회
export async function GET(req: Request) {
  const password = req.headers.get("x-admin-password");
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const auctionId = searchParams.get("auction_id");

  const supabase = createAdminClient();
  const query = supabase.from("predictions").select("*").order("created_at", { ascending: true });
  if (auctionId) query.eq("auction_id", auctionId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
