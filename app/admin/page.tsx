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
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #1a2332 0%, #2d4a4a 50%, #1a2332 100%)",
      }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="w-24 h-24 mx-auto rounded-full shadow-lg overflow-hidden"
            style={{ background: "white", padding: "3px" }}
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
          <h1 className="text-lg font-bold text-white mt-4 tracking-wider">
            HOMING-BIRD-AUCTION
          </h1>
          <p className="text-xs mt-1" style={{ color: "#c8956c" }}>
            관리자 접근
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 space-y-4 shadow-xl"
          style={{ background: "white" }}
        >
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl px-4 py-3 text-sm"
            style={{ border: "1px solid #e2e8f0", background: "#f8fafb" }}
            placeholder="비밀번호 입력"
          />
          {error && (
            <div
              className="rounded-lg px-3 py-2"
              style={{ background: "#fef2f2", border: "1px solid #fecaca" }}
            >
              <p className="text-xs" style={{ color: "#dc2626" }}>
                {error}
              </p>
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 text-sm font-semibold text-white rounded-xl"
            style={{
              background: "linear-gradient(135deg, #2d6a6a 0%, #3d8a8a 100%)",
            }}
          >
            확인
          </button>
        </form>

        <div className="text-center mt-4">
          <a
            href="/"
            className="inline-block text-xs font-semibold px-5 py-2 rounded-xl"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            &larr; 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
