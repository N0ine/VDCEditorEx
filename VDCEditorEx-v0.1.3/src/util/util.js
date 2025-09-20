//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

// Adding this if the user doesn't want to go to another version of the editor (probably because of something useful added).
var SUPPRESS_OUTDATED_EDITOR = false;

var BROWSER_TYPE = (typeof InstallTrigger !== 'undefined' ? "Firefox" : "Chrome");

var UDT_ALLNAMES = [];
var UDT_SHORTEST = new Map();

var EDITOR_LOADED = false

var MainEditorWrapper = undefined;
var MainEditor = undefined;
var SubMainToolBar = undefined;
var SubMainTextArea = undefined;
var SubMainBottom = undefined;
var Textarea_Code = undefined;
var Div_SearchCode = undefined;
var Div_SameSelection = undefined;
var Div_CodeLines = undefined;
var Div_StylizedCode = undefined;
var Div_Editor = undefined;
var Div_LineNumbers = undefined;
var SettingsPanelBtn = undefined;
var SettingsPanel = undefined;
var SearchPanelBtn = undefined;
var SearchPanel = undefined;
var SearchInfoDlg = undefined;
var EditorSidePanel = undefined;
var SummaryPreview = undefined;
var SummaryText = undefined;
var previewText = undefined;

const EditorSettings = new Proxy({
	SameSelection: false,
	WordWrap: true,
	ScrollAfterLastLine: false,
	StylizedTemplates: true,
	StylizedLinks: true,
	NoticeTemplates: true,
	HTMLTagsFormatter: true,
	HTMLEnts: true,
	MwCategory: true,
	MwFile: true,
	MwFunctions: true,
	TempMagicWords: true,
	MwHeader: true,
	MwMnemonics: true,
	MwMagicWords: true,
	MwMultiComments: true,
	MwPost: true,
	MwTags: true,
	MwTimeStamp: true,
	MwMarkup: true,
	ColoredNumbers: false,
	MatchingBracket: false,
    HTMLUnsupportedTags: false,
	HTMLInvalidTags: false,
	ShowAllChars: false,
	MwTables: false,
	MwStringsCounter: false,
	ShowLiveSummary: false,
	EDITOR_DIR_RTL: false, // Deprecated, Buggy, breaks the Show All Chars feature.
	SIDE_PANEL_OPEN: false,
	TemplatePageTab: false,
	Dbg_ShowWeirdBlocks: false,
	Dbg_ThorwError: false
}, {
	set(target, key, value) {
		const oldValue = target[key];
		if (oldValue !== value) {
			target[key] = value;

			Event_OnSettingsChanged(key, value, oldValue);
		}
		return true;
	}
});

function Event_OnSettingsChanged(key, value, oldValue) {
	if (!EDITOR_LOADED) return;

	if (key == "MwStringsCounter" && value == true && PAGE_NAME.endsWith("/strings")) {
		const StringsCounterButton = document.getElementById("VDC-T-StringsCounter");
		StringsCounterButton.style.display = "flex";
	}
	else if (key == "MwStringsCounter" && value == false && PAGE_NAME.endsWith("/strings")) {
		const StringsCounterButton = document.getElementById("VDC-T-StringsCounter");
		StringsCounterButton.style.display = "none";
	}

	if (key == "TemplatePageTab" && value == true) {
        TemplatePage_addEventListener();
	}
	else if (key == "TemplatePageTab" && value == false) {
		TemplatePage_removeEventListener();
	}

	if (key == "Dbg_ThrowError") {
        throw new EditorError("This is a test error, you have clicked on the button to throw the error.", "TEST_ERROR");
	}

	if (key == "WordWrap") {
		const whiteSpaceValue = value ? "break-spaces" : "pre";
		[Div_StylizedCode, Div_SameSelection, Div_CodeLines, Div_Editor].forEach(el => {
			el.style.whiteSpace = whiteSpaceValue;
		});
		Div_Editor.style.minWidth = value ? "unset" : "fit-content";
		Div_Editor.style.paddingRight = value ? "5px" : "128px";
	}

	EditorFormatter();
	Func_ResizeEvent();
}


class EditorError extends Error {
	constructor(message, code) {
		super(message);
		this.name = "EditorError";
		this.code = code; // custom error code
	}
}

var MwCatRegex;
var MwLinksRegex;
var MAGICWORDS;
var MagicWordsRegex;
var MagicWordsTempRegex;
var TimeStampRegex;
var MwFunctionsRegex;
var MwOtherFuncsRegex;
// If a magic word is allowed to contain values
var MagicWordsAllowedRegex;
var ELEMTAGS;
var WIKITAGS;

/**
 * Encode text as a wiki URL
 * @param {any} title
 * @returns
 */
function wikiEncode(title) {
	if (!title) return "";

	let result = title;
	result = result.charAt(0).toUpperCase() + result.slice(1);

	result = encodeURIComponent(result);

	result = result
		.replace(/%5F|%20/g, "_")
		.replace(/%2F/g, "/")
		.replace(/%3A/g, ":")
		.replace(/%23/g, "#");

	return result;
}

