/**
 * Định dạng một con số thành chuỗi tiền tệ VNĐ chuyên nghiệp.
 * Ví dụ:
 * formatCurrency(500000) -> "500.000 VNĐ"
 * formatCurrency(5200000) -> "5.200.000 VNĐ"
 * formatCurrency(null) -> "0 VNĐ"
 *
 * @param value - Con số cần định dạng.
 * @returns Chuỗi tiền tệ đã được định dạng.
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || isNaN(value)) {
    return "0 VNĐ";
  }
  // Sử dụng Intl.NumberFormat để có hiệu năng tốt và hỗ trợ đa ngôn ngữ
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
};

/**
 * Định dạng một con số lớn thành chuỗi rút gọn (k, tr).
 * Dùng cho các biểu đồ có không gian hẹp.
 * Ví dụ:
 * formatCurrencyShort(500000) -> "500k"
 * formatCurrencyShort(5200000) -> "5.2tr"
 *
 * @param value - Con số cần định dạng.
 * @returns Chuỗi tiền tệ rút gọn.
 */
export const formatCurrencyShort = (
  value: number | null | undefined
): string => {
  if (value == null || isNaN(value)) {
    return "0";
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}tr`;
  }
  if (value >= 1000) {
    return `${Math.round(value / 1000)}k`;
  }
  return String(value);
};
