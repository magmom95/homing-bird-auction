"use client";

import { AuctionItem } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

interface Props {
  auction: AuctionItem;
}

export default function AuctionNotice({ auction }: Props) {
  const isOpen = auction.status === "open" && new Date(auction.end_at) > new Date();

  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "white", border: "1px solid #e2e8f0" }}>
      {/* 상단 배지 */}
      <div className="px-5 pt-4 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: isOpen ? "#10b981" : "#94a3b8" }} />
          <span className="text-xs font-semibold" style={{ color: isOpen ? "#10b981" : "#94a3b8" }}>
            {isOpen ? "진행 중" : "마감"}
          </span>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 rounded-full" style={{ background: "#f1f5f9", color: "#64748b" }}>
          {auction.case_number}
        </span>
      </div>

      {/* 대표 이미지 */}
      {auction.image_url ? (
        <div className="relative w-full h-52 bg-gray-100 overflow-hidden cursor-pointer" onClick={() => window.open(auction.image_url!, "_blank")}>
          <img
            src={auction.image_url}
            alt={auction.title}
            className="w-full h-full object-cover"
          />
          <span className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center text-xs" style={{ background: "rgba(0,0,0,0.4)", color: "white" }}>&#x1F50D;</span>
        </div>
      ) : (
        <div className="w-full h-52 flex items-center justify-center" style={{ background: "#f1f5f9" }}>
          <img src="/icon128.png" alt="" className="w-16 h-16 opacity-20" />
        </div>
      )}

      {/* 물건 정보 */}
      <div className="px-5 pt-4 pb-3">
        <h2 className="text-lg font-bold" style={{ color: "#1a2332" }}>{auction.title}</h2>
        <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>{auction.address}</p>
      </div>

      {/* 금액 정보 */}
      <div className="mx-5 rounded-xl p-4 space-y-3" style={{ background: "#f8fafb", border: "1px solid #e2e8f0" }}>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: "#94a3b8" }}>감정가</span>
          <span className="text-sm font-semibold" style={{ color: "#1a2332" }}>{formatPrice(auction.appraisal_price)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs" style={{ color: "#94a3b8" }}>최저입찰가</span>
          <span className="text-sm font-bold" style={{ color: "#dc2626" }}>{formatPrice(auction.minimum_bid_price)}</span>
        </div>
      </div>

      {/* 마감일 + 링크 */}
      <div className="px-5 py-4 flex justify-between items-center">
        <div>
          <p className="text-xs" style={{ color: "#94a3b8" }}>입찰 마감</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: "#1a2332" }}>{formatDate(auction.end_at)}</p>
        </div>
        {auction.detail_url && (
          <a
            href={auction.detail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "#e8f4f0", color: "#2d6a6a" }}
          >
            자세히 보기
          </a>
        )}
      </div>
    </div>
  );
}
