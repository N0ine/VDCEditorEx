//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Localization script for the extension.
//
//================================================================

let CURRENT_LANG = "en";

let TRANSLATION_DATA_EN = {};

let TRANSLATION_DATA = {};

chrome.storage.local.get("VDC-LANG", data => {
    CURRENT_LANG = data["VDC-LANG"] || "en";
});

async function loadTranslations() {
    const lang = (CURRENT_LANG || "en").toLowerCase();
    const url = chrome.runtime.getURL(`src/locales/${lang}.json`);

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new EditorError(`HTTP ${resp.status}`, "HTTP_REQUEST_FAIL");
        TRANSLATION_DATA = await resp.json();

        const resp_en = await fetch(chrome.runtime.getURL(`src/locales/en.json`));
        if (!resp_en.ok) throw new EditorError(`HTTP ${resp_en.status}`, "HTTP_REQUEST_FAIL");
        TRANSLATION_DATA_EN = await resp_en.json();

    } catch (err) {
        console.warn(`Failed to load ${lang}.json, falling back to en:`, err);

        try {
            const resp = await fetch(chrome.runtime.getURL("src/locales/en.json"));
            if (!resp.ok) throw new EditorError(`HTTP ${resp.status}`, "HTTP_REQUEST_FAIL");
            TRANSLATION_DATA = await resp.json();
            chrome.storage.local.set({ "VDC-LANG": "en" });
        } catch (err2) {
            throw new EditorError(`Could not load fallback locale file (en): ${err2}`,"LOCALE_FALLBACK_FAILURE");
        }
    }
}

function getTranslation(tokenId, ...params) {
    if (!TRANSLATION_DATA || !Object.keys(TRANSLATION_DATA).length) {
        throw new EditorError("Tried to get token id while TRANSLATION_DATA is empty","LOCALE_MISSING");
    }

    let token = TRANSLATION_DATA[tokenId] ?? TRANSLATION_DATA_EN[tokenId];

    if (token === undefined || token === null) {
        console.warn(`Missing translation for token id: ${tokenId}`);
        return "#" + tokenId;
    }

    if (Array.isArray(token)) {
        token = token.join("\n");
    }

    let i = 0;
    return token.replace(/%s|%(\d+)|\$(\d+)/g, (match, p1, p2) => {
        if (match === "%s") return params[i++] ?? match;
        const idx = parseInt(p1 || p2, 10) - 1;
        return params[idx] ?? match;
    });
}