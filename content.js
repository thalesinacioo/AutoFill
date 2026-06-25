const ICON_ID = "__af_icon__";
const PICKER_ID = "__af_picker__";
const DIALOG_ID = "__autofill_dialog__";
const ICON_URL = chrome.runtime.getURL("icons/icon48.png");

const SVG = {
  sparks:      `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4v5M3 6.5h5m-2 10v4m-2-2h4m3.508-8.217c-2.118.606-3.177.908-3.33 1.443a1 1 0 0 0 0 .548c.153.535 1.212.837 3.33 1.443.425.121.637.182.798.314a1 1 0 0 1 .156.162c.127.165.181.38.288.809.615 2.458.922 3.687 1.49 3.84.17.046.35.046.52 0 .568-.152.875-1.382 1.49-3.84.107-.43.16-.644.288-.81a1 1 0 0 1 .156-.16c.16-.133.373-.194.797-.315 2.12-.606 3.178-.908 3.33-1.443a1 1 0 0 0 0-.548c-.152-.535-1.21-.837-3.33-1.443-.424-.121-.636-.182-.797-.314a1 1 0 0 1-.156-.162c-.128-.165-.181-.38-.288-.809-.615-2.458-.922-3.688-1.49-3.84a1 1 0 0 0-.52 0c-.568.152-.875 1.382-1.49 3.84-.107.43-.16.644-.288.81a1 1 0 0 1-.156.16c-.16.133-.373.194-.797.315z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  list:        `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8 7h13M8 12h13M8 17h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm0 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z" fill="currentColor"/></svg>`,
  save:        `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 3H10c-1.886 0-2.828 0-3.414.586C6 4.172 6 5.114 6 7v8.222c0 3.46 0 5.19.989 5.55.989.358 2.097-.971 4.314-3.628l.697-.835.697.835c2.217 2.657 3.325 3.986 4.314 3.627.989-.358.989-2.089.989-5.55V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 3v6m3-3h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  search:      `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="9.375" cy="9.375" r="6.375" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M14.333 14.333L20 20" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  chevronDown: `<svg width="12" height="12" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 9l5.172 5.172c1.333 1.333 2 2 2.828 2 .828 0 1.495-.667 2.828-2L20 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronUp:   `<svg width="12" height="12" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 15l-5.172-5.172c-1.333-1.333-2-2-2.828-2-.828 0-1.495.667-2.828 2L4 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

let cachedFields = {};
let cachedOrder = [];
let currentInput = null;

// Carrega campos do storage
function loadFields(cb) {
  chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
    cachedFields = fields;
    cachedOrder = fieldOrder;
    if (cb) cb(fields, fieldOrder);
  });
}

// Retorna atributos textuais do campo para matching
function getFieldHints(el) {
  // label associado via for/id
  const labelFor = el.id ? document.querySelector(`label[for="${el.id}"]`)?.textContent || "" : "";

  // sobe até 4 níveis buscando texto de label ou irmão anterior com texto
  let ancestorText = "";
  let node = el.parentElement;
  for (let i = 0; i < 4 && node; i++, node = node.parentElement) {
    const prev = node.previousElementSibling;
    if (prev && prev.textContent.trim()) { ancestorText = prev.textContent; break; }
    const lbl = node.closest("label");
    if (lbl) { ancestorText = lbl.textContent; break; }
  }

  return [
    el.placeholder || "",
    el.name || "",
    el.id || "",
    el.getAttribute("aria-label") || "",
    el.getAttribute("autocomplete") || "",
    el.getAttribute("data-label") || "",
    labelFor,
    el.closest("label")?.textContent || "",
    el.previousElementSibling?.textContent || "",
    el.parentElement?.previousElementSibling?.textContent || "",
    ancestorText,
  ].join(" ").toLowerCase();
}

// Retorna a chave que melhor casa com o hint do campo (match mais longo/específico).
// Evita que "Sobrenome" case com "Nome" só por conter a substring.
function bestMatchKey(hint, keys) {
  let best = null, bestLen = 0;
  for (const key of keys) {
    const k = key.toLowerCase();
    if (k && hint.includes(k) && k.length > bestLen) { best = key; bestLen = k.length; }
  }
  return best;
}

// Ordena entradas priorizando as que têm match com o campo
function sortedKeys(fields, order, el) {
  const hint = getFieldHints(el);
  const fieldKeys = order.filter(k => fields[k] !== undefined);
  Object.keys(fields).forEach(k => { if (!fieldKeys.includes(k)) fieldKeys.push(k); });

  return fieldKeys.sort((a, b) => {
    const aMatch = hint.includes(a.toLowerCase()) ? 1 : 0;
    const bMatch = hint.includes(b.toLowerCase()) ? 1 : 0;
    return bMatch - aMatch;
  });
}

