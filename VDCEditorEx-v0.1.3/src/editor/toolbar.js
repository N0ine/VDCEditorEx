//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

async function CreateToolbar() {
    const toolbar = document.getElementById("wikiEditor-ui-toolbar");
    const response = await fetch(chrome.runtime.getURL("src/editor/html/toolbar.html"));
    let html = await response.text();

    const extURL = chrome.runtime.getURL("").replace(/\/$/, "");

    html = html.replace(/__EXT_ID__/g, extURL);

    toolbar.innerHTML = html;

    SetupToolbarEvents();
}

function SetupToolbarEvents() {
    document.querySelectorAll("[data-VDCEdEx-T-setting]").forEach(button => {
        const key = button.dataset.vdcedexTSetting;

        button.addEventListener("click", (e) => {
            e.preventDefault();
            toggleButton(button, key);
        });
    });
}

