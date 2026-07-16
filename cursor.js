(function () {
  var NAVY = "#16294d";
  var current = null;

  function teardown() {
    if (current) {
      cancelAnimationFrame(current.raf);
      window.removeEventListener("pointermove", current.onMove);
      document.removeEventListener("pointerover", current.onOver);
      document.removeEventListener("pointerdown", current.onDown);
      document.removeEventListener("pointerup", current.onUp);
      current = null;
    }
    document.querySelectorAll("[data-monte-cursor]").forEach(function (n) { n.remove(); });
    document.body.style.cursor = "";
  }

  function apply(type) {
    teardown();
    type = type || "Ring + dot";
    if (type === "Native" || (window.matchMedia && matchMedia("(pointer:coarse)").matches)) {
      document.body.style.cursor = "";
      return;
    }
    var style = document.createElement("style");
    style.setAttribute("data-monte-cursor", "");
    style.textContent = "*{cursor:none!important}";
    document.head.appendChild(style);
    var root = document.createElement("div");
    root.setAttribute("data-monte-cursor", "");
    root.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:99999";
    document.body.appendChild(root);

    var sel = "a,button,input,select,textarea,[data-btn],[data-card]";
    var textSel = "p,h1,h2,h3,h4,h5,h6,li,em,strong,blockquote,label,input,textarea,option";
    var mx = innerWidth / 2, my = innerHeight / 2;
    var hovering = false, pressing = false, onText = false;
    var onMove = function (e) { mx = e.clientX; my = e.clientY; };
    var onOver = function (e) {
      hovering = !!(e.target.closest && e.target.closest(sel));
      onText = !!(e.target.closest && e.target.closest(textSel));
    };
    var onDown = function () { pressing = true; };
    var onUp = function () { pressing = false; };
    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);

    var x = mx, y = my, rx = mx, ry = my, step, extraStyle = null;

    if (type === "Pen (ink)") {
      extraStyle = document.createElement("style");
      extraStyle.setAttribute("data-monte-cursor", "");
      document.head.appendChild(extraStyle);
      var setOverride = function (on) { style.textContent = on ? "*{cursor:none!important}" : ""; };
      var setNoSelect = function (on) { extraStyle.textContent = on ? "*{user-select:none!important;-webkit-user-select:none!important}" : ""; };
      var ns = "http://www.w3.org/2000/svg";
      var svg = document.createElementNS(ns, "svg");
      svg.setAttribute("style", "position:absolute;inset:0;width:100%;height:100%;overflow:visible");
      root.appendChild(svg);
      var drawSeg = function (x1, y1, x2, y2) {
        var ln = document.createElementNS(ns, "line");
        ln.setAttribute("x1", x1); ln.setAttribute("y1", y1);
        ln.setAttribute("x2", x2); ln.setAttribute("y2", y2);
        ln.setAttribute("stroke", NAVY);
        ln.setAttribute("stroke-width", "2.6");
        ln.setAttribute("stroke-linecap", "round");
        ln.style.transition = "opacity 1.5s ease .6s";
        svg.appendChild(ln);
        requestAnimationFrame(function () { ln.style.opacity = "0"; });
        setTimeout(function () { ln.remove(); }, 2300);
      };
      var pen = document.createElement("div");
      var dot = document.createElement("div");
      dot.style.cssText = "position:absolute;top:0;left:0;width:8px;height:8px;margin:-4px 0 0 -4px;border-radius:50%;background:" + NAVY + ";opacity:0;transition:opacity .15s ease";
      root.appendChild(dot);
      var nearRects = [], nearAt = 0, NEAR_PAD = 28;
      var refreshRects = function () {
        nearRects = [];
        document.querySelectorAll(sel).forEach(function (el) {
          var r = el.getBoundingClientRect();
          if (r.width && r.height) nearRects.push(r);
        });
        nearAt = performance.now();
      };
      var nearInteractive = function () {
        if (performance.now() - nearAt > 350) refreshRects();
        for (var i = 0; i < nearRects.length; i++) {
          var r = nearRects[i];
          if (mx > r.left - NEAR_PAD && mx < r.right + NEAR_PAD && my > r.top - NEAR_PAD && my < r.bottom + NEAR_PAD) return true;
        }
        return false;
      };
      pen.style.cssText = "position:absolute;top:0;left:0;width:42px;height:42px;transform-origin:0% 100%;filter:drop-shadow(1px 2px 1px rgba(0,0,0,.22))";
      pen.innerHTML = "<svg width='42' height='42' viewBox='0 0 42 42' fill='none' xmlns='http://www.w3.org/2000/svg'><g transform='rotate(45 21 21)'><rect x='16.5' y='2' width='9' height='24' rx='2' fill='#16294d'/><rect x='16.5' y='2' width='4.5' height='24' fill='#22386b'/><rect x='16.5' y='7' width='9' height='3' fill='#f6c500'/><path d='M16.5 26 L21 38 L25.5 26 Z' fill='#e8dccb'/><path d='M21 32 L21 38 L25.5 26 Z' fill='#c9b79a'/><path d='M20 34 L21 38 L22 34 Z' fill='#16294d'/></g></svg>";
      root.appendChild(pen);
      var penLast = null, writing = false;
      step = function () {
        var hov = hovering || nearInteractive();
        if (pressing && !writing && !onText && !hov) writing = true;
        if (!pressing) writing = false;
        if (hov && !writing) {
          setOverride(true); setNoSelect(false);
          pen.style.opacity = "0"; penLast = null;
          dot.style.opacity = "1";
          dot.style.transform = "translate(" + mx + "px," + my + "px)";
          return;
        }
        dot.style.opacity = "0";
        if (onText && !writing) {
          setOverride(false); setNoSelect(false);
          pen.style.opacity = "0"; penLast = null;
          return;
        }
        if (writing) {
          setOverride(true); setNoSelect(true);
          pen.style.opacity = "1";
          var bob = Math.sin(performance.now() / 60) * 1.7;
          pen.style.transform = "translate(" + mx + "px," + (my - 42 + 3 + bob) + "px)";
          pen.style.filter = "drop-shadow(2px 5px 3px rgba(0,0,0,.3))";
          if (penLast) drawSeg(penLast[0], penLast[1], mx, my);
          penLast = [mx, my];
        } else {
          setNoSelect(false); penLast = null;
          setOverride(true);
          pen.style.opacity = "1";
          pen.style.transform = "translate(" + mx + "px," + (my - 42) + "px)";
          pen.style.filter = "drop-shadow(1px 2px 1px rgba(0,0,0,.22))";
        }
      };
    } else if (type === "Soft glow") {
      var halo = document.createElement("div");
      halo.style.cssText = "position:absolute;top:0;left:0;width:130px;height:130px;margin:-65px 0 0 -65px;border-radius:50%;background:radial-gradient(circle,rgba(22,41,77,.2),transparent 68%);transition:transform .35s ease";
      var gdot = document.createElement("div");
      gdot.style.cssText = "position:absolute;top:0;left:0;width:24px;height:24px;margin:-12px 0 0 -12px;border-radius:50%;background:" + NAVY + ";mix-blend-mode:multiply;filter:blur(1px);transition:transform .18s ease";
      root.append(halo, gdot);
      step = function () {
        x += (mx - x) * 0.5; y += (my - y) * 0.5;
        rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
        gdot.style.transform = "translate(" + x + "px," + y + "px) scale(" + (pressing ? 0.6 : hovering ? 1.5 : 1) + ")";
        halo.style.transform = "translate(" + rx + "px," + ry + "px) scale(" + (hovering ? 1.5 : 1) + ")";
      };
    } else if (type === "Invert lens") {
      var c = document.createElement("div");
      c.style.cssText = "position:absolute;top:0;left:0;width:22px;height:22px;margin:-11px 0 0 -11px;border-radius:50%;background:#fff;mix-blend-mode:difference;transition:transform .28s cubic-bezier(.22,1,.36,1)";
      root.append(c);
      step = function () {
        x += (mx - x) * 0.4; y += (my - y) * 0.4;
        var s = pressing ? 0.6 : hovering ? 3.4 : 1;
        c.style.transform = "translate(" + x + "px," + y + "px) scale(" + s + ")";
      };
    } else {
      var ring = document.createElement("div");
      ring.style.cssText = "position:absolute;top:0;left:0;width:34px;height:34px;margin:-17px 0 0 -17px;border:1.5px solid " + NAVY + ";border-radius:50%;transition:background .25s ease";
      var rdot = document.createElement("div");
      rdot.style.cssText = "position:absolute;top:0;left:0;width:7px;height:7px;margin:-3.5px 0 0 -3.5px;background:" + NAVY + ";border-radius:50%";
      root.append(ring, rdot);
      step = function () {
        rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
        rdot.style.transform = "translate(" + mx + "px," + my + "px) scale(" + (hovering ? 0 : 1) + ")";
        ring.style.transform = "translate(" + rx + "px," + ry + "px) scale(" + (pressing ? 0.8 : hovering ? 1.7 : 1) + ")";
        ring.style.background = hovering ? "rgba(22,41,77,.1)" : "transparent";
      };
    }

    var handle = { root: root, style: style, style2: extraStyle, onMove: onMove, onOver: onOver, onDown: onDown, onUp: onUp, raf: 0 };
    var loop = function () { step(); handle.raf = requestAnimationFrame(loop); };
    handle.raf = requestAnimationFrame(loop);
    current = handle;
  }

  window.MonteCursor = {
    apply: apply,
    get: function () { try { return localStorage.getItem("monteCursor") || "Ring + dot"; } catch (e) { return "Ring + dot"; } },
    set: function (type) { try { localStorage.setItem("monteCursor", type); } catch (e) {} apply(type); }
  };

  function boot() {
    apply(window.MonteCursor.get());
    window.addEventListener("storage", function (e) {
      if (e.key === "monteCursor") apply(e.newValue || "Ring + dot");
    });
  }
  if (document.readyState !== "loading") boot();
  else document.addEventListener("DOMContentLoaded", boot);
})();
