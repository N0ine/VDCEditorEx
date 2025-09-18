//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

var PAGE_NAME = "Main Page";

if (document.body.querySelector('form textarea#wpTextbox1')) {
    const IntervalId = setInterval(() => {
        if (document.body.querySelector(".wikiEditor-ui")) {
            clearInterval(IntervalId);
            if (document.getElementById("VDCEditorEx-Loaded")) {
                DuplicateEditorWarn();
                return;
            }

            PAGE_NAME = wikiEncode(getPageName());

            loadTranslations();

            Event_OnUDTLoad();
            Event_OnLoad();

            InitStyles(() => {
                SetupTemplateData();
                WarnIfNewVersion();
                CreateToolbar();
                EditorMain();
            });

            const manifest = chrome.runtime.getManifest();
            const currentVersion = manifest.version;

            const marker = document.createElement("span");
            marker.id = "VDCEditorEx-Loaded";
            marker.style.display = "none";
            marker.dataset.version = currentVersion;
            document.body.appendChild(marker);
        }
    }, 170);
}

// Initializes the UI first, then it will call the actual main function
async function EditorMain() {
    MainEditor = document.getElementsByClassName("wikiEditor-ui")[0];
    SubMainToolBar = document.getElementById('wikiEditor-ui-toolbar');
    SubMainTextArea = document.querySelector('.wikiEditor-ui-text');
    SubMainBottom = document.querySelector('.wikiEditor-ui-bottom');
    Textarea_Code = document.getElementById('wpTextbox1');

    MainEditorWrapper = document.createElement('div');
    MainEditorWrapper.id = "VDCEditorEx-MainWrapper";

    let ErrorDlg = await CreateErrorDialog();

    const StatusBar = document.createElement('div');
    StatusBar.id = "VDCEditorEx-StatusBar";
    StatusBar.style.fontSize = "11px";
    StatusBar.innerHTML = await CreatePanel("statusbar");

    MainEditor.parentNode.insertBefore(MainEditorWrapper, MainEditor);
    MainEditorWrapper.append(ErrorDlg, MainEditor, document.querySelector('.wikiEditor-ui-clear'), StatusBar, document.querySelector('.editOptions'));

    //================================================================

    const createEditableDiv = (id) => {
        const div = document.createElement('div');
        div.id = id;
        div.setAttribute("contenteditable", "true");
        div.setAttribute("tabindex", "-1");
        div.setAttribute("translate", "no");
        div.setAttribute("spellcheck", "false");
        div.setAttribute("autocorrect", "off");
        div.setAttribute("autocapitalize", "off");
        return div;
    };

    Div_SearchCode = createEditableDiv("VDCEditorEx-SearchCode");
    Div_SameSelection = createEditableDiv("VDCEditorEx-SameSelection");
    Div_CodeLines = createEditableDiv("VDCEditorEx-CodeLines");
    Div_StylizedCode = createEditableDiv("VDCEditorEx-StylizedCode");

    SettingsPanel = document.createElement('div');
    SettingsPanel.id = "VDCEditorEx-SettingsPanel";
    SettingsPanel.style.display = "none";
    SettingsPanel.innerHTML = await CreatePanel("settingsPanel");

    SearchPanel = document.createElement("div");
    SearchPanel.id = "VDCEditorEx-SearchPanel";
    SearchPanel.classList.add("VDCEditorEx-SearchDlg");
    SearchPanel.style.display = "none";
    SearchPanel.style.right = "15px";
    SearchPanel.innerHTML = await CreatePanel("searchPanel");

    SubMainTextArea.append(Div_SearchCode, Div_SameSelection, Div_CodeLines, Div_StylizedCode);

    Div_Editor = createEditableDiv("VDCEditorEx-Editor");
    Div_LineNumbers = document.createElement('div');
    Div_LineNumbers.id = "VDCEditorEx-LineNumbers";
    Div_LineNumbers.style.left = "0";
    Div_LineNumbers.style.textAlign = "right";
    Div_LineNumbers.style.borderRight = "1px solid";

    EditorSidePanel = document.createElement("div");
    EditorSidePanel.id = "VDCEditorEx-SidePanel";
    EditorSidePanel.style.right = "15px";
    EditorSidePanel.style.display = "none";
    EditorSidePanel.innerHTML = "";

    SubMainTextArea.append(Div_Editor, Div_LineNumbers);
    SubMainBottom.append(SettingsPanel, SearchPanel, EditorSidePanel);

    Div_Editor.textContent = Div_StylizedCode.textContent = Textarea_Code.value + '\n';

    InitTextEditorLogic(); 
}

