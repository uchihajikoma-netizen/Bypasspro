(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const input = $("urlInput"), results = $("results"), errorBox = $("errorBox"), toast = $("toast");
  let toastTimer;
  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
  }
  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function renderHistory(items) {
    const root = $("historyList");
    if (!items.length) {
      root.innerHTML = '<div class="empty-state"><span>◷</span><p>Chưa có lịch sử phân tích.</p></div>';
      return;
    }
    root.innerHTML = items.map(item => `<div class="history-item"><span class="history-icon">↗</span><div class="history-text"><strong>${escapeText(item.hostname)}</strong><small>${escapeText(item.url)} · ${new Date(item.at).toLocaleString("vi-VN")}</small></div><button type="button" data-url="${encodeURIComponent(item.url)}">NẠP LẠI</button></div>`).join("");
    root.querySelectorAll("button[data-url]").forEach(btn => btn.addEventListener("click", () => {
      input.value = decodeURIComponent(btn.dataset.url);
      updateCount();
      input.focus();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
  }
  function updateCount() { $("charCount").textContent = `${input.value.length} ký tự`; }
  function analyze() {
    const result = window.LinkScopeValidator.analyzeUrl(input.value);
    errorBox.hidden = true;
    if (!result.ok) {
      results.hidden = true;
      errorBox.textContent = result.error;
      errorBox.hidden = false;
      return;
    }
    $("hostResult").textContent = result.hostname;
    $("protocolResult").textContent = result.url;
    $("schemeResult").textContent = result.protocol.replace(":", "").toUpperCase();
    $("lengthResult").textContent = `${result.length} ký tự`;
    $("paramsResult").textContent = String(result.parameterCount);
    $("secureTag").textContent = result.secure ? "HTTPS" : "HTTP";
    $("secureTag").classList.toggle("insecure", !result.secure);
    $("validBadge").textContent = "URL VALID";
    $("openBtn").dataset.url = result.url;
    $("copyBtn").dataset.url = result.url;
    results.hidden = false;
    window.LinkScopeHistory.add(result);
    renderHistory(window.LinkScopeHistory.get());
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  input.addEventListener("input", updateCount);
  input.addEventListener("keydown", e => { if (e.key === "Enter") analyze(); });
  $("analyzeBtn").addEventListener("click", analyze);
  $("clearBtn").addEventListener("click", () => {
    input.value = ""; updateCount(); results.hidden = true; errorBox.hidden = true; input.focus();
  });
  $("pasteBtn").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard || !navigator.clipboard.readText) throw new Error("no clipboard");
      input.value = await navigator.clipboard.readText(); updateCount(); input.focus(); notify("Đã dán URL.");
    } catch (_) { notify("Không đọc được clipboard. Hãy nhấn giữ ô nhập để dán."); }
  });
  $("openBtn").addEventListener("click", () => {
    const url = $("openBtn").dataset.url;
    if (!url) return;
    window.open(url, "_blank", "noopener,noreferrer");
  });
  $("copyBtn").addEventListener("click", async () => {
    const url = $("copyBtn").dataset.url;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      notify("Đã sao chép URL.");
    } catch (_) {
      const helper = document.createElement("textarea");
      helper.value = url; helper.style.position = "fixed"; helper.style.opacity = "0";
      document.body.appendChild(helper); helper.select();
      const ok = document.execCommand("copy"); helper.remove();
      notify(ok ? "Đã sao chép URL." : "Không thể sao chép tự động. Hãy sao chép thủ công.");
    }
  });
  $("clearHistoryBtn").addEventListener("click", () => {
    window.LinkScopeHistory.clear(); renderHistory([]); notify("Đã xóa lịch sử trên thiết bị.");
  });
  const dialog = $("infoDialog");
  $("themeHint").addEventListener("click", () => dialog.showModal());
  $("closeDialog").addEventListener("click", () => dialog.close());
  $("dialogOk").addEventListener("click", () => dialog.close());
  renderHistory(window.LinkScopeHistory.get());
  updateCount();
})();
