"use client";

import { useEffect, useState } from "react";
import AuctionNotice from "@/components/AuctionNotice";
import PredictionForm from "@/components/PredictionForm";
import ResultBoard from "@/components/ResultBoard";
import WinnerModal from "@/components/WinnerModal";
import { AuctionItem, PredictionWithDiff } from "@/types";

export default function HomePage() {
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [participated, setParticipated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{
    visible: boolean;
    actual_price?: number;
    top3?: PredictionWithDiff[];
  } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auction")
      .then((r) => r.json())
      .then((data: AuctionItem) => {
        setAuction(data);

        // 이미 참여했는지 확인
        const key = `participated_${data.id}`;
        if (localStorage.getItem(key)) setParticipated(true);

        // 결과 조회
        return fetch(`/api/result?auction_id=${data.id}`).then((r) => r.json());
      })
      .then((resultData) => {
        setResult(resultData);
        if (resultData.visible && resultData.top3?.length > 0) {
          setShowModal(true);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSuccess = () => {
    setParticipated(true);
    setSubmitted(true);
  };

  const isOpen = auction
    ? auction.status === "open" && new Date(auction.end_at) > new Date()
    : false;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">불러오는 중...</p>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">현재 진행 중인 경매가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-md mx-auto py-8 px-4 space-y-4">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-lg font-bold tracking-widest text-gray-800">
            모의 부동산 경매
          </h1>
          <p className="text-xs text-gray-500 mt-1">낙찰가 예측 이벤트</p>
        </div>

        {/* 경매 공고 */}
        <AuctionNotice auction={auction} />

        {/* 결과 */}
        {result?.visible && result.top3 && result.actual_price && (
          <ResultBoard actualPrice={result.actual_price} top3={result.top3} />
        )}

        {/* 예측 폼 */}
        {isOpen && !participated && !result?.visible && (
          <PredictionForm auctionId={auction.id} onSuccess={handleSuccess} />
        )}

        {/* 제출 완료 메시지 */}
        {submitted && (
          <div className="border border-gray-300 bg-white p-4 text-center text-sm text-gray-600">
            예측이 제출되었습니다. 결과는 마감 후 공개됩니다.
          </div>
        )}

        {/* 이미 참여한 경우 */}
        {participated && !submitted && !result?.visible && (
          <div className="border border-gray-300 bg-white p-4 text-center text-sm text-gray-500">
            이미 참여하셨습니다. 결과는 마감 후 공개됩니다.
          </div>
        )}

        {/* 관리자 버튼 */}
        <div className="text-center pt-4">
          <a href="/admin" className="text-xs text-gray-400 underline">
            관리자
          </a>
        </div>
      </div>

      {/* 1등 모달 */}
      {showModal && result?.top3 && result.actual_price && (
        <WinnerModal
          winner={result.top3[0]}
          actualPrice={result.actual_price}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
