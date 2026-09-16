/** 날짜 표시 공용 포맷 — yyyy년 mm월 dd일 (+ 24시간제 hh:mm). */
function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** yyyy년 mm월 dd일 */
export function koDate(d: Date): string {
  return `${d.getFullYear()}년 ${pad2(d.getMonth() + 1)}월 ${pad2(d.getDate())}일`;
}

/** yyyy년 mm월 dd일 hh:mm (24시간제, 예: 23:05) */
export function koDateTime(d: Date): string {
  return `${koDate(d)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}
