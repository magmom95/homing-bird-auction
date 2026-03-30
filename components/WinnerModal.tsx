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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-2 border-gray-800 w-full max-w-sm p-8 text-center space-y-4">
        <div className="text-4xl">🎉</div>
        <p className="text-xs text-gray-500 tracking-widest">이번 경매 예측</p>
        <p className="text-2xl font-bold">{displayName}</p>
        <p className="text-sm text-yellow-600 font-semibold">1위</p>

        <div className="bg-gray-50 border border-gray-200 p-4 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">예상가</span>
            <span className="font-medium">{formatPrice(winner.predicted_price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">실제 낙찰가</span>
            <span className="font-medium">{formatPrice(actualPrice)}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
            <span className="text-gray-500">차이</span>
            <span className="font-bold text-red-600">{formatPrice(winner.diff)}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-gray-800 text-white py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}
