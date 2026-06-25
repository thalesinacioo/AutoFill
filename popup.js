const DEFAULT_BLOCKED = [
  "chat.openai.com", "gemini.google.com", "www.google.com",
  "youtube.com", "twitter.com", "x.com", "instagram.com", "facebook.com",
];

const SVG = {
  sparks:    `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5.5 4v5M3 6.5h5m-2 10v4m-2-2h4m3.508-8.217c-2.118.606-3.177.908-3.33 1.443a1 1 0 0 0 0 .548c.153.535 1.212.837 3.33 1.443.425.121.637.182.798.314a1 1 0 0 1 .156.162c.127.165.181.38.288.809.615 2.458.922 3.687 1.49 3.84.17.046.35.046.52 0 .568-.152.875-1.382 1.49-3.84.107-.43.16-.644.288-.81a1 1 0 0 1 .156-.16c.16-.133.373-.194.797-.315 2.12-.606 3.178-.908 3.33-1.443a1 1 0 0 0 0-.548c-.152-.535-1.21-.837-3.33-1.443-.424-.121-.636-.182-.797-.314a1 1 0 0 1-.156-.162c-.128-.165-.181-.38-.288-.809-.615-2.458-.922-3.688-1.49-3.84a1 1 0 0 0-.52 0c-.568.152-.875 1.382-1.49 3.84-.107.43-.16.644-.288.81a1 1 0 0 1-.156.16c-.16.133-.373.194-.797.315z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  blocked:   `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16 10H8c-1.886 0-2.828 0-3.414.586C4 11.172 4 12.114 4 14v3c0 1.886 0 2.828.586 3.414C5.172 21 6.114 21 8 21h8c1.886 0 2.828 0 3.414-.586C20 19.828 20 18.886 20 17v-3c0-1.886 0-2.828-.586-3.414C18.828 10 17.886 10 16 10zm-8 0V6.5c0-3 2.438-3.5 4-3.5 1.562 0 4 .5 4 3v4" stroke="currentColor" stroke-width="2"/></svg>`,
  unblocked: `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M15 6a1 1 0 1 0 2 0zm-8 4a1 1 0 0 0 2 0zm1 0h1V6.5H7v3.499h1zm1-3.5c0-1.174.447-1.718.942-2.026C10.514 4.12 11.293 4 12 4V2c-.856 0-2.077.131-3.114.776C7.772 3.468 7 4.674 7 6.5zM12 4c.706 0 1.514.118 2.108.441.524.285.892.72.892 1.559h2c0-1.66-.85-2.726-1.937-3.316C14.05 2.132 12.856 2 12 2z" fill="currentColor"/><path d="M19.414 20.414l.707.707zm-14.828 0l-.707.707zm14.828-9.828l.707-.707zM8 11h8V9H8zm-3 6v-3H3v3zm11 3H8v2h8zm3-6v3h2v-3zm-3 8c.915 0 1.701.002 2.328-.082.655-.088 1.284-.287 1.793-.797l-1.414-1.414c-.076.076-.212.17-.646.229-.462.062-1.09.064-2.061.064zm3-5c0 .971-.002 1.599-.064 2.061-.059.434-.153.57-.229.646l1.414 1.414c.51-.51.709-1.138.797-1.793C21.002 18.7 21 17.915 21 17zM3 17c0 .915-.002 1.701.082 2.328.088.655.287 1.284.797 1.793l1.414-1.414c-.076-.076-.17-.212-.229-.646C5.002 18.6 5 17.971 5 17zm5 3c-.971 0-1.599-.002-2.061-.064-.434-.059-.57-.153-.646-.229l-1.414 1.414c.51.51 1.138.709 1.793.797C6.3 22.002 7.085 22 8 22zm8-9c.971 0 1.599.002 2.061.064.434.059.57.153.646.229l1.414-1.414c-.51-.51-1.138-.709-1.793-.797C17.7 8.998 16.915 9 16 9zm5 3c0-.915.002-1.701-.082-2.328-.088-.655-.287-1.284-.797-1.793l-1.414 1.414c.076.076.17.212.229.646.062.462.064 1.09.064 2.061zM8 9c-.915 0-1.701-.002-2.328.082-.655.088-1.284.287-1.793.797l1.414 1.414c.076-.076.212-.17.646-.229C6.4 11.002 7.029 11 8 11zm-3 5c0-.971.002-1.599.064-2.061.059-.434.153-.57.229-.646L3.879 9.879c-.51.51-.709 1.138-.797 1.793C2.998 12.3 3 13.085 3 14z" fill="currentColor"/></svg>`,
  copy:      `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M7 3.5c-.932 0-1.398 0-1.765.152a2 2 0 0 0-1.083 1.083C4 5.102 4 5.568 4 6.5V17c0 1.886 0 2.828.586 3.414C5.172 21 6.114 21 8 21h8c1.886 0 2.828 0 3.414-.586C20 19.828 20 18.886 20 17V6.5c0-.932 0-1.398-.152-1.765a2 2 0 0 0-1.083-1.083C18.398 3.5 17.932 3.5 17 3.5" stroke="currentColor" stroke-width="2"/><path d="M7 3.75C7 2.784 7.784 2 8.75 2h6.5a1.75 1.75 0 1 1 0 3.5h-6.5A1.75 1.75 0 0 1 7 3.75z" stroke="currentColor" stroke-width="2"/><path d="M8 9h8m-8 4h8m-8 4h4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  edit:      `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.364 4.136c.329-.329.493-.493.657-.602a2 2 0 0 1 2.222 0c.164.11.328.273.657.602.328.328.492.493.602.657a2 2 0 0 1 0 2.222c-.11.164-.274.328-.602.656L9.066 18.505c-.264.265-.397.397-.55.502-.154.105-.325.18-.667.33l-.92.405c-1.986.874-2.98 1.311-3.463.828-.484-.484-.047-1.477.827-3.464l.405-.919c.15-.343.226-.514.33-.667.106-.154.238-.286.503-.55L16.364 4.136z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M13.621 6.843l3.536 3.536" stroke="currentColor" stroke-width="2"/></svg>`,
  trash:     `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 9.5l1.087 8.036c.223 1.65.335 2.476.9 2.97.566.494 1.398.494 3.064.494h3.898c1.666 0 2.499 0 3.064-.494s.677-1.32.9-2.97L19 9.5M9 6c0-.932 0-1.398.152-1.765a2 2 0 0 1 1.083-1.083C10.602 3 11.068 3 12 3c.932 0 1.398 0 1.765.152a2 2 0 0 1 1.083 1.083C15 4.602 15 5.068 15 6m4 0H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M9.5 10l.5 7.5m4.5-7.5l-.5 7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  check:     `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M4 14.667l3.2 4.266c.367.49.55.734.8.734s.433-.245.8-.734L20 4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  close:     `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 5l14 14m0-14L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  add:       `<svg width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  save:      `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.5 3H10c-1.886 0-2.828 0-3.414.586C6 4.172 6 5.114 6 7v8.222c0 3.46 0 5.19.989 5.55.989.358 2.097-.971 4.314-3.628l.697-.835.697.835c2.217 2.657 3.325 3.986 4.314 3.627.989-.358.989-2.089.989-5.55V12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.5 3v6m3-3h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  export:    `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 16.5V3m0 0l5 4.701M12 3L7 7.701" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 14v3c0 1.886 0 2.828.586 3.414C4.172 21 5.114 21 7 21h10c1.886 0 2.828 0 3.414-.586C21 19.828 21 18.886 21 17v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  import:      `<svg width="14" height="14" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v12.5m0 0l-5-4.701m5 4.701l5-4.701" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 14v3c0 1.886 0 2.828.586 3.414C4.172 21 5.114 21 7 21h10c1.886 0 2.828 0 3.414-.586C21 19.828 21 18.886 21 17v-3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`,
  chevronDown: `<svg width="12" height="12" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 9l5.172 5.172c1.333 1.333 2 2 2.828 2 .828 0 1.495-.667 2.828-2L20 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevronUp:   `<svg width="12" height="12" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 15l-5.172-5.172c-1.333-1.333-2-2-2.828-2-.828 0-1.495.667-2.828 2L4 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
};

let dragSrcKey = null;

function saveOrder(order) {
  chrome.storage.sync.set({ fieldOrder: order });
}

function getOrderedKeys(fields, order) {
  const fieldKeys = Object.keys(fields);
  const ordered = (order || []).filter(k => fieldKeys.includes(k));
  const remaining = fieldKeys.filter(k => !ordered.includes(k));
  return [...ordered, ...remaining];
}

function renderList(fields, order, filter = "") {
  const list = document.getElementById("fields-list");
  const keys = getOrderedKeys(fields, order);
  const filtered = filter
    ? keys.filter(k => k.toLowerCase().includes(filter) || fields[k].toLowerCase().includes(filter))
    : keys;

  if (filtered.length === 0) {
    list.innerHTML = filter
      ? '<p class="empty">Nenhum resultado.</p>'
      : '<p class="empty">Nenhuma entrada ainda.</p>';
    return;
  }

  list.innerHTML = filtered.map((key, idx) => `
    <div class="field-item" data-key="${escapeHtml(key)}" draggable="true" title="${escapeHtml(fields[key])}">
      <span class="drag-handle">⠿</span>
      <span class="item-num">${idx + 1 <= 9 ? idx + 1 : "·"}</span>

      <div class="fill-trigger" data-key="${escapeHtml(key)}">
        <span class="field-name">${highlight(escapeHtml(key), filter)}</span>
        <span class="field-value">${highlight(escapeHtml(fields[key]), filter)}</span>
      </div>

      <div class="edit-row" id="edit-${escapeHtml(key)}">
        <input class="edit-name" type="text" value="${escapeHtml(key)}" placeholder="Nome" />
        <input class="edit-value" type="text" value="${escapeHtml(fields[key])}" placeholder="Valor" />
      </div>

      <div class="item-actions view-actions">
        <button class="icon-btn copy-btn" data-key="${escapeHtml(key)}" title="Copiar">${SVG.copy}</button>
        <button class="icon-btn edit-btn" data-key="${escapeHtml(key)}" title="Editar">${SVG.edit}</button>
        <button class="icon-btn delete-btn" data-key="${escapeHtml(key)}" title="Remover">${SVG.trash}</button>
      </div>
      <div class="item-actions edit-actions" style="display:none;">
        <button class="icon-btn confirm-btn" title="Confirmar">${SVG.check}</button>
        <button class="icon-btn cancel-btn" title="Cancelar">${SVG.close}</button>
      </div>
    </div>
  `).join("");

  // Preencher ao clicar na linha inteira
  list.querySelectorAll(".fill-trigger").forEach(el => {
    el.addEventListener("click", (e) => {
      if (e.target.closest(".item-actions")) return;
      const key = el.dataset.key;
      const val = fields[key];
      navigator.clipboard.writeText(val).catch(() => {});
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || !tabs[0]) return;
        chrome.tabs.sendMessage(tabs[0].id, { action: "fill", value: val }, () => {
          void chrome.runtime.lastError;
        });
        window.close();
      });
    });
  });

  // Copiar
  list.querySelectorAll(".copy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      navigator.clipboard.writeText(fields[btn.dataset.key]).then(() => {
        btn.innerHTML = SVG.check;
        btn.style.color = "#16a34a";
        setTimeout(() => {
          btn.innerHTML = SVG.copy;
          btn.style.color = "";
        }, 1500);
      });
    });
  });

  // Deletar
  list.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.key;
      chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
        delete fields[key];
        const newOrder = fieldOrder.filter(k => k !== key);
        chrome.storage.sync.set({ fields, fieldOrder: newOrder }, () => {
          chrome.runtime.sendMessage({ action: "rebuildMenus" });
          renderList(fields, newOrder, currentFilter());
          loadPageActions(fields);
        });
      });
    });
  });

  // Editar
  list.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".field-item");
      item.querySelector(".fill-trigger").style.display = "none";
      item.querySelector(".item-num").style.display = "none";
      item.querySelector(".edit-row").classList.add("visible");
      item.querySelector(".view-actions").style.display = "none";
      item.querySelector(".edit-actions").style.display = "flex";
      item.setAttribute("draggable", "false");
      item.querySelector(".drag-handle").style.opacity = "0.2";
      item.querySelector(".edit-value").focus();
    });
  });

  list.querySelectorAll(".cancel-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
        renderList(fields, fieldOrder, currentFilter());
      });
    });
  });

  list.querySelectorAll(".confirm-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".field-item");
      const oldKey = item.dataset.key;
      const newName = item.querySelector(".edit-name").value.trim();
      const newValue = item.querySelector(".edit-value").value.trim();
      if (!newName || !newValue) return;

      chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
        if (oldKey !== newName) {
          delete fields[oldKey];
          const idx = fieldOrder.indexOf(oldKey);
          if (idx !== -1) fieldOrder[idx] = newName;
        }
        fields[newName] = newValue;
        chrome.storage.sync.set({ fields, fieldOrder }, () => {
          chrome.runtime.sendMessage({ action: "rebuildMenus" });
          renderList(fields, fieldOrder, currentFilter());
        });
      });
    });
  });

  list.querySelectorAll(".edit-row input").forEach(input => {
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") input.closest(".field-item").querySelector(".confirm-btn").click();
      if (e.key === "Escape") input.closest(".field-item").querySelector(".cancel-btn").click();
    });
  });

  // Drag and drop
  if (!filter) {
    list.querySelectorAll(".field-item").forEach(item => {
      item.addEventListener("dragstart", (e) => {
        dragSrcKey = item.dataset.key;
        setTimeout(() => item.classList.add("dragging"), 0);
        e.dataTransfer.effectAllowed = "move";
      });
      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        list.querySelectorAll(".field-item").forEach(i => i.classList.remove("drag-over"));
      });
      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        list.querySelectorAll(".field-item").forEach(i => i.classList.remove("drag-over"));
        if (item.dataset.key !== dragSrcKey) item.classList.add("drag-over");
      });
      item.addEventListener("drop", (e) => {
        e.preventDefault();
        item.classList.remove("drag-over");
        if (!dragSrcKey || dragSrcKey === item.dataset.key) return;
        chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
          const ordered = getOrderedKeys(fields, fieldOrder);
          const fromIdx = ordered.indexOf(dragSrcKey);
          const toIdx = ordered.indexOf(item.dataset.key);
          ordered.splice(fromIdx, 1);
          ordered.splice(toIdx, 0, dragSrcKey);
          chrome.storage.sync.set({ fieldOrder: ordered }, () => {
            renderList(fields, ordered);
          });
        });
      });
    });
  }
}

// ── Ações da página (preencher / salvar tudo) ─────────────────────────────────
function loadPageActions(fields, onDone) {
  const container = document.getElementById("page-actions");
  container.innerHTML = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) { onDone && onDone(); return; }

    chrome.tabs.sendMessage(tabs[0].id, { action: "getPageInfo", fields }, (resp) => {
      if (chrome.runtime.lastError || !resp) { onDone && onDone(); return; }

      if (resp.matchCount >= 1) {
        const row = document.createElement("div");
        row.style.cssText = "display:flex;align-items:center;border-bottom:1px solid #e5e7eb;";

        const btn = document.createElement("button");
        btn.className = "page-action-btn fill-all";
        btn.style.cssText = "flex:1;border-bottom:none;border-right:1px solid #e5e7eb;";
        btn.innerHTML = `${SVG.sparks} Preencher ${resp.matchCount} campos de uma vez`;
        btn.addEventListener("click", () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "fillAll" }, () => { void chrome.runtime.lastError; });
          window.close();
        });

        const infoBtn = document.createElement("button");
        infoBtn.className = "page-action-btn fill-all";
        infoBtn.style.cssText = "flex:0;padding:8px 12px;border-bottom:none;font-size:13px;color:#9ca3af;";
        infoBtn.innerHTML = SVG.chevronDown;
        infoBtn.title = "Ver quais campos serão preenchidos";

        const preview = document.createElement("div");
        preview.style.cssText = `display:none;background:#faf9ff;border-bottom:1px solid #e5e7eb;padding:6px 14px;`;
        resp.matchingFields.forEach(({ key, value }) => {
          const r = document.createElement("div");
          r.style.cssText = "display:flex;gap:6px;align-items:center;padding:2px 0;";
          r.innerHTML = `
            <span style="font-size:11px;font-weight:600;color:#5b4fd8;flex-shrink:0;">${escapeHtml(key)}</span>
            <span style="font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">→ ${escapeHtml(value)}</span>
          `;
          preview.appendChild(r);
        });

        infoBtn.addEventListener("click", () => {
          const visible = preview.style.display !== "none";
          preview.style.display = visible ? "none" : "block";
          infoBtn.style.color = visible ? "#9ca3af" : "#5b4fd8";
          infoBtn.innerHTML = visible ? SVG.chevronDown : SVG.chevronUp;
        });

        row.appendChild(btn);
        row.appendChild(infoBtn);
        container.appendChild(row);
        container.appendChild(preview);
      }

      if (resp.unsavedCount > 0) {
        const saveRow = document.createElement("div");
        saveRow.style.cssText = "display:flex;align-items:center;border-bottom:1px solid #e5e7eb;";

        const saveBtn = document.createElement("button");
        saveBtn.className = "page-action-btn save-all";
        saveBtn.style.cssText = "flex:1;border-bottom:none;border-right:1px solid #dcfce7;";
        saveBtn.innerHTML = `${SVG.save} Salvar ${resp.unsavedCount} campo${resp.unsavedCount > 1 ? "s" : ""} preenchido${resp.unsavedCount > 1 ? "s" : ""} ainda não salvo${resp.unsavedCount > 1 ? "s" : ""}`;
        saveBtn.addEventListener("click", () => {
          chrome.tabs.sendMessage(tabs[0].id, { action: "showSaveAll" }, () => { void chrome.runtime.lastError; });
          window.close();
        });

        const saveChev = document.createElement("button");
        saveChev.className = "page-action-btn save-all";
        saveChev.style.cssText = "flex:0;padding:8px 12px;border-bottom:none;color:#16a34a;display:flex;align-items:center;";
        saveChev.innerHTML = SVG.chevronDown;

        const savePreview = document.createElement("div");
        savePreview.style.cssText = `display:none;background:#f0fdf4;border-bottom:1px solid #e5e7eb;padding:6px 14px;`;
        (resp.unsavedFields || []).forEach(({ name, value }) => {
          const r = document.createElement("div");
          r.style.cssText = "display:flex;gap:6px;align-items:center;padding:2px 0;";
          r.innerHTML = `
            <span style="font-size:11px;font-weight:600;color:#16a34a;flex-shrink:0;">${escapeHtml(name)}</span>
            <span style="font-size:11px;color:#6b7280;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">→ ${escapeHtml(value)}</span>
          `;
          savePreview.appendChild(r);
        });

        saveChev.addEventListener("click", () => {
          const visible = savePreview.style.display !== "none";
          savePreview.style.display = visible ? "none" : "block";
          saveChev.innerHTML = visible ? SVG.chevronDown : SVG.chevronUp;
        });

        saveRow.appendChild(saveBtn);
        saveRow.appendChild(saveChev);
        container.appendChild(saveRow);
        container.appendChild(savePreview);
      }

      onDone && onDone();
    });
  });
}