async function InitTextEditorLogic() {
    SearchPanelBtn = document.getElementById('VDCEditorEx-SearchPanelBtn');
    const SearchInputFind = document.getElementById("VDCEditorEx-Search");
    const SearchInputReplace = document.getElementById("VDCEditorEx-Replace");
    const SearchInputCaseIns = document.getElementById("VDCEditorEx-Search-Ins");
    const SearchInputMode = document.getElementById("VDCEditorEx-Search-Mode");

    const SearchClear = document.getElementById("VDCEditorEx-SearchClearBtn");
    const SearchNext = document.getElementById("VDCEditorEx-Search-Next");
    const ReplaceNext = document.getElementById("VDCEditorEx-Search-RepNext");
    const ReplaceAll = document.getElementById("VDCEditorEx-Search-RepAll");

    SearchInfoDlg = document.getElementById("VDCEditorEx-SearchDlg-Info");

    let SearchMode = "normal";
    let ReplaceValue = "";

    SearchInputMode.addEventListener("change", (e) => {
        e.preventDefault();
        SearchMode = SearchInputMode.value;
        EditorSearch(SearchInputFind.value, SearchInputCaseIns.getAttribute("checked"), SearchInputMode.value, false);
    });

    SearchInputFind.addEventListener('input', (e) => {
        e.preventDefault()
        EditorSearch(SearchInputFind.value, SearchInputCaseIns.getAttribute("checked"), SearchMode);
    });

    SearchInputReplace.addEventListener('input', (e) => { e.preventDefault();  ReplaceValue = SearchInputReplace.value; });

    SearchInputFind.addEventListener('keydown', (e) => { if (e.key === "Enter") { e.preventDefault(); SearchInputFind.blur(); } });
    SearchInputReplace.addEventListener('keydown', (e) => { if (e.key === "Enter") { e.preventDefault(); SearchInputReplace.blur(); } });

    SearchClear.addEventListener('click', (e) => {
        e.preventDefault()
        SearchInputFind.value = "";
        ReplaceValue = "";
        SearchInputReplace.value = "";
        EditorSearch("", "", false, "normal");
    });

    SearchInputCaseIns.addEventListener('click', (e) => {
        e.preventDefault()
        if (SearchInputCaseIns.getAttribute("checked") == "false")
            SearchInputCaseIns.setAttribute("checked", "true");
        else 
            SearchInputCaseIns.setAttribute("checked", "false");    

        EditorSearch(SearchInputFind.value, SearchInputCaseIns.getAttribute("checked"), SearchMode);
    });

    SearchNext.addEventListener('click', (e) => {
        e.preventDefault()
        EditorFindNext(SearchInputFind.value, SearchInputCaseIns.getAttribute("checked"), SearchMode);
    });

    ReplaceNext.addEventListener('click', (e) => {
        e.preventDefault()
        EditorReplace(SearchInputFind.value, ReplaceValue, SearchInputCaseIns.getAttribute("checked"), SearchMode, false);
        EditorSearch(SearchInputFind.value, SearchInputCaseIns.getAttribute("checked"), SearchMode);
    });

    ReplaceAll.addEventListener('click', (e) => {
        e.preventDefault()
        EditorReplace(SearchInputFind.value, ReplaceValue, SearchInputCaseIns.getAttribute("checked"), SearchMode, true);
        EditorSearch(SearchInputFind.value, SearchInputCaseIns.getAttribute("checked"), SearchMode);
    });

    SettingsPanelBtn = document.getElementById('VDCEditorEx-SettingsPanelBtn');
    const listener = document.getElementsByClassName("wikiEditor-ui-text")[0];

    MainSettings();
    SettingsPanelBtn.onclick = ToggleSettingsPanel;
    SearchPanelBtn.onclick = ToggleSearchPanel;

    document.getElementById("VDC-T-ReplaceLinks").addEventListener('click', Func_ReplaceLinks);

    new ResizeObserver(entry => { Func_ResizeEvent(); }).observe(SubMainTextArea);

    EditorFormatter();

    const EditOptions = document.querySelector("div.editOptions");
    const first = EditOptions.firstElementChild;

    const LivePreviewInfo = document.createElement("div");
    LivePreviewInfo.style.marginBottom = "5px";
    LivePreviewInfo.style.marginTop = "-5px";
    LivePreviewInfo.style.fontSize = "11px";
    LivePreviewInfo.style.lineHeight = "1.26";
    LivePreviewInfo.innerHTML = getTranslation("Info-LivePreview");

    if (!document.querySelector("div.mw-summary-preview")) {
        SummaryPreview = document.createElement("div");
        SummaryPreview.classList.add("mw-summary-preview");

        SummaryText = document.createElement("span");
        SummaryText.classList.add("comment");
        SummaryText.innerHTML = "()";

        previewText = await getMessageTranslation("summary-preview") || "Preview of edit summary:";

        SummaryPreview.append(previewText + " ", SummaryText, LivePreviewInfo);


        if (first && EditorSettings.ShowLiveSummary) {
            EditOptions.insertBefore(LivePreviewInfo, first.nextSibling);
            EditOptions.insertBefore(SummaryPreview, first.nextSibling);
        }
    } else {
        SummaryPreview = document.querySelector("div.mw-summary-preview");
        SummaryText = document.querySelector("span.comment");

        if (first && EditorSettings.ShowLiveSummary)
            EditOptions.insertBefore(LivePreviewInfo, first.nextSibling.nextSibling);
    }

    document.querySelector('#VDCEditorEx-Editor').onkeydown = (e) => OnKeyDown(e);

    document.getElementById('wpSave').onclick = Func_MoveBackToTextarea;
    document.getElementById('wpPreview').onclick = Func_MoveBackToTextarea;
    document.getElementById('wpDiff').onclick = Func_MoveBackToTextarea;

    listener.onkeydown = function (ev) {
        
        const sel = window.getSelection();
        if (!sel?.focusNode) return;

        const { focusNode, focusOffset } = sel;
        const pos = getCursorPosition(Div_Editor, focusNode, focusOffset, { pos: 0, done: false });
        const caretPos = Math.min(pos.pos, Div_Editor.textContent.length);

        SB_Pos(caretPos);
    };

    document.addEventListener("selectionchange", Func_SelectionChange);

    Div_Editor.addEventListener('input', () => {

        if (Div_Editor.textContent.length == 0)
            Div_Editor.innerHTML = '\n';

        Div_SearchCode.innerHTML = "";
        EditorFormatter();
    });

    Div_Editor.addEventListener('paste', function (e) {
        e.preventDefault();

        let text = (e.originalEvent || e).clipboardData.getData('text/plain');

        text = text.replaceAll("&", "&amp;");
        text = text.replaceAll("<", '&lt;');
        text = text.replaceAll(">", '&gt;');

        Div_SearchCode.innerHTML = "";

        document.execCommand("insertHTML", false, text);
    });


    Div_Editor.addEventListener('drop', function (e) {
        e.preventDefault();

        let text = e.dataTransfer.getData('text/plain');

        text = text.replaceAll("&", "&amp;");
        text = text.replaceAll("<", '&lt;');
        text = text.replaceAll(">", '&gt;');

        let range = document.caretRangeFromPoint(e.clientX, e.clientY);
        range.deleteContents();

        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        Div_SearchCode.innerHTML = "";

        document.execCommand("insertHTML", false, text);
    });

    if (PAGE_NAME.endsWith("/strings")) {
        const StringsCounterButton = document.getElementById("VDC-T-StringsCounter");

        if (EditorSettings.MwStringsCounter)
            StringsCounterButton.style.display = "flex";

        StringsCounterButton.addEventListener('click', (e) => {
            e.preventDefault();
            EditorSettings.SIDE_PANEL_OPEN = true;
            StringCounter();
            EditorSidePanel.style.display = "block";
        })
        
    }

    // Idk why it wont fire on the proxy, but this works, but im lazy as of now so... im leaving it like this
    if (EditorSettings.TemplatePageTab) {
        TemplatePage_addEventListener();
    }
    else {
        TemplatePage_removeEventListener();
    }

    const whiteSpaceValue = EditorSettings.WordWrap ? "break-spaces" : "pre";
    [Div_StylizedCode, Div_SameSelection, Div_CodeLines, Div_Editor].forEach(el => {
        el.style.whiteSpace = whiteSpaceValue;
    });
    Div_Editor.style.minWidth = EditorSettings.WordWrap ? "unset" : "fit-content";
    Div_Editor.style.paddingRight = EditorSettings.WordWrap ? "5px" : "128px";

    // The editor probably did not load everything
    setTimeout(Event_OnLocalStorageLoad, 150);

    if (SummaryText && EditorSettings.ShowLiveSummary) {
        const SummaryInput = document.getElementById("wpSummary");

        if (SummaryInput) {
            let summaryTimer;

            function OnInput_Summary(e) {
                clearTimeout(summaryTimer);
                const target = e.target || e;
                let text = target.value || "";

                text = text.replaceAll("<", "&lt;").replaceAll(">", "&gt;")
                    .replaceAll("&#91;", "[").replaceAll("&#93;", "]")
                    .replaceAll("&#124;", "|").replaceAll("&#123;", "{").replaceAll("&#125;", "}")
                    .replaceAll("&#42;", "*").replaceAll("&#47;", "/");

                text = text.replace(/\/\*(.*?)\*\/([^\/]+(?=\/)|.*$)/g, (match, header, txt, offset, fullText) => {
                    const encodedName = PAGE_NAME + "#" + wikiEncode(header.trim());
                    const col = txt.trim() ? ": " : "";

                    const isEnd = (offset + match.length) === fullText.length;
                    const trimmedTxt = isEnd ? txt.trimEnd() : txt;

                    return `<span dir="auto"><span class="autocomment"><a href="/wiki/${encodedName}" title="${PAGE_NAME}">&#8594;${header.trim()}</a>${col}</span>${trimmedTxt}</span>`
                });

                let PendingText = text;

                text = SummaryColorLinks(text);
                SummaryText.innerHTML = "(" + text.trim() + ")";

                // AsyncSummaryColorLinks() uses the VDCs API, so to prevent too many requests, delaying this prevents overload on the api
                summaryTimer = setTimeout(async () => {
                    PendingText = await AsyncSummaryColorLinks(PendingText);

                    SummaryText.innerHTML = "(" + PendingText.trim() + ")";
                }, 400);
            };

            SummaryInput.addEventListener("input", OnInput_Summary);
            //SummaryInput.innerHTML = OnInput_Summary(SummaryInput);
        }
    }

    setTimeout(() => {
        document.querySelectorAll("[data-locales-title]").forEach(el => {
            const key = el.getAttribute("data-locales-title");
            el.title = getTranslation(key);
        });
        document.querySelectorAll("[data-locales-text]").forEach(el => {
            const key = el.getAttribute("data-locales-text");
            el.innerHTML = getTranslation(key);
        });
    }, 50);

    EDITOR_LOADED = true;
}

function ToggleSettingsPanel() {
    if (SettingsPanel.style.display == "none") {
        SettingsPanel.style.display = "block";
        SearchPanel.style.display = "none";
    } else {
        SettingsPanel.style.display = "none";
        SearchPanel.style.display = "none";
        // Valve Developer Community - User Defined Templates
        if (SettingTabButtons.Tab3.getAttribute("checked") == "true") {
            chrome.storage.local.set({ "VDC-UDT": BLOCK_DATA })
            CreateUDT(BLOCK_DATA);
            EditorFormatter();
        }     
    }

    Object.keys(SettingTabButtons).forEach((key, index) => {
        const btn = SettingTabButtons[key];
        if (!btn) return;
        btn.setAttribute("checked", index === 0 ? "true" : "false");
    });

    Object.keys(SettingPanelTabs).forEach((key, index) => {
        const panel = SettingPanelTabs[key];
        if (!panel) return;
        panel.style.display = index === 0 ? "block" : "none";
    });
}

function ToggleSearchPanel() {
    if (SearchPanel.style.display == "none") {
        SearchPanel.style.display = "block";
    } else {
        SearchPanel.style.display = "none";
    }
}

function Func_ReplaceLinks() {
    let TextEditor = Div_Editor.innerHTML;

    let BtnConfirm = document.getElementById("VDCEditorEx-Replace-Confirm");
    let BtnCancel = document.getElementById("VDCEditorEx-Replace-Cancel");
    
    let BlurDlg = document.getElementById("VDCEditorEx-BlurDlg");
    let ReplaceDlg = document.getElementById("VDCEditorEx-ReplaceDlg-Content");

    BlurDlg.style.display = "block";
    ReplaceDlg.style.display = "block";

    BtnConfirm.addEventListener('click', (e) => {
        e.preventDefault();

        BlurDlg.style.display = "none";
        ReplaceDlg.style.display = "none";

        TextEditor = TextEditor.replace(/\[\[(?!(?:(?::)?[Cc]ategory(?:[ _]talk)?|[Dd]ictionary|[Ff]ile(?:[ _]talk)?|[Gg]oogle|[Gg]oogleGroups|[Hh]elp(?:[ _]talk)?|IMDB|[Ii]mage(?:[ _]talk)?|m|M|mw|MW|[Mm]edia|[Mm]ediaWiki(?:[ _]talk)?|[Mm]eta|[Pp]roject(?:[ _]talk)?|[Ss]dkBug|[Ss]ourceForge|[Ss]pecial|[Ss]teampowered|[Tt]alk|[Tt]emplate(?:[ _]talk)?|[Uu]ser(?:[ _]talk)?|[Vv]alve[ _][Dd]eveloper[ _][Cc]ommunity(?:[ _]talk)?|W|WP|wp|[Ww]iki|[Ww]ikiBooks|[Ww]ikipedia|[Ww]ikiquote|[Ww]iktionary|c|C|[Cc]ommons|[Ss]pecial|[Mm]etawikipedia|\#|\/):)(.+?)]]/g, "{{L|$1}}")
        TextEditor = TextEditor.replace(/\[\[:(?:[Cc]ategory:)(.+?)]]/g, "{{LCategory|$1}}")
        TextEditor = TextEditor.replace(/\[\[(?:[Cc]ategory:)(.+?)]]/g, "{{ACategory|$1}}")
        TextEditor = TextEditor.replace(/\[\[(?:[Hh]elp:)(.+?)]]/g, "{{LHelp|$1}}")
        TextEditor = TextEditor.replace(/\[\[(?:[Pp]roject|[Vv]alve[ _][Dd]eveloper[ _][Cc]ommunity):(.+?)]]/g, "{{LProject|$1}}")
        TextEditor = TextEditor.replace(/\[\[(?:[Ss]pecial:)(.+?)]]/g, "{{LSpecial|$1}}")

        Div_Editor.innerHTML = TextEditor;
        EditorFormatter();
    })

    BtnCancel.addEventListener('click', (e) => {
        e.preventDefault();
        BlurDlg.style.display = "none";
        ReplaceDlg.style.display = "none";
    })
}