function SetupTemplateData() {
	if (!TEMPLATES_DATA) {
		throw new EditorError("Could not find TEMPLATES_DATA in templates_json.js", "TEMPLATES_DATA_NOT_FOUND");
	}

	MAGICWORDS = TEMPLATES_DATA.MAGICWORDS;

	if (TEMPLATES_DATA.CATEGORIES?.length)
		MwCatRegex = new RegExp(`^(${TEMPLATES_DATA.CATEGORIES.join("|")})$`, "");

	if (TEMPLATES_DATA.LINKS?.length)
		MwLinksRegex = new RegExp(`^(${TEMPLATES_DATA.LINKS.join("|")})$`, "");

	if (TEMPLATES_DATA.FUNCTIONS?.length)
		MwFunctionsRegex = new RegExp(`^(${TEMPLATES_DATA.FUNCTIONS.join("|")})$`, "");

	if (TEMPLATES_DATA.OTHER_FUNCS?.length)
		MwOtherFuncsRegex = new RegExp(`^(${TEMPLATES_DATA.OTHER_FUNCS.join("|")})$`, "");

	if (MAGICWORDS?.magicwords?.length) {
		let DefaultReg = `^(${MAGICWORDS.magicwords.join("|")})$`;
		let TempSpaceReg = `^(${MAGICWORDS.tempmagicwords.join("|")})(${MAGICWORDS.spaces.join("|")})$`;
		let SubjectSpaceReg = `^(${MAGICWORDS.spaces.join("|")})(${MAGICWORDS.space_suffixes.join("|")})$`;

		MagicWordsTempRegex = new RegExp(`${DefaultReg}|${TempSpaceReg}|${SubjectSpaceReg}`, "");

		MagicWordsRegex = new RegExp(`__(${MAGICWORDS.magicwords_2.join("|")})__`, "g");

		MagicWordsAllowedRegex = new RegExp(`^\\b(${MAGICWORDS.AllowedValues.join("|")})\\b`, "");
	}

	if (TEMPLATES_DATA.TIMESTAMP?.location?.length && TEMPLATES_DATA.TIMESTAMP?.date?.length)
		TimeStampRegex = new RegExp(`^(${TEMPLATES_DATA.TIMESTAMP.location.join("|")})(${TEMPLATES_DATA.TIMESTAMP.date.join("|")})$`, "");

	ELEMTAGS = [...new Set(TEMPLATES_DATA.TAGS)].sort((a, b) => b.length - a.length);
	WIKITAGS = [...new Set(TEMPLATES_DATA.WIKITAGS)].sort((a, b) => b.length - a.length);
}
function getPageName() {
	const params = new URLSearchParams(window.location.search);
	if (params.has("title")) {
		return decodeURIComponent(params.get("title").replace(/_/g, " "));
	}
	return "Main Page";
}

/**
 * Creates a warning if another version of the editor is interfiering
 */
function DuplicateEditorWarn() {
	if (SUPPRESS_OUTDATED_EDITOR) return;
	let content = document.getElementById("bodyContent");

	const manifest = chrome.runtime.getManifest();
	const currentVersion = manifest.version;

	let message = document.createElement("div");
	message.className = "VDCEditorEx-WarningBox mw-message-box";
	message.innerHTML = `<p><strong>Duplicate editor detected:</strong> ${currentVersion} can not run because one of its versions is enabled.<br>Please disable the old version to run the new one.</p>`;

	let place = content.children[4];
	content.insertBefore(message, place.nextSibling);
}

/**
 * Creates a message box if the version on the site is newer than the manifest version
 */
async function WarnIfNewVersion() {
	if (SUPPRESS_OUTDATED_EDITOR) return;
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
		console.error(`New version available (${version}). Limited support for VDCEditorEx.`);

        let content = document.getElementById("bodyContent");

        let message = document.createElement("div");
        message.className = "VDCEditorEx-WarningBox mw-message-box";
        message.innerHTML = `<p>A new version of <a href="https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor" target="_blank">VDCEditor</a> (${version}) is available.<br><strong>VDCEditorEx has limited support and will no longer receive updates. Please switch to the latest version.</strong></p>`;

        let place = content.children[4];
        content.insertBefore(message, place.nextSibling);
    }
}
function isDeveloper() {
	const USERS = ["N0one", "Max34"];
	const userName = document.getElementById("pt-userpage").innerText;

    return USERS.includes(userName);
}


async function VDC_API(urlData = "") {
	const url = "https://developer.valvesoftware.com/w/api.php" + urlData;
	const response = await fetch(url);

	if (!response.ok) {
		throw new EditorError(`HTTP error ${response.status}`, "HTTP_FAILURE");
	}

	return await response.json();
}

/**
 * Returns the URL of an image in the extension's images directory
 * @param {string} name - The name of the image file
 * @return {string} - The full URL to the image
 */
function getImage(name) {
    return chrome.runtime.getURL(`images/${name}`);
}


