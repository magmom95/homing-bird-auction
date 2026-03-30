"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { AuctionItem, Prediction } from "@/types";
import { formatPrice } from "@/lib/utils";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from(
  { length: CURRENT_YEAR - 2000 + 1 },
  (_, i) => CURRENT_YEAR - i,
);

type FormState = {
  case_year: string;
  case_seq: string;
  title: string;
  address: string;
  appraisal_price: string;
  minimum_bid_price: string;
  end_at: string;
  detail_url: string;
  status: "open" | "closed";
  actual_price: string;
  result_open: boolean;
  result_date: string;
};

const EMPTY_FORM: FormState = {
  case_year: String(CURRENT_YEAR),
  case_seq: "",
  title: "",
  address: "",
  appraisal_price: "",
  minimum_bid_price: "",
  end_at: "",
  detail_url: "",
  status: "open",
  actual_price: "",
  result_open: false,
  result_date: "",
};

const grad = "linear-gradient(135deg, #2d6a6a 0%, #3d8a8a 100%)";

function Field({
  label,
  children,
  required,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div>
      <label
        className="block text-xs font-medium mb-1.5"
        style={{ color: "#64748b" }}
      >
        {label} {required && <span style={{ color: "#dc2626" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all";
const dpCls =
  "w-full rounded-xl px-4 py-3 text-sm outline-none transition-all border border-slate-200 bg-[#f8fafb] cursor-pointer";
const inputSt = { border: "1px solid #e2e8f0", background: "#f8fafb" };

export default function AdminDashboardPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [auctions, setAuctions] = useState<AuctionItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);

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
      const res = await fetch("/api/auction?all=true");
      if (res.ok) {
        const data = await res.json();
        setAuctions(Array.isArray(data) ? data : []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async (auctionId: string) => {
    const res = await fetch(`/api/prediction?auction_id=${auctionId}`, {
      headers: { "x-admin-password": password },
    });
    if (res.ok) setPredictions(await res.json());
  };

  const parseCaseNumber = (cn: string) => {
    const match = cn.match(/^(\d{4})\s*타경\s*(\d+)$/) || cn.match(/^타경\s*(\d{4})-(\d+)$/);
    return match
      ? { year: match[1], seq: match[2] }
      : { year: String(CURRENT_YEAR), seq: "" };
  };

  const startEdit = (auction: AuctionItem) => {
    const parsed = parseCaseNumber(auction.case_number);
    setEditingId(auction.id);
    setForm({
      case_year: parsed.year,
      case_seq: parsed.seq,
      title: auction.title,
      address: auction.address,
      appraisal_price: String(auction.appraisal_price),
      minimum_bid_price: String(auction.minimum_bid_price),
      end_at: auction.end_at.slice(0, 16),
      detail_url: auction.detail_url || "",
      status: auction.status,
      actual_price: auction.actual_price ? String(auction.actual_price) : "",
      result_open: auction.result_open,
      result_date: auction.result_date || "",
    });
    setExistingImageUrl(auction.image_url);
    setImagePreview(auction.image_url || "");
    setImageFile(null);
    setShowForm(true);
    loadPredictions(auction.id);
  };

  const startNew = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setExistingImageUrl(null);
    setImagePreview("");
    setImageFile(null);
    setPredictions([]);
    setShowForm(true);
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
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
    const ext = file.name.split(".").pop();
    const fileName = `auction_${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("auction-images")
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage
      .from("auction-images")
      .getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleSave = async () => {
    setMessage("");
    if (!form.case_seq) { setMessage("오류: 사건번호를 입력해주세요."); return; }
    if (!form.title) { setMessage("오류: 물건명을 입력해주세요."); return; }
    if (!form.appraisal_price) { setMessage("오류: 감정가를 입력해주세요."); return; }
    if (!form.minimum_bid_price) { setMessage("오류: 최저입찰가를 입력해주세요."); return; }
    if (!form.end_at) { setMessage("오류: 마감일시를 선택해주세요."); return; }
    setSaving(true);
    try {
      let imageUrl = existingImageUrl;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      const caseNumber = `${form.case_year} 타경 ${form.case_seq}`;
      const payload = {
        case_number: caseNumber,
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
        result_date: form.result_open ? new Date().toISOString().split("T")[0] : null,
      };
      const res = editingId
        ? await fetch(`/api/auction/${editingId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": password,
            },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/auction", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": password,
            },
            body: JSON.stringify(payload),
          });
      if (!res.ok) {
        const err = await res.json();
        setMessage(`오류: ${err.error}`);
        return;
      }
      setMessage("저장되었습니다.");
      setShowForm(false);
      loadData(password);
    } catch {
      setMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetMain = async (id: string) => {
    // 선택한 경매를 메인으로 설정
    await fetch("/api/auction/" + id, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "x-admin-password": password },
      body: JSON.stringify({ is_main: true }),
    });
    // 나머지 전부 해제
    for (const a of auctions) {
      if (a.id !== id && a.is_main) {
        await fetch("/api/auction/" + a.id, {
          method: "PUT",
          headers: { "Content-Type": "application/json", "x-admin-password": password },
          body: JSON.stringify({ is_main: false }),
        });
      }
    }
    loadData(password);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("정말 삭제하시겠습니까? 참여 데이터도 함께 삭제됩니다."))
      return;
    const res = await fetch(`/api/auction/${id}`, {
      method: "DELETE",
      headers: { "x-admin-password": password },
    });
    if (res.ok) {
      setShowForm(false);
      loadData(password);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f8fafb" }}
      >
        <div className="text-center space-y-3">
          <img
            src="/icon128.png"
            alt=""
            className="w-12 h-12 mx-auto animate-pulse"
          />
          <p className="text-xs" style={{ color: "#94a3b8" }}>
            불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f8fafb" }}>
      {/* 헤더 */}
      <header
        className="sticky top-0 z-10"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-2xl mx-auto px-5 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href="/"><img src="/icon48.png" alt="" className="w-9 h-9 rounded-xl" /></a>
            <div>
              <h1 className="text-sm font-bold" style={{ color: "#1a2332" }}>
                HOMING-BIRD-AUCTION
              </h1>
              <p className="text-[10px]" style={{ color: "#94a3b8" }}>
                관리자 대시보드
              </p>
            </div>
          </div>
          <a
            href="/"
            className="text-xs font-medium px-3 py-1.5 rounded-lg"
            style={{ background: "#f1f5f9", color: "#64748b" }}
          >
            사용자 페이지
          </a>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-5 py-6 space-y-5">
        {/* 경매 목록 */}
        {!showForm && (
          <>
            <div className="flex justify-between items-end">
              <div>
                <h2
                  className="text-base font-bold"
                  style={{ color: "#1a2332" }}
                >
                  경매 관리
                </h2>
                <p className="text-xs mt-0.5" style={{ color: "#94a3b8" }}>
                  {auctions.length}건 등록됨
                </p>
              </div>
              <button
                onClick={startNew}
                className="text-xs font-semibold px-4 py-2.5 rounded-xl text-white"
                style={{ background: grad }}
              >
                + 새 경매
              </button>
            </div>

            {auctions.length === 0 ? (
              <div
                className="rounded-2xl p-10 text-center"
                style={{ background: "white", border: "1px solid #e2e8f0" }}
              >
                <img
                  src="/icon128.png"
                  alt=""
                  className="w-14 h-14 mx-auto mb-3 opacity-25"
                />
                <p className="text-sm" style={{ color: "#94a3b8" }}>
                  등록된 경매가 없습니다
                </p>
                <p className="text-xs mt-1" style={{ color: "#cbd5e1" }}>
                  새 경매를 등록해보세요
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto" style={{ maxHeight: "60vh" }}>
                {auctions.map((a) => (
                  <div
                    key={a.id}
                    className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer"
                    style={{ background: "white", border: "1px solid #e2e8f0" }}
                    onClick={() => startEdit(a)}
                  >
                    {a.image_url ? (
                      <img
                        src={a.image_url}
                        alt=""
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "#f1f5f9" }}
                      >
                        <img
                          src="/icon48.png"
                          alt=""
                          className="w-7 h-7 opacity-25"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "#1a2332" }}
                      >
                        {a.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md"
                          style={{ background: "#f1f5f9", color: "#94a3b8" }}
                        >
                          {a.case_number}
                        </span>
                        <span
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                          style={{
                            background:
                              a.status === "open" ? "#e8f4f0" : "#f1f5f9",
                            color: a.status === "open" ? "#2d6a6a" : "#94a3b8",
                          }}
                        >
                          {a.status === "open" ? "진행중" : "마감"}
                        </span>
                        {a.is_main && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: "#c8956c", color: "white" }}>
                            메인
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSetMain(a.id); }}
                        className="text-[10px] font-semibold px-3 py-1.5 rounded-lg transition-all"
                        style={a.is_main ? { background: "#c8956c", color: "white" } : { background: "#f1f5f9", color: "#94a3b8" }}
                        onMouseEnter={(e) => { if (!a.is_main) { e.currentTarget.style.background = "#c8956c"; e.currentTarget.style.color = "white"; } }}
                        onMouseLeave={(e) => { if (!a.is_main) { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#94a3b8"; } }}
                      >
                        {a.is_main ? "메인" : "메인 설정"}
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(a.id); }}
                        className="text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
                        style={{ background: "#fef2f2", color: "#dc2626" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#dc2626"; e.currentTarget.style.color = "white"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }}
                      >
                        삭제
                      </button>
                      <span style={{ color: "#cbd5e1" }}>&rsaquo;</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* 등록/수정 폼 */}
        {showForm && (
          <>
            <button
              onClick={() => {
                setShowForm(false);
                setMessage("");
              }}
              className="text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ background: "#1a2332", color: "white" }}
            >
              &larr; 목록으로
            </button>

            <div className="space-y-5">
              {/* 기본 정보 */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #e2e8f0" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "#1a2332" }}
                  >
                    {editingId ? "경매 수정" : "새 경매 등록"}
                  </h3>
                </div>

                <div className="p-5 space-y-4">
                  <Field label="사건번호" required>
                    <div className="flex items-center gap-2">
                      <select
                        className="rounded-xl px-2 py-3 text-sm outline-none"
                        style={{ ...inputSt, width: "85px" }}
                        value={form.case_year}
                        onChange={(e) =>
                          setForm({ ...form, case_year: e.target.value })
                        }
                      >
                        {YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                      <span
                        className="text-xs font-bold px-3 py-3 rounded-xl whitespace-nowrap"
                        style={{ background: "#1a2332", color: "white" }}
                      >
                        타경
                      </span>
                      <span className="text-sm" style={{ color: "#cbd5e1" }}>
                        -
                      </span>
                      <input
                        className={`${inputCls} flex-1`}
                        style={inputSt}
                        value={form.case_seq}
                        onChange={(e) =>
                          setForm({ ...form, case_seq: e.target.value })
                        }
                        placeholder="번호"
                      />
                    </div>
                  </Field>

                  <Field label="물건명" required>
                    <input
                      className={inputCls}
                      style={inputSt}
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                    />
                  </Field>


                  <Field label="대표 사진">
                    {imagePreview ? (
                      <div className="relative rounded-xl overflow-hidden group">
                        <img
                          src={imagePreview}
                          alt=""
                          className="w-full h-40 object-cover cursor-pointer"
                          onClick={() => window.open(imagePreview, "_blank")}
                        />
                        <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                          <span
                            className="text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                            style={{ background: "rgba(255,255,255,0.2)" }}
                          >
                            사진 변경
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label
                        className="flex flex-col items-center justify-center gap-2 w-full py-8 rounded-xl cursor-pointer"
                        style={{
                          border: "2px dashed #e2e8f0",
                          background: "#fafbfc",
                        }}
                      >
                        <img
                          src="/icon48.png"
                          alt=""
                          className="w-8 h-8 opacity-20"
                        />
                        <span className="text-xs" style={{ color: "#94a3b8" }}>
                          클릭하여 사진 업로드
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="감정가 (원)" required>
                      <input
                        type="number"
                        min="0"
                        className={inputCls}
                        style={inputSt}
                        value={form.appraisal_price}
                        onChange={(e) =>
                          setForm({ ...form, appraisal_price: e.target.value })
                        }
                      />
                    </Field>
                    <Field label="최저입찰가 (원)" required>
                      <input
                        type="number"
                        min="0"
                        className={inputCls}
                        style={inputSt}
                        value={form.minimum_bid_price}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            minimum_bid_price: e.target.value,
                          })
                        }
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="마감일시" required>
                      <div className="relative">
                        <DatePicker
                          selected={form.end_at ? new Date(form.end_at) : null}
                          onChange={(date: Date | null) => {
                            if (!date) { setForm({ ...form, end_at: "" }); return; }
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, "0");
                            const d = String(date.getDate()).padStart(2, "0");
                            const h = String(date.getHours()).padStart(2, "0");
                            const min = String(date.getMinutes()).padStart(2, "0");
                            setForm({ ...form, end_at: `${y}-${m}-${d}T${h}:${min}` });
                          }}
                          showTimeSelect
                          timeIntervals={30}
                          dateFormat="yyyy-MM-dd HH:mm"
                          placeholderText="날짜/시간 선택"
                          className={dpCls}
                          wrapperClassName="w-full"
                          shouldCloseOnSelect
                          portalId="datepicker-portal"
                          popperPlacement="top-start"
                        />
                        <span
                          className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-base"
                          style={{ color: "#94a3b8" }}
                        >
                          &#x1F4C5;
                        </span>
                      </div>
                    </Field>
                    <Field label="상태">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, status: "open" })}
                          className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all"
                          style={
                            form.status === "open"
                              ? { background: "#2d6a6a", color: "white" }
                              : { background: "#f1f5f9", color: "#94a3b8" }
                          }
                        >
                          진행 중
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, status: "closed" })}
                          className="flex-1 py-3 rounded-xl text-xs font-semibold transition-all"
                          style={
                            form.status === "closed"
                              ? { background: "#1a2332", color: "white" }
                              : { background: "#f1f5f9", color: "#94a3b8" }
                          }
                        >
                          마감
                        </button>
                      </div>
                    </Field>
                  </div>

                  <Field label="참고 링크 (선택)">
                    <input
                      className={inputCls}
                      style={inputSt}
                      value={form.detail_url}
                      onChange={(e) =>
                        setForm({ ...form, detail_url: e.target.value })
                      }
                      placeholder="https://..."
                    />
                  </Field>
                </div>
              </div>

              {/* 결과 설정 */}
              <div
                className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #e2e8f0" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid #f1f5f9" }}
                >
                  <h3
                    className="text-sm font-bold"
                    style={{ color: "#1a2332" }}
                  >
                    결과 설정
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  <Field label="실제 낙찰가 (원)">
                    <input
                      type="number"
                      min="0"
                      className={inputCls}
                      style={inputSt}
                      value={form.actual_price}
                      onChange={(e) =>
                        setForm({ ...form, actual_price: e.target.value })
                      }
                      placeholder="낙찰 확정 후 입력"
                    />
                  </Field>
                  <div
                    className="flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: form.result_open ? "#e8f4f0" : "#f8fafb",
                      border: form.result_open
                        ? "1px solid #b8d8d0"
                        : "1px solid #e2e8f0",
                    }}
                    onClick={() =>
                      setForm({ ...form, result_open: !form.result_open })
                    }
                  >
                    <div>
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "#1a2332" }}
                      >
                        결과 공개
                      </p>
                      <p
                        className="text-[10px] mt-0.5"
                        style={{ color: "#94a3b8" }}
                      >
                        공개 날짜에 TOP3 결과가 노출됩니다
                      </p>
                    </div>
                    <div
                      className="w-11 h-6 rounded-full p-0.5 transition-all"
                      style={{
                        background: form.result_open ? "#2d6a6a" : "#cbd5e1",
                      }}
                    >
                      <div
                        className="w-5 h-5 rounded-full bg-white shadow-sm transition-transform"
                        style={{
                          transform: form.result_open
                            ? "translateX(20px)"
                            : "translateX(0)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {message && (
                <div
                  className="rounded-xl px-4 py-3 text-xs font-medium"
                  style={{
                    background: message.startsWith("오류")
                      ? "#fef2f2"
                      : "#e8f4f0",
                    color: message.startsWith("오류") ? "#dc2626" : "#2d6a6a",
                    border: message.startsWith("오류")
                      ? "1px solid #fecaca"
                      : "1px solid #b8d8d0",
                  }}
                >
                  {message}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 py-3.5 text-sm font-bold text-white rounded-2xl disabled:opacity-50 transition-all"
                  style={{ background: grad }}
                >
                  {saving ? "저장 중..." : "저장"}
                </button>
                {editingId && (
                  <button
                    onClick={() => handleDelete(editingId)}
                    className="px-6 py-3.5 text-sm font-semibold rounded-2xl transition-all"
                    style={{
                      background: "#fef2f2",
                      color: "#dc2626",
                      border: "1px solid #fecaca",
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* 참여 현황 */}
              {predictions.length > 0 && (
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "white", border: "1px solid #e2e8f0" }}
                >
                  <div
                    className="px-5 py-4 flex justify-between items-center"
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                  >
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "#1a2332" }}
                    >
                      참여 현황
                    </h3>
                    <span
                      className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: "#e8f4f0", color: "#2d6a6a" }}
                    >
                      {predictions.length}명
                    </span>
                  </div>
                  <div>
                    {(form.actual_price
                      ? [...predictions].sort((a, b) => Math.abs(a.predicted_price - parseInt(form.actual_price)) - Math.abs(b.predicted_price - parseInt(form.actual_price)))
                      : predictions
                    ).map((p, i) => (
                      <div
                        key={p.id}
                        className="px-5 py-3 flex justify-between items-center"
                        style={{
                          borderBottom:
                            i !== predictions.length - 1
                              ? "1px solid #f8fafb"
                              : "none",
                        }}
                      >
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{ color: "#1a2332" }}
                          >
                            {p.nickname || p.email.split("@")[0]}
                          </p>
                          <p
                            className="text-[10px] mt-0.5"
                            style={{ color: "#cbd5e1" }}
                          >
                            {p.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold" style={{ color: "#2d6a6a" }}>
                            {formatPrice(p.predicted_price)}
                          </span>
                          {form.actual_price && (
                            <p className="text-[10px] mt-0.5" style={{ color: "#94a3b8" }}>
                              차이 {formatPrice(Math.abs(p.predicted_price - parseInt(form.actual_price)))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div id="datepicker-portal" />
    </div>
  );
}
