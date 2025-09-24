//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Error Handle
//
//================================================================

async function CreateErrorDialog() {
    const response = await fetch(chrome.runtime.getURL("src/editor/html/blurDlg.html"));
    let html = await response.text();

    const wrapper = document.createElement("div");
    wrapper.innerHTML = html;

    return wrapper.firstElementChild;
}

function ErrorDialog(message, errorCode) {
    const BlurDlg = document.getElementById("VDCEditorEx-BlurDlg");

    if (!BlurDlg) {
        return;
    }

    let ErrorMessage = document.getElementById("VDCEditorEx-Message");
    let ErrorCode = document.getElementById("VDCEditorEx-ErrorCode");

    message = message.replace(/(Uncaught .+?: )/, "")

    if (message && !message.endsWith(".")) {
        message += ".";
    }

    ErrorMessage.textContent = message;
    ErrorCode.textContent = "Error code: " + errorCode.toString();

    ErrorButtons();  
}

function showErrorDialog(message, error) {
    const BlurDlg = document.getElementById("VDCEditorEx-BlurDlg");
    const ErrorDlg = document.getElementById("VDCEditorEx-ErrorDlg-Content");

    BlurDlg.style.display = "block";
    

    if (ErrorDlg.style.display === "block") {
        return; // Already displayed + prevent new error from being shown
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
                case "TypeError": code = "INVALID_TYPE"; break; 
                default:
                    code = error.name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toUpperCase();
            }
        }
    }

    let finalMessage = message || "A critical error occurred.\nCheck the console for details.";
    let ErrCode = "__ERR_" + (code == String ? code.toUpperCase() : "GENERIC") + "__";

    ErrorDialog(finalMessage, ErrCode);

    ErrorDlg.style.display = "block";
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

function ErrorButtons() {
    const Download = document.getElementById("VDCEditorEx-Download");
    const CopyToClip = document.getElementById("VDCEditorEx-CopyToClip");
    const Cancel = document.getElementById("VDCEditorEx-Cancel");

    const EditorText = document.getElementById("VDCEditorEx-Editor")?.textContent || "";

    Download.addEventListener('click', (e) => {
        e.preventDefault();
        const blob = new Blob([EditorText], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "editor_backup.txt";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    CopyToClip.addEventListener('click', (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(EditorText)
    });

    Cancel.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById("VDCEditorEx-ErrorDlg").style.display = "none";

        const WikiCancelSpan = document.getElementById("mw-editform-cancel");
        const WikiCancelLink = WikiCancelSpan?.querySelector("a");
        if (WikiCancelLink) WikiCancelLink.click();
    });
}