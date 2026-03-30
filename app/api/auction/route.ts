import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";

// 경매 조회 (all=true면 전체 목록, 아니면 최신 1건)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get("all");
  const supabase = createAdminClient();

  if (all === "true") {
    const { data, error } = await supabase
      .from("auctions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  }

  // 1순위: 관리자가 직접 선택한 메인 경매
  const { data: mainAuction } = await supabase
    .from("auctions")
    .select("*")
    .eq("is_main", true)
    .limit(1)
    .single();

  if (mainAuction) return NextResponse.json(mainAuction);

  // 2순위: 마감 임박한 진행중 경매
  const { data: openAuction } = await supabase
    .from("auctions")
    .select("*")
    .eq("status", "open")
    .order("end_at", { ascending: true })
    .limit(1)
    .single();

  if (openAuction) return NextResponse.json(openAuction);

  // 3순위: 결과 공개 당일인 경매
  const today = new Date().toISOString().split("T")[0];
  const { data: resultAuction } = await supabase
    .from("auctions")
    .select("*")
    .eq("result_open", true)
    .eq("result_date", today)
    .limit(1)
    .single();

  if (resultAuction) return NextResponse.json(resultAuction);

  return NextResponse.json({ error: "no auction" }, { status: 404 });
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
