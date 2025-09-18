//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Opens a new tab with the template documentation
//
//================================================================

let templatePageHandler = null;

function TemplatePage_addEventListener() {
    if (templatePageHandler) return;

    templatePageHandler = function (e) {
        if (!e.ctrlKey) return;
        if (e.target.closest("#VDCEditorEx-Editor") === null) return;

        const sel = window.getSelection();
        if (!sel.rangeCount) return;

        const range = sel.getRangeAt(0);
        const container = range.startContainer;

        if (!Div_Editor.contains(container)) return;

        const text = container.textContent;
        const pos = range.startOffset;

        const before = text.lastIndexOf("{{", pos);
        if (before === -1) return;

        const charBefore = before > 0 ? text[before - 1] : null;

        if (charBefore && charBefore === "{") return;

        const afterPipe = text.indexOf("|", pos);
        const afterClose = text.indexOf("}}", pos);
        const end = (afterPipe !== -1 && (afterClose === -1 || afterPipe < afterClose))
            ? afterPipe
            : afterClose;

        if (end === -1) return;

        const templateName = text.slice(before + 2, end).trim();

        if (templateName && !templateName.includes("{")
            && !templateName.includes("|")
            && !MagicWordsTempRegex.test(templateName)
            && !TimeStampRegex.test(templateName)
            && !MagicWordsAllowedRegex.test(templateName)
        ) {
            const url = `https://developer.valvesoftware.com/wiki/Template:${wikiEncode(capitalizeFirst(templateName))}`;
            window.open(url, "_blank");
        }
    };

    Div_Editor.addEventListener("dblclick", templatePageHandler);
}

function TemplatePage_removeEventListener() {
    if (!templatePageHandler) return;
    Div_Editor.removeEventListener("dblclick", templatePageHandler);
    templatePageHandler = null;
}