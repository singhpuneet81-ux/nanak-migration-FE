/**
 * WordPress parent — sizes Nanak Migration iframe embeds to content height.
 *
 *   <script src="https://admin.nanakmigration.com.au/embed-parent.js" defer></script>
 */
(function () {
  if (window.__nanakMigrationIframeParent) return;
  window.__nanakMigrationIframeParent = true;

  function frameSrc(frame) {
    try {
      return frame.getAttribute("src") || frame.src || "";
    } catch (_) {
      return "";
    }
  }

  function isHeroChat(src) {
    return /herosection_chatbot|herosection-chatbot/i.test(src);
  }

  function isNewsletter(src) {
    return /immigration_newsletter|immigration-newsletter/i.test(src);
  }

  function ceilingFor(data, src) {
    if (data.maxHeight && data.height) return Math.max(Number(data.maxHeight), Number(data.height));
    if (data.source === "immigration_newsletter" || isNewsletter(src)) return 520;
    if (data.source === "herosection_chatbot" || isHeroChat(src)) return 1200;
    return 1200;
  }

  function heroMaxWidth() {
    return window.innerWidth >= 768 ? "440px" : "100%";
  }

  function applyHeroLayout(frame) {
    var src = frameSrc(frame);
    if (!isHeroChat(src)) return;
    var mw = heroMaxWidth();
    frame.style.setProperty("width", "100%", "important");
    frame.style.setProperty("max-width", mw, "important");
    frame.style.setProperty("min-width", "0", "important");
    if (window.innerWidth >= 768) {
      frame.style.setProperty("margin-left", "auto", "important");
      frame.style.setProperty("margin-right", "0", "important");
    } else {
      frame.style.removeProperty("margin-left");
      frame.style.removeProperty("margin-right");
    }
  }

  function applyToFrame(frame, height, cap, data) {
    var h = Number(height);
    if (!h || h < 40) return;
    if (cap && h > cap) h = cap;
    frame.dataset.nanakSized = "1";
    var src = frameSrc(frame);
    var hero = isHeroChat(src) || (data && data.source === "herosection_chatbot");
    if (hero) {
      applyHeroLayout(frame);
    } else {
      frame.style.setProperty("width", "100%", "important");
      frame.style.setProperty("max-width", "100%", "important");
      frame.style.setProperty("min-width", "0", "important");
    }
    if (hero && data && data.suggestedWidth && window.innerWidth >= 768) {
      frame.style.setProperty("max-width", data.suggestedWidth + "px", "important");
    }
    frame.style.setProperty("display", "block", "important");
    frame.style.setProperty("overflow", "hidden", "important");
    frame.style.setProperty("min-height", "0", "important");
    frame.style.setProperty("max-height", "none", "important");
    frame.style.setProperty("height", h + "px", "important");
    frame.style.setProperty("border", "0", "important");
    frame.style.setProperty("background", "transparent", "important");
    frame.removeAttribute("height");
    frame.setAttribute("scrolling", "no");
  }

  window.addEventListener("message", function (e) {
    var data = e && e.data;
    if (!data || typeof data !== "object") return;
    if (data.type !== "nanak-embed-resize" && data.type !== "resize-iframe") return;
    document.querySelectorAll("iframe").forEach(function (frame) {
      try {
        if (frame.contentWindow !== e.source) return;
        var src = frameSrc(frame);
        var match =
          data.source === "herosection_chatbot" ||
          data.source === "immigration_newsletter" ||
          isHeroChat(src) ||
          isNewsletter(src);
        if (match) {
          applyToFrame(frame, data.height, ceilingFor(data, src), data);
        }
      } catch (_) {}
    });
  });

  window.addEventListener("resize", function () {
    document.querySelectorAll("iframe[data-nanak-sized='1']").forEach(function (frame) {
      try {
        applyHeroLayout(frame);
        if (frame.contentWindow && frame.contentWindow.postMessage) {
          frame.contentWindow.postMessage({ type: "nanak-embed-request-resize" }, "*");
        }
      } catch (_) {}
    });
  });
})();
