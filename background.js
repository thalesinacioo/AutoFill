function rebuildMenus(fields) {
  chrome.contextMenus.removeAll(() => {
    // Menu para salvar texto selecionado (aparece ao selecionar texto)
    chrome.contextMenus.create({
      id: "save-selection",
      title: "💾 Salvar no AutoFill…",
      contexts: ["selection"]
    });

    // Menu para preencher campo (aparece ao clicar em campo editável)
    const keys = Object.keys(fields);
    if (keys.length > 0) {
      chrome.contextMenus.create({
        id: "autofill-root",
        title: "AutoFill",
        contexts: ["editable"]
      });

      keys.forEach(key => {
        chrome.contextMenus.create({
          id: `fill__${key}`,
          parentId: "autofill-root",
          title: key,
          contexts: ["editable"]
        });
      });
    }
  });
}

chrome.runtime.onInstalled.addListener((details) => {
  chrome.storage.sync.get("fields", ({ fields = {} }) => {
    rebuildMenus(fields);
  });

  if (details.reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("install.html") });
  }
});

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "rebuildMenus") {
    chrome.storage.sync.get("fields", ({ fields = {} }) => {
      rebuildMenus(fields);
    });
  }

  if (msg.action === "saveField") {
    chrome.storage.sync.get("fields", ({ fields = {} }) => {
      fields[msg.name] = msg.value;
      chrome.storage.sync.set({ fields }, () => {
        rebuildMenus(fields);
      });
    });
  }
});

function sendToActiveTab(message) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs || !tabs[0]) return;
    chrome.tabs.sendMessage(tabs[0].id, message, () => {
      // Ignora erro se o content script não estiver disponível na página
      void chrome.runtime.lastError;
    });
  });
}

chrome.commands.onCommand.addListener((command) => {
  if (command === "fill-field") {
    chrome.storage.sync.get("fields", ({ fields = {} }) => {
      sendToActiveTab({ action: "showPicker", fields });
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  // Salvar texto selecionado
  if (info.menuItemId === "save-selection") {
    chrome.tabs.sendMessage(tab.id, { action: "promptSave", value: info.selectionText }, () => {
      void chrome.runtime.lastError;
    });
    return;
  }

  if (info.menuItemId.startsWith("fill__")) {
    const key = info.menuItemId.replace("fill__", "");
    chrome.storage.sync.get("fields", ({ fields = {} }) => {
      if (fields[key] !== undefined) {
        chrome.tabs.sendMessage(tab.id, { action: "fill", value: fields[key] }, () => {
          void chrome.runtime.lastError;
        });
      }
    });
  }
});