function highlight(text, filter) {
  if (!filter) return text;
  const re = new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  return text.replace(re, '<mark style="background:#ede9fe;color:#5b4fd8;border-radius:2px;">$1</mark>');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function currentFilter() {
  return document.getElementById("search-input").value.trim().toLowerCase();
}

// ── Busca home: filtra lista ao digitar ──────────────────────────────────────
document.getElementById("search-input").addEventListener("input", () => {
  chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
    renderList(fields, fieldOrder, currentFilter());
  });
});

// ── Salvar nova entrada ───────────────────────────────────────────────────────
document.getElementById("save-btn").addEventListener("click", () => {
  const nameEl = document.getElementById("name-input");
  const valueEl = document.getElementById("value-input");
  const name = nameEl.value.trim();
  const value = valueEl.value.trim();
  if (!name || !value) return;

  chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
    fields[name] = value;
    if (!fieldOrder.includes(name)) fieldOrder.push(name);
    chrome.storage.sync.set({ fields, fieldOrder }, () => {
      chrome.runtime.sendMessage({ action: "rebuildMenus" });
      nameEl.value = "";
      valueEl.value = "";
      document.getElementById("add-form").classList.remove("open");
      document.getElementById("add-toggle-btn").classList.remove("active");
      renderList(fields, fieldOrder);
      loadPageActions(fields);
    });
  });
});

