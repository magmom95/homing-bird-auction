"use client";

import { PredictionWithDiff } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  winner: PredictionWithDiff;
  actualPrice: number;
  onClose: () => void;
}

export default function WinnerModal({ winner, actualPrice, onClose }: Props) {
  const displayName = winner.nickname || winner.email.split("@")[0];

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ background: "white" }}>
        {/* 상단 */}
        <div className="py-8 text-center" style={{ background: "linear-gradient(135deg, #1a2332 0%, #2d4a4a 100%)" }}>
          <div className="text-5xl mb-3">&#x1F389;</div>
          <p className="text-xs tracking-widest" style={{ color: "#c8956c" }}>이번 경매 예측</p>
          <p className="text-2xl font-bold text-white mt-2">{displayName}</p>
          <div className="inline-block mt-2 px-4 py-1 rounded-full text-xs font-bold" style={{ background: "#c8956c", color: "white" }}>
            1위
          </div>
        </div>

        {/* 내용 */}
        <div className="px-6 py-5 space-y-3">
          <div className="rounded-xl p-4 space-y-2.5" style={{ background: "#f8fafb", border: "1px solid #e2e8f0" }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#94a3b8" }}>예상가</span>
              <span className="font-semibold" style={{ color: "#1a2332" }}>{formatPrice(winner.predicted_price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: "#94a3b8" }}>실제 낙찰가</span>
              <span className="font-semibold" style={{ color: "#1a2332" }}>{formatPrice(actualPrice)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2" style={{ borderTop: "1px dashed #e2e8f0" }}>
              <span style={{ color: "#94a3b8" }}>차이</span>
              <span className="font-bold" style={{ color: "#dc2626" }}>{formatPrice(winner.diff)}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 text-sm font-semibold text-white rounded-xl"
            style={{ background: "linear-gradient(135deg, #2d6a6a 0%, #3d8a8a 100%)" }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
