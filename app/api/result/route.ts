import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { todayStr } from "@/lib/utils";

// 결과 조회 (당일 공개 조건 체크)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const auctionId = searchParams.get("auction_id");

  if (!auctionId) {
    return NextResponse.json({ error: "auction_id required" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: auction, error: auctionError } = await supabase
    .from("auctions")
    .select("actual_price, result_date, result_open")
    .eq("id", auctionId)
    .single();

  if (auctionError) return NextResponse.json({ error: auctionError.message }, { status: 500 });

  const today = todayStr();
  const isVisible = auction.result_open && auction.result_date === today;

  if (!isVisible) {
    return NextResponse.json({ visible: false });
  }

  const { data: predictions, error: predError } = await supabase
    .from("predictions")
    .select("*")
    .eq("auction_id", auctionId);

  if (predError) return NextResponse.json({ error: predError.message }, { status: 500 });

  const actualPrice = auction.actual_price as number;
  const ranked = predictions
    .map((p) => ({ ...p, diff: Math.abs(p.predicted_price - actualPrice) }))
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 3);

  return NextResponse.json({ visible: true, actual_price: actualPrice, top3: ranked });
}
