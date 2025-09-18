//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

const CurrentLanguages = ["en",
    "ar",
    "ca", "cs",
    "de",
    "el", "en-GB", "eo", "es", "et",
    "fi", "fr",
    "he", "hr", "hu",
    "it",
    "ja",
    "ka", "ko",
    "nl", "no",
    "pl", "pt", "pt-br",
    "ru",
    "sk", "sv",
    "tr",
    "uk",
    "vi",
    "zh", "zh-tw"
]

const ImgSrc = {
ar:"images/3/35/Flag-ar.png",
ca:"images/7/74/Flag-ca.png",
cs:"images/7/78/Flag-cs.png",
de:"images/b/b7/Flag-de.png",
el:"images/a/a9/Flag-el.png",
en:"images/3/37/Flag-en.png",
"en-GB":"images/5/54/Flag-en-gb.png",
eo:"images/5/57/Flag-eo.png",
es:"images/8/86/Flag-es.png",
et:"images/3/3a/Flag-et.png",
fi:"images/d/d5/Flag-fi.png",
fr:"images/9/95/Flag-fr.png",
he:"images/8/8b/Flag-he.png",
hr:"images/d/d6/Flag-hr.png",
hu:"images/5/5b/Flag-hu.png",
it:"images/d/d3/Flag-it.png",
ja:"images/c/cd/Flag-ja.png",
ka:"images/c/ca/Flag-ka.png",
ko:"images/f/f7/Flag-ko.png",
nl:"images/8/83/Flag-nl.png",
no:"images/d/d6/Flag-no.png",
pl:"images/9/9a/Flag-pl.png",
pt:"images/c/c8/Flag-pt.png",
"pt-br": "images/2/29/Flag-pt-br.png",
ru:"images/e/e1/Flag-ru.png",
sk:"images/d/d6/Flag-sk.png",
sv:"images/f/fb/Flag-sv.png",
tr:"images/2/24/Flag-tr.png",
uk:"images/2/2b/Flag-uk.png",
vi:"images/4/47/Flag-vi.png",
zh:"images/e/e9/Flag-zh.png",
"zh-tw": "images/e/e6/Flag-zh-tw.png"
}

