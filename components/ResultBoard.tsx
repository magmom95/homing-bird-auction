"use client";

import { PredictionWithDiff } from "@/types";
import { formatPrice } from "@/lib/utils";

interface Props {
  actualPrice: number;
  top3: PredictionWithDiff[];
}

const MEDALS = ["1위", "2위", "3위"];
const MEDAL_STYLES = [
  "bg-yellow-50 border-yellow-300",
  "bg-gray-50 border-gray-300",
  "bg-orange-50 border-orange-300",
];

export default function ResultBoard({ actualPrice, top3 }: Props) {
  return (
    <div className="border-2 border-gray-800 bg-white p-6 space-y-4">
      <div className="text-center border-b border-gray-300 pb-3">
        <p className="text-xs text-gray-500 tracking-widest">결과 공개</p>
        <p className="text-sm font-bold mt-1">
          실제 낙찰가: <span className="text-red-600">{formatPrice(actualPrice)}</span>
        </p>
      </div>

      <p className="text-center text-sm font-semibold text-gray-700">TOP 3</p>

      <div className="space-y-2">
        {top3.map((p, i) => (
          <div
            key={p.id}
            className={`border rounded px-4 py-3 flex justify-between items-center ${MEDAL_STYLES[i]}`}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold w-6">{MEDALS[i]}</span>
              <span className="text-sm font-medium">
                {p.nickname || p.email.split("@")[0]}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold">{formatPrice(p.predicted_price)}</p>
              <p className="text-xs text-gray-500">차이 {formatPrice(p.diff)}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400">
        ※ 결과는 당일에만 확인 가능합니다.
      </p>
    </div>
  );
}
