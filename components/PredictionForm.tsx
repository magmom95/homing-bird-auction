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
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (!priceInput) {
      setError("예상 낙찰가를 입력해주세요.");
      return;
    }
    const predicted_price = parsePrice(priceInput);
    if (predicted_price <= 0) {
      setError("올바른 금액을 입력해주세요.");
      return;
    }
    if (!agreed) {
      setError("제출 후 수정 불가에 동의해주세요.");
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

      localStorage.setItem(`participated_${auctionId}`, "true");
      onSuccess();
    } catch {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "white", border: "1px solid #e2e8f0" }}>
      <div className="px-5 pt-5 pb-3">
        <h3 className="text-sm font-bold" style={{ color: "#1a2332" }}>낙찰가 예측 참여</h3>
        <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>예상 낙찰가를 입력하고 제출하세요</p>
      </div>

      <div className="px-5 pb-5 space-y-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>
            이메일 <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(""); }}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm"
            style={{ border: "1px solid #e2e8f0", background: "#f8fafb" }}
            placeholder="example@email.com"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>
            닉네임 <span className="font-normal" style={{ color: "#cbd5e1" }}>(선택)</span>
          </label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full rounded-lg px-3.5 py-2.5 text-sm"
            style={{ border: "1px solid #e2e8f0", background: "#f8fafb" }}
            placeholder="결과 화면에 표시될 이름"
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "#64748b" }}>
            예상 낙찰가 <span style={{ color: "#dc2626" }}>*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              value={priceInput}
              onChange={handlePriceChange}
              className="w-full rounded-lg px-3.5 py-2.5 text-sm pr-10"
              style={{ border: "1px solid #e2e8f0", background: "#f8fafb" }}
              placeholder="금액 입력"
            />
            <span className="absolute right-3.5 top-2.5 text-sm" style={{ color: "#94a3b8" }}>원</span>
          </div>
        </div>

        <label className="flex items-start gap-2.5 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => { setAgreed(e.target.checked); setError(""); }}
            className="mt-0.5 w-4 h-4 rounded"
            style={{ accentColor: "#2d6a6a" }}
          />
          <span className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
            제출 후 수정이 불가함에 동의합니다.
          </span>
        </label>

        {error && (
          <div className="rounded-lg px-3 py-2" style={{ background: "#fef2f2", border: "1px solid #fecaca" }}>
            <p className="text-xs" style={{ color: "#dc2626" }}>{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 text-sm font-semibold text-white rounded-xl disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #2d6a6a 0%, #3d8a8a 100%)" }}
        >
          {loading ? "제출 중..." : "예측 제출"}
        </button>
      </div>
    </form>
  );
}