function StringCounter() {
    let PageCounterPanel = document.getElementById("VDCEditorEx-PageStringsCounter");

    if (!PageCounterPanel) {
        PageCounterPanel = document.createElement("div");
        PageCounterPanel.id = "VDCEditorEx-PageStringsCounter";
    }

    let text = Div_Editor.textContent;
    let results = {};

    const stripped = text.replace(/<!--(.*?)-->/gs, "");

    const mainSwitchStart = stripped.search(/<onlyinclude>{{#switch:\s*{{{1\|?.*?}}}/i);
    if (mainSwitchStart === -1) return;

    let depth = 0, i = mainSwitchStart, mainSwitchBlock = "";
    while (i < stripped.length) {

        let openMatch = stripped.slice(i).match(/^(\{+)/);
        if (openMatch) {
            let n = openMatch[1].length;
            depth += n;
            mainSwitchBlock += openMatch[1];
            i += n;
            continue;
        }

        let closeMatch = stripped.slice(i).match(/^(\}+)/);
        if (closeMatch) {
            let n = closeMatch[1].length;
            depth -= n;
            mainSwitchBlock += closeMatch[1];
            i += n;
            if (depth <= 0) break;
            continue;
        }

        mainSwitchBlock += stripped[i];
        i++;
    }

    // Find all top-level string blocks: "| something = {{#switch:"; autolang for legacy templates
    const stringBlockPattern = /(\|\s*.*?\s*=)\s*.*?\{\{#switch:\s*\{\{(Language|Intlang|Autolang)/gim;
    let match;
    while ((match = stringBlockPattern.exec(mainSwitchBlock)) !== null) {
        let blockStart = match.index + match[1].length;

        depth = 0;
        i = blockStart;
        stringBlock = "";
        while (i < mainSwitchBlock.length) {
            let openMatch = mainSwitchBlock.slice(i).match(/^(\{+)/);
            let closeMatch = mainSwitchBlock.slice(i).match(/^(\}+)/);

            if (openMatch) { depth += openMatch[1].length; stringBlock += openMatch[1]; i += openMatch[1].length; continue; }
            if (closeMatch) { depth -= closeMatch[1].length; stringBlock += closeMatch[1]; i += closeMatch[1].length; if (depth <= 0) break; continue; }

            stringBlock += mainSwitchBlock[i];
            i++;
        }

        const regex = new RegExp(`(\\|\\s*)(${CurrentLanguages.join('|')}|#default)(\\s*=)(.*)`, "gi");
        const keysAndValues = stringBlock.matchAll(regex);
        const tempCounts = {};

        for (const match of keysAndValues) {
            const key = match[2].trim();
            const value = match[4].trim();

            if (key === "#default" && value === "") continue;

            tempCounts[key] = (tempCounts[key] || 0) + 1;
        }

        CurrentLanguages.forEach(lang => {
            if (lang === "en") {
                if (tempCounts["en"]) {
                    results[lang] = (results[lang] || 0) + 1;
                } else if (tempCounts["#default"]) {
                    results[lang] = (results[lang] || 0) + 1;
                }
            } else {
                if (tempCounts[lang]) {
                    results[lang] = (results[lang] || 0) + 1;
                }
            }
        });
    }

    CurrentLanguages.forEach(lang => results[lang] = results[lang] || 0);

    const table = document.createElement("table");
    table.style = 'width: 100%; font-size: var(--font-size); margin: 0;';
    table.classList.add("wikitable");

    const tbody = document.createElement("tbody");

    table.appendChild(tbody)

    for (let i = 0; i < CurrentLanguages.length; i += 2) {
        const tr = document.createElement("tr");

        function createLangCell(lang) {
            const td = document.createElement("td");

            const div = document.createElement("div");
            div.style = "margin: 0 10px; align-items: center; display: inline-block;";
            div.innerHTML = `<img alt=${[lang]}" src="${ImgSrc[lang]}" decoding="async" title="${[lang]}" width="16" height="11" data-file-width="16" data-file-height="11">`;

            td.appendChild(div);
            td.appendChild(document.createTextNode(lang));

            const countTd = document.createElement("td");
            countTd.id = `VDC-PageCounter-${lang.replace(/-/g, "")}`;
            countTd.innerHTML = results[lang];

            if (results[lang] == 0)
                countTd.style.color = "#5b5b5b";
            else if (results[lang] > 0)
                countTd.style.color = "#f0f642";

            return [td, countTd];
        }

        const [td1, td2] = createLangCell(CurrentLanguages[i]);
        tr.append(td1, td2);

        if (i + 1 < CurrentLanguages.length) {
            const [td3, td4] = createLangCell(CurrentLanguages[i + 1]);
            tr.append(td3, td4);
        }

        tbody.appendChild(tr);
    }

    const wrapper = document.createElement("div");
    wrapper.style.justifySelf = "center";
    wrapper.style.margin = "4px";

    const OkayButton = document.createElement("div");
    OkayButton.id = "VDCEditorEx-Button-OkStrings";
    OkayButton.textContent = "OK"
    wrapper.appendChild(OkayButton)

    const Notice = document.createElement("span");
    Notice.style.fontSize = "var(--font-size)";
    Notice.style.color = "var(--ed-color-text)";
    Notice.style.textDecoration = "dotted";
    Notice.style.textDecorationLine = "underline";
    Notice.style.userSelect = "none";
    Notice.title = "English strings might be wrong on big pages, since it can be #default or en.\nIt tries to combine both of them, on simple pages, it may be correct";
    Notice.innerHTML = "Experimental mode<sup>[?]</sup>";

    PageCounterPanel.innerHTML = "";
    PageCounterPanel.append(Notice, table, wrapper)

    EditorSidePanel.innerHTML = "";
    EditorSidePanel.style.fontSize = "var(--font-size)";
    EditorSidePanel.appendChild(PageCounterPanel)

    function handleClick(e) {
        e.preventDefault();
        EditorSettings.SIDE_PANEL_OPEN = false;
        EditorSidePanel.style.display = "none";
        OkayButton.removeEventListener('click', handleClick);
    }

    OkayButton.addEventListener('click', handleClick);

}