document.getElementById("value-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("save-btn").click();
});

// ── Exportar / Importar ───────────────────────────────────────────────────────
document.getElementById("export-btn").addEventListener("click", () => {
  chrome.storage.sync.get(["fields", "fieldOrder", "blockedSites", "unlockedSites"], (data) => {
    const payload = {
      fields: data.fields || {},
      fieldOrder: data.fieldOrder || [],
      blockedSites: data.blockedSites || DEFAULT_BLOCKED,
      unlockedSites: data.unlockedSites || [],
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "autofill-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  });
});

document.getElementById("import-btn").addEventListener("click", () => {
  document.getElementById("import-file").click();
});

document.getElementById("import-file").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    try {
      const { fields = {}, fieldOrder = [], blockedSites, unlockedSites } = JSON.parse(ev.target.result);
      chrome.storage.sync.get(["fields", "fieldOrder", "blockedSites", "unlockedSites"], (existing) => {
        const merged = { ...existing.fields, ...fields };
        const existingOrder = existing.fieldOrder || [];
        const newKeys = fieldOrder.filter(k => !existingOrder.includes(k));
        const mergedOrder = [...existingOrder, ...newKeys];
        const update = { fields: merged, fieldOrder: mergedOrder };
        if (blockedSites !== undefined) update.blockedSites = blockedSites;
        if (unlockedSites !== undefined) update.unlockedSites = unlockedSites;
        chrome.storage.sync.set(update, () => {
          chrome.runtime.sendMessage({ action: "rebuildMenus" });
          renderList(merged, mergedOrder);
          loadPageActions(merged);
        });
      });
    } catch {
      alert("Arquivo inválido. Use um JSON exportado pelo AutoFill.");
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

// ── Navegação (header persistente) ───────────────────────────────────────────
const slides = document.getElementById("slides");
const viewport = document.getElementById("viewport");
const mainPanel = document.getElementById("main-panel");
const settingsPanel = document.getElementById("settings-panel");

const SVG_HAMBURGER = `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M5 7h14M5 17h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
const SVG_BACK      = `<svg width="15" height="15" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

let onSettings = false;

function lockViewportToMain() {
  // Tamanho do popup é fixo via CSS (460×560). Nada a medir aqui.
}

function closeAllForms() {
  document.getElementById("add-form").classList.remove("open");
  document.getElementById("add-domain-form").classList.remove("open");
  document.getElementById("search-panel").classList.remove("open");
  document.getElementById("blocked-search-panel").classList.remove("open");
  document.getElementById("add-toggle-btn").classList.remove("active");
  document.getElementById("search-toggle-btn").classList.remove("active");
}

document.getElementById("menu-btn").addEventListener("click", () => {
  closeAllForms();
  if (!onSettings) {
    onSettings = true;
    slides.classList.add("settings-open");
    document.getElementById("menu-btn").innerHTML = SVG_BACK;
    renderBlockedList();
  } else {
    onSettings = false;
    slides.classList.remove("settings-open");
    document.getElementById("menu-btn").innerHTML = SVG_HAMBURGER;
  }
});

// ── Adicionar (context-aware) ─────────────────────────────────────────────────
document.getElementById("add-toggle-btn").addEventListener("click", () => {
  if (!onSettings) {
    // home: toggle add-form
    const form = document.getElementById("add-form");
    const btn = document.getElementById("add-toggle-btn");
    const isOpen = form.classList.toggle("open");
    btn.classList.toggle("active", isOpen);
    if (isOpen) document.getElementById("name-input").focus();
  } else {
    // settings: toggle add-domain-form
    const form = document.getElementById("add-domain-form");
    const btn = document.getElementById("add-toggle-btn");
    const isOpen = form.classList.toggle("open");
    btn.classList.toggle("active", isOpen);
    if (isOpen) document.getElementById("domain-input").focus();
  }
});

// ── Buscar (context-aware) ────────────────────────────────────────────────────
document.getElementById("search-toggle-btn").addEventListener("click", () => {
  if (!onSettings) {
    const panel = document.getElementById("search-panel");
    const btn = document.getElementById("search-toggle-btn");
    const isOpen = panel.classList.toggle("open");
    btn.classList.toggle("active", isOpen);
    if (isOpen) document.getElementById("search-input").focus();
  } else {
    const panel = document.getElementById("blocked-search-panel");
    const btn = document.getElementById("search-toggle-btn");
    const isOpen = panel.classList.toggle("open");
    btn.classList.toggle("active", isOpen);
    if (isOpen) document.getElementById("blocked-search-input").focus();
  }
});

// ── Sites bloqueados ──────────────────────────────────────────────────────────
function loadBlockedSites(cb) {
  chrome.storage.sync.get("blockedSites", ({ blockedSites }) => {
    if (blockedSites === undefined) {
      chrome.storage.sync.set({ blockedSites: DEFAULT_BLOCKED }, () => cb(DEFAULT_BLOCKED));
    } else {
      cb(blockedSites);
    }
  });
}

function saveBlockedSites(sites) {
  chrome.storage.sync.set({ blockedSites: sites });
}

function renderBlockedList(onDone, filter = "") {
  loadBlockedSites((sites) => {
    const list = document.getElementById("blocked-list");
    list.innerHTML = "";

    const filtered = filter ? sites.filter(d => d.includes(filter)) : sites;

    if (filtered.length === 0) {
      list.innerHTML = '<p class="empty">Nenhum site bloqueado.</p>';
      onDone && onDone();
      return;
    }

    chrome.storage.sync.get("unlockedSites", ({ unlockedSites = [] }) => {
      filtered.forEach((domain) => {
        const isUnlocked = unlockedSites.includes(domain);
        const item = document.createElement("div");
        item.className = "blocked-item" + (isUnlocked ? " unlocked" : "");

        const iconWrap = document.createElement("div");
        iconWrap.className = "b-icon";
        const lockBtn = document.createElement("button");
        lockBtn.className = "icon-btn";
        lockBtn.title = isUnlocked ? "Bloquear novamente" : "Permitir temporariamente";
        lockBtn.innerHTML = isUnlocked ? SVG.unblocked : SVG.blocked;
        lockBtn.style.color = isUnlocked ? "#16a34a" : "#ef4444";
        lockBtn.addEventListener("click", () => {
          chrome.storage.sync.get("unlockedSites", ({ unlockedSites: cur = [] }) => {
            const next = cur.includes(domain)
              ? cur.filter(d => d !== domain)
              : [...cur, domain];
            chrome.storage.sync.set({ unlockedSites: next }, renderBlockedList);
          });
        });
        iconWrap.appendChild(lockBtn);

        const text = document.createElement("span");
        text.className = "blocked-domain";
        text.textContent = domain;

        const deleteBtn = document.createElement("button");
        deleteBtn.className = "icon-btn";
        deleteBtn.title = "Remover da lista";
        deleteBtn.innerHTML = SVG.trash;
        deleteBtn.style.color = "#ef4444";
        deleteBtn.addEventListener("click", () => {
          chrome.storage.sync.get(["blockedSites", "unlockedSites"], ({ blockedSites: bs = [], unlockedSites: us = [] }) => {
            chrome.storage.sync.set({
              blockedSites: bs.filter(d => d !== domain),
              unlockedSites: us.filter(d => d !== domain),
            }, renderBlockedList);
          });
        });

        item.appendChild(iconWrap);
        item.appendChild(text);
        item.appendChild(deleteBtn);
        list.appendChild(item);
      });

      onDone && onDone();
    });
  });
}

document.getElementById("add-domain-btn").addEventListener("click", () => {
  const input = document.getElementById("domain-input");
  const domain = input.value.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  if (!domain) return;
  loadBlockedSites((sites) => {
    if (!sites.includes(domain)) saveBlockedSites([...sites, domain]);
    input.value = "";
    document.getElementById("add-domain-form").classList.remove("open");
    document.getElementById("add-toggle-btn").classList.remove("active");
    renderBlockedList();
  });
});

document.getElementById("domain-input").addEventListener("keydown", (e) => {
  if (e.key === "Enter") document.getElementById("add-domain-btn").click();
});

document.getElementById("blocked-search-input").addEventListener("input", (e) => {
  renderBlockedList(null, e.target.value.trim().toLowerCase());
});

// ── Footer compartilhado ──────────────────────────────────────────────────────
const GITHUB_URL = "https://github.com/thalesinacioo/AutoFill";
const NUBANK_URL = "https://nubank.com.br/cobrar/1eewi8/6a3d365a-e904-44ad-8fc5-c6979ec28dc4";

document.getElementById("coffee-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: NUBANK_URL });
});
document.getElementById("bug-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: GITHUB_URL + "/issues" });
});
document.getElementById("github-btn").addEventListener("click", () => {
  chrome.tabs.create({ url: GITHUB_URL });
});

// ── Tip banner ────────────────────────────────────────────────────────────────
function applyTipBannerState() {
  chrome.storage.sync.get("tipDismissed", ({ tipDismissed }) => {
    if (tipDismissed) document.getElementById("tip-banner").style.display = "none";
  });
}

document.getElementById("tip-close").addEventListener("click", () => {
  chrome.storage.sync.set({ tipDismissed: true });
  document.getElementById("tip-banner").style.display = "none";
});

applyTipBannerState();

// ── Carga inicial ─────────────────────────────────────────────────────────────
chrome.storage.sync.get(["fields", "fieldOrder"], ({ fields = {}, fieldOrder = [] }) => {
  renderList(fields, fieldOrder);
  loadPageActions(fields, () => requestAnimationFrame(lockViewportToMain));
});
