"use client";

import { AuctionItem } from "@/types";
import { formatPrice, formatDate } from "@/lib/utils";

interface Props {
  auction: AuctionItem;
}

export default function AuctionNotice({ auction }: Props) {
  const isOpen = auction.status === "open" && new Date(auction.end_at) > new Date();

  return (
    <div className="border-2 border-gray-800 bg-white p-6 space-y-4">
      {/* 헤더 */}
      <div className="text-center border-b-2 border-gray-800 pb-4">
        <p className="text-xs text-gray-500 tracking-widest">부동산 경매 공고</p>
        <p className="text-sm font-semibold mt-1">사건번호: {auction.case_number}</p>
      </div>

      {/* 대표 이미지 */}
      {auction.image_url ? (
        <div className="w-full h-56 bg-gray-100 overflow-hidden">
          <img
            src={auction.image_url}
            alt={auction.title}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
          사진 없음
        </div>
      )}

      {/* 물건 정보 */}
      <div className="space-y-1">
        <h2 className="text-xl font-bold">{auction.title}</h2>
        <p className="text-gray-600 text-sm">{auction.address}</p>
      </div>

      {/* 금액 정보 */}
      <div className="bg-gray-50 border border-gray-200 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">감정가</span>
          <span className="font-medium">{formatPrice(auction.appraisal_price)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">최저입찰가</span>
          <span className="font-semibold text-red-600">{formatPrice(auction.minimum_bid_price)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 pt-2">
          <span className="text-gray-500">매수신청보증금 (10%)</span>
          <span className="font-medium">{formatPrice(auction.deposit_amount)}</span>
        </div>
      </div>

      {/* 마감 정보 */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">입찰 마감</span>
        <span className="font-medium">{formatDate(auction.end_at)}</span>
      </div>

      {/* 상태 + 링크 */}
      <div className="flex justify-between items-center">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isOpen
              ? "bg-green-100 text-green-700"
              : "bg-gray-200 text-gray-600"
          }`}
        >
          {isOpen ? "진행 중" : "마감"}
        </span>
        {auction.detail_url && (
          <a
            href={auction.detail_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 underline"
          >
            자세히 보기
          </a>
        )}
      </div>
    </div>
  );
}
