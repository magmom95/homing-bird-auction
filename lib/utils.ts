// 금액을 한국식으로 포맷 (억/만원 단위)
export function formatPrice(price: number): string {
  const eok = Math.floor(price / 100000000);
  const man = Math.floor((price % 100000000) / 10000);

  if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
  if (eok > 0) return `${eok}억`;
  if (man > 0) return `${man.toLocaleString()}만원`;
  return `${price.toLocaleString()}원`;
}

// 입력 문자열(쉼표 포함)을 숫자로 변환
export function parsePrice(value: string): number {
  return parseInt(value.replace(/,/g, ""), 10) || 0;
}

// 숫자에 쉼표 추가
export function formatNumber(value: string): string {
  const num = value.replace(/[^0-9]/g, "");
  return num ? parseInt(num).toLocaleString() : "";
}

// 날짜 포맷
export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 오늘 날짜 (YYYY-MM-DD)
export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}
