/* Local-only history. Never stores cookies, page contents, or credentials. */
(function (global) {
  "use strict";
  const KEY = "linkscope.history.v1";
  function get() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value.slice(0, 10) : [];
    } catch (_) { return []; }
  }
  function add(item) {
    const entries = get().filter(x => x.url !== item.url);
    entries.unshift({ url: item.url, hostname: item.hostname, at: Date.now() });
    try { localStorage.setItem(KEY, JSON.stringify(entries.slice(0, 10))); } catch (_) {}
    return get();
  }
  function clear() {
    try { localStorage.removeItem(KEY); } catch (_) {}
    return [];
  }
  global.LinkScopeHistory = { get, add, clear };
})(window);
