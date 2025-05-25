/**
 * Create a message box if the version on the site is newer than the manifest version
 */
async function WarnIfNewVersion() {
    // Direct URL to the VDCEditor page.
    var page = await fetch('https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor');
    var html = await page.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');

    let latestBox = doc.getElementById("Ed-Latest");
    let firstTd = latestBox.querySelector('td');

    let version = firstTd.childNodes[0].textContent.trim();

    const manifest = chrome.runtime.getManifest();
    const currentVersion = manifest.version;

    function compareVersions(version, currentVersion) {
        if (version[0] === 'v' || version[0] === 'V') { version = version.slice(1); }
        if (currentVersion[0] === 'v' || currentVersion[0] === 'V') { currentVersion = currentVersion.slice(1); }
        const v1 = version.split('.').map(Number);
        const v2 = currentVersion.split('.').map(Number);
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
            const num1 = v1[i] || 0;
            const num2 = v2[i] || 0;
            if (num1 > num2) return true;
            if (num1 < num2) return false;
        }
        return false;
    }

    if (compareVersions(version, currentVersion)) {
        console.error("New version available (%s). Limited support for VDCEditorEx.", version);

        let content = document.getElementById("bodyContent");

        let message = document.createElement("div");
        message.className = "VDCEditorEx-WarningBox mw-message-box";
        message.innerHTML = `<p>A new version of <a href="https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor" target="_blank">VDCEditor</a> (${version}) is available.<br><strong>VDCEditorEx has limited support and will no longer receive updates. Please switch to the latest version.</strong></p>`;

        let place = content.children[4];
        content.insertBefore(message, place.nextSibling);
    }
}

/**
 * Adds a custom style for templates
 * @param {Function} callback when it adds the style (or not) fire a function
 */
function addStyles(callback) {
    if (!document.getElementById("VDCEditorEx-Style")) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = "VDCEditorEx-Style";
        link.href = chrome.runtime.getURL('Style.css');
        link.onload = function () {
            document.documentElement.style.setProperty('--resizer', `url("${chrome.runtime.getURL('images/toolbar/Resizer.png')}")`);
            if (callback) callback();
        };
        document.head.appendChild(link);
    } else {
        document.documentElement.style.setProperty('--resizer', `url("${chrome.runtime.getURL('images/toolbar/Resizer.png')}")`);
        if (callback) {
            callback();
        }
    }
}

const style = document.createElement('style');
let css = '';
data.TEMPLATES.forEach(template => {
	const names = Array.isArray(template.NAME) ? template.NAME : [template.NAME];
	const shortest = names.reduce((a, b) => a.length <= b.length ? a : b);
	const tagName = 'nt-' + shortest.toLowerCase().replace(/:/g, '-').replace(/\s+/g, '');
	let style = template.USEDEFAULT === true
		? 'color: var(--color-mwtemplates);'
		: `color: ${template.COLOR};`;

	if (template.STYLE && Array.isArray(data.STYLES)) {
		const match = data.STYLES.find(s => s.TYPE === template.STYLE);
		if (match && match.STYLE) {
			style += ` ${match.STYLE}`;
		}
	}
	if (shortest === "__DEFAULT__") {
		css += `editor-mwtemplates { ${style} }\n`;
	} else {
		css += `${tagName} { ${style} }\n`;
	}
});

style.textContent = css;
style.id = "VDCEditorEx-autostyles";
document.head.appendChild(style);

var TEMPLATES = data.TEMPLATES.filter(t => {
    if (Array.isArray(t.NAME)) {
        return !t.NAME.includes("__DEFAULT__");
    }
    return t.NAME !== "__DEFAULT__";
});

var CATEGORIES = data.CATEGORIES;
var LINKS = data.LINKS;
var FUNCTIONS = data.FUNCTIONS;
var MAGICWORDS = data.MAGICWORDS;
var TIMESTAMPS = data.TIMESTAMP;

/**
 *  Optimized helper function to get type of braced block
 * @param {string} text text content of the editor
 * @param {number} [type=2] how many braces to look for
 * */
