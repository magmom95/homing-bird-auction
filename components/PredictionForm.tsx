"use client";

import { useState } from "react";
import { formatNumber, parsePrice } from "@/lib/utils";

interface Props {
  auctionId: string;
  onSuccess: () => void;
}

export default function PredictionForm({ auctionId, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [priceInput, setPriceInput] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPriceInput(formatNumber(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !priceInput || !agreed) {
      setError("이메일과 예상 낙찰가를 입력하고 동의해주세요.");
      return;
    }

    const predicted_price = parsePrice(priceInput);
    if (predicted_price <= 0) {
      setError("올바른 금액을 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prediction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ auction_id: auctionId, email, nickname, predicted_price }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "제출에 실패했습니다.");
        return;
      }

      // 참여 기록 저장
      localStorage.setItem(`participated_${auctionId}`, "true");
      onSuccess();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-2 border-gray-800 bg-white p-6 space-y-4">
      <h3 className="text-center font-bold text-base border-b border-gray-300 pb-3">
        낙찰가 예측 참여
      </h3>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이메일 <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-600"
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            닉네임 <span className="text-gray-400 text-xs">(선택)</span>
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-600"
            placeholder="결과 화면에 표시될 이름"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            예상 낙찰가 <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={handlePriceChange}
              className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-600 pr-8"
              placeholder="금액 입력 (원)"
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">원</span>
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-xs text-gray-600">
          제출 후 수정이 불가함에 동의합니다.
        </span>
      </label>

      {error && <p className="text-red-500 text-xs">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gray-800 text-white py-2.5 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "제출 중..." : "예측 제출"}
      </button>
    </form>
  );
}
