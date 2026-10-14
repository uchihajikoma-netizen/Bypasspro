/* URL syntax validation only. This module does not fetch or bypass destinations. */
(function (global) {
  "use strict";
  function analyzeUrl(input) {
    const raw = String(input || "").trim();
    if (!raw) return { ok: false, error: "Hãy nhập một URL trước khi phân tích." };
    if (/\s/.test(raw)) return { ok: false, error: "URL không được chứa khoảng trắng chưa mã hóa." };
    let parsed;
    try { parsed = new URL(raw); } catch (_) {
      return { ok: false, error: "URL chưa hợp lệ. Hãy nhập đầy đủ, ví dụ https://example.com/path." };
    }
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { ok: false, error: "Chỉ hỗ trợ URL bắt đầu bằng http:// hoặc https://." };
    }
    if (!parsed.hostname || parsed.hostname.includes("..")) {
      return { ok: false, error: "Không thể xác định tên miền hợp lệ." };
    }
    if (parsed.username || parsed.password) {
      return { ok: false, error: "URL có thông tin đăng nhập nhúng. Vì an toàn, hãy bỏ phần này." };
    }
    return {
      ok: true,
      url: parsed.href,
      hostname: parsed.hostname,
      protocol: parsed.protocol,
      secure: parsed.protocol === "https:",
      length: parsed.href.length,
      parameterCount: Array.from(parsed.searchParams.keys()).length,
      pathname: parsed.pathname,
      hasFragment: Boolean(parsed.hash)
    };
  }
  global.LinkScopeValidator = { analyzeUrl };
})(window);
