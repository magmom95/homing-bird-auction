"use client";

import { PredictionWithDiff } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  actualPrice: number;
  top3: PredictionWithDiff[];
}

const RANK_CONFIG = [
  { label: "1st", bg: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "#f59e0b", text: "#92400e", icon: "&#x1F3C6;" },
  { label: "2nd", bg: "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)", border: "#94a3b8", text: "#475569", icon: "&#x1F948;" },
  { label: "3rd", bg: "linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)", border: "#f97316", text: "#9a3412", icon: "&#x1F949;" },
];

export default function ResultBoard({ actualPrice, top3 }: Props) {
  return (
    <div className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "white", border: "1px solid #e2e8f0" }}>
      <div className="px-5 pt-5 pb-4 text-center" style={{ background: "linear-gradient(135deg, #1a2332 0%, #2d4a4a 100%)" }}>
        <p className="text-xs tracking-widest" style={{ color: "#c8956c" }}>RESULT</p>
        <p className="text-lg font-bold text-white mt-1">
          실제 낙찰가: {formatPrice(actualPrice)}
        </p>
      </div>

      <div className="px-5 py-4 space-y-2.5">
        <p className="text-xs font-semibold text-center mb-3" style={{ color: "#64748b" }}>TOP 3</p>
        {top3.map((p, i) => (
          <div
            key={p.id}
            className="rounded-xl px-4 py-3.5 flex justify-between items-center"
            style={{ background: RANK_CONFIG[i].bg, border: `1px solid ${RANK_CONFIG[i].border}30` }}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg" dangerouslySetInnerHTML={{ __html: RANK_CONFIG[i].icon }} />
              <div>
                <p className="text-sm font-bold" style={{ color: RANK_CONFIG[i].text }}>
                  {p.nickname || p.email.split("@")[0]}
                </p>
                <p className="text-xs" style={{ color: "#94a3b8" }}>
                  예측: {formatPrice(p.predicted_price)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs" style={{ color: "#94a3b8" }}>차이</p>
              <p className="text-sm font-bold" style={{ color: RANK_CONFIG[i].text }}>
                {formatPrice(p.diff)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 pb-4">
        <p className="text-center text-xs py-2 rounded-lg" style={{ background: "#f8fafb", color: "#94a3b8" }}>
          ※ 결과는 당일에만 확인 가능합니다.
        </p>
      </div>
    </div>
  );
}
