"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AuctionItem, Prediction } from "@/types";
import { formatPrice } from "@/lib/utils";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [auction, setAuction] = useState<AuctionItem | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // 폼 상태
  const [form, setForm] = useState({
    case_number: "",
    title: "",
    address: "",
    appraisal_price: "",
    minimum_bid_price: "",
    end_at: "",
    detail_url: "",
    status: "open" as "open" | "closed",
    actual_price: "",
    result_open: false,
    result_date: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    const pw = sessionStorage.getItem("admin_password");
    if (!pw) {
      router.push("/admin");
      return;
    }
    setPassword(pw);
    loadData(pw);
  }, []);

  const loadData = async (pw: string) => {
    try {
      const auctionRes = await fetch("/api/auction");
      if (auctionRes.ok) {
        const auctionData: AuctionItem = await auctionRes.json();
        setAuction(auctionData);
        setForm({
          case_number: auctionData.case_number,
          title: auctionData.title,
          address: auctionData.address,
          appraisal_price: String(auctionData.appraisal_price),
          minimum_bid_price: String(auctionData.minimum_bid_price),
          end_at: auctionData.end_at.slice(0, 16),
          detail_url: auctionData.detail_url || "",
          status: auctionData.status,
          actual_price: auctionData.actual_price ? String(auctionData.actual_price) : "",
          result_open: auctionData.result_open,
          result_date: auctionData.result_date || "",
        });
        setImagePreview(auctionData.image_url || "");

        const predRes = await fetch(`/api/prediction?auction_id=${auctionData.id}`, {
          headers: { "x-admin-password": pw },
        });
        if (predRes.ok) {
          setPredictions(await predRes.json());
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (file: File): Promise<string> => {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const ext = file.name.split(".").pop();
    const fileName = `auction_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("auction-images")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from("auction-images").getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      let imageUrl = auction?.image_url || null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      const payload = {
        case_number: form.case_number,
        title: form.title,
        address: form.address,
        image_url: imageUrl,
        appraisal_price: parseInt(form.appraisal_price),
        minimum_bid_price: parseInt(form.minimum_bid_price),
        end_at: new Date(form.end_at).toISOString(),
        detail_url: form.detail_url || null,
        status: form.status,
        actual_price: form.actual_price ? parseInt(form.actual_price) : null,
        result_open: form.result_open,
        result_date: form.result_date || null,
      };

      let res;
      if (auction) {
        res = await fetch(`/api/auction/${auction.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-admin-password": password },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/auction", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-password": password },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        setMessage(`오류: ${err.error}`);
        return;
      }

      setMessage("저장되었습니다.");
      loadData(password);
    } catch (e) {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="font-bold text-lg">관리자 대시보드</h1>
          <a href="/" className="text-xs text-gray-500 underline">사용자 페이지</a>
        </div>

        {/* 경매 등록/수정 폼 */}
        <div className="bg-white border-2 border-gray-800 p-6 space-y-4">
          <h2 className="font-semibold text-sm border-b pb-2">
            {auction ? "경매 수정" : "경매 등록"}
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">사건번호</label>
              <input
                className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
                value={form.case_number}
                onChange={(e) => setForm({ ...form, case_number: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">상태</label>
              <select
                className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "open" | "closed" })}
              >
                <option value="open">진행 중</option>
                <option value="closed">마감</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">물건명</label>
            <input
              className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">주소</label>
            <input
              className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">대표 사진</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-xs mt-1"
            />
            {imagePreview && (
              <img src={imagePreview} alt="미리보기" className="mt-2 h-32 object-cover w-full" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">감정가 (원)</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
                value={form.appraisal_price}
                onChange={(e) => setForm({ ...form, appraisal_price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">최저입찰가 (원)</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
                value={form.minimum_bid_price}
                onChange={(e) => setForm({ ...form, minimum_bid_price: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">마감일시</label>
            <input
              type="datetime-local"
              className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
              value={form.end_at}
              onChange={(e) => setForm({ ...form, end_at: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">참고 링크 (선택)</label>
            <input
              className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
              value={form.detail_url}
              onChange={(e) => setForm({ ...form, detail_url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="border-t pt-4 space-y-3">
            <p className="text-xs font-semibold text-gray-600">결과 공개 설정</p>
            <div>
              <label className="text-xs text-gray-500">실제 낙찰가 (원)</label>
              <input
                type="number"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
                value={form.actual_price}
                onChange={(e) => setForm({ ...form, actual_price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">결과 공개 날짜</label>
              <input
                type="date"
                className="w-full border border-gray-300 px-2 py-1.5 text-sm mt-1"
                value={form.result_date}
                onChange={(e) => setForm({ ...form, result_date: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.result_open}
                onChange={(e) => setForm({ ...form, result_open: e.target.checked })}
              />
              <span className="text-xs text-gray-700">결과 공개</span>
            </label>
          </div>

          {message && (
            <p className={`text-xs ${message.startsWith("오류") ? "text-red-500" : "text-green-600"}`}>
              {message}
            </p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-gray-800 text-white py-2.5 text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>

        {/* 입찰 데이터 */}
        {predictions.length > 0 && (
          <div className="bg-white border border-gray-300 p-4 space-y-2">
            <h2 className="font-semibold text-sm">참여 현황 ({predictions.length}명)</h2>
            <div className="space-y-1 max-h-64 overflow-y-auto">
              {predictions.map((p) => (
                <div key={p.id} className="flex justify-between text-xs border-b border-gray-100 py-1">
                  <span className="text-gray-600">{p.nickname || p.email}</span>
                  <span className="font-medium">{formatPrice(p.predicted_price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
