export function formatPriceKrw(price: number): string {
  if (!price && price !== 0) return '';
  if (price >= 10_000) {
    const man = Math.floor(price / 10_000);
    const rest = price % 10_000;
    if (rest === 0) return `${man.toLocaleString()}만원`;
    return `${man.toLocaleString()}만 ${rest.toLocaleString()}원`;
  }
  return `${price.toLocaleString()}원`;
}

export function formatDate(iso: string, withTime = false): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  if (!withTime) return `${yy}.${mm}.${dd}`;
  const hh = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  return `${yy}.${mm}.${dd} ${hh}:${mi}`;
}

export function timeAgo(iso: string): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / (60 * 1000));
  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}일 전`;
  return formatDate(iso);
}