function GenerateEditorFont() {
	if (!document.getElementById("VDCEditorEx-FontStyle")) {
		const fontURL = chrome.runtime.getURL("src/fonts/VDCEditor-Font.woff2");

		const style = document.createElement("style");
		style.id = "VDCEditorEx-FontStyle"
		style.textContent = `@font-face {
    font-family: "EditorFont";
    src: url("${fontURL}") format("woff2");
	unicode-range: U+0020, U+00A0, U+00B6;
}`;
		document.head.appendChild(style);
	}
}

function updateCSSVariableInStylesheet(varName, value) {
	const EditorSheet = document.getElementById("VDCEditorEx-Style");
	if (EditorSheet) {
		const sheet = EditorSheet.sheet;
		try {
			for (const rule of sheet.cssRules) {
				if (rule.selectorText === ":root")
					rule.style.setProperty(varName, value);
			}
		} catch (e) {
			console.warn(e);
		}
    }
}

/**
 * Adds a custom style for templates
 * @param {Function} callback when it adds the style (or not) fire a function
 */
function InitStyles(callback) {
    if (!document.getElementById("VDCEditorEx-Style")) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.id = "VDCEditorEx-Style";
        link.href = chrome.runtime.getURL('src/editor/style.css');
        link.onload = function () {
			updateCSSVariableInStylesheet('--resizer', `url("${getImage('toolbar/Resizer.png')}")`);
			updateCSSVariableInStylesheet('--TabSymbol-stopper', `url("${getImage('symbols/TabSymbol-stopper.png')}")`);
			updateCSSVariableInStylesheet('--transBG', `url("${getImage('symbols/checkerboard.png')}")`);
			GenerateEditorFont()

			chrome.storage.local.get("VDC-STYLE", (data) => {
				const styleTable = data["VDC-STYLE"];
				if (!styleTable) return;
				Object.entries(styleTable).forEach(([cssVar, cssValue]) => { updateCSSVariableInStylesheet(cssVar, cssValue); });
			});

            if (callback) callback();
        };
        document.head.appendChild(link);
    } else {
        if (callback) {
            callback();
        }
    }
}

async function CreatePanel(filename) {
	const response = await fetch(chrome.runtime.getURL(`src/editor/html/${filename}.html`));
	if (!response.ok) {
		throw new EditorError(`Failed to load ${filename}.html`, "PANEL_LOAD_ERROR");
	}

	let html = await response.text();
	const extURL = chrome.runtime.getURL("").replace(/\/$/, "");
	html = html.replace(/__EXT_ID__/g, extURL);
	html = html.replace(/_#([A-Za-z0-9-_]+)#_/g, (_, key) => { return getTranslation(key); });

	return html;
}

function Func_MoveBackToTextarea() { Textarea_Code.value = Div_Editor.textContent; }

function getCursorPosition(parent, node, offset, stat) {
	if (stat.done) return stat;

	let currentNode = null;

	if (parent.childNodes.length == 0)
		stat.pos += parent.textContent.length;
	else {
		for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
			currentNode = parent.childNodes[i];
			if (currentNode === node) {
				stat.pos += offset;
				stat.done = true;
				return stat;
			}
			else
				getCursorPosition(currentNode, node, offset, stat);
		}
	}
	return stat;
}

function setCursorPosition(parent, range, stat) {
	if (stat.done) return range;

	if (parent.childNodes.length == 0) {
		if (parent.textContent.length >= stat.pos) {
			range.setStart(parent, stat.pos);
			stat.done = true;
		}
		else
			stat.pos = stat.pos - parent.textContent.length;
	}
	else {
		for (let i = 0; i < parent.childNodes.length && !stat.done; i++) {
			currentNode = parent.childNodes[i];
			setCursorPosition(currentNode, range, stat);
		}
	}
	return range;
}

function Func_UpdateLineNumbering() {
    const Div_LineNumbers = document.getElementById("VDCEditorEx-LineNumbers");
	const lines = document.querySelectorAll('editor-line');

	var Spans_Nums = "";

	for (var i = 0; i < lines.length; i++)
		Spans_Nums += `<span style="min-height: ${lines[i].offsetHeight + 4}px;">${i + 1}</span>`;

	Div_LineNumbers.innerHTML = Spans_Nums;
}

function Func_UpdateSizes() {
	Func_UpdateLineNumbering();

	const pad = 5 + Div_LineNumbers.clientWidth + "px";

	const height = "max(" + (Div_Editor.clientHeight - 4) + "px, " + (SubMainTextArea.clientHeight - 4) + "px)";

	let padding = "5px";

	if (EditorSettings.SIDE_PANEL_OPEN) {
		padding = "300px";
	}

	if (EditorSettings.EDITOR_DIR_RTL) {
		[Div_Editor, Div_StylizedCode, Div_SameSelection, Div_CodeLines, Div_SearchCode].forEach(el => {
			el.style.paddingRight = pad;
			el.style.paddingLeft = padding;
		});
	} else {
		[Div_Editor, Div_StylizedCode, Div_SameSelection, Div_CodeLines, Div_SearchCode].forEach(el => {
			el.style.paddingRight = padding;
			el.style.paddingLeft = pad;
		});
	}

	Event_Editor_Dir(EditorSettings.EDITOR_DIR_RTL)

	Div_LineNumbers.style.height = height;
}