// ── Preenche o campo ──────────────────────────────────────────────────────────
function fillField(el, value) {
  if (!el) return;
  if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
    const proto = el.tagName === "INPUT"
      ? window.HTMLInputElement.prototype
      : window.HTMLTextAreaElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, value);
    else el.value = value;
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  } else if (el.isContentEditable) {
    el.focus();
    document.execCommand("insertText", false, value);
  }
}

// ── Ícone flutuante dentro do campo ──────────────────────────────────────────
function removeIcon() {
  document.getElementById(ICON_ID)?.remove();
}

function removePicker() {
  document.getElementById(PICKER_ID)?.remove();
}


function positionNear(floater, el, side = "right") {
  const r = el.getBoundingClientRect();
  const scrollX = window.scrollX;
  const scrollY = window.scrollY;
  floater.style.position = "absolute";
  floater.style.top = `${r.top + scrollY + (r.height - 24) / 2}px`;
  if (side === "right") {
    floater.style.left = `${r.right + scrollX - 28}px`;
  } else {
    floater.style.left = `${r.right + scrollX + 4}px`;
  }
  floater.style.zIndex = "2147483646";
}

function showFieldIcon(el) {
  removeIcon();
  if (!el || el.readOnly || el.disabled) return;
  if (!["INPUT", "TEXTAREA"].includes(el.tagName) && !el.isContentEditable) return;
  if (el.type === "password" || el.type === "hidden" || el.type === "submit" || el.type === "button") return;

  const icon = document.createElement("img");
  icon.id = ICON_ID;
  icon.src = ICON_URL;
  icon.title = "AutoFill";
  icon.style.cssText = `
    width: 20px; height: 20px; border-radius: 4px;
    cursor: pointer; opacity: 0.75;
    transition: opacity 0.15s, transform 0.15s;
    pointer-events: all;
    display: block;
  `;
  icon.addEventListener("mouseenter", () => { icon.style.opacity = "1"; icon.style.transform = "scale(1.1)"; });
  icon.addEventListener("mouseleave", () => { icon.style.opacity = "0.75"; icon.style.transform = ""; });

  icon.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (document.getElementById(PICKER_ID)) { removePicker(); return; }
    showInlinePicker(el);
  });

  document.body.appendChild(icon);
  positionNear(icon, el, "right");
}

// ── Preenche todos os campos da página que dão match ─────────────────────────
function fillAllMatching(fields) {
  const inputs = Array.from(document.querySelectorAll("input, textarea, [contenteditable]"))
    .filter(el => isEditableField(el) && el.offsetParent !== null);

  let filled = 0;
  inputs.forEach(el => {
    const hint = getFieldHints(el);
    const match = bestMatchKey(hint, Object.keys(fields));
    if (match) {
      fillField(el, fields[match]);
      filled++;
    }
  });
  return filled;
}

