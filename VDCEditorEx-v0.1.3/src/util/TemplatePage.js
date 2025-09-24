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

        const afterClose = text.indexOf("}}", pos);
        if (afterClose === -1) return;

        const afterPipe = text.indexOf("|", pos);
        let end;
        if (afterPipe !== -1 && afterPipe < afterClose) {
            end = afterPipe;
        } else {
            end = afterClose;
        }

        const rawName = text.slice(before + 2, end);
        const templateName = rawName.trim();

        if (templateName && !templateName.includes("{")
            && !templateName.includes("|")
            && !MagicWordsTempRegex.test(templateName)
            && !TimeStampRegex.test(templateName)
            && !MagicWordsAllowedRegex.test(templateName)
        ) {
            const startOffset = before + 2 + (rawName.length - rawName.trimStart().length);
            const endOffset = startOffset + templateName.length;

            if (endOffset <= startOffset) return;

            const current = sel.rangeCount ? sel.getRangeAt(0) : null;
            const sameRange = current && current.startContainer === container
                && current.endContainer === container && current.startOffset === startOffset && current.endOffset === endOffset;

            if (!sameRange) {
                const newRange = document.createRange();
                newRange.setStart(container, startOffset);
                newRange.setEnd(container, endOffset);

                sel.removeAllRanges();
                sel.addRange(newRange);
            }

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