function findAllBracedBlocks(text, type = 2) {
    const results = [];
    const stack = [];
    let start = -1;
    const openSeq = '{'.repeat(type);
    const closeSeq = '}'.repeat(type);
    const step = type - 1;

    for (let i = 0; i < text.length - (type - 1); i++) {
        const seq = text.slice(i, i + type);

        if (seq === openSeq) {
            if (stack.length === 0) start = i;
            stack.push(openSeq);
            i += step;
        } else if (seq === closeSeq) {
            if (stack.length > 0) {
                stack.pop();
                i += step;
                if (stack.length === 0 && start !== -1) {
                    results.push({
                        start,
                        end: i + 1,
                        content: text.slice(start, i + 1)
                    });
                    start = -1;
                }
            }
        }
    }

    return results;
}

/**
 *  Optimized helper function to parse and files and categories
 * @param {string} text text content of the editor
 * */
function findAllLinkBlocks(text) {
    const results = [];
    let stack = 0;
    let start = -1;

    for (let i = 0; i < text.length - 1; i++) {
        const pair = text.slice(i, i + 2);
        if (pair === '[[') {
            if (stack === 0) start = i;
            stack++;
            i++;
        } else if (pair === ']]') {
            if (stack > 0) {
                stack--;
                i++;
                if (stack === 0 && start !== -1) {
                    results.push({
                        start,
                        end: i + 1,
                        content: text.slice(start, i + 1)
                    });
                    start = -1;
                }
            }
        }
    }

    return results;
}

/**
 *  Advanced helper function to parse and wrap nested templates
 * @param {string} str text content of the editor
 * */
function parseNestedTemplates(str) {
    const nested = findAllBracedBlocks(str, 2);
    if (!nested.length) return str;

    const normalizeName = s => (typeof s === "string" ? s.toLowerCase().replace(/\s+/g, '').replace(/:/g, '-') : '');

    const noticeTemplatesMap = new Map(
        (Array.isArray(TEMPLATES) ? TEMPLATES : []).flatMap(template => {
            const names = Array.isArray(template.NAME) ? template.NAME : [template.NAME];
            const shortest = names.reduce((a, b) => a.length <= b.length ? a : b);
            const normShortest = normalizeName(shortest);
            return names.map(name => [normalizeName(name), normShortest]);
        })
    );
    const catTemplatesSet = new Set(
        (Array.isArray(CATEGORIES) ? CATEGORIES : []).flatMap(t =>
            Array.isArray(t.NAME)
                ? t.NAME.map(normalizeName).filter(Boolean)
                : [normalizeName(t.NAME)].filter(Boolean)
        )
    );
    const linksSet = new Set(
        (Array.isArray(LINKS) ? LINKS : []).flatMap(name =>
            Array.isArray(name)
                ? name.map(normalizeName).filter(Boolean)
                : [normalizeName(name)].filter(Boolean)
        )
    );
    const functionsSet = new Set(
        (Array.isArray(FUNCTIONS) ? FUNCTIONS : []).flatMap(name =>
            Array.isArray(name)
                ? name.map(normalizeName).filter(Boolean)
                : [normalizeName(name)].filter(Boolean)
        )
    );

    let mwPattern, tempmwPattern, spacePattern, timeStampPattern;
    if (MAGICWORDS) {
        if (MAGICWORDS.magicwords?.length)
            mwPattern = new RegExp(`^(${MAGICWORDS.magicwords.join("|")})$`, "i");
        if (MAGICWORDS.tempmagicwords?.length && MAGICWORDS.tempmagic_suffixes?.length)
            tempmwPattern = new RegExp(`^(${MAGICWORDS.tempmagicwords.join("|")})(${MAGICWORDS.tempmagic_suffixes.join("|")})$`, "i");
        if (MAGICWORDS.spaces?.length && MAGICWORDS.space_suffixes?.length)
            spacePattern = new RegExp(`^(${MAGICWORDS.spaces.join("|")})(${MAGICWORDS.space_suffixes.join("|")})$`, "i");
    }
    if (TIMESTAMPS?.location?.length && TIMESTAMPS?.date?.length) {
        timeStampPattern = new RegExp(`^(${TIMESTAMPS.location.join("|")})(${TIMESTAMPS.date.join("|")})$`, "i");
    }

    let result = str;

    for (let i = nested.length - 1; i >= 0; i--) {
        const tpl = nested[i];
        const original = tpl.content;
        const match = original.match(/^{{\s*([^|}]+)/i);
        const match2 = original.match(/^{{\s*([^:|}]+)/i);
        if (!match || !match2) continue;

        const nameRaw = match[1];
        const nameRaw2 = match2[1];
        const nameNorm = normalizeName(nameRaw);
        const nameNorm2 = normalizeName(nameRaw2);
        const tagName = 'nt-' + nameNorm;
        const inner = original.slice(2, -2);
        const rebuilt = `{{${parseNestedTemplates(inner)}}}`;

        let wrapped = original;

        if (noticeTemplatesMap.has(nameNorm)) {
            const tagName = 'nt-' + normalizeName(noticeTemplatesMap.get(nameNorm));
            wrapped = typeof StylizedTemplates !== "undefined" && StylizedTemplates
                ? `<${tagName}>${rebuilt}</${tagName}>`
                : rebuilt;
        } else if (catTemplatesSet.has(nameNorm2)) {
            wrapped = typeof MwCategory !== "undefined" && MwCategory
                ? `<editor-mwcategories>${rebuilt}</editor-mwcategories>`
                : rebuilt;
        } else if (linksSet.has(nameNorm)) {
            wrapped = typeof StylizedLinks !== "undefined" && StylizedLinks
                ? `<editor-mwlinks>${rebuilt}</editor-mwlinks>`
                : rebuilt;
        } else if (functionsSet.has(nameNorm2)) {
            wrapped = typeof MwFunctions !== "undefined" && MwFunctions
                ? `<editor-mwfuncs>${rebuilt}</editor-mwfuncs>`
                : (typeof StylizedTemplates !== "undefined" && StylizedTemplates
                    ? `<editor-mwtemplates>${rebuilt}</editor-mwtemplates>`
                    : rebuilt);
        } else if (
            (mwPattern && mwPattern.test(nameRaw2)) ||
            (tempmwPattern && tempmwPattern.test(nameRaw2)) ||
            (spacePattern && spacePattern.test(nameRaw2))
        ) {
            wrapped = typeof TempMagicWords !== "undefined" && TempMagicWords
                ? `<editor-tempmagicwords>${rebuilt}</editor-tempmagicwords>`
                : rebuilt;
        } else if (timeStampPattern && timeStampPattern.test(nameRaw2)) {
            wrapped = MwTimeStamp
                ? `<editor-timestamp>${rebuilt}</editor-timestamp>`
                : rebuilt;
        } else if (original.startsWith("{{{")) {
            wrapped = rebuilt;
        } else {
            wrapped = typeof StylizedTemplates !== "undefined" && StylizedTemplates
                ? `<editor-mwtemplates>${rebuilt}</editor-mwtemplates>`
                : rebuilt;
        }
        result = result.slice(0, tpl.start) + wrapped + result.slice(tpl.end);
    }
    return result;
}

/**
 *  Optimized helper function to parse and wrap nested parameters
 * @param {string} str text content of the editor
 * */
function parseNestedParams(str) {
    const nested = findAllBracedBlocks(str, 3);
    if (!nested.length) return str;

    let result = str;

    for (let i = nested.length - 1; i >= 0; i--) {
        const tpl = nested[i];
        const original = tpl.content;
        const match = original.match(/^{{{\s*([^|}]+)/i);
        if (!match) continue;

        const inner = original.slice(3, -3);
        const rebuilt = `{{{${parseNestedParams(inner)}}}}`;

        let wrapped = original;
        wrapped = `<editor-mwparams>${rebuilt}</editor-mwparams>`;

        result = result.slice(0, tpl.start) + wrapped + result.slice(tpl.end);
    }
    return result;
}

/**
 *  Optimized helper function to parse and wrap nested links, categories, or files
 * @param {string} str text content of the editor
 * */
function parseNestedLinksCatsFiles(str) {
    const nested = findAllLinkBlocks(str);
    if (!nested.length) return str;

    let result = str;

    for (let i = nested.length - 1; i >= 0; i--) {
        const tpl = nested[i];
        const original = tpl.content;
        const match = original.match(/^\[\[\s*([^\]|:]+)(:[^\]|]+)?/i);
        if (!match) continue;

        const inner = original.slice(2, -2);
        const rebuilt = `[[${parseNestedLinksCatsFiles(inner)}]]`;

        let wrapped = original;

        if (/^:?(category|категория|categorie|kategorie|categoria|категорія|категория|分類|분류|カテゴリ|категорія|категория|категорія|категория|категорія|категория):/i.test(inner)) {
            wrapped = MwFile
                ? `<editor-mwcategories>${rebuilt}</editor-mwcategories>`
                : rebuilt;
        } else if (/^:?(file|image|файл|dosya|archivo|bild|immagine|imagem|obraz|изображение|fichier|media|media):/i.test(inner)) {
            wrapped = MwCategory
                ? `<editor-mwfiles>${rebuilt}</editor-mwfiles>`
                : rebuilt;
        } else {
            wrapped = StylizedLinks
                ? `<editor-mwlinks>${rebuilt}</editor-mwlinks>`
                : rebuilt;
        }

        result = result.slice(0, tpl.start) + wrapped + result.slice(tpl.end);
    }
    return result;
}

function highlightMatchingBracket(Div_Editor, Div_SameSelection, SelectionCount, Span_CaretPosition, getCursorPosition) {
    SelectionCount.innerHTML = getTranslation("Found", 0);

    setTimeout(() => {
        const sel = window.getSelection();
        const node = sel.focusNode;
        const offset = sel.focusOffset;
        const pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

        if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
            Span_CaretPosition.textContent = getTranslation("PosLength", Math.min(pos.pos, Div_Editor.textContent.length));
        else
            Span_CaretPosition.textContent = getTranslation("PosLength", Math.min(pos.pos, Div_Editor.textContent.length - 1));
    }, 0);

    const editor = Div_Editor;
    const display = Div_SameSelection;

    const sel = window.getSelection();
    if (!sel.rangeCount || !editor.contains(sel.focusNode)) return;

    const selectedText = sel.toString();
    if (selectedText.length !== 1 || !['{', '}', '[', ']', '(', ')'].includes(selectedText)) return;

    const raw = editor.textContent;

    let offset = sel.focusOffset;
    if (!sel.isCollapsed && sel.anchorNode === sel.focusNode) {
        if (sel.anchorOffset > sel.focusOffset) {
            offset = sel.focusOffset;
        } else {
            offset = sel.focusOffset - 1;
        }
    } else {
        offset = sel.focusOffset - 1;
    }
    const cursorOffset = Math.max(0, offset);

    const bracketsMap = {
        '{': '}',
        '}': '{',
        '[': ']',
        ']': '[',
        '(': ')',
        ')': '(',
    };

    const isOpening = ['{', '[', '('].includes(selectedText);
    const openBracket = isOpening ? selectedText : bracketsMap[selectedText];
    const closeBracket = isOpening ? bracketsMap[selectedText] : selectedText;

    let stack = 1;
    let matchPos = -1;

    if (isOpening) {
        for (let i = cursorOffset + 1; i < raw.length; i++) {
            if (raw[i] === openBracket) stack++;
            else if (raw[i] === closeBracket) stack--;
            if (stack === 0) {
                matchPos = i;
                break;
            }
        }
    } else {
        for (let i = cursorOffset - 1; i >= 0; i--) {
            if (raw[i] === closeBracket) stack++;
            else if (raw[i] === openBracket) stack--;
            if (stack === 0) {
                matchPos = i;
                break;
            }
        }
    }

    function htmlEncode(str) {
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    if (matchPos !== -1) {
        let html = '';
        for (let i = 0; i < raw.length; i++) {
            let ch = htmlEncode(raw[i]);
            if (i === cursorOffset || i === matchPos) {
                html += `<span class="VDCEditorEx-SameAsSelected">${ch}</span>`;
            } else {
                html += ch;
            }
        }
        display.innerHTML = html;
    } else {
        display.innerText = raw;
    }
}