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
      .then((data) => {
        if (!data || data.error) {
          setLoading(false);
          return;
        }
        setAuction(data as AuctionItem);

        const key = `participated_${data.id}`;
        if (localStorage.getItem(key)) setParticipated(true);

        return fetch(`/api/result?auction_id=${data.id}`).then((r) => r.json());
      })
      .then((resultData) => {
        if (!resultData) return;
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
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8fafb" }}
      >
        <div className="text-center space-y-3">
          <img
            src="/icon128.png"
            alt="HOMING-BIRD-AUCTION"
            className="w-16 h-16 mx-auto animate-pulse"
          />
          <p className="text-sm" style={{ color: "#64748b" }}>
            불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8fafb" }}>
      {/* 히어로 헤더 */}
      <header
        className="relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #1a2332 0%, #2d4a4a 50%, #1a2332 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #c8956c 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-48 h-48 rounded-full"
            style={{
              background:
                "radial-gradient(circle, #2d6a6a 0%, transparent 70%)",
            }}
          />
        </div>
        <div className="relative max-w-md mx-auto px-4 py-8 text-center">
          <div
            className="w-24 h-24 mx-auto mb-3 rounded-full shadow-lg overflow-hidden"
            style={{
              background: "white",
              padding: "3px",
              marginLeft: "calc(50% - 48px + 2px)",
            }}
          >
            <img
              src="/main-logo-sm.png"
              alt="HOMING-BIRD-AUCTION"
              className="w-full h-full rounded-full"
              style={{
                objectFit: "cover",
                objectPosition: "center -10%",
                marginLeft: "4px",
              }}
            />
          </div>
          <h1 className="text-xl font-bold text-white tracking-wider">
            HOMING-BIRD-AUCTION
          </h1>
          <p className="text-xs mt-1" style={{ color: "#c8956c" }}>
            모의 부동산 경매 예측
          </p>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-6 space-y-5 -mt-2">
        {!auction ? (
          <div
            className="rounded-2xl text-center shadow-sm flex flex-col items-center justify-center"
            style={{ background: "white", border: "1px solid #e2e8f0", minHeight: "40vh", padding: "2rem" }}
          >
            <img
              src="/icon128.png"
              alt=""
              className="w-24 h-24 mx-auto mb-4 opacity-30"
            />
            <p className="text-lg font-semibold" style={{ color: "#1a2332" }}>
              현재 진행 중인 경매가 없습니다
            </p>
            <p className="text-sm mt-1" style={{ color: "#94a3b8" }}>
              새로운 경매가 등록되면 여기에 표시됩니다
            </p>
          </div>
        ) : (
          <>
            <AuctionNotice auction={auction} />

            {result?.visible && result.top3 && result.actual_price && (
              <ResultBoard
                actualPrice={result.actual_price}
                top3={result.top3}
              />
            )}

            {isOpen && !participated && !result?.visible && (
              <PredictionForm
                auctionId={auction.id}
                onSuccess={handleSuccess}
              />
            )}

            {submitted && (
              <div
                className="rounded-2xl p-5 text-center shadow-sm"
                style={{ background: "#e8f4f0", border: "1px solid #b8d8d0" }}
              >
                <div className="text-2xl mb-2">&#x2709;</div>
                <p className="text-sm font-medium" style={{ color: "#2d6a6a" }}>
                  예측이 제출되었습니다
                </p>
                <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                  결과는 마감 후 공개됩니다.
                </p>
              </div>
            )}

            {participated && !submitted && !result?.visible && (
              <div
                className="rounded-2xl p-5 text-center shadow-sm"
                style={{ background: "white", border: "1px solid #e2e8f0" }}
              >
                <p className="text-sm" style={{ color: "#64748b" }}>
                  이미 참여하셨습니다. 결과는 마감 후 공개됩니다.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* 푸터 */}
      <footer className="max-w-md mx-auto px-4 py-8 text-center space-y-2">
        <a
          href="/admin"
          className="inline-block text-xs font-medium px-5 py-2 rounded-xl"
          style={{ background: "#e2e8f0", color: "#64748b" }}
        >
          관리자
        </a>
        <p className="text-xs" style={{ color: "#cbd5e1" }}>
          HOMING-BIRD-AUCTION &copy; 2026
        </p>
      </footer>

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