let saveHeightTimeout;

function saveHeight(height) {
	clearTimeout(saveHeightTimeout);
	saveHeightTimeout = setTimeout(() => {
		if (height != "")
			chrome.storage.local.set({ "VDC-Height": height });
	}, 150);
}

function Func_ResizeEvent() {
	if (EditorSettings.ScrollAfterLastLine) {
		const fontSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--font-size')) || 14;
		Div_Editor.style.paddingBottom = `min(${SubMainTextArea.clientHeight - fontSize * 1.5 - 2}px, calc(100vh - ${fontSize * 1.5 + 4}px))`;
	}
	else
		Div_Editor.style.paddingBottom = "2px";

	Func_UpdateSizes();

	saveHeight(SubMainTextArea.style.height)
}

function capitalizeFirst(str) {
	if (!str) return str;
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBar_Info(elementId, token, ...args) {
	const element = document.getElementById(elementId);
	if (!element) return;

	element.textContent = getTranslation(token, ...args);
}

function encodeHTML(str) {
	return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
	
function Func_SelectionChange()
{
	try {
		if (EditorSettings.SameSelection && window.getSelection().focusNode.parentNode.id == "VDCEditorEx-Editor") {
			if (window.getSelection().toString().length !== 0) {
				const selectedText = window.getSelection().toString();

				const raw = Div_Editor.textContent || "";
				let regex;

				try {
					const escaped = selectedText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
					regex = new RegExp(escaped, "gm");
				} catch (e) {
					Div_SameSelection.innerHTML = "";
					return;
				}

				let lastIndex = 0;
				let result = "";
				let match;

				while ((match = regex.exec(raw)) !== null) {
					result += encodeHTML(raw.slice(lastIndex, match.index));
					result += `<span class="VDCEditorEx-SameAsSelected">${encodeHTML(match[0])}</span>`;
					lastIndex = match.index + match[0].length;
					if (match.index === regex.lastIndex) regex.lastIndex++;
				}

				result += encodeHTML(raw.slice(lastIndex));

				Div_SameSelection.innerHTML = result;

			} else {
				Div_SameSelection.innerHTML = "";
			}
		}
		else
			Div_SameSelection.innerHTML = "";

		const SameSelectionCount = document.getElementById('VDCEditorEx-SameSelection').querySelectorAll('.VDCEditorEx-SameAsSelected');

		StatusBar_Info("StatusBar-Found", "StatusBar-Found", SameSelectionCount.length);

		setTimeout(() => {
			const sel = window.getSelection();
			const node = sel.focusNode;
			const offset = sel.focusOffset;
			const pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

			if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
				StatusBar_Info("StatusBar-Pos", "StatusBar-Position", Math.min(pos.pos, Div_Editor.textContent.length));
			else
				StatusBar_Info("StatusBar-Pos", "StatusBar-Position", Math.min(pos.pos, Div_Editor.textContent.length - 1));
		}, 0);
	}
	catch (e) { }
}

function getSelectedTextInEditor() {
	if (!Div_Editor) return "";

	const sel = window.getSelection();
	if (!sel.rangeCount) return "";

	const range = sel.getRangeAt(0);

	if (!Div_Editor.contains(range.commonAncestorContainer)) return "";

	return sel.toString();
}

function OnKeyDown(e) {
	const Div_Editor = document.getElementById("VDCEditorEx-Editor");


	switch (e.keyCode) {
		case 90: // Z
			if (e.ctrlKey)
				setTimeout(() => { Func_SelectionChange() }, 0);
			return true;

		case 88: // X
			if (e.ctrlKey) {
				var sel = window.getSelection();

				if (BROWSER_TYPE != "Firefox" && sel.toString().length == 0) {
					var node = sel.focusNode;
					var offset = sel.focusOffset;
					var pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

					const Lines = Div_Editor.textContent.split('\n');
					var TextAmount = 0;

					for (var i = 0; i < Lines.length; i++) {
						TextAmount += Lines[i].length;

						if (TextAmount >= pos.pos) {
							Func_SelectCodePart(TextAmount - Lines[i].length, TextAmount + 1);
							break;
						}

						TextAmount++;
					}
				}

				setTimeout(() => { Func_SelectionChange() }, 0);
			}
			return true;

		case 68: // D
			if (e.ctrlKey) {
				e.preventDefault();

				var sel = window.getSelection();
				var node = sel.focusNode;
				var offset = sel.focusOffset;
				var pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

				const Lines = Div_Editor.textContent.split('\n');
				var TextAmount = 0;

				for (var i = 0; i < Lines.length; i++) {
					TextAmount += Lines[i].length;

					if (TextAmount >= pos.pos) {
						if (sel == 0) {
							var CurrentLine = Div_Editor.textContent.substring(TextAmount - Lines[i].length, TextAmount);

							CurrentLine = encodeHTML(CurrentLine);

							sel.removeAllRanges();
							const range = setCursorPosition(Div_Editor, document.createRange(), {
								pos: TextAmount,
								done: false,
							});

							range.collapse(true);
							sel.addRange(range);

							document.execCommand('insertHTML', false, '\n' + CurrentLine);
						}
						else {
							var string = sel.toString();

							string = encodeHTML(string);

							sel.collapseToEnd();
							document.execCommand('insertHTML', false, string);
						}

						return false;
					}

					TextAmount++;
				}
			}
			return true;

		case 8: // Backspace
			setTimeout(() => { Func_SelectionChange() }, 0);
			return true;

		case 9: // Tab
			e.preventDefault();
			document.execCommand('insertHTML', false, '\t');
			return true;

		case 13: // Enter
			e.preventDefault();

			var sel = window.getSelection();
			var node = sel.focusNode;
			var offset = sel.focusOffset;
			var pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

			const Lines = Div_Editor.textContent.split('\n');
			var TextAmount = 0;
			var Paddings = '';

			for (var i = 0; i < Lines.length; i++) {
				TextAmount += Lines[i].length;

				if (TextAmount >= pos.pos) {
					TextAmount -= Lines[i].length;
					var CurrentLine = Div_Editor.textContent.substring(TextAmount, pos.pos)
					const t = CurrentLine.length;

					for (var l = 0; l < t; l++) {
						if (CurrentLine.charAt(0) == '\t') {
							Paddings += '\t';
							CurrentLine = CurrentLine.substring(1, CurrentLine.length);
						}
						else if (CurrentLine.charAt(0) == ' ') {
							Paddings += ' ';
							CurrentLine = CurrentLine.substring(1, CurrentLine.length);
						}
						else
							break;
					}

					break;
				}

				TextAmount++;
			}

			var add = "";

			if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n') {
				sel = window.getSelection();
				node = sel.focusNode;
				offset = sel.focusOffset;
				pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

				if (Div_Editor.textContent.length == pos.pos)
					add = '\n';
			}

			document.execCommand('insertHTML', false, '\n' + add);

			// Inserting an indent at the beginning of a line is done separately,
			// so that when undoing actions, this indent is canceled first.
			// And checking for an empty indent is needed so that this insertHTML is not initiated
			// every time Enter is pressed, otherwise it will create an empty undo/redo for each line
			if (Paddings.length != 0)
				document.execCommand('insertHTML', false, Paddings);
			return true;

		case 70: // F
			if (e.ctrlKey) {
				e.preventDefault();


                SearchPanel.style.display = "block";
				const input = document.getElementById("VDCEditorEx-Search");
				if (input) {
					const sel = getSelectedTextInEditor();
					input.value = sel;
					input.textContent = sel;
					input.focus();

					console.log(sel)

					const SearchInputCaseIns = document.getElementById("VDCEditorEx-Search-Ins");
					const SearchInputMode = document.getElementById("VDCEditorEx-Search-Mode");
					EditorSearch(sel, SearchInputCaseIns.getAttribute("checked"), SearchInputMode.value, false);
				}
			}
			return true;

		default:
			return true;
	}
};

function highlightMatchingBracket() {
	StatusBar_Info("StatusBar-Found", "StatusBar-Found", 0);

	setTimeout(() => {
		const sel = window.getSelection();
		const node = sel.focusNode;
		const offset = sel.focusOffset;
		const pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

		if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
			StatusBar_Info("StatusBar-Pos", "StatusBar-Position", Math.min(pos.pos, Div_Editor.textContent.length));
		else
			StatusBar_Info("StatusBar-Pos", "StatusBar-Position", Math.min(pos.pos, Div_Editor.textContent.length - 1));
	}, 0);

	const sel = window.getSelection();
	if (!sel.rangeCount || !Div_Editor.contains(sel.focusNode)) return;

	const selectedText = sel.toString();
	if (selectedText.length !== 1 || !['{', '}', '[', ']', '(', ')'].includes(selectedText)) return;

	const raw = Div_Editor.textContent;

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

	if (matchPos !== -1) {
		let html = '';
		for (let i = 0; i < raw.length; i++) {
			let ch = encodeHTML(raw[i]);
			if (i === cursorOffset || i === matchPos) {
				html += `<span class="VDCEditorEx-SameAsSelected">${ch}</span>`;
			} else {
				html += ch;
			}
		}
		Div_SameSelection.innerHTML = html;
	} else {
		Div_SameSelection.innerText = raw;
	}
}

let searchMsgTimeout = null; // keep one global reference

function SearchMsg(message, type, clearAfter = 5000) {
	if (!message) return;

	let color = "inherit";

	switch (type) {
		case "good":
		case 1:
			color = "#8bc34a";
			break;
		case "bad":
		case 0:
		default:
			color = "#c34a4a";
			break;
	}

	SearchInfoDlg.innerHTML = `<span style="color: ${color}">${message}</span>`;

	if (searchMsgTimeout) {
		clearTimeout(searchMsgTimeout);
		searchMsgTimeout = null;
	}

	if (clearAfter > 0) {
		searchMsgTimeout = setTimeout(() => {
			if (SearchInfoDlg.textContent.includes(message)) {
				SearchInfoDlg.innerHTML = "";
			}
			searchMsgTimeout = null;
		}, clearAfter);
	}
}

let findMatches = [];
let currentIndex = -1;

function EditorFindNext(text, caseIns, mode) {
	if (!text) {
		SearchMsg(getTranslation("Search-Msg-NoVal"), 0);
		Div_SearchCode.innerHTML = "";
		return;
	}

	const rawContent = Div_Editor.textContent || "";
	if (!rawContent) return;

	const flags = caseIns === "true" ? "gmi" : "gm";
	let regex;

	try {
		if (mode === "regex") {
			regex = new RegExp(text, flags);
		} else {
			regex = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
		}
	} catch (err) {
		SearchMsg(getTranslation("Search-Msg-InvalidRegex"), 0);
		return;
	}

	if (findMatches.length === 0 || findMatches[0].pattern !== text) {
		findMatches = [];
		let match;
		while ((match = regex.exec(rawContent)) !== null) {
			findMatches.push({
				start: match.index,
				end: match.index + match[0].length,
				text: match[0],
				pattern: text
			});
			if (match[0].length === 0) regex.lastIndex++;
		}
		currentIndex = -1;
	}

	if (findMatches.length === 0) {
		SearchMsg(getTranslation("Search-Msg-NoMatches"), 0);
		Div_SearchCode.innerHTML = "";
		return;
	}

	currentIndex = (currentIndex + 1) % findMatches.length;
	const match = findMatches[currentIndex];

	const before = encodeHTML(rawContent.slice(0, match.start));
	const mid = `<span class="VDCEditorEx-SameAsSelected">${encodeHTML(match.text)}</span>`;
	const after = encodeHTML(rawContent.slice(match.end));

	Div_SearchCode.innerHTML = before + mid + after;

	const span = Div_SearchCode.querySelector(".VDCEditorEx-SameAsSelected");
	if (span) {
		const offsetTop = span.offsetTop;
		const targetScroll = offsetTop - SubMainTextArea.clientHeight / 2;

		SubMainTextArea.scrollTo({
			top: targetScroll,
			behavior: "instant"
		});
	}

	SearchMsg(getTranslation("Search-Msg-MatchIdx", currentIndex + 1, findMatches.length), 1);
}

function EditorSearch(text, caseIns, mode) {
	if (!text) {
		Div_SearchCode.innerHTML = "";
		return;
	}

	const raw = Div_Editor.textContent || "";
	const flags = caseIns === "true" ? "gmi" : "gm";
	let regex;

	try {
		if (mode === "regex") {
			regex = new RegExp(text, flags);
		} else {
			const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			regex = new RegExp(escaped, flags);
		}
	} catch {
		SearchMsg(getTranslation("Search-Msg-InvalidRegex"), 0);
		Div_SearchCode.innerHTML = "";
		return;
	}

	let lastIndex = 0;
	let result = "";
	let match;

	while ((match = regex.exec(raw)) !== null) {
		result += encodeHTML(raw.slice(lastIndex, match.index));
		result += `<span class="VDCEditorEx-SameAsSelected">${encodeHTML(match[0])}</span>`;
		lastIndex = match.index + match[0].length;
		if (match.index === regex.lastIndex) regex.lastIndex++;
	}

	result += encodeHTML(raw.slice(lastIndex));

	Div_SearchCode.innerHTML = result;

	const matches = [...raw.matchAll(regex)];
	if (matches.length > 0) {
		if (matches.length > 1) 
			SearchMsg(getTranslation("Search-Msg-Found2", matches.length), 1);
		else
			SearchMsg(getTranslation("Search-Msg-Found", matches.length), 1);
	} else {
		SearchMsg(getTranslation("Search-Msg-NoMatches"), 0);
	}
}

function EditorReplace(text, replace, caseIns, mode, UseGlobal) {
	if (!text) return;

	let content = Div_Editor.textContent || "";
	let flags = (UseGlobal ? "g" : "") + (caseIns === "true" ? "i" : "");

	try {
		let regex;
		if (mode === "regex") {
			regex = new RegExp(text, flags);
		} else {
			const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
			regex = new RegExp(escaped, flags);
		}

		content = content.replace(regex, replace);

		Div_Editor.textContent = content;
		EditorFormatter();
	} catch (err) {
		SearchMsg(getTranslation("Search-Msg-InvalidRegex"), 0);
		console.warn("Replacement failed due to invalid regex:", err);
	}
}


function toggleButton(button, editorBoolKey) {
	if (!editorBoolKey) {
		throw new EditorError("[toggleButton]: Failed to recieve a key to toggle", "BUTTON_FAILURE")
	}

	let BoolValueKey = editorBoolKey?.replace(/^VDC-T-|^VDC-S-/, "");

	const isChecked = button.getAttribute("checked") === "true";
	const newChecked = !isChecked;

	button.setAttribute("checked", newChecked ? "true" : "false");
	EditorSettings[BoolValueKey] = newChecked;

	chrome.storage.local.set({ [editorBoolKey]: newChecked });
}

function alphaToHex(alphaPercent) {
	const a = Math.round(alphaPercent / 100 * 255);
	return a.toString(16).padStart(2, "0");
}

function hexAlphaToPercent(hex) {
	const alphaHex = hex.length === 9 ? hex.slice(7, 9) : hex;
	const alphaDecimal = parseInt(alphaHex, 16);
	console.log(Math.floor((alphaDecimal / 255) * 100))
	return Math.floor((alphaDecimal / 255) * 100);
}

function cssColorToHex(color) {
	const ctx = document.createElement("canvas").getContext("2d");
	ctx.fillStyle = color;
	const computed = ctx.fillStyle;

	if (computed.startsWith("rgb")) {
		const nums = computed.match(/\d+/g).map(Number);
		return "#" + nums.slice(0, 3).map(n => n.toString(16).padStart(2, "0")).join("");
	}
	return computed; // already hex
}

function NameToTag(str) {
    if (typeof str === "string")
        return str.toLowerCase().replace(/\s+/g, '').replace(/:/g, '-')
    else
        return "__NOT_A_STRING__"
}

function Event_OnLoad() {
	chrome.storage.local.get(null, (items) => {
		for (const [key, value] of Object.entries(items)) {
			if (key.startsWith("VDC-T-") || key.startsWith("VDC-S-")) {
				const BoolValueKey = key.replace(/^VDC-T-|^VDC-S-/, "");
				EditorSettings[BoolValueKey] = value;
			} else if (key == "VDC-S-WordWrap" && value == false) {
					SubMainTextArea.style.overflowX = null;
			}
		}
	});
}

function Event_OnLocalStorageLoad() {
	chrome.storage.local.get(null, (items) => {
		if (!items || Object.keys(items).length === 0) {
			return;
		}

		for (const [key, value] of Object.entries(items)) {
			if ((key.startsWith("VDC-T-") || key.startsWith("VDC-S-")) && key != "VDC-STYLE") {
				const BoolValueKey = key.replace(/^VDC-T-|^VDC-S-/, "");

				EditorSettings[BoolValueKey] = value;

				const button = document.querySelector(`[data-vdcedex-t-setting="${key}"]`);
				const button2 = document.querySelector(`[data-vdcedex-s-setting="${key}"]`);

				if (button) {
					button.setAttribute("checked", value ? "true" : "false");
				} else if (button2) {
					button2.setAttribute("checked", value ? "true" : "false");
				}
			} else if (key === "VDC-STYLE") {
				Object.entries(value).forEach(([cssVar, cssValue]) => {
					const button = document.querySelector(`[data-VDCEdEx-S-style="${cssVar}"]`);

					if (button) {
						button.value = cssValue;
					} else {
						console.warn(`No button found for ${cssVar}`);
					}
				});
			} else if (key === "VDC-Height" && value != "500px") {
				SubMainTextArea.style.height = value
			}
		}
	});

	Event_OnUDTLocalStorageLoad();
}

async function pageExists(title) {
	const params = `?action=query&titles=${wikiEncode(title)}&format=json&origin=*`;
	const data = await VDC_API(params);

	if (!data?.query) return false;

	if (data.query.interwiki) return 2;

	const pages = data.query.pages;
	const pageId = Object.keys(pages)[0];
	return pageId !== "-1"; // -1 means missing
}

async function getMessageTranslation(messageKey) {
	const params = `?action=query&meta=allmessages&ammessages=${encodeURIComponent(messageKey)}&format=json&origin=*`;
	const data = await VDC_API(params);

	const allmessages = data.query?.allmessages;
	if (!allmessages || !allmessages.length) return null;

	// allmessages is an array, usually with 1 item if you queried a single key
	const msgObj = allmessages[0];
	return msgObj ? msgObj['*'] : null;
}

/**
 * Recursively color braced link block if they exist or not
 * @param {string} text - the text to colorize
 * @returns {Promise<string>} - HTML with colored link braces
 */
async function AsyncSummaryColorLinks(text) {
	const blocks = findAllLinkBlocks(text);
	if (!blocks.length) return text;

	let result = '';
	let lastIndex = 0;

	async function isValid(value, linkName, linkShow) {
		const encodedName = wikiEncode(linkName);

		if (value == true) {
			return `<a href="/wiki/${encodedName}" title="${linkName}">${linkShow || linkName}</a>`;

		} else if (value == false) {
			let title = await getMessageTranslation("red-link-title");
			let trueTitle = title.replace("$1", linkName)

			// Although wiki just uses the default red link, this is a bit (probably not) helpful if someone wants to upload a file.
			if (linkName.startsWith("File:")) {
				return `<a href="/w/index.php?title=Special:Upload&wpDestFile=${wikiEncode(linkName)}" class="new" title="${trueTitle}">${linkShow || linkName}</a>`;
			}

			return `<a href="/w/index.php?title=${encodedName}&action=edit&redlink=1" class="new" title="${trueTitle}">${linkShow || linkName}</a>`;
		} else if (value == 2) { // interwiki link
			let [prefix, ...restParts] = linkName.split(":");
			const pagePart = restParts.join(":");
			const encodedPage = wikiEncode(pagePart);

			let linkType;

			switch (prefix.toUpperCase()) {
				case "W":
				case "WP": linkType = `http://en.wikipedia.org/wiki/${encodedPage}`; break;
				case "MW": linkType = `http://www.mediawiki.org/wiki/${encodedPage}`; break;
				case "M": linkType = `http://meta.wikipedia.org/wiki/${encodedPage}`; break;
				case "GOOGLE": linkType = `http://www.google.com/search?q=${encodeURIComponent(pagePart)}`; break;
				default: linkType = "__PENDING__";
			}

			if (linkType == "__PENDING__") // Prevent the link from turning to blue and for the user to think its a working link
				return `<span style="color: gray;" title="${linkName}">${linkShow || linkName}</span>`;

			return `<a href="${linkType}" class="extiw" title="${linkName}">${linkShow || linkName}</a>`;
		} else {
			return `<span style="color: gray;" title="${linkName}">${linkShow || linkName}</span>`;
		}
	}

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		if (block.start < lastIndex) continue;

		result += text.slice(lastIndex, block.start);

		const inner = block.content.slice(block.type, -block.type);
		const [namePart, linkShow = ""] = inner.split("|");
		let linkName = capitalizeFirst(block.name);

		let wrapped;
		if (block.type === 2) {
			if (linkName.startsWith("Special:Contributions/")) {
				wrapped = await isValid(true, linkName, linkShow);
			} else {
				const exists = await pageExists(linkName);
				wrapped = await isValid(exists, linkName, linkShow);		
			}		
		} else {
			if (block.content == "__LINK__")
				wrapped = "[[]]"
			else
				wrapped = block.content;
		}

		result += wrapped;
		lastIndex = block.end;
	}

	result += text.slice(lastIndex);
	return result;
}
/**
 * Recursively color braced link block to a temporary color
 * @param {string} text - the text to colorize
 * @returns {string} - HTML with colored link braces
 */
