//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Counts the strings on /string with the current translations (As of 2025-2026)
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

    const text = Div_Editor.textContent || "";
    const stripped = text.replace(/<!--[\s\S]*?-->/g, "");
    if (!hasStringPageWrapper(stripped)) {
        InfoDialog("No <includeonly> or <onlyinclude> wrapper was detected; this may not be a string page.");
        return;
    }
    const switchBlocks = findSwitchBlocks(stripped);
    const originalTextAreaHeight = SubMainTextArea.style.height || "";
    SubMainTextArea.style.height = `${Math.max(originalTextAreaHeight, 659)}px`;

    const optionsBar = document.createElement("div");
    optionsBar.style = "display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 10px;";

    const defaultToggle = document.createElement("span");
    defaultToggle.className = "VDCEditorEx-Settings-Btn oo-ui-icon-check oo-ui-image-invert";
    defaultToggle.setAttribute("checked", "true");
    defaultToggle.style.cursor = "pointer";
    defaultToggle.style.minWidth = "18px";
    defaultToggle.style.minHeight = "18px";
    defaultToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const enabled = defaultToggle.getAttribute("checked") === "true";
        defaultToggle.setAttribute("checked", enabled ? "false" : "true");
        renderCounts(!enabled);
    });

    const defaultLabel = document.createElement("span");
    defaultLabel.style = "display: inline-flex; align-items: center; gap: 6px; font-size: var(--font-size); color: var(--ed-color-text);";
    defaultLabel.append(defaultToggle, document.createTextNode("Treat #default as English fallback"));

    const defaultCount = document.createElement("span");
    defaultCount.style = "font-size: var(--font-size); color: var(--ed-color-text);";
    defaultCount.innerHTML = "String entries<sup style=\"user-select: none;\">[?]</sup>: 0";
    defaultCount.title = "Total number of string entries using switches (not including non switch content)";

    optionsBar.append(defaultLabel, defaultCount);
    const warningNote = document.createElement("div");
    warningNote.style = "background-color: rgb(244 196 48 / 3%); border: 1px solid rgb(244 196 48 / 15%);; border-left: 4px solid rgb(244 196 48 / 80%); border-radius: 3px; padding: 6px; font-size: 0.8em;";
    warningNote.textContent = "Note: Complex pages can affect the accuracy of these counts.";
    optionsBar.appendChild(warningNote);

    const table = document.createElement("table");
    table.style = 'width: 100%; font-size: var(--font-size); margin: 0; border-collapse: collapse;';
    table.classList.add("wikitable");

    const tbody = document.createElement("tbody");
    table.appendChild(tbody);

    function renderCounts(useDefaultAsEnglish) {
        const results = analyzeSwitchBlocks(switchBlocks, useDefaultAsEnglish);
        if (results.blockCount === 0) {
            InfoDialog("No #switch templates/strings were detected on this page.");
            return;
        }

        EditorSettings.SIDE_PANEL_OPEN = true;
        EditorSidePanel.style.display = "block";

        defaultCount.innerHTML = `String entries<sup style=\"user-select: none;\">[?]</sup>: ${results.rawCounts['#default']}`;

        tbody.innerHTML = "";

        const header = document.createElement("tr");
        header.innerHTML = '<th style="padding: 6px; text-align:left;">Language</th><th style="padding: 6px; text-align:right;">Count</th><th style="padding: 6px; text-align:left;">Language</th><th style="padding: 6px; text-align:right;">Count</th>';
        tbody.appendChild(header);

        const displayList = CurrentLanguages;
        for (let index = 0; index < displayList.length; index += 2) {
            const row = document.createElement("tr");
            row.append(...createLangCells(displayList[index], results));

            if (index + 1 < displayList.length) {
                row.append(...createLangCells(displayList[index + 1], results));
            }

            tbody.appendChild(row);
        }
    }

    function createLangCells(lang, results) {
        const tdName = document.createElement("td");
        tdName.style.padding = "4px 6px";
        tdName.style.whiteSpace = "nowrap";

        if (lang !== '#default') {
            const flag = document.createElement("img");
            flag.alt = lang;
            flag.src = ImgSrc[lang];
            flag.decoding = "async";
            flag.title = lang;
            flag.width = 16;
            flag.height = 11;
            flag.style.marginRight = "6px";
            flag.style.verticalAlign = "middle";
            flag.style.userSelect = "none";
            tdName.appendChild(flag);
        }

        tdName.appendChild(document.createTextNode(lang));

        const tdCount = document.createElement("td");
        tdCount.style.padding = "4px 6px";
        tdCount.style.textAlign = "right";
        tdCount.textContent = results.displayCounts[lang] ?? 0;
        tdCount.style.color = results.displayCounts[lang] > 0 ? "#f0f642" : "#5b5b5b";

        return [tdName, tdCount];
    }

    function findSwitchBlocks(source) {
        const blocks = [];
        const pattern = /{{#switch:\s*/gi;
        let match;

        while ((match = pattern.exec(source)) !== null) {
            let i = match.index;
            let depth = 0;
            let block = "";

            while (i < source.length) {
                const openMatch = source.slice(i).match(/^(\{+)/);
                const closeMatch = source.slice(i).match(/^(\}+)/);

                if (openMatch) {
                    depth += openMatch[1].length;
                    block += openMatch[1];
                    i += openMatch[1].length;
                    continue;
                }

                if (closeMatch) {
                    depth -= closeMatch[1].length;
                    block += closeMatch[1];
                    i += closeMatch[1].length;
                    if (depth <= 0) {
                        break;
                    }
                    continue;
                }

                block += source[i];
                i++;
            }

            if (block) {
                blocks.push({
                    text: block,
                    start: match.index,
                    end: i
                });
            }
        }

        return blocks;
    }

    function findParentBlock(child, allBlocks) {
        let parent = null;
        allBlocks.forEach(candidate => {
            if (candidate === child) {
                return;
            }
            if (candidate.start <= child.start && candidate.end >= child.end) {
                if (!parent || (candidate.end - candidate.start) < (parent.end - parent.start)) {
                    parent = candidate;
                }
            }
        });
        return parent;
    }

    function analyzeSwitchBlocks(blocks, useDefaultAsEnglish) {
        const withParents = blocks.map(block => ({
            ...block,
            parent: findParentBlock(block, blocks)
        }));

        const effectiveBlocks = withParents.filter(block => {
            if (isDispatchSwitchBlock(block.text)) {
                return false;
            }
            if (!block.parent) {
                return true;
            }
            return isDispatchSwitchBlock(block.parent.text);
        });

        const rawCounts = { '#default': 0 };
        const languageSet = new Set(CurrentLanguages.map(lang => lang.toLowerCase()));
        CurrentLanguages.forEach(lang => rawCounts[lang] = 0);

        let totalEntries = 0;

        effectiveBlocks.forEach(block => {
            const entries = parseSwitchEntries(block.text);
            entries.forEach(entry => {
                const normalized = entry.key.toLowerCase();
                if (normalized === '#default' || languageSet.has(normalized)) {
                    if (entry.value !== "") {
                        rawCounts[normalized] = (rawCounts[normalized] || 0) + 1;
                        totalEntries += 1;
                    }
                }
            });
        });

        const displayCounts = { ...rawCounts };
        if (useDefaultAsEnglish) {
            effectiveBlocks.forEach(block => {
                const entries = parseSwitchEntries(block.text);
                const hasEn = entries.some(entry => entry.key.toLowerCase() === 'en' && entry.value !== '');
                if (hasEn) {
                    return;
                }

                const defaultCount = entries.filter(entry => entry.key.toLowerCase() === '#default' && entry.value !== '').length;
                if (defaultCount > 0) {
                    displayCounts['en'] += defaultCount;
                }
            });
        }

        const languageTotal = CurrentLanguages.reduce((sum, lang) => sum + (displayCounts[lang] || 0), 0);

        return {
            blockCount: effectiveBlocks.length,
            totalEntries,
            rawCounts,
            displayCounts,
            languageTotal
        };
    }

    function parseSwitchEntries(block) {
        const entries = [];
        const prefix = '{{#switch:';
        const startIndex = block.toLowerCase().indexOf(prefix);
        if (startIndex === -1) {
            return entries;
        }

        let i = startIndex + prefix.length;
        let depth = 0;
        while (i < block.length) {
            const openMatch = block.slice(i).match(/^(\{+)/);
            const closeMatch = block.slice(i).match(/^(\}+)/);
            if (openMatch) {
                depth += openMatch[1].length;
                i += openMatch[1].length;
                continue;
            }
            if (closeMatch) {
                depth -= closeMatch[1].length;
                i += closeMatch[1].length;
                continue;
            }
            if (block[i] === '|' && depth === 0) {
                break;
            }
            i += 1;
        }

        let current = "";
        for (; i < block.length; i++) {
            const openMatch = block.slice(i).match(/^(\{+)/);
            const closeMatch = block.slice(i).match(/^(\}+)/);

            if (openMatch) {
                depth += openMatch[1].length;
                current += openMatch[1];
                i += openMatch[1].length - 1;
                continue;
            }

            if (closeMatch) {
                depth -= closeMatch[1].length;
                current += closeMatch[1];
                i += closeMatch[1].length - 1;
                continue;
            }

            if (block[i] === '|' && depth === 0) {
                if (current.trim()) {
                    const entry = parseEntrySegment(current);
                    if (entry) {
                        entries.push(entry);
                    }
                }
                current = "";
                continue;
            }

            current += block[i];
        }

        if (current.trim()) {
            const entry = parseEntrySegment(current);
            if (entry) {
                entries.push(entry);
            }
        }

        return entries;
    }

    function parseEntrySegment(segment) {
        let depth = 0;
        let key = "";
        let value = "";
        let foundEquals = false;

        for (let j = 0; j < segment.length; j++) {
            const openMatch = segment.slice(j).match(/^(\{+)/);
            const closeMatch = segment.slice(j).match(/^(\}+)/);

            if (openMatch) {
                depth += openMatch[1].length;
                if (foundEquals) value += openMatch[1];
                else key += openMatch[1];
                j += openMatch[1].length - 1;
                continue;
            }

            if (closeMatch) {
                depth -= closeMatch[1].length;
                if (foundEquals) value += closeMatch[1];
                else key += closeMatch[1];
                j += closeMatch[1].length - 1;
                continue;
            }

            if (!foundEquals && segment[j] === '=' && depth === 0) {
                foundEquals = true;
                continue;
            }

            if (foundEquals) {
                value += segment[j];
            } else {
                key += segment[j];
            }
        }

        const cleanedKey = key.replace(/^\s*\|?\s*/, '').trim();
        const cleanedValue = value.trim();

        if (!cleanedKey) {
            return null;
        }

        return {
            key: cleanedKey,
            value: cleanedValue
        };
    }

    function hasStringPageWrapper(source) {
        return /<\s*(?:includeonly|onlyinclude)\b/i.test(source);
    }

    function isDispatchSwitchBlock(block) {
        const prefix = '{{#switch:';
        const startIndex = block.toLowerCase().indexOf(prefix);
        if (startIndex === -1) {
            return false;
        }

        let i = startIndex + prefix.length;
        let depth = 0;
        while (i < block.length) {
            const openMatch = block.slice(i).match(/^(\{+)/);
            const closeMatch = block.slice(i).match(/^(\}+)/);
            if (openMatch) {
                depth += openMatch[1].length;
                i += openMatch[1].length;
                continue;
            }
            if (closeMatch) {
                depth -= closeMatch[1].length;
                i += closeMatch[1].length;
                continue;
            }
            if (block[i] === '|' && depth === 0) {
                break;
            }
            i += 1;
        }

        if (i >= block.length) {
            return false;
        }

        const selector = block.slice(startIndex + prefix.length, i).trim();
        return /^\s*\{\{\{\s*1(?:\|[^}]*)?\}\}\}\s*$/i.test(selector);
    }

    PageCounterPanel.innerHTML = "";
    PageCounterPanel.append(optionsBar, table);

    function createFooter() {
        const wrapper = document.createElement("div");
        wrapper.style.justifySelf = "center";
        wrapper.style.margin = "4px";

        const CloseButton = document.createElement("div");
        CloseButton.id = "VDCEditorEx-Button-OkStrings";
        CloseButton.textContent = "Close";
        CloseButton.style.cursor = "pointer";
        CloseButton.style.padding = "6px 119px";
        CloseButton.style.border = "var(--border-size) solid #3c783c";
        CloseButton.style.borderRadius = "4px";
        CloseButton.style.display = "inline-block";
        wrapper.appendChild(CloseButton);

        function handleClick(e) {
            e.preventDefault();
            EditorSettings.SIDE_PANEL_OPEN = false;
            EditorSidePanel.style.display = "none";
            SubMainTextArea.style.height = originalTextAreaHeight || null;
            chrome.storage.local.set({ "VDC-Height": originalTextAreaHeight || "500px" });
            Func_ResizeEvent();
            CloseButton.removeEventListener('click', handleClick);
        }

        CloseButton.addEventListener('click', handleClick);
        return wrapper;
    }

    const footer = createFooter();
    PageCounterPanel.appendChild(footer);
    EditorSidePanel.innerHTML = "";
    EditorSidePanel.style.fontSize = "var(--font-size)";
    EditorSidePanel.appendChild(PageCounterPanel);
    Func_ResizeEvent();

    renderCounts(defaultToggle.getAttribute("checked") === "true");
}
