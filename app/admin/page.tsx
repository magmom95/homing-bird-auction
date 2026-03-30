"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 비밀번호 검증 (관리자 API 테스트)
    const res = await fetch("/api/prediction?auction_id=test", {
      headers: { "x-admin-password": password },
    });

    if (res.status === 401) {
      setError("비밀번호가 올바르지 않습니다.");
      return;
    }

    sessionStorage.setItem("admin_password", password);
    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white border-2 border-gray-800 p-8 w-full max-w-sm space-y-4">
        <h1 className="text-center font-bold text-base">관리자 접근</h1>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-gray-600"
            placeholder="비밀번호 입력"
          />
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-gray-800 text-white py-2.5 text-sm font-semibold hover:bg-gray-700 transition-colors"
          >
            확인
          </button>
        </form>
        <div className="text-center">
          <a href="/" className="text-xs text-gray-400 underline">돌아가기</a>
        </div>
      </div>
    </div>
  );
}
