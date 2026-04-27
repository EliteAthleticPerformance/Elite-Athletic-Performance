// ========================================
// 🔥 EDIT / DELETE SYSTEM (HISTORY PAGE)
// ========================================

let CURRENT_EDIT_ID = null;
let LAST_DELETED = null;

// ========================================
// ✏️ OPEN EDIT
// ========================================

function openEdit(rowData) {
  CURRENT_EDIT_ID = rowData.id;

  // 🔥 Match YOUR frontend keys (IMPORTANT)
  document.getElementById("editName").value = rowData.name || "";
  document.getElementById("editBench").value = rowData.bench || "";
  document.getElementById("editSquat").value = rowData.squat || "";
  document.getElementById("editClean").value = rowData.clean || "";

  document.getElementById("editModal").classList.remove("hidden");
}

function closeEdit() {
  document.getElementById("editModal").classList.add("hidden");
}

// ========================================
// 💾 SAVE EDIT
// ========================================

async function saveEdit() {
  const config = await window.APP_READY;

  const payload = new URLSearchParams({
    action: "update",
    school: config.key,
    id: CURRENT_EDIT_ID,
    name: document.getElementById("editName").value,
    bench: document.getElementById("editBench").value,
    squat: document.getElementById("editSquat").value,
    clean: document.getElementById("editClean").value
  });

  await fetch(config.submitURL, {
    method: "POST",
    body: payload
  });

  closeEdit();
  refreshTable();
}

// ========================================
// 🗑 DELETE
// ========================================

async function deleteRow(rowData) {
  const config = await window.APP_READY;

  LAST_DELETED = rowData;

  await fetch(config.submitURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "delete",
      school: config.key,
      id: rowData.id
    })
  });

  showToast();
  refreshTable();
}

// ========================================
// ↩️ UNDO DELETE
// ========================================

async function undoDelete() {
  if (!LAST_DELETED) return;

  const config = await window.APP_READY;

  await fetch(config.submitURL, {
    method: "POST",
    body: new URLSearchParams({
      action: "undo",
      school: config.key,
      id: LAST_DELETED.id
    })
  });

  hideToast();
  refreshTable();
}

// ========================================
// 🔔 TOAST
// ========================================

let toastTimeout;

function showToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.remove("hidden");

  toastTimeout = setTimeout(() => {
    hideToast();
  }, 5000);
}

function hideToast() {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.classList.add("hidden");
  clearTimeout(toastTimeout);
}

// ========================================
// 🔄 REFRESH TABLE
// ========================================

async function refreshTable() {
  const data = await loadAthleteData();

  // 🔥 These functions live in history.html
  if (typeof CURRENT_NAME !== "undefined" && CURRENT_NAME) {
    renderSingle(CURRENT_NAME, data);
  } else {
    renderAll(data);
  }
}
