//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Dynamic dialog handling
//
//================================================================

async function CreateErrorDialog() {
    const response = await fetch(chrome.runtime.getURL("src/editor/html/blurDlg.html"));
    let html = await response.text();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    return wrapper.firstElementChild;
}

function createDialogButton(text, onClick, classes = []) {
    const button = document.createElement("span");

    if (typeof classes === "string") {
        button.classList.add(classes);
    } else if (Array.isArray(classes)) {
        button.classList.add(...classes);
    }

    button.textContent = text;
    button.addEventListener("click", (event) => {
        event.preventDefault();
        onClick();
    });
    return button;
}

function closeDialog() {
    const BlurDlg = document.getElementById("VDCEditorEx-BlurDlg");
    const DialogContent = document.getElementById("VDCEditorEx-DialogContent");
    const DialogButtons = document.getElementById("VDCEditorEx-DialogButtons");

    if (DialogButtons) {
        DialogButtons.innerHTML = "";
    }
    if (DialogContent) {
        DialogContent.style.display = "none";
    }
    if (BlurDlg) {
        BlurDlg.style.display = "none";
    }
}

function formatDialogMessage(message) {
    if (!message) return "";
    const cleaned = message.toString().replace(/(Uncaught .+?: )/, "");
    return cleaned;
}

function openDialog(type, options = {}) {
    const BlurDlg = document.getElementById("VDCEditorEx-BlurDlg");
    const DialogContent = document.getElementById("VDCEditorEx-DialogContent");
    const DialogTitle = document.getElementById("VDCEditorEx-DialogTitle");
    const DialogMessage = document.getElementById("VDCEditorEx-DialogMessage");
    const DialogCode = document.getElementById("VDCEditorEx-DialogCode");
    const DialogAdditional = document.getElementById("VDCEditorEx-DialogAdditional");
    const DialogButtons = document.getElementById("VDCEditorEx-DialogButtons");

    if (!BlurDlg || !DialogContent || !DialogTitle || !DialogMessage || !DialogButtons) {
        return;
    }

    BlurDlg.style.display = "block";
    DialogContent.style.display = "grid";
    DialogTitle.textContent = options.title || (type === "error" ? "An error has occured:" : type === "confirm" ? "Confirm action" : "Information");
    DialogMessage.textContent = formatDialogMessage(options.message || "");

    if (DialogCode) {
        if (options.errorCode) {
            DialogCode.textContent = options.errorCode;
            DialogCode.style.display = "block";
        } else {
            DialogCode.style.display = "none";
        }
    }

    if (DialogAdditional) {
        if (options.additional) {
            DialogAdditional.textContent = options.additional;
            DialogAdditional.style.display = "block";
        } else {
            DialogAdditional.style.display = "none";
        }
    }

    DialogButtons.innerHTML = "";
    const editorText = document.getElementById("VDCEditorEx-Editor")?.textContent || "";

    if (type === "error") {
        DialogButtons.append(
            createDialogButton("Download", () => {
                const blob = new Blob([editorText], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "editor_backup.txt";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, ["VDCEditorEx-SettingsPanelBtn"]),
            createDialogButton("Copy to Clipboard", () => navigator.clipboard.writeText(editorText), ["VDCEditorEx-SettingsPanelBtn"]),
            createDialogButton("Cancel", closeDialog, ["VDCEditorEx-SettingsPanelBtn"])
        );
    } else if (type === "confirm") {
        DialogButtons.append(
            createDialogButton(options.confirmText || "Confirm", () => {
                if (typeof options.onConfirm === "function") {
                    options.onConfirm();
                }
                closeDialog();
            }, ["VDCEditorEx-BlurDlg-Confirm"]),
            createDialogButton(options.cancelText || "Cancel", closeDialog, ["VDCEditorEx-BlurDlg-Cancel"])
        );
    } else {
        DialogButtons.append(createDialogButton(options.okText || "Ok", closeDialog, ["VDCEditorEx-SettingsPanelBtn"]));
    }
}

function showErrorDialog(message, error) {
    const DialogContent = document.getElementById("VDCEditorEx-DialogContent");
    if (DialogContent && DialogContent.style.display === "grid") {
        return;
    }

    let code = "GENERIC";
    if (error) {
        if (error.code) {
            code = error.code;
        } else if (error.name) {
            switch (error.name) {
                case "ReferenceError": code = "NOT_DEFINED"; break;
                case "TypeError": code = "INVALID_TYPE"; break;
                case "SyntaxError": code = "SYNTAX"; break;
                case "RangeError": code = "OUT_OF_RANGE"; break;
                default:
                    code = error.name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
            }
        }
    }

    const finalMessage = message || "A critical error occurred.\nCheck the console for details.";
    const ErrCode = "__ERR_" + (typeof code === "string" ? code.toUpperCase() : "GENERIC") + "__";

    ErrorDialog(finalMessage, ErrCode);
}

// Global error
window.onerror = function (message, source, lineno, colno, error) {
    showErrorDialog(message, error);
};

// Unhandled Promise rejection
window.onunhandledrejection = function (event) {
    const reason = event.reason;
    const message = reason?.message || String(reason);
    showErrorDialog(message, reason);
};

function ErrorDialog(message, errorCode) {
    openDialog("error", { message, errorCode });
}

function InfoDialog(message) {
    openDialog("info", { message });
}

function ConfirmDialog(message, onConfirm) {
    openDialog("confirm", { message, onConfirm });
}
