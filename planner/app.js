/*
  Household Emergency Planner - application code.
  Plain JavaScript, no libraries, no network calls.
  The questions themselves live in questions.js.
*/
(function () {
  "use strict";

  var Q = window.PLANNER_QUESTIONS;
  var FORMAT = "HomeEmergencyPlanner";
  var FORMAT_VERSION = 1;
  var DB_NAME = "HomeEmergencyPlanner";   // unique to this tool
  var DB_STORE = "plan";
  var DB_KEY = "current";
  var LS_KEY = "HomeEmergencyPlanner.v1"; // fallback; unique to this tool
  var MAX_FILE_BYTES = 5 * 1024 * 1024;

  var SECTIONS = (Q && Q.sections) || [];

  /* ------------------------------------------------------------------ */
  /* State                                                              */
  /* ------------------------------------------------------------------ */

  function emptyState() {
    return {
      answers: {},        // questionId -> value
      customItems: {},    // checklist questionId -> [{id, label}]
      extraQuestions: {}, // sectionId -> [{id, question, answer}]
      settings: { showBlanks: false },
      savedAt: null       // ISO string of last autosave
    };
  }

  var state = emptyState();
  var currentView = "start"; // "start" | section id | "plan"
  var workingTables = {};    // questionId -> rows shown on screen but not yet stored

  /* ------------------------------------------------------------------ */
  /* Small helpers                                                      */
  /* ------------------------------------------------------------------ */

  function $(id) { return document.getElementById(id); }

  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        var v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === "text") node.textContent = v;
        else if (k === "className") node.className = v;
        else if (k.indexOf("on") === 0 && typeof v === "function") node.addEventListener(k.slice(2), v);
        else if (k === "value") node.value = v;
        else if (k === "checked") node.checked = !!v;
        else node.setAttribute(k, v === true ? "" : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) {
      var c = arguments[i];
      if (c === null || c === undefined || c === false) continue;
      if (Array.isArray(c)) c.forEach(function (x) { if (x) node.appendChild(typeof x === "string" ? document.createTextNode(x) : x); });
      else node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    }
    return node;
  }

  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  function slug(s) {
    return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "item";
  }

  function newId(prefix) {
    return prefix + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  }

  function pad(n) { return (n < 10 ? "0" : "") + n; }

  function formatDate(d) { return pad(d.getDate()) + "/" + pad(d.getMonth() + 1) + "/" + d.getFullYear(); }

  function formatTime(d) {
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? "pm" : "am";
    h = h % 12; if (h === 0) h = 12;
    return h + ":" + pad(m) + " " + ampm;
  }

  function formatDateTime(d) { return formatDate(d) + " at " + formatTime(d); }

  /* Accepts 16/11/2026, 16-11-2026, 16.11.2026, 1/2/2026, 2026-11-16.
     Returns "dd/mm/yyyy", "" for empty, or null if not a real date. */
  function normaliseDate(text) {
    var s = String(text || "").trim();
    if (!s) return "";
    var d, m, y, match;
    if ((match = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))) { y = +match[1]; m = +match[2]; d = +match[3]; }
    else if ((match = s.match(/^(\d{1,2})\s*[\/\-. ]\s*(\d{1,2})\s*[\/\-. ]\s*(\d{4})$/))) { d = +match[1]; m = +match[2]; y = +match[3]; }
    else return null;
    var dt = new Date(y, m - 1, d);
    if (dt.getFullYear() !== y || dt.getMonth() !== m - 1 || dt.getDate() !== d) return null;
    return pad(d) + "/" + pad(m) + "/" + y;
  }

  function isBlank(v) { return v === undefined || v === null || String(v).trim() === ""; }

  function findQuestion(id) {
    for (var i = 0; i < SECTIONS.length; i++) {
      for (var j = 0; j < SECTIONS[i].questions.length; j++) {
        if (SECTIONS[i].questions[j].id === id) return SECTIONS[i].questions[j];
      }
    }
    return null;
  }

  function itemsOf(q) {
    return (q.items || []).map(function (it) {
      return typeof it === "string" ? { id: slug(it), label: it } : { id: it.id || slug(it.label), label: it.label };
    });
  }

  function optionsOf(q) {
    return (q.options || []).map(function (o) {
      return typeof o === "string" ? { value: o, label: o } : { value: o.value || o.label, label: o.label };
    });
  }

  function blankRow(q) {
    var r = {};
    q.columns.forEach(function (c) { r[c.id] = ""; });
    return r;
  }

  function rowHasContent(row) {
    return Object.keys(row || {}).some(function (k) { return !isBlank(row[k]); });
  }

  /* What a table holds for printing/answer purposes (stored, else defaults). */
  function effectiveRows(q, blanks) {
    var stored = state.answers[q.id];
    if (Array.isArray(stored)) return stored;
    return (q.printDefaults || blanks) ? clone(q.defaultRows || []) : [];
  }

  /* ------------------------------------------------------------------ */
  /* Answer status                                                      */
  /* ------------------------------------------------------------------ */

  function isAnswered(q) {
    var v = state.answers[q.id];
    switch (q.type) {
      case "table": return Array.isArray(v) && v.some(rowHasContent);
      case "checklist":
        return !!v && typeof v === "object" && Object.keys(v).some(function (k) { return v[k] === true; });
      default: return !isBlank(v);
    }
  }

  function extrasFor(sectionId) { return state.extraQuestions[sectionId] || []; }

  function extraHasContent(x) { return !isBlank(x.question) || !isBlank(x.answer); }

  function sectionAnsweredCount(section) {
    var n = 0;
    section.questions.forEach(function (q) { if (isAnswered(q)) n++; });
    extrasFor(section.id).forEach(function (x) { if (extraHasContent(x)) n++; });
    return n;
  }

  function hasAnyAnswers() {
    return SECTIONS.some(function (s) { return sectionAnsweredCount(s) > 0; });
  }

  /* ------------------------------------------------------------------ */
  /* Storage (IndexedDB "HomeEmergencyPlanner", fallback localStorage)   */
  /* ------------------------------------------------------------------ */

  var storage = {
    backend: "none",
    db: null,

    init: function () {
      var self = this;
      return new Promise(function (resolve) {
        var done = false;
        function finish(backend) { if (done) return; done = true; self.backend = backend; resolve(backend); }
        function fallback() {
          try {
            var t = "HomeEmergencyPlanner.test";
            window.localStorage.setItem(t, "1");
            window.localStorage.removeItem(t);
            finish("ls");
          } catch (e) { finish("none"); }
        }
        var timer = setTimeout(fallback, 4000);
        try {
          if (!window.indexedDB) { clearTimeout(timer); fallback(); return; }
          var req = window.indexedDB.open(DB_NAME, 1);
          req.onupgradeneeded = function () {
            if (!req.result.objectStoreNames.contains(DB_STORE)) req.result.createObjectStore(DB_STORE);
          };
          req.onsuccess = function () { clearTimeout(timer); self.db = req.result; finish("idb"); };
          req.onerror = function () { clearTimeout(timer); fallback(); };
          req.onblocked = function () { clearTimeout(timer); fallback(); };
        } catch (e) { clearTimeout(timer); fallback(); }
      });
    },

    idbRequest: function (mode, fn) {
      var db = this.db;
      return new Promise(function (resolve, reject) {
        try {
          var tx = db.transaction(DB_STORE, mode);
          var req = fn(tx.objectStore(DB_STORE));
          tx.oncomplete = function () { resolve(req && req.result); };
          tx.onerror = function () { reject(tx.error); };
          tx.onabort = function () { reject(tx.error); };
        } catch (e) { reject(e); }
      });
    },

    load: function () {
      var self = this;
      var fromLs = null;
      try { var raw = window.localStorage.getItem(LS_KEY); if (raw) fromLs = JSON.parse(raw); } catch (e) { /* ignore */ }
      if (self.backend !== "idb") return Promise.resolve(fromLs);
      return self.idbRequest("readonly", function (s) { return s.get(DB_KEY); })
        .then(function (fromDb) {
          if (fromDb && fromLs) return (String(fromLs.savedAt || "") > String(fromDb.savedAt || "")) ? fromLs : fromDb;
          return fromDb || fromLs;
        })
        .catch(function () { return fromLs; });
    },

    save: function (data) {
      var self = this;
      function saveLs() {
        try { window.localStorage.setItem(LS_KEY, JSON.stringify(data)); return Promise.resolve(true); }
        catch (e) { return Promise.reject(e); }
      }
      if (self.backend === "idb") {
        return self.idbRequest("readwrite", function (s) { return s.put(data, DB_KEY); })
          .then(function () {
            // Remove any older fallback copy so it cannot shadow the database.
            try { window.localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
            return true;
          })
          .catch(function () { self.backend = "ls"; return saveLs(); });
      }
      if (self.backend === "ls") return saveLs();
      return Promise.reject(new Error("No storage available"));
    },

    /* Clears ONLY this tool's own record and key. */
    clear: function () {
      try { window.localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
      if (this.backend === "idb") {
        return this.idbRequest("readwrite", function (s) { return s.delete(DB_KEY); }).catch(function () {});
      }
      return Promise.resolve();
    }
  };

  var persistAsked = false;
  function askPersist() {
    if (persistAsked) return;
    persistAsked = true;
    try {
      if (navigator.storage && navigator.storage.persist) {
        navigator.storage.persisted().then(function (p) { if (!p) return navigator.storage.persist(); }).catch(function () {});
      }
    } catch (e) { /* ignore */ }
  }

  /* ------------------------------------------------------------------ */
  /* Autosave                                                           */
  /* ------------------------------------------------------------------ */

  var saveTimer = null;

  function setSaveStatus(text, isError) {
    var s = $("save-status");
    s.textContent = text;
    s.classList.toggle("is-error", !!isError);
  }

  function showSavedTime() {
    if (state.savedAt) setSaveStatus("Saved on " + formatDateTime(new Date(state.savedAt)));
    else setSaveStatus("Not saved yet");
  }

  function changed() {
    askPersist();
    updateProgress();
    setSaveStatus("Saving…");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveNow, 700);
  }

  function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    state.savedAt = new Date().toISOString();
    var data = clone(state);
    data.format = FORMAT;
    data.formatVersion = FORMAT_VERSION;
    data.lastView = currentView;
    return storage.save(data).then(function () {
      showSavedTime();
      renderPrintArea();
    }).catch(function () {
      setSaveStatus("Could not save on this computer. Please use “Save backup”.", true);
    });
  }

  // Save straight away if the page is being closed with a save pending.
  window.addEventListener("pagehide", function () { if (saveTimer) saveNow(); });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden" && saveTimer) saveNow();
  });

  /* ------------------------------------------------------------------ */
  /* Notices and dialogs                                                */
  /* ------------------------------------------------------------------ */

  var noticeTimer = null;
  function notice(text, kind) {
    var n = $("notice");
    n.textContent = text;
    n.className = "notice" + (kind ? " notice-" + kind : "");
    n.hidden = false;
    clearTimeout(noticeTimer);
    if (kind !== "error") noticeTimer = setTimeout(function () { n.hidden = true; }, 12000);
  }

  function hideNotice() { $("notice").hidden = true; }

  /* opts: {title, message (string or array of paragraphs), okText, cancelText, danger, noCancel} */
  function ask(opts) {
    return new Promise(function (resolve) {
      var dlg = $("dialog");
      var msgs = Array.isArray(opts.message) ? opts.message : [opts.message];
      if (!dlg || typeof dlg.showModal !== "function") {
        if (opts.noCancel) { window.alert(opts.title + "\n\n" + msgs.join("\n\n")); resolve(true); }
        else resolve(window.confirm(opts.title + "\n\n" + msgs.join("\n\n")));
        return;
      }
      var lastFocus = document.activeElement;
      $("dialog-title").textContent = opts.title;
      var box = $("dialog-message");
      box.textContent = "";
      msgs.forEach(function (m) { box.appendChild(el("p", { text: m })); });
      var ok = $("dialog-ok"), cancel = $("dialog-cancel");
      ok.textContent = opts.okText || "OK";
      ok.className = "btn " + (opts.danger ? "btn-danger" : "btn-primary");
      cancel.textContent = opts.cancelText || "Cancel";
      cancel.hidden = !!opts.noCancel;
      function close(result) {
        ok.removeEventListener("click", onOk);
        cancel.removeEventListener("click", onCancel);
        dlg.removeEventListener("cancel", onEsc);
        dlg.close();
        if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) { /* ignore */ } }
        resolve(result);
      }
      function onOk() { close(true); }
      function onCancel() { close(false); }
      function onEsc(e) { e.preventDefault(); close(false); }
      ok.addEventListener("click", onOk);
      cancel.addEventListener("click", onCancel);
      dlg.addEventListener("cancel", onEsc);
      dlg.showModal();
      (opts.noCancel ? ok : cancel).focus();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Navigation and progress                                            */
  /* ------------------------------------------------------------------ */

  function sectionIndex(id) {
    for (var i = 0; i < SECTIONS.length; i++) if (SECTIONS[i].id === id) return i;
    return -1;
  }

  function renderSidebar() {
    var list = $("section-list");
    list.textContent = "";
    function item(viewId, label, extraClass) {
      var btn = el("button", {
        type: "button", className: "nav-btn" + (extraClass ? " " + extraClass : ""),
        "data-view": viewId, onclick: function () { go(viewId); }
      }, el("span", { className: "nav-label", text: label }), el("span", { className: "nav-status" }));
      list.appendChild(el("li", null, btn));
    }
    item("start", "Start here");
    SECTIONS.forEach(function (s, i) { item(s.id, (i + 1) + ". " + s.title); });
    item("plan", "Produce final plan", "nav-plan");
    updateProgress();
  }

  function updateProgress() {
    var withAnswers = 0;
    var buttons = document.querySelectorAll(".nav-btn");
    Array.prototype.forEach.call(buttons, function (btn) {
      var v = btn.getAttribute("data-view");
      var statusEl = btn.querySelector(".nav-status");
      if (v === currentView) btn.setAttribute("aria-current", "page"); else btn.removeAttribute("aria-current");
      var i = sectionIndex(v);
      if (i < 0) { statusEl.textContent = ""; return; }
      var n = sectionAnsweredCount(SECTIONS[i]);
      if (n > 0) withAnswers++;
      btn.classList.toggle("has-answers", n > 0);
      statusEl.textContent = n > 0 ? "✓ " + n + " answered" : "Not started";
    });
    $("progress-text").textContent = withAnswers + " of " + SECTIONS.length + " sections have answers";
    $("progress-fill").style.width = (SECTIONS.length ? (100 * withAnswers / SECTIONS.length) : 0) + "%";
  }

  function go(viewId, opts) {
    opts = opts || {};
    currentView = viewId;
    hideNotice();
    workingTables = {};
    renderView();
    updateProgress();
    if (!opts.noScroll) window.scrollTo(0, 0);
    if (!opts.noFocus) {
      var h = $("view").querySelector("h2");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
    }
  }

  function renderView() {
    var view = $("view");
    view.textContent = "";
    if (currentView === "plan") view.appendChild(renderPlanView());
    else if (sectionIndex(currentView) >= 0) view.appendChild(renderSection(SECTIONS[sectionIndex(currentView)]));
    else { currentView = "start"; view.appendChild(renderStart()); }
  }

  /* Re-draw the current section after adding/removing rows or items,
     keeping the page where it is, then focus the given element id. */
  function redraw(focusId) {
    var y = window.scrollY;
    renderView();
    window.scrollTo(0, y);
    if (focusId) {
      var f = $(focusId);
      if (f) f.focus();
    }
    updateProgress();
  }

  /* ------------------------------------------------------------------ */
  /* Start screen                                                       */
  /* ------------------------------------------------------------------ */

  function renderStart() {
    var wrap = el("div", { className: "start" });
    wrap.appendChild(el("h2", { text: "Welcome" }));
    wrap.appendChild(el("p", { className: "lead", text: "Work through the sections together, typing your answers. You can stop at any time and come back later. When you have finished, produce the final plan and print it or save it as a PDF." }));

    if (hasAnyAnswers() && state.savedAt) {
      wrap.appendChild(el("p", { className: "resume" },
        "You have answers saved on this computer (last saved on " + formatDateTime(new Date(state.savedAt)) + ")."));
    }

    wrap.appendChild(el("section", { className: "privacy", "aria-labelledby": "privacy-h" },
      el("h3", { id: "privacy-h", text: "Your privacy" }),
      el("ul", null,
        el("li", { text: "Your answers stay on this computer only, in this web browser." }),
        el("li", { text: "Nothing is sent anywhere. This planner works without the internet." }),
        el("li", { text: "Use “Save backup” regularly and keep the backup file somewhere safe, such as a USB stick." }),
        el("li", { text: "Do not upload a filled-in backup file to GitHub or any other website. It contains your personal details." })
      )));

    wrap.appendChild(el("section", { className: "howto", "aria-labelledby": "howto-h" },
      el("h3", { id: "howto-h", text: "How it works" }),
      el("ol", null,
        el("li", { text: "Choose a section from the list, or press “Begin” below." }),
        el("li", { text: "Type your answers. They are saved on this computer as you type." }),
        el("li", { text: "Add your own items to any checklist, and your own questions or notes to any section." }),
        el("li", { text: "Press “Save backup” to keep a copy in a file. Use “Open a saved file” to carry on from a backup." }),
        el("li", { text: "Press “Produce final plan” to see, print or save the finished plan." })
      )));

    wrap.appendChild(el("div", { className: "start-actions" },
      el("button", { type: "button", className: "btn btn-primary btn-large", onclick: function () { go(SECTIONS[0].id); } },
        hasAnyAnswers() ? "Carry on" : "Begin"),
      el("button", { type: "button", className: "btn btn-large", onclick: function () { $("file-input").click(); } }, "Open a saved file")
    ));
    return wrap;
  }

  /* ------------------------------------------------------------------ */
  /* Section screen and question renderers                              */
  /* ------------------------------------------------------------------ */

  function fid(q, suffix) { return "f-" + q.id + (suffix !== undefined ? "-" + suffix : ""); }

  function helpEl(q, id) {
    return q.help ? el("p", { className: "help", id: id, text: q.help }) : null;
  }

  function renderSection(section) {
    var i = sectionIndex(section.id);
    var wrap = el("div", { className: "section" });
    wrap.appendChild(el("p", { className: "section-count", text: "Section " + (i + 1) + " of " + SECTIONS.length }));
    wrap.appendChild(el("h2", { text: section.title }));
    if (section.intro) wrap.appendChild(el("p", { className: "lead", text: section.intro }));

    section.questions.forEach(function (q) {
      var r = RENDERERS[q.type];
      if (r) wrap.appendChild(r(q));
    });

    wrap.appendChild(renderExtras(section));

    var nav = el("div", { className: "prev-next" });
    nav.appendChild(el("button", {
      type: "button", className: "btn",
      onclick: function () { go(i === 0 ? "start" : SECTIONS[i - 1].id); }
    }, i === 0 ? "← Back to start" : "← Previous: " + SECTIONS[i - 1].title));
    nav.appendChild(el("button", {
      type: "button", className: "btn btn-primary",
      onclick: function () { go(i === SECTIONS.length - 1 ? "plan" : SECTIONS[i + 1].id); }
    }, i === SECTIONS.length - 1 ? "Next: Produce final plan →" : "Next: " + SECTIONS[i + 1].title + " →"));
    wrap.appendChild(nav);
    return wrap;
  }

  function textInput(q) {
    var id = fid(q), hid = id + "-help";
    var multi = q.type === "textarea";
    var input = el(multi ? "textarea" : "input", {
      id: id, className: multi ? "field field-long" : "field",
      type: multi ? null : "text", rows: multi ? 4 : null,
      "aria-describedby": q.help ? hid : null,
      placeholder: q.placeholder || null,
      autocomplete: "off",
      value: state.answers[q.id] || "",
      oninput: function () { state.answers[q.id] = input.value; changed(); }
    });
    return el("div", { className: "q q-" + q.type },
      el("label", { "for": id, className: "q-label", text: q.label }), helpEl(q, hid), input);
  }

  /* A dd/mm/yyyy text box (used for date questions and date table columns). */
  function dateBox(id, labelText, value, onValue, describedBy) {
    var errId = id + "-err";
    var err = el("p", { className: "field-error", id: errId, "aria-live": "polite" });
    var input = el("input", {
      id: id, type: "text", className: "field field-date", inputmode: "numeric",
      placeholder: "dd/mm/yyyy", autocomplete: "off", value: value || "",
      "aria-describedby": (describedBy ? describedBy + " " : "") + errId,
      oninput: function () { onValue(input.value); },
      onblur: function () {
        var n = normaliseDate(input.value);
        if (n === null) {
          err.textContent = "Please type the date as dd/mm/yyyy, for example 16/11/2026.";
          input.setAttribute("aria-invalid", "true");
        } else {
          err.textContent = "";
          input.removeAttribute("aria-invalid");
          if (n !== input.value) { input.value = n; onValue(n); }
        }
      }
    });
    var label = labelText ? el("label", { "for": id, className: "q-label", text: labelText }) : null;
    return { input: input, label: label, err: err };
  }

  function dateQuestion(q) {
    var id = fid(q), hid = id + "-help";
    var hint = el("p", { className: "help", id: id + "-fmt", text: "Type it as dd/mm/yyyy, for example 16/11/2026." });
    var box = dateBox(id, q.label, state.answers[q.id], function (v) { state.answers[q.id] = v; changed(); },
      (q.help ? hid + " " : "") + id + "-fmt");
    var today = el("button", {
      type: "button", className: "btn btn-small",
      onclick: function () { box.input.value = formatDate(new Date()); state.answers[q.id] = box.input.value; box.err.textContent = ""; changed(); }
    }, "Use today’s date");
    return el("div", { className: "q q-date" }, box.label, helpEl(q, hid), hint,
      el("div", { className: "date-row" }, box.input, today), box.err);
  }

  function radioQuestion(q, options) {
    var id = fid(q), hid = id + "-help";
    var fs = el("fieldset", { className: "q q-" + q.type, "aria-describedby": q.help ? hid : null },
      el("legend", { className: "q-label", text: q.label }), helpEl(q, hid));
    var group = el("div", { className: "radio-group" + (q.type === "yesno" ? " inline" : "") });
    options.forEach(function (o, idx) {
      var rid = id + "-" + idx;
      var r = el("input", {
        type: "radio", id: rid, name: id, value: o.value, checked: state.answers[q.id] === o.value,
        onchange: function () { if (r.checked) { state.answers[q.id] = o.value; changed(); } }
      });
      group.appendChild(el("div", { className: "choice" }, r, el("label", { "for": rid, text: o.label })));
    });
    fs.appendChild(group);
    fs.appendChild(el("button", {
      type: "button", className: "btn btn-small btn-quiet",
      onclick: function () {
        delete state.answers[q.id];
        Array.prototype.forEach.call(group.querySelectorAll("input"), function (x) { x.checked = false; });
        changed();
      }
    }, "Clear answer", el("span", { className: "visually-hidden", text: " to “" + q.label + "”" })));
    return fs;
  }

  function yesNoQuestion(q) {
    return radioQuestion(q, [{ value: "yes", label: "Yes" }, { value: "no", label: "No" }]);
  }

  function choiceQuestion(q) { return radioQuestion(q, optionsOf(q)); }

  function checklistQuestion(q) {
    var id = fid(q), hid = id + "-help";
    var ticks = (state.answers[q.id] && typeof state.answers[q.id] === "object") ? state.answers[q.id] : {};
    var fs = el("fieldset", { className: "q q-checklist", "aria-describedby": q.help ? hid : null },
      el("legend", { className: "q-label", text: q.label }), helpEl(q, hid));
    var list = el("ul", { className: "checklist" });

    function setTick(itemId, on) {
      var t = (state.answers[q.id] && typeof state.answers[q.id] === "object") ? state.answers[q.id] : {};
      if (on) t[itemId] = true; else delete t[itemId];
      state.answers[q.id] = t;
      changed();
    }

    function addRow(item, custom, idx) {
      var cid = id + "-" + (custom ? "c" : "i") + idx;
      var cb = el("input", {
        type: "checkbox", id: cid, checked: ticks[item.id] === true,
        onchange: function () { setTick(item.id, cb.checked); }
      });
      var li = el("li", { className: "check-item" + (custom ? " custom" : "") }, cb, el("label", { "for": cid, text: item.label }));
      if (custom) {
        li.appendChild(el("button", {
          type: "button", className: "btn btn-small btn-quiet",
          onclick: function () {
            state.customItems[q.id] = (state.customItems[q.id] || []).filter(function (x) { return x.id !== item.id; });
            var t = state.answers[q.id];
            if (t && typeof t === "object") delete t[item.id];
            changed();
            redraw(id + "-add");
          }
        }, "Remove", el("span", { className: "visually-hidden", text: " “" + item.label + "”" })));
      }
      list.appendChild(li);
    }

    itemsOf(q).forEach(function (it, i) { addRow(it, false, i); });
    (state.customItems[q.id] || []).forEach(function (it, i) { addRow(it, true, i); });
    fs.appendChild(list);

    var addInput = el("input", { type: "text", id: id + "-add", className: "field", autocomplete: "off" });
    function addItem() {
      var label = addInput.value.trim();
      if (!label) { addInput.focus(); return; }
      var item = { id: newId("custom"), label: label };
      state.customItems[q.id] = (state.customItems[q.id] || []).concat([item]);
      var t = (state.answers[q.id] && typeof state.answers[q.id] === "object") ? state.answers[q.id] : {};
      t[item.id] = true;
      state.answers[q.id] = t;
      changed();
      redraw(id + "-add");
    }
    addInput.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); addItem(); } });
    fs.appendChild(el("div", { className: "add-row" },
      el("label", { "for": id + "-add", className: "add-label", text: "Add your own item to this list" }),
      el("div", { className: "add-controls" }, addInput,
        el("button", { type: "button", className: "btn", id: id + "-addbtn", onclick: addItem }, "Add item"))));
    return fs;
  }

  function tableQuestion(q) {
    var id = fid(q), hid = id + "-help";
    var rowLabel = q.rowLabel || "Row";
    var rows;
    if (Array.isArray(state.answers[q.id])) rows = state.answers[q.id];
    else if (workingTables[q.id]) rows = workingTables[q.id];
    else {
      rows = q.defaultRows && q.defaultRows.length ? clone(q.defaultRows) : [blankRow(q)];
      workingTables[q.id] = rows;
    }
    function store() { state.answers[q.id] = rows; delete workingTables[q.id]; }

    var fs = el("fieldset", { className: "q q-table", "aria-describedby": q.help ? hid : null },
      el("legend", { className: "q-label", text: q.label }), helpEl(q, hid));

    if (!rows.length) fs.appendChild(el("p", { className: "empty-table", text: "Nothing added yet." }));

    rows.forEach(function (row, r) {
      var card = el("div", { className: "table-row", role: "group", "aria-labelledby": id + "-r" + r + "-h" });
      card.appendChild(el("h3", { className: "row-heading", id: id + "-r" + r + "-h", text: rowLabel + " " + (r + 1) }));
      var grid = el("div", { className: "row-grid" });
      q.columns.forEach(function (c) {
        var cid = id + "-r" + r + "-" + c.id;
        var cell;
        if (c.type === "date") {
          var box = dateBox(cid, null, row[c.id], function (v) { row[c.id] = v; store(); changed(); });
          cell = el("div", { className: "cell" }, el("label", { "for": cid, className: "cell-label", text: c.label }), box.input, box.err);
        } else {
          var multi = c.type === "textarea";
          var inp = el(multi ? "textarea" : "input", {
            id: cid, className: "field" + (multi ? " field-cell-long" : ""), type: multi ? null : "text",
            rows: multi ? 2 : null, autocomplete: "off", value: row[c.id] || ""
          });
          inp.addEventListener("input", function () { row[c.id] = inp.value; store(); changed(); });
          cell = el("div", { className: "cell" + (multi ? " cell-wide" : "") }, el("label", { "for": cid, className: "cell-label", text: c.label }), inp);
        }
        grid.appendChild(cell);
      });
      card.appendChild(grid);
      card.appendChild(el("button", {
        type: "button", className: "btn btn-small btn-quiet remove-row",
        onclick: function () {
          rows.splice(r, 1);
          store();
          changed();
          redraw(id + "-addrow");
        }
      }, "Remove " + rowLabel.toLowerCase() + " " + (r + 1)));
      fs.appendChild(card);
    });

    fs.appendChild(el("button", {
      type: "button", className: "btn", id: id + "-addrow",
      onclick: function () {
        rows.push(blankRow(q));
        store();
        changed();
        redraw(id + "-r" + (rows.length - 1) + "-" + q.columns[0].id);
      }
    }, "+ " + (q.addLabel || "Add another row")));
    return fs;
  }

  function renderExtras(section) {
    var sid = "x-" + section.id;
    var box = el("section", { className: "extras", "aria-labelledby": sid + "-h" },
      el("h3", { id: sid + "-h", text: "Your own questions and notes" }),
      el("p", { className: "help", text: "Add anything else you want in this part of the plan." }));
    var list = extrasFor(section.id);
    list.forEach(function (x, i) {
      var qid = sid + "-" + i + "-q", aid = sid + "-" + i + "-a";
      var qIn = el("input", { type: "text", id: qid, className: "field", autocomplete: "off", value: x.question || "" });
      var aIn = el("textarea", { id: aid, className: "field field-long", rows: 3, value: x.answer || "" });
      qIn.addEventListener("input", function () { x.question = qIn.value; changed(); });
      aIn.addEventListener("input", function () { x.answer = aIn.value; changed(); });
      box.appendChild(el("div", { className: "extra-item", role: "group", "aria-label": "Your question " + (i + 1) },
        el("label", { "for": qid, className: "cell-label", text: "Your question or heading " + (i + 1) }), qIn,
        el("label", { "for": aid, className: "cell-label", text: "Answer or note" }), aIn,
        el("button", {
          type: "button", className: "btn btn-small btn-quiet",
          onclick: function () {
            list.splice(i, 1);
            state.extraQuestions[section.id] = list;
            changed();
            redraw(sid + "-add");
          }
        }, "Remove your question " + (i + 1))));
    });
    box.appendChild(el("button", {
      type: "button", className: "btn", id: sid + "-add",
      onclick: function () {
        list.push({ id: newId("extra"), question: "", answer: "" });
        state.extraQuestions[section.id] = list;
        changed();
        redraw(sid + "-" + (list.length - 1) + "-q");
      }
    }, "+ Add your own question or note"));
    return box;
  }

  var RENDERERS = {
    text: textInput,
    textarea: textInput,
    date: dateQuestion,
    yesno: yesNoQuestion,
    choice: choiceQuestion,
    checklist: checklistQuestion,
    table: tableQuestion
  };

  /* ------------------------------------------------------------------ */
  /* Final plan (screen preview and print)                              */
  /* ------------------------------------------------------------------ */

  function planTitle() {
    return isBlank(state.answers.plan_title) ? "Our household emergency plan" : String(state.answers.plan_title).trim();
  }

  function lastReviewedText(blanks) {
    var v = state.answers.plan_last_reviewed;
    if (!isBlank(v)) return v;
    return blanks ? "____ / ____ / ________" : "not yet recorded";
  }

  function ruled(lines) {
    var d = el("div", { className: "ruled" });
    for (var i = 0; i < lines; i++) d.appendChild(el("div", { className: "ruled-line" }));
    return d;
  }

  function box(ticked) { return el("span", { className: "tickbox" + (ticked ? " ticked" : ""), "aria-hidden": "true" }, ticked ? "✓" : ""); }

  /* Returns an element for one question in the plan, or null to omit it. */
  function planQuestion(q, blanks) {
    var v = state.answers[q.id];
    var body = null;
    switch (q.type) {
      case "text": case "textarea": case "date":
        if (!isBlank(v)) body = el("p", { className: "plan-answer", text: String(v) });
        else if (blanks) body = ruled(q.type === "textarea" ? 4 : 1);
        break;
      case "yesno":
        if (v === "yes" || v === "no") body = el("p", { className: "plan-answer", text: v === "yes" ? "Yes" : "No" });
        else if (blanks) body = el("p", { className: "plan-options" }, box(false), " Yes    ", box(false), " No");
        break;
      case "choice":
        if (!isBlank(v)) {
          var match = optionsOf(q).filter(function (o) { return o.value === v; })[0];
          body = el("p", { className: "plan-answer", text: match ? match.label : String(v) });
        } else if (blanks) {
          body = el("ul", { className: "plan-checks" }, optionsOf(q).map(function (o) { return el("li", null, box(false), " " + o.label); }));
        }
        break;
      case "checklist": {
        var t = (v && typeof v === "object") ? v : {};
        var all = itemsOf(q).concat(state.customItems[q.id] || []);
        var action = q.printStyle === "actionList";
        var show = blanks ? all : all.filter(function (it) { return t[it.id] === true; });
        if (show.length || blanks) {
          body = el("ul", { className: "plan-checks" }, show.map(function (it) {
            return el("li", null, box(action ? false : t[it.id] === true), " " + it.label);
          }));
          if (blanks) {
            var extra = el("div", { className: "plan-extra-lines" });
            for (var k = 0; k < 2; k++) extra.appendChild(el("div", { className: "check-blank" }, box(false), el("span", { className: "ruled-line inline" })));
            body = el("div", null, body, extra);
          }
        }
        break;
      }
      case "table": {
        var rows = effectiveRows(q, blanks).filter(rowHasContent);
        var blankCount = blanks ? (rows.length ? 2 : 4) : 0;
        if (rows.length || blanks) {
          var table = el("table", { className: "plan-table" },
            el("thead", null, el("tr", null, q.columns.map(function (c) { return el("th", { scope: "col", text: c.label }); }))));
          var tb = el("tbody");
          rows.forEach(function (r) { tb.appendChild(el("tr", null, q.columns.map(function (c) { return el("td", { text: r[c.id] || "" }); }))); });
          for (var b = 0; b < blankCount; b++) tb.appendChild(el("tr", { className: "blank-row" }, q.columns.map(function () { return el("td", null, " "); })));
          table.appendChild(tb);
          body = table;
        }
        break;
      }
    }
    if (!body) return null;
    return el("div", { className: "plan-q plan-q-" + q.type }, el("h3", { className: "plan-q-label", text: q.label }), body);
  }

  function buildPlanDoc(blanks) {
    var doc = el("article", { className: "plan-doc" + (blanks ? " with-blanks" : "") });
    var title = planTitle();
    var reviewed = lastReviewedText(blanks);
    doc.appendChild(el("header", { className: "plan-header" },
      el("h1", { className: "plan-title", text: title }),
      el("p", { className: "plan-meta" },
        el("span", null, el("strong", { text: "Last reviewed: " }), reviewed),
        el("span", null, el("strong", { text: "Printed: " }), blanks ? "____ / ____ / ________" : formatDate(new Date())))));

    var anything = false;
    SECTIONS.forEach(function (s, i) {
      var parts = [];
      s.questions.forEach(function (q) {
        if (q.hideInPlan) return;
        var p = planQuestion(q, blanks);
        if (p) parts.push(p);
      });
      extrasFor(s.id).forEach(function (x) {
        if (!extraHasContent(x)) return;
        var ans = !isBlank(x.answer) ? el("p", { className: "plan-answer", text: x.answer }) : (blanks ? ruled(3) : null);
        parts.push(el("div", { className: "plan-q" }, el("h3", { className: "plan-q-label", text: isBlank(x.question) ? "Note" : x.question }), ans));
      });
      if (!parts.length) return;
      anything = true;
      var sec = el("section", { className: "plan-section" + (s.newPage ? " new-page" : "") });
      if (s.newPage) sec.appendChild(el("p", { className: "running-head", text: title + " · Last reviewed: " + reviewed }));
      sec.appendChild(el("h2", { className: "plan-section-title", text: (i + 1) + ". " + s.title }));
      if (s.intro && s.newPage) sec.appendChild(el("p", { className: "plan-intro", text: s.intro }));
      parts.forEach(function (p) { sec.appendChild(p); });
      doc.appendChild(sec);
    });
    if (!anything) {
      doc.appendChild(el("p", { className: "plan-empty", text: "No answers yet. Go through the sections first, or tick “Show blank lines for unanswered questions” to print a paper template." }));
    }
    return doc;
  }

  function renderPrintArea() {
    var area = $("print-area");
    area.textContent = "";
    area.appendChild(buildPlanDoc(!!state.settings.showBlanks));
  }

  function renderPlanView() {
    var wrap = el("div", { className: "plan-view" });
    wrap.appendChild(el("h2", { text: "Produce final plan" }));
    wrap.appendChild(el("p", { className: "lead", text: "This is how your plan will look on paper. Each scenario starts on a new page." }));

    var cb = el("input", {
      type: "checkbox", id: "toggle-blanks", checked: !!state.settings.showBlanks,
      onchange: function () {
        state.settings.showBlanks = cb.checked;
        changed();
        preview.textContent = "";
        preview.appendChild(buildPlanDoc(cb.checked));
        renderPrintArea();
      }
    });
    wrap.appendChild(el("div", { className: "plan-controls" },
      el("div", { className: "check-item big" }, cb,
        el("label", { "for": "toggle-blanks", text: "Show blank lines for unanswered questions (useful as a paper template)" })),
      el("button", { type: "button", className: "btn btn-primary btn-large", id: "btn-print", onclick: function () { renderPrintArea(); window.print(); } },
        "Print or save as PDF"),
      el("div", { className: "print-help" },
        el("p", { text: "When the Print window opens:" }),
        el("ol", null,
          el("li", { text: "To print on paper, choose your printer." }),
          el("li", { text: "To make a PDF, choose “Save to PDF” (Firefox) or “Save as PDF” (Chrome) as the printer or destination." }),
          el("li", { text: "Check the paper size is A4, then press Print or Save." })))));

    var preview = el("div", { className: "plan-preview", "aria-label": "Preview of the printed plan", role: "region" });
    preview.appendChild(buildPlanDoc(!!state.settings.showBlanks));
    wrap.appendChild(preview);
    renderPrintArea();
    return wrap;
  }

  window.addEventListener("beforeprint", renderPrintArea);

  /* ------------------------------------------------------------------ */
  /* Backup: save and open                                              */
  /* ------------------------------------------------------------------ */

  function backupData() {
    var now = new Date();
    return {
      format: FORMAT,
      formatVersion: FORMAT_VERSION,
      appName: "Household Emergency Planner",
      questionSetVersion: Q.questionSetVersion || "",
      savedAt: now.toISOString(),
      savedOn: formatDateTime(now),
      answers: clone(state.answers),
      customItems: clone(state.customItems),
      extraQuestions: clone(state.extraQuestions),
      settings: clone(state.settings)
    };
  }

  function downloadBackup() {
    if (saveTimer) saveNow();
    var data = backupData();
    var now = new Date();
    var name = "household-plan-backup-" + pad(now.getDate()) + "-" + pad(now.getMonth() + 1) + "-" + now.getFullYear() + ".json";
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = el("a", { href: url, download: name });
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 1000);
    notice("Backup saved as “" + name + "”. Look for it in your Downloads folder and keep it somewhere safe.", "ok");
  }

  function isPlainObject(x) { return !!x && typeof x === "object" && !Array.isArray(x); }

  function cleanString(x) { return typeof x === "string" ? x : (typeof x === "number" ? String(x) : ""); }

  /* Checks a parsed file. Returns {ok, data} or {ok:false, message}. */
  function validateBackup(obj) {
    var notOurs = "This file is not a Household Emergency Planner backup. It may belong to a different app. Please choose a file with a name like “household-plan-backup-16-11-2026.json”.";
    if (!isPlainObject(obj)) return { ok: false, message: notOurs };
    if (obj.format !== FORMAT) return { ok: false, message: notOurs };
    if (typeof obj.formatVersion !== "number" || obj.formatVersion < 1) return { ok: false, message: "This backup file seems to be damaged, so it could not be opened." };
    if (obj.formatVersion > FORMAT_VERSION) return { ok: false, message: "This backup was made by a newer version of the planner, so this version cannot open it." };
    if (obj.answers !== undefined && !isPlainObject(obj.answers)) return { ok: false, message: "This backup file seems to be damaged, so it could not be opened." };

    var out = emptyState();
    var answers = isPlainObject(obj.answers) ? obj.answers : {};
    Object.keys(answers).forEach(function (k) {
      var v = answers[k];
      var q = findQuestion(k);
      if (typeof v === "string" || typeof v === "number") out.answers[k] = String(v);
      else if (Array.isArray(v)) {
        out.answers[k] = v.filter(isPlainObject).map(function (row) {
          var r = {};
          Object.keys(row).forEach(function (c) { r[c] = cleanString(row[c]); });
          if (q && q.columns) q.columns.forEach(function (c) { if (r[c.id] === undefined) r[c.id] = ""; });
          return r;
        });
      } else if (isPlainObject(v)) {
        var t = {};
        Object.keys(v).forEach(function (i) { if (v[i] === true) t[i] = true; });
        out.answers[k] = t;
      }
    });
    if (isPlainObject(obj.customItems)) {
      Object.keys(obj.customItems).forEach(function (k) {
        var arr = obj.customItems[k];
        if (!Array.isArray(arr)) return;
        out.customItems[k] = arr.filter(function (x) { return isPlainObject(x) && typeof x.label === "string"; })
          .map(function (x) { return { id: typeof x.id === "string" && x.id ? x.id : newId("custom"), label: x.label }; });
      });
    }
    if (isPlainObject(obj.extraQuestions)) {
      Object.keys(obj.extraQuestions).forEach(function (k) {
        var arr = obj.extraQuestions[k];
        if (!Array.isArray(arr)) return;
        out.extraQuestions[k] = arr.filter(isPlainObject).map(function (x) {
          return { id: typeof x.id === "string" && x.id ? x.id : newId("extra"), question: cleanString(x.question), answer: cleanString(x.answer) };
        });
      });
    }
    if (isPlainObject(obj.settings)) out.settings.showBlanks = obj.settings.showBlanks === true;
    return { ok: true, data: out, savedOn: typeof obj.savedOn === "string" ? obj.savedOn : "" };
  }

  function openFile(file) {
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      notice("That file is too large to be a planner backup. Please choose a file with a name like “household-plan-backup-16-11-2026.json”.", "error");
      return;
    }
    var reader = new FileReader();
    reader.onerror = function () { notice("Sorry, that file could not be read. Please try again.", "error"); };
    reader.onload = function () {
      var parsed;
      try { parsed = JSON.parse(String(reader.result).replace(/^﻿/, "")); }
      catch (e) {
        notice("This file is not a Household Emergency Planner backup, so it could not be opened. Please choose a file with a name like “household-plan-backup-16-11-2026.json”.", "error");
        return;
      }
      var result = validateBackup(parsed);
      if (!result.ok) { notice(result.message, "error"); return; }
      var confirmFirst = hasAnyAnswers()
        ? ask({
            title: "Replace your current answers?",
            message: [
              "Opening “" + file.name + "” will replace the answers currently in the planner.",
              "If you want to keep the current answers, press Cancel and use “Save backup” first."
            ],
            okText: "Yes, open the file", cancelText: "Cancel"
          })
        : Promise.resolve(true);
      confirmFirst.then(function (yes) {
        if (!yes) return;
        var keepSaved = state.savedAt;
        state = result.data;
        state.savedAt = keepSaved;
        workingTables = {};
        saveNow().then(function () {
          go(currentView === "plan" ? "plan" : "start", { noFocus: false });
          notice("Opened “" + file.name + "”" + (result.savedOn ? " (backup made on " + result.savedOn + ")" : "") + ". Your answers have been restored.", "ok");
        });
      });
    };
    reader.readAsText(file);
  }

  /* ------------------------------------------------------------------ */
  /* Start again                                                        */
  /* ------------------------------------------------------------------ */

  function startAgain() {
    ask({
      title: "Start again?",
      message: [
        "This will delete all the answers in this planner on this computer, including any items and questions you added.",
        "We recommend you press Cancel and use “Save backup” first, so you have a copy.",
        "Backup files you have already saved will not be affected. Nothing else on this computer is changed."
      ],
      okText: "Delete my answers and start again", cancelText: "Cancel", danger: true
    }).then(function (yes) {
      if (!yes) return;
      clearTimeout(saveTimer); saveTimer = null;
      storage.clear().then(function () {
        state = emptyState();
        workingTables = {};
        showSavedTime();
        renderPrintArea();
        go("start");
        notice("All answers have been cleared. You can start again.", "ok");
      });
    });
  }

  /* ------------------------------------------------------------------ */
  /* Start-up                                                           */
  /* ------------------------------------------------------------------ */

  function loadInto(saved) {
    if (!saved) return;
    var r = validateBackup(saved);
    if (!r.ok) return;
    state = r.data;
    state.savedAt = typeof saved.savedAt === "string" ? saved.savedAt : null;
    if (typeof saved.lastView === "string") currentView = saved.lastView;
  }

  function init() {
    if (!SECTIONS.length) {
      $("view").appendChild(el("p", { className: "notice notice-error", text: "The questions could not be loaded. If questions.js was edited recently, check it for a missing comma or quotation mark." }));
      return;
    }
    $("btn-backup").addEventListener("click", downloadBackup);
    $("btn-open").addEventListener("click", function () { $("file-input").click(); });
    $("btn-reset").addEventListener("click", startAgain);
    $("file-input").addEventListener("change", function (e) {
      var f = e.target.files && e.target.files[0];
      e.target.value = "";
      openFile(f);
    });

    storage.init().then(function () { return storage.load(); }).then(function (saved) {
      loadInto(saved);
      renderSidebar();
      showSavedTime();
      if (storage.backend === "none") {
        setSaveStatus("This browser cannot save answers here. Use “Save backup” often.", true);
      }
      go(currentView, { noFocus: true });
      renderPrintArea();
    });
  }

  // Expose a little for testing and troubleshooting (read-only use).
  window.HomeEmergencyPlanner = {
    storageBackend: function () { return storage.backend; },
    normaliseDate: normaliseDate,
    flushSave: function () { return saveNow(); }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
