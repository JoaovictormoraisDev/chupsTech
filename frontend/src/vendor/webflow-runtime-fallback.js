(function () {
  const existing = window.Webflow;

  if (existing && !Array.isArray(existing) && typeof existing.push === "function") {
    return;
  }

  const queue = Array.isArray(existing) ? existing.slice() : [];

  function run(callback) {
    if (typeof callback !== "function") return;

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback, { once: true });
      return;
    }

    callback();
  }

  window.Webflow = {
    push(callback) {
      queue.push(callback);
      run(callback);
    },
    ready() {
      queue.forEach(run);
    },
    destroy() {},
    require() {
      return null;
    }
  };

  window.Webflow.ready();
})();