// ── Salva todos os campos preenchidos ainda não salvos ────────────────────────
function showSaveAllDialog(newEntries) {
  document.getElementById("__af_saveall__")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "__af_saveall__";
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.35); z-index: 2147483647;
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  const box = document.createElement("div");
  box.style.cssText = `background:white;border-radius:12px;width:380px;
    box-shadow:0 20px 60px rgba(0,0,0,0.25);overflow:hidden;`;

  const header = document.createElement("div");
  header.style.cssText = `padding:16px 20px 12px;border-bottom:1px solid #f3f4f6;`;
  header.innerHTML = `
    <div style="font-size:14px;font-weight:700;color:#1a1a2e;margin-bottom:6px;">Salvar campos preenchidos</div>
    <div style="font-size:12px;color:#6b7280;line-height:1.5;">Edite os nomes antes de salvar.<br>Desmarque os que não quer.</div>
  `;

  const listEl = document.createElement("div");
  listEl.style.cssText = `max-height:280px;overflow-y:auto;padding:8px 12px;display:flex;flex-direction:column;gap:6px;`;

  // Checkbox state
  const checks = newEntries.map(() => true);

  newEntries.forEach((entry, i) => {
    const row = document.createElement("div");
    row.style.cssText = `display:flex;align-items:center;gap:8px;
      background:#f9fafb;border:1px solid #e5e7eb;border-radius:7px;padding:7px 10px;`;

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = true;
    cb.style.cssText = `
      all: revert;
      width: 16px; height: 16px;
      flex-shrink: 0;
      appearance: auto; -webkit-appearance: checkbox;
      accent-color: #4f46e5;
      cursor: pointer;
      margin: 0;
    `;
    cb.addEventListener("change", () => { checks[i] = cb.checked; });

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = entry.name;
    nameInput.placeholder = "Nome";
    nameInput.style.cssText = `flex:0.8;border:1px solid #e5e7eb;border-radius:5px;
      padding:4px 7px;font-size:12px;font-weight:600;color:#4f46e5;outline:none;`;
    nameInput.addEventListener("focus", () => { nameInput.style.borderColor = "#4f46e5"; });
    nameInput.addEventListener("blur", () => { nameInput.style.borderColor = "#e5e7eb"; entry.name = nameInput.value.trim(); });

    const sep = document.createElement("span");
    sep.textContent = "→";
    sep.style.cssText = "color:#d1d5db;font-size:11px;flex-shrink:0;";

    const valSpan = document.createElement("span");
    valSpan.textContent = entry.value;
    valSpan.style.cssText = `font-size:12px;color:#6b7280;overflow:hidden;
      text-overflow:ellipsis;white-space:nowrap;flex:1;`;
    valSpan.title = entry.value;

    row.appendChild(cb);
    row.appendChild(nameInput);
    row.appendChild(sep);
    row.appendChild(valSpan);
    listEl.appendChild(row);
  });

  const footer = document.createElement("div");
  footer.style.cssText = `display:flex;justify-content:flex-end;gap:8px;
    padding:12px 16px;border-top:1px solid #f3f4f6;`;

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "Cancelar";
  cancelBtn.style.cssText = `padding:7px 16px;background:#f3f4f6;border:none;border-radius:6px;
    font-size:13px;cursor:pointer;color:#374151;`;

  const saveBtn = document.createElement("button");
  saveBtn.textContent = "Salvar selecionados";
  saveBtn.style.cssText = `padding:7px 18px;background:#4f46e5;color:white;border:none;
    border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;`;

  const close = () => overlay.remove();
  cancelBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  saveBtn.addEventListener("click", () => {
    const toSave = newEntries.filter((_, i) => checks[i] && newEntries[i].name.trim());
    if (toSave.length === 0) { close(); return; }

    chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
      toSave.forEach(({ name, value }) => {
        fields[name] = value;
        if (!fieldOrder.includes(name)) fieldOrder.push(name);
      });
      chrome.storage.sync.set({ fields, fieldOrder }, () => {
        chrome.runtime.sendMessage({ action: "rebuildMenus" });
      });
    });

    close();
    const toast = document.createElement("div");
    toast.textContent = `✓ ${toSave.length} entrada${toSave.length > 1 ? "s salvas" : " salva"}`;
    toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:2147483647;
      background:#4f46e5;color:white;font-family:-apple-system,sans-serif;
      font-size:13px;font-weight:600;padding:10px 16px;border-radius:8px;
      box-shadow:0 4px 20px rgba(79,70,229,0.4);transition:opacity 0.3s;`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2500);
  });

  footer.appendChild(cancelBtn);
  footer.appendChild(saveBtn);
  box.appendChild(header);
  box.appendChild(listEl);
  box.appendChild(footer);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
}

function isVisible(el) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return false;
  const style = window.getComputedStyle(el);
  return style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0";
}

function collectUnsavedFields(fields) {
  const savedValues = Object.values(fields);
  const savedNames = Object.keys(fields).map(k => k.toLowerCase());

  const inputs = Array.from(document.querySelectorAll("input, textarea"))
    .filter(el => isEditableField(el) && isVisible(el) && el.value.trim());

  const seen = new Set();
  const results = [];

  inputs.forEach(el => {
    const value = el.value.trim();
    if (seen.has(value)) return;

    const suggestedName = el.placeholder?.trim() || el.getAttribute("aria-label")?.trim()
      || el.name?.trim() || el.id?.trim() || "";

    // Pula se o nome já está salvo com o mesmo valor
    const nameKey = suggestedName.toLowerCase();
    if (nameKey && savedNames.includes(nameKey) && fields[Object.keys(fields).find(k => k.toLowerCase() === nameKey)] === value) return;

    // Pula se o valor já está salvo (sem nome identificável)
    if (!suggestedName && savedValues.includes(value)) return;

    seen.add(value);
    results.push({ name: suggestedName, value });
  });

  return results;
}

// ── Mini picker inline ────────────────────────────────────────────────────────
function showInlinePicker(el) {
  removePicker();
  loadFields((fields) => {
    const keys = sortedKeys(fields, cachedOrder, el);
    const unsavedCheck = collectUnsavedFields(fields);
    // Só fecha se não há entradas salvas E nada para salvar
    if (keys.length === 0 && unsavedCheck.length === 0) return;

    const r = el.getBoundingClientRect();
    const picker = document.createElement("div");
    picker.id = PICKER_ID;
    picker.style.cssText = `
      position: absolute;
      top: ${r.bottom + window.scrollY + 4}px;
      left: ${r.left + window.scrollX}px;
      min-width: ${Math.max(r.width, 180)}px;
      max-width: 300px;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      z-index: 2147483647;
      overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    `;

    const hint = getFieldHints(el);

    // Separa sugerido do resto
    const suggested = keys.filter(k => hint.includes(k.toLowerCase()));
    const others = keys.filter(k => !hint.includes(k.toLowerCase()));
    const orderedKeys = [...suggested, ...others];

    // Conta campos da página com match para o botão "preencher tudo"
    const allInputs = Array.from(document.querySelectorAll("input, textarea, [contenteditable]"))
      .filter(inp => isEditableField(inp) && inp.offsetParent !== null);
    const matchingFields = allInputs.reduce((acc, inp) => {
      const h = getFieldHints(inp);
      const match = bestMatchKey(h, Object.keys(fields));
      if (match && !acc.find(m => m.key === match)) acc.push({ key: match, value: fields[match] });
      return acc;
    }, []);

    // ── Linha de ações: Preencher | Salvar | Buscar ───────────────────────────
    const unsaved = unsavedCheck;
    const hasActions = matchingFields.length > 1 || unsaved.length > 0 || keys.length > 0;

    let listItems = []; // referências aos itens para filtrar
    let previewRow = null;
    let searchRow = null;

    if (hasActions) {
      const actionRow = document.createElement("div");
      actionRow.style.cssText = `display:flex; align-items:stretch; border-bottom:1px solid #e5e7eb;`;

      // Botão Preencher (só se houver match)
      if (matchingFields.length >= 1) {
        const fillWrap = document.createElement("div");
        fillWrap.style.cssText = `flex:1; display:flex; align-items:stretch; background:#f5f3ff; border-right:1px solid #e5e7eb;`;

        const fillBtn = document.createElement("div");
        fillBtn.style.cssText = `flex:1; display:flex; align-items:center; gap:4px; padding:7px 8px; cursor:pointer; font-size:11px; font-weight:600; color:#4f46e5; min-width:0;`;
        fillBtn.innerHTML = `${SVG.sparks} <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Preencher ${matchingFields.length}</span>`;

        const fillChev = document.createElement("div");
        fillChev.style.cssText = `padding:7px 6px; cursor:pointer; color:#9ca3af; display:flex; align-items:center; border-left:1px solid #ddd5fe; flex-shrink:0;`;
        fillChev.innerHTML = SVG.chevronDown;

        previewRow = document.createElement("div");
        previewRow.style.cssText = `display:none; border-bottom:1px solid #e5e7eb; background:#faf9ff; padding:6px 10px;`;
        matchingFields.forEach(({ key, value }) => {
          const r = document.createElement("div");
          r.style.cssText = `display:flex;gap:6px;align-items:center;padding:2px 0;`;
          r.innerHTML = `<span style="font-size:11px;font-weight:600;color:#4f46e5;flex-shrink:0;">${escHtml(key)}</span><span style="font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">→ ${escHtml(value)}</span>`;
          previewRow.appendChild(r);
        });

        fillChev.addEventListener("mousedown", (e) => {
          e.preventDefault(); e.stopPropagation();
          const vis = previewRow.style.display !== "none";
          previewRow.style.display = vis ? "none" : "block";
          fillChev.innerHTML = vis ? SVG.chevronDown : SVG.chevronUp;
          fillChev.style.color = vis ? "#9ca3af" : "#4f46e5";
        });

        fillBtn.addEventListener("mouseenter", () => { fillWrap.style.background = "#ede9fe"; });
        fillBtn.addEventListener("mouseleave", () => { fillWrap.style.background = "#f5f3ff"; });
        fillBtn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          const filled = fillAllMatching(fields);
          removePicker(); removeIcon();
          const toast = document.createElement("div");
          toast.textContent = `✓ ${filled} campo${filled > 1 ? "s" : ""} preenchido${filled > 1 ? "s" : ""}`;
          toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:2147483647;background:#4f46e5;color:white;font-family:-apple-system,sans-serif;font-size:13px;font-weight:600;padding:10px 16px;border-radius:8px;box-shadow:0 4px 20px rgba(79,70,229,0.4);transition:opacity 0.3s;`;
          document.body.appendChild(toast);
          setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2000);
        });

        fillWrap.appendChild(fillBtn);
        fillWrap.appendChild(fillChev);
        actionRow.appendChild(fillWrap);
      }

      // Botão Salvar (só se houver campos não salvos) + chevron para preview
      if (unsaved.length > 0) {
        const saveWrap = document.createElement("div");
        saveWrap.style.cssText = `flex:1; display:flex; align-items:stretch; background:#f0fdf4; border-right:1px solid #e5e7eb;`;

        const saveBtn = document.createElement("div");
        saveBtn.style.cssText = `flex:1; display:flex; align-items:center; gap:4px; padding:7px 8px; cursor:pointer; font-size:11px; font-weight:600; color:#16a34a; min-width:0;`;
        saveBtn.innerHTML = `${SVG.save} <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">Salvar ${unsaved.length}</span>`;

        const saveChev = document.createElement("div");
        saveChev.style.cssText = `padding:7px 6px; cursor:pointer; color:#9ca3af; display:flex; align-items:center; border-left:1px solid #bbf7d0; flex-shrink:0;`;
        saveChev.innerHTML = SVG.chevronDown;

        const savePreviewRow = document.createElement("div");
        savePreviewRow.style.cssText = `display:none; border-bottom:1px solid #e5e7eb; background:#f0fdf4; padding:6px 10px;`;
        unsaved.forEach(({ name, value }) => {
          const r = document.createElement("div");
          r.style.cssText = `display:flex;gap:6px;align-items:center;padding:2px 0;`;
          r.innerHTML = `<span style="font-size:11px;font-weight:600;color:#16a34a;flex-shrink:0;">${escHtml(name)}</span><span style="font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">→ ${escHtml(value)}</span>`;
          savePreviewRow.appendChild(r);
        });

        saveChev.addEventListener("mousedown", (e) => {
          e.preventDefault(); e.stopPropagation();
          const vis = savePreviewRow.style.display !== "none";
          savePreviewRow.style.display = vis ? "none" : "block";
          saveChev.innerHTML = vis ? SVG.chevronDown : SVG.chevronUp;
          saveChev.style.color = vis ? "#9ca3af" : "#16a34a";
        });

        saveBtn.addEventListener("mouseenter", () => { saveWrap.style.background = "#dcfce7"; });
        saveBtn.addEventListener("mouseleave", () => { saveWrap.style.background = "#f0fdf4"; });
        saveBtn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          removePicker(); removeIcon();
          showSaveAllDialog(unsaved);
        });

        saveWrap.appendChild(saveBtn);
        saveWrap.appendChild(saveChev);
        actionRow.appendChild(saveWrap);

        // guardar para inserir após previewRow do fill
        actionRow._savePreviewRow = savePreviewRow;
      }

      // Botão Buscar (sempre visível se há entradas)
      if (keys.length > 0) {
        const searchBtn = document.createElement("div");
        searchBtn.style.cssText = `flex:1; display:flex; align-items:center; justify-content:center; gap:4px; padding:7px 8px; cursor:pointer; font-size:11px; font-weight:600; color:#ea580c; background:#fff7ed; min-width:0;`;
        searchBtn.innerHTML = `${SVG.search} <span style="white-space:nowrap;">Buscar</span>`;

        searchRow = document.createElement("div");
        searchRow.style.cssText = `display:none; border-bottom:1px solid #e5e7eb; padding:6px 8px; background:white;`;
        const searchInput = document.createElement("input");
        searchInput.placeholder = "Buscar entrada…";
        searchInput.style.cssText = `width:100%;border:1px solid #e5e7eb;border-radius:5px;padding:4px 8px;font-size:12px;outline:none;font-family:-apple-system,sans-serif;`;
        searchInput.addEventListener("focus", () => { searchInput.style.borderColor = "#ea580c"; });
        searchInput.addEventListener("blur", () => { searchInput.style.borderColor = "#e5e7eb"; });
        searchInput.addEventListener("input", () => {
          const q = searchInput.value.toLowerCase();
          listItems.forEach(({ item, key }) => {
            const show = !q || key.toLowerCase().includes(q) || fields[key].toLowerCase().includes(q);
            item.style.display = show ? "" : "none";
          });
        });
        searchRow.appendChild(searchInput);

        searchBtn.addEventListener("mouseenter", () => { searchBtn.style.background = "#ffedd5"; });
        searchBtn.addEventListener("mouseleave", () => { if (searchRow.style.display === "none") searchBtn.style.background = "#fff7ed"; });
        searchBtn.addEventListener("mousedown", (e) => {
          e.preventDefault();
          const vis = searchRow.style.display !== "none";
          searchRow.style.display = vis ? "none" : "block";
          searchBtn.style.background = vis ? "#fff7ed" : "#ffedd5";
          if (!vis) setTimeout(() => searchInput.focus(), 30);
        });

        actionRow.appendChild(searchBtn);
      }

      picker.appendChild(actionRow);
      if (previewRow) picker.appendChild(previewRow);
      if (actionRow._savePreviewRow) picker.appendChild(actionRow._savePreviewRow);
      if (searchRow) picker.appendChild(searchRow);
    }

    // Lista com scroll, máximo 5 itens visíveis (só se houver entradas)
    if (keys.length === 0) {
      document.body.appendChild(picker);
      setupPickerClose(picker);
      return;
    }
    const list = document.createElement("div");
    list.style.cssText = `max-height: ${5 * 34}px; overflow-y: auto;`;
    picker.appendChild(list);

    orderedKeys.forEach((key, idx) => {
      const num = idx + 1;
      const isMatch = suggested.includes(key);
      const item = document.createElement("div");
      item.style.cssText = `
        display: flex; align-items: center; gap: 10px;
        padding: 5px 10px; cursor: pointer;
        border-bottom: ${idx < orderedKeys.length - 1 ? "1px solid #f3f4f6" : "none"};
        background: ${isMatch ? "#faf9ff" : "white"};
      `;

      const badge = document.createElement("span");
      badge.textContent = num <= 9 ? num : "·";
      badge.style.cssText = `
        flex-shrink: 0; width: 16px; height: 16px; border-radius: 3px;
        background: ${isMatch ? "#ede9fe" : "#f3f4f6"};
        color: ${isMatch ? "#4f46e5" : "#9ca3af"};
        font-size: 10px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
      `;

      const name = document.createElement("span");
      name.style.cssText = `font-size:12px;font-weight:600;color:${isMatch ? "#4f46e5" : "#1a1a2e"};
        flex-shrink:0;`;
      name.textContent = key;

      const sep = document.createElement("span");
      sep.style.cssText = "font-size:11px;color:#d1d5db;flex-shrink:0;";
      sep.textContent = "·";

      const val = document.createElement("span");
      val.style.cssText = `font-size:11px;color:#9ca3af;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap;flex:1;`;
      val.textContent = fields[key];

      item.appendChild(badge);
      item.appendChild(name);
      item.appendChild(sep);
      item.appendChild(val);

      if (isMatch) {
        const tag = document.createElement("span");
        tag.textContent = "sugerido";
        tag.style.cssText = `font-size:9px;font-weight:600;background:#ede9fe;color:#4f46e5;
          border-radius:4px;padding:2px 5px;flex-shrink:0;`;
        item.appendChild(tag);
      }

      item.addEventListener("mouseenter", () => { item.style.background = "#f3f4f6"; });
      item.addEventListener("mouseleave", () => { item.style.background = isMatch ? "#faf9ff" : "white"; });
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        const val = fields[key];
        fillField(el, val);
        copyToClipboard(val);
        removePicker(); removeIcon();
        el.focus();
      });

      listItems.push({ item, key });
      list.appendChild(item);
    });

    document.body.appendChild(picker);
    setupPickerClose(picker, el, fields, keys);
  });
}