function SummaryColorLinks(text) {
	const blocks = findAllLinkBlocks(text);
	if (!blocks.length) return text;

	let result = '';
	let lastIndex = 0;

	for (let i = 0; i < blocks.length; i++) {
		const block = blocks[i];
		if (block.start < lastIndex) continue;

		result += text.slice(lastIndex, block.start);

		const inner = block.content.slice(block.type, -block.type);
		const [namePart, linkShow = ""] = inner.split("|");
		let linkName = capitalizeFirst(block.name);

		let wrapped;
		if (block.type === 2) {
			wrapped = `<span style="color: gray;" title="${linkName}">${linkShow || linkName}</span>`;
		} else {
			if (block.content == "__LINK__")
				wrapped = "[[]]"
			else
				wrapped = block.content;
		}

		result += wrapped;
		lastIndex = block.end;
	}

	result += text.slice(lastIndex);
	return result;
}

function CreateUDT(blockData) {
	let style = document.getElementById("VDCEditorEx-UDT-Styles");
	if (!style) {
		style = document.createElement("style");
		style.id = "VDCEditorEx-UDT-Styles";
		document.head.appendChild(style);
	}

	let css = "";

	Object.values(blockData).forEach(block => {
		const names = Object.values(block.NAMES);
		if (!names.length) return;

		UDT_ALLNAMES.push(...names)
		const shortest = names.reduce((a, b) => a.length <= b.length ? a : b);

		const tagName = "udt-" + shortest.toLowerCase().replace(/:/g, "-").replace(/\s+/g, "");

		let styleRule = `color: ${block.TemplateColor || "inherit"};`;

		if (block.TemplateBackgroundColor)
			styleRule += `background: ${block.TemplateBackgroundColor}${block.TemplateBGTrans || ''};`;


		styleRule += "border-radius: 4px;";

		names.forEach(name => {
			UDT_SHORTEST.set(name, NameToTag(shortest));
		});

		css += `${tagName} { ${styleRule} }\n`;
	});

	chrome.storage.local.set({ "VDC-UDT-CSS": css })

	chrome.storage.local.set({ "VDC-UDT-DAT": { "SHORTEST": Object.fromEntries(UDT_SHORTEST), "ALLNAMES": UDT_ALLNAMES } })
	style.textContent = css;
}


/**
 * Sets the editor to LTR or RTL.
 * @param {boolean} DIR_RTL
 */
function Event_Editor_Dir(DIR_RTL) {

	MainEditorWrapper.setAttribute("dir", DIR_RTL ? "rtl" : "ltr")

	SearchPanel.style.left = null;
	EditorSidePanel.style.left = null;
	Div_LineNumbers.style.left = null;
	SearchPanel.style.right = null;
	EditorSidePanel.style.right = null;
	Div_LineNumbers.style.right = null;

	if (DIR_RTL) {
		SearchPanel.style.left = "15px";
		EditorSidePanel.style.left = "15px";
		Div_LineNumbers.style.right = "0";		
	} else {
		SearchPanel.style.right = "15px";
		EditorSidePanel.style.right = "15px";
		Div_LineNumbers.style.left = "0";	
	}
}