function setupPickerClose(picker, el, fields, keys) {
    // Atalho numérico: pressionar 1-9 preenche a entrada correspondente
    function keyHandler(e) {
      if (picker.contains(e.target)) return;
      const n = parseInt(e.key);
      if (keys && n >= 1 && n <= 9 && keys[n - 1]) {
        e.preventDefault();
        const val = fields[keys[n - 1]];
        fillField(el, val);
        fallbackCopy(val);
        removePicker();
        removeIcon();
        document.removeEventListener("keydown", keyHandler, true);
      }
      if (e.key === "Escape") {
        removePicker();
        document.removeEventListener("keydown", keyHandler, true);
      }
    }
    document.addEventListener("keydown", keyHandler, true);
    picker.__keyHandler = keyHandler;

    // Fecha ao clicar fora
    setTimeout(() => {
      document.addEventListener("mousedown", function handler(e) {
        if (!picker.contains(e.target) && e.target.id !== ICON_ID) {
          removePicker();
          document.removeEventListener("keydown", picker.__keyHandler, true);
          document.removeEventListener("mousedown", handler);
        }
      });
    }, 0);
}

// ── Ícone de salvar após o usuário digitar no campo ───────────────────────────
// Atualiza estado visual do ícone: normal ou "há algo para salvar"
function updateIconState(el) {
  const icon = document.getElementById(ICON_ID);
  if (!icon) return;
  loadFields((fields) => {
    const unsaved = collectUnsavedFields(fields);
    const hasUnsaved = unsaved.some(u => u.value === el.value?.trim());
    if (hasUnsaved) {
      icon.style.filter = "drop-shadow(0 0 4px rgba(79,70,229,0.8))";
      icon.style.opacity = "1";
      icon.title = "AutoFill — clique para salvar este campo";
    } else {
      icon.style.filter = "";
      icon.style.opacity = "0.75";
      icon.title = "AutoFill";
    }
  });
}

// ── Dialogo para salvar texto selecionado ─────────────────────────────────────
function showSaveDialog(value, suggestedName = "") {
  document.getElementById(DIALOG_ID)?.remove();

  const overlay = document.createElement("div");
  overlay.id = DIALOG_ID;
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.35); z-index: 2147483647;
    display: flex; align-items: center; justify-content: center;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  const box = document.createElement("div");
  box.style.cssText = `background:white;border-radius:12px;padding:20px 24px;
    width:360px;box-shadow:0 20px 60px rgba(0,0,0,0.25);`;

  box.innerHTML = `
    <div style="font-size:15px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">Salvar no AutoFill</div>
    <div style="font-size:12px;color:#6b7280;margin-bottom:14px;">
      Valor: <span style="font-weight:600;color:#4f46e5;">"${value.length > 50 ? value.slice(0,50)+"…" : escHtml(value)}"</span>
    </div>
    <label style="font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">
      Nome da entrada
    </label>
    <input id="__af_name_input__" type="text" value="${escHtml(suggestedName)}" placeholder="Ex: Email, CPF, Endereço…"
      style="width:100%;margin-top:6px;padding:8px 10px;border:1px solid #d1d5db;
             border-radius:6px;font-size:13px;outline:none;box-sizing:border-box;" />
    <div style="display:flex;gap:8px;margin-top:14px;justify-content:flex-end;">
      <button id="__af_cancel__" style="padding:7px 16px;background:#f3f4f6;border:none;border-radius:6px;
        font-size:13px;cursor:pointer;color:#374151;">Cancelar</button>
      <button id="__af_confirm__" style="padding:7px 18px;background:#4f46e5;color:white;border:none;
        border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Salvar</button>
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  const input = document.getElementById("__af_name_input__");
  input.focus();
  input.select();

  const close = () => overlay.remove();
  document.getElementById("__af_cancel__").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });

  const confirm = () => {
    const name = input.value.trim();
    if (!name) { input.style.border = "1px solid #ef4444"; input.focus(); return; }
    chrome.runtime.sendMessage({ action: "saveField", name, value });
    close();
  };
  document.getElementById("__af_confirm__").addEventListener("click", confirm);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") confirm();
    if (e.key === "Escape") close();
  });
}

// ── Seletor rápido via atalho ─────────────────────────────────────────────────
function showPicker(fields) {
  document.getElementById(PICKER_ID)?.remove();
  const keys = Object.keys(fields);
  if (keys.length === 0) return;

  const targetEl = document.activeElement;

  const overlay = document.createElement("div");
  overlay.id = PICKER_ID;
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.25); z-index: 2147483647;
    display: flex; align-items: flex-start; justify-content: center;
    padding-top: 15vh;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  `;

  const box = document.createElement("div");
  box.style.cssText = `background:white;border-radius:12px;padding:8px;
    width:340px;box-shadow:0 20px 60px rgba(0,0,0,0.25);`;

  // Botão "Preencher tudo" no topo do picker
  const allInputs = Array.from(document.querySelectorAll("input, textarea, [contenteditable]"))
    .filter(el => isEditableField(el) && el.offsetParent !== null);
  const matchCount = allInputs.filter(el => {
    const h = getFieldHints(el);
    return Object.keys(fields).some(k => h.includes(k.toLowerCase()));
  }).length;

  if (matchCount >= 1) {
    const fillAllBtn = document.createElement("div");
    fillAllBtn.style.cssText = `display:flex;align-items:center;gap:6px;padding:8px 12px;
      border-radius:7px;cursor:pointer;background:#f5f3ff;margin-bottom:4px;
      font-size:12px;font-weight:600;color:#4f46e5;border:1px solid #ede9fe;`;
    fillAllBtn.innerHTML = `${SVG.sparks} Preencher ${matchCount} campo${matchCount > 1 ? "s" : ""} de uma vez`;
    fillAllBtn.addEventListener("mouseenter", () => { fillAllBtn.style.background = "#ede9fe"; });
    fillAllBtn.addEventListener("mouseleave", () => { fillAllBtn.style.background = "#f5f3ff"; });
    fillAllBtn.addEventListener("click", () => {
      overlay.remove();
      const filled = fillAllMatching(fields);
      const toast = document.createElement("div");
      toast.textContent = filled > 0
        ? `✓ ${filled} campo${filled > 1 ? "s" : ""} preenchido${filled > 1 ? "s" : ""}`
        : "Nenhum campo com match encontrado";
      toast.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:2147483647;
        background:${filled > 0 ? "#4f46e5" : "#6b7280"};color:white;
        font-family:-apple-system,sans-serif;font-size:13px;font-weight:600;
        padding:10px 16px;border-radius:8px;
        box-shadow:0 4px 20px rgba(0,0,0,0.2);transition:opacity 0.3s;`;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2500);
    });
    box.appendChild(fillAllBtn);
  }

  const title = document.createElement("div");
  title.style.cssText = `font-size:11px;font-weight:600;color:#9ca3af;
    text-transform:uppercase;letter-spacing:0.5px;padding:6px 10px 8px;`;
  title.textContent = "Escolher entrada para preencher";
  box.appendChild(title);

  const sorted = targetEl ? sortedKeys(fields, cachedOrder, targetEl) : keys;
  sorted.forEach(key => {
    const item = document.createElement("div");
    item.style.cssText = `padding:9px 12px;border-radius:7px;cursor:pointer;
      display:flex;justify-content:space-between;align-items:center;`;
    item.innerHTML = `
      <span style="font-size:13px;font-weight:600;color:#1a1a2e;">${escHtml(key)}</span>
      <span style="font-size:12px;color:#9ca3af;max-width:160px;overflow:hidden;
        text-overflow:ellipsis;white-space:nowrap;">${escHtml(fields[key])}</span>
    `;
    item.addEventListener("mouseenter", () => { item.style.background = "#f3f4f6"; });
    item.addEventListener("mouseleave", () => { item.style.background = ""; });
    item.addEventListener("click", () => {
      overlay.remove();
      if (targetEl) targetEl.focus();
      fillField(targetEl, fields[key]);
    });
    box.appendChild(item);
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  document.addEventListener("keydown", function handler(e) {
    if (e.key === "Escape") { overlay.remove(); document.removeEventListener("keydown", handler); }
  });
}

// ── Copia para clipboard ──────────────────────────────────────────────────────
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const el = document.createElement("textarea");
  el.value = text;
  el.style.cssText = "position:fixed;top:-9999px;left:-9999px;opacity:0;";
  document.body.appendChild(el);
  el.focus();
  el.select();
  document.execCommand("copy");
  el.remove();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function isEditableField(el) {
  if (!el) return false;
  if (el.isContentEditable) return true;
  if (!["INPUT", "TEXTAREA"].includes(el.tagName)) return false;
  const skip = ["password", "hidden", "submit", "button", "reset", "checkbox", "radio", "file", "image", "range", "color"];
  return !skip.includes(el.type);
}

// ── Listeners de foco e input ─────────────────────────────────────────────────
function isDomainBlocked(cb) {
  chrome.storage.sync.get(["blockedSites", "unlockedSites"], ({ blockedSites = [], unlockedSites = [] }) => {
    const h = window.location.hostname;
    const blocked = blockedSites.some(d => h === d || h.endsWith("." + d));
    const unlocked = unlockedSites.some(d => h === d || h.endsWith("." + d));
    cb(blocked && !unlocked);
  });
}

document.addEventListener("focusin", (e) => {
  const el = e.target;
  if (!isEditableField(el)) { removeIcon(); return; }
  currentInput = el;
  isDomainBlocked((blocked) => {
    if (blocked) return;
    loadFields(() => showFieldIcon(el));
  });
}, true);

document.addEventListener("focusout", (e) => {
  setTimeout(() => {
    const active = document.activeElement;
    if (!isEditableField(active) && !document.getElementById(PICKER_ID)) {
      removeIcon();
    }
  }, 200);
}, true);

// Atualiza estado do ícone quando o usuário digita
document.addEventListener("input", (e) => {
  const el = e.target;
  if (!isEditableField(el)) return;
  clearTimeout(el.__af_state_timer__);
  el.__af_state_timer__ = setTimeout(() => {
    if (document.activeElement === el) updateIconState(el);
  }, 600);
}, true);

// Reposiciona ao rolar ou redimensionar
window.addEventListener("scroll", () => {
  const icon = document.getElementById(ICON_ID);
  if (icon && currentInput) positionNear(icon, currentInput, "right");
}, { passive: true });

// ── Mensagens do background ───────────────────────────────────────────────────
chrome.runtime.onMessage.addListener(({ action, value, fields }, _sender, sendResponse) => {
  if (action === "fill") fillField(document.activeElement, value);
  if (action === "promptSave") showSaveDialog(value);
  if (action === "showPicker") { cachedFields = fields; showPicker(fields); }
  if (action === "showSaveAll") {
    loadFields((f) => {
      const unsaved = collectUnsavedFields(f);
      if (unsaved.length > 0) showSaveAllDialog(unsaved);
    });
  }
  if (action === "getPageInfo") {
    const allInputs = Array.from(document.querySelectorAll("input, textarea, [contenteditable]"))
      .filter(el => isEditableField(el) && isVisible(el));
    const matchingFields = allInputs.reduce((acc, inp) => {
      const h = getFieldHints(inp);
      const match = bestMatchKey(h, Object.keys(fields));
      if (match && !acc.find(m => m.key === match)) acc.push({ key: match, value: fields[match] });
      return acc;
    }, []);
    const unsaved = collectUnsavedFields(fields);
    sendResponse({ matchCount: matchingFields.length, matchingFields, unsavedCount: unsaved.length, unsavedFields: unsaved });
    return true;
  }
  if (action === "fillAll") {
    loadFields((f) => {
      const filled = fillAllMatching(f);
      const toast = document.createElement("div");
      toast.textContent = filled > 0
        ? `✓ ${filled} campo${filled > 1 ? "s" : ""} preenchido${filled > 1 ? "s" : ""}`
        : "Nenhum campo com match encontrado";
      toast.style.cssText = `
        position: fixed; bottom: 24px; right: 24px; z-index: 2147483647;
        background: ${filled > 0 ? "#4f46e5" : "#6b7280"}; color: white;
        font-family: -apple-system, sans-serif; font-size: 13px; font-weight: 600;
        padding: 10px 16px; border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2); transition: opacity 0.3s;
      `;
      document.body.appendChild(toast);
      setTimeout(() => { toast.style.opacity = "0"; setTimeout(() => toast.remove(), 300); }, 2500);
    });
  }
});

loadFields();
