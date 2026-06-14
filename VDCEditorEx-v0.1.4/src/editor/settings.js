//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Seperate file for settings related functions
//
//================================================================

var TEMPLATE_COUNT = 0;
var REMOVED_TEMPS = [];

var BLOCK_DATA = {};

// If you are reading this and you are not a scripter, these 2 bottom ones you are looking for if you want to change the max for names or params.
// ########## WARNING: Setting the value above 15 will cause UI issues, the value is set to 15 because it fits perfectly. ##########
const MAX_TEMPLATE_NAMES = 15;
const MAX_TEMPLATE_PARAMS = 15;


const SettingTabButtons = {
    Tab1: undefined,
    Tab2: undefined,
    Tab3: undefined
}

const SettingPanelTabs = {
    Panel1: undefined,
    Panel2: undefined,
    Panel3: undefined
};

async function getSettingHTML(name) {
    const response = await fetch(chrome.runtime.getURL("src/editor/html/settings/" + name + ".html"));
    let html = await response.text();
    const extURL = chrome.runtime.getURL("").replace(/\/$/, "");

    html = html.replace(/__Panel-UDT-Info__/g, getTranslation("Panel-UDT-Info", MAX_TEMPLATE_NAMES, MAX_TEMPLATE_PARAMS));
    html = html.replace(/__EXT_ID__/g, extURL);
    html = html.replace(/_#([A-Za-z0-9-_]+)#_/g, (_, key) => { return getTranslation(key); });

    return html;
}

async function loadAvailableLocales() {
    const url = chrome.runtime.getURL("src/locales/locales.json");

    try {
        const resp = await fetch(url);
        if (!resp.ok) throw new EditorError(`HTTP ${resp.status}`, "HTTP_REQUEST_FAIL");
        const locales = await resp.json();
        return locales;
    } catch (err) {
        console.warn("Could not load locales.json, defaulting to ['en']", err);
        return ["en"];
    }
}

async function populateLangDropdown() {
    const dropdown = document.getElementById("VDCEditorEx-Editor-Lang");
    if (!dropdown) return;

    const localesData = await loadAvailableLocales();
    const availableLocales = localesData.LOCALES || ["en"];

    availableLocales.forEach(lang => {
        if (lang === "en") return;
        const opt = document.createElement("option");
        opt.value = lang.toLowerCase();
        opt.textContent = lang.toUpperCase();
        dropdown.appendChild(opt);
    });

    chrome.storage.local.get("VDC-LANG", data => {
        let storedLang = data["VDC-LANG"] || "en";

        if (!availableLocales.includes(storedLang)) {
            storedLang = "en";
            chrome.storage.local.set({ "VDC-LANG": "en" });
        }

        CURRENT_LANG = storedLang;
        dropdown.value = CURRENT_LANG.toLowerCase();
    });

    dropdown.addEventListener("change", e => {
        CURRENT_LANG = e.target.value;
        chrome.storage.local.set({ "VDC-LANG": CURRENT_LANG });
    });
}


/**
 * Main function for the settings panel.
 */
async function MainSettings() {
    SettingTabButtons.Tab1 = document.getElementById("VDCEditorEx-Tab1");
    SettingTabButtons.Tab2 = document.getElementById("VDCEditorEx-Tab2");
    SettingTabButtons.Tab3 = document.getElementById("VDCEditorEx-Tab3");
    SettingPanelTabs.Panel1 = document.getElementById("VDCEditorEx-Panel-Tab1");
    SettingPanelTabs.Panel2 = document.getElementById("VDCEditorEx-Panel-Tab2");
    SettingPanelTabs.Panel3 = document.getElementById("VDCEditorEx-Panel-Tab3");

    for (const [key, value] of Object.entries(SettingTabButtons)) {
        value.addEventListener("click", () => {
            for (const [k, v] of Object.entries(SettingTabButtons)) {
                v.setAttribute("checked", "false");
                SettingPanelTabs[k.replace("Tab", "Panel")].style.display = "none";
            }
            value.setAttribute("checked", "true");
            SettingPanelTabs[key.replace("Tab", "Panel")].style.display = "block";
        });
    }

    SettingPanelTabs.Panel1.innerHTML = await getSettingHTML("general");
    SettingPanelTabs.Panel2.innerHTML = await getSettingHTML("style");
    SettingPanelTabs.Panel3.innerHTML = await getSettingHTML("templates");

    populateLangDropdown();
    SetupSettingEvents();
    SetupSettingStyleEvents();
    SetupTemplatesPanelEvents();

    const DebugContent = document.getElementById("Editor-Debug-Settings");

    if (isDeveloper() && DebugContent) {
        DebugContent.style.display = "block";
    }
}



function SetupSettingEvents() {
    document.querySelectorAll("[data-VDCEdEx-S-setting]").forEach(button => {
        const key = button.dataset.vdcedexSSetting;
        button.classList.add("oo-ui-icon-check", "oo-ui-image-invert");
        button.addEventListener("click", (e) => {
            e.preventDefault();
            toggleButton(button, key);
        });
    });

    document.getElementById("VDCEditorEx-ResetHeight")?.addEventListener("click", (e) => {
        e.preventDefault();
        SubMainTextArea.style.height = null;
        chrome.storage.local.set({ "VDC-Height": "500px" });
    });
}

function SetupSettingStyleEvents() {
    const ResetStyleBtnEd = document.getElementById("VDCEditorEx-Reset-Sty-Ed");
    const ResetStyleBtn = document.getElementById("VDCEditorEx-Reset-Sty");

    function OnClick(e) {
        e.preventDefault();
        const type = e.currentTarget.dataset.type || "";

        const styleTable = {};

        document.querySelectorAll("[data-VDCEdEx-S-style]").forEach(button => {
            const cssVar = button.dataset.vdcedexSStyle;

            if (cssVar.startsWith(type)) {
                const defaultValue = button.defaultValue;

                styleTable[cssVar] = defaultValue;

                updateCSSVariableInStylesheet(cssVar, defaultValue);
                button.value = defaultValue;
            }
        });

        // Merge into existing storage
        chrome.storage.local.get("VDC-STYLE", data => {
            const current = data["VDC-STYLE"] || {};
            const merged = { ...current, ...styleTable };
            chrome.storage.local.set({ "VDC-STYLE": merged });
        });
    }

    ResetStyleBtnEd.addEventListener("click", OnClick);
    ResetStyleBtn.addEventListener("click", OnClick);

    document.querySelectorAll("[data-VDCEdEx-S-style]").forEach(button => {
        button.addEventListener("change", e => {
            e.preventDefault();
            const cssVar = button.dataset.vdcedexSStyle;
            const newValue = button.value;

            updateCSSVariableInStylesheet(cssVar, newValue);

            // Merge into existing storage
            chrome.storage.local.get("VDC-STYLE", data => {
                const current = data["VDC-STYLE"] || {};
                current[cssVar] = newValue;
                chrome.storage.local.set({ "VDC-STYLE": current });
            });
        });
    });
}
function SetupTemplatesPanelEvents() {
    const AddNewTemplate = document.getElementById("VDCEditorEx-CreateNewTemplate");
    const TemporaryText = document.getElementById("Panel3-TemporaryText");

    const ExportUDTBtn = document.getElementById("VDCEditorEx-ExportTemplate");
    const ImportUDTBtn = document.getElementById("VDCEditorEx-ImportTemplate");

    const OkayBtn = document.getElementById("VDCEditorEx-Button-Ok");

    AddNewTemplate.addEventListener('click', (e) => {
        e.preventDefault();

        if (TemporaryText)
            TemporaryText.remove();

        let blockNum = 0;

        if (REMOVED_TEMPS.length > 0) {
            blockNum = REMOVED_TEMPS.shift();
        } else {
            TEMPLATE_COUNT += 1;
            blockNum = TEMPLATE_COUNT;
        }

        CreateNewTemplateBlock(blockNum);
    });

    OkayBtn?.addEventListener('click', (e) => {
        e.preventDefault()
        closeDialog();
    });

    ExportUDTBtn.addEventListener("click", (e) => {
        chrome.storage.local.get("VDC-UDT", (result) => {
            const data = result["VDC-UDT"];

            const jsonString = JSON.stringify(data, null, 2);

            if (!data || jsonString == "{}") {
                InfoDialog("No data was found while trying to export.");
                return;
            }

            const blob = new Blob([jsonString], { type: "text/plain" });
            const url = URL.createObjectURL(blob);

            const a = document.createElement("a");
            a.href = url;
            a.download = "UserDefinedTemplates.json";
            document.body.appendChild(a);
            a.click();

            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    });

    ImportUDTBtn.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";

        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const text = await file.text();
            let data;

            // I don't want to bloat the extension with creating a custom script that just converts the templates.js (old version of the editor)
            // to a json file, so i am asking users to create a backup of templates.js,
            // then they must remove comments and ONLY have "TEMPLATES", the "const data = ", and check for any unwanted commas.
            try {
                if (file.name.endsWith(".json")) {
                    data = JSON.parse(text);

                    if (Array.isArray(data.TEMPLATES)) {
                        let NewUDT_Data = migrateOldTemplates(data.TEMPLATES);
                        Event_OnImportedData(NewUDT_Data, true);
                        return;
                    }

                    const blockKeys = Object.keys(data).filter(key => /^Block-\d+$/.test(key));
                    if (blockKeys.length == 0) {
                        InfoDialog("Invalid JSON structure, does not match old version or the new version.");
                        return;
                    }

                    Event_OnImportedData(data, true);
                } else {
                    InfoDialog("Unsupported file, please use a JSON file.");
                    return;
                }

            } catch (err) {
                InfoDialog("Failed to parse the file, please check for any errors is the file.");
            }
        };

        input.click();
    });
}

// The old way that i was doing it in v0.1.2 was okay, but it didn't look good, so i decided to create a UI for it and change the json layout of the templates.
// now this can update the old json in to the new one when detected.
// Im not creating any detection here, i will be adding it to the main function that detects the import file.
function migrateOldTemplates(oldTemplates) {
    try {
        const rootStyles = getComputedStyle(document.documentElement);

        const newBlocks = {};
        let blockCount = 0;

        (Array.isArray(oldTemplates) ? oldTemplates : []).forEach(template => {
            if (template.NAME != "__DEFAULT__") {
                blockCount++;

                const namesArray = Array.isArray(template.NAME) ? template.NAME : [template.NAME];
                const paramsArray = Array.isArray(template.CAPTURE) ? template.CAPTURE : [];
                const paramsColorObj = template.C_STYLE || {};

                const namesObj = {};
                namesArray.forEach((name, idx) => {
                    namesObj[idx + 1] = capitalizeFirst(name);
                });

                const paramsObj = {};
                const paramsColorFinal = {};
                paramsArray.forEach((paramName, idx) => {
                    const index = idx + 1;
                    paramsObj[index] = paramName;

                    let color = null;
                    let FixedColor = null;

                    if (paramsColorObj && typeof paramsColorObj === "object") {
                        if (paramsColorObj[paramName]) color = paramsColorObj[paramName];
                        else if (typeof paramsColorObj === "string") color = paramsColorObj;
                    }

                    if (color && typeof color === "string") {
                        const match = color.match(/color\s*:\s*(.+);?/i);
                        if (match) color = match[1].trim();
                    }

                    if (color?.startsWith("var(")) {
                        const varMatch = color.match(/var\((--[\w-]+)\)/);
                        if (varMatch) {
                            const varName = varMatch[1];

                            FixedColor = rootStyles.getPropertyValue(varName).trim();
                        }
                    } else {
                        FixedColor = color;
                    }

                    paramsColorFinal[index] = color ? cssColorToHex(FixedColor) : "#000000";
                });

                let newTempColor = "#000000";
                const styleValue = template.COLOR?.trim();


                if (styleValue?.startsWith("var(")) {
                    const varMatch = styleValue.match(/var\((--[\w-]+)\)/);
                    if (varMatch) {
                        const varName = varMatch[1];

                        const value = rootStyles.getPropertyValue(varName).trim();

                        if (value) {
                            newTempColor = cssColorToHex(value); 
                        }
                    }
                    else {
                        newTempColor = cssColorToHex(styleValue);
                    }
                } else if (styleValue) {
                    newTempColor = cssColorToHex(styleValue);
                }

                let TemplateStyle = template.STYLE
                let BGTransClr = null;

                // If the styles are used, it will only add these ones in dark, i don't want to add more scripting to get the color, the user must do for themselves.
                if (TemplateStyle == "GAME") {
                    BGTransClr = "33";
                } else if (TemplateStyle == "CODE") {
                    BGTransClr = "42";
                }

                // New block structure
                newBlocks[`Block-${blockCount}`] = {
                    NAMES: namesObj,
                    PARAMS: paramsObj,
                    PARAMS_COLOR: paramsColorFinal,
                    TemplateColor: newTempColor
                };

                if (BGTransClr) {             
                    newBlocks[`Block-${blockCount}`].TemplateBackgroundColor = "#000000";
                    newBlocks[`Block-${blockCount}`].TemplateBGTrans = BGTransClr;
                }
            };
        });

        return newBlocks;

    } catch (ImportError) {
        console.warn(ImportError);
    }
}

function CreateNewTemplateBlock(templateCount, UDTNameLen = 1, UDTParamLen = 1) {

    //===============================================

    const block = document.createElement("div");
    block.classList.add("VDCEditorEx-Template-Block");
    block.id = "Settings-Temp-Block-" + templateCount;
    block.dataset.block = templateCount;

    const RemoveBlockSep = document.createElement("div");
    RemoveBlockSep.classList.add("VDCEditorEx-Gap");

    const RemoveBlock = document.createElement("div");
    RemoveBlock.classList.add("VDCEditorEx-TemplateBtn", "VDCEditorEx-TemplateBtn-Red", "VDCEditorEx-Template-RemoveBtn");
    RemoveBlock.id = "Settings-Temp-Block-Remove-" + templateCount;
    RemoveBlock.innerHTML = `<img src="${getImage('settings/MwBtnMinus.png')}">`;
    

    //===============================================

    const ColorRow = document.createElement("div");
    ColorRow.classList.add("VDCEditorEx-Template-Row");
    ColorRow.style.gap = "20px";
    ColorRow.style.alignItems = "center";

    const ColorPickerInput = document.createElement("input");
    ColorPickerInput.dataset.templateBlock = "Block-" + templateCount;
    ColorPickerInput.id = "Input-Block-" + templateCount;
    ColorPickerInput.dataset.type = "MainColor";
    ColorPickerInput.type = "color";
    ColorPickerInput.value = "#EE69B1"
    ColorPickerInput.classList.add("VDCEditorEx-Colorpicker");

    const EnableBackground = document.createElement("span");
    EnableBackground.textContent = getTranslation("UDT-EnableBG");

    const EnableBackgroundBtn = document.createElement("span");
    EnableBackgroundBtn.classList.add("VDCEditorEx-TemplateBtn", "VDCEditorEx-Settings-Btn", "oo-ui-icon-check", "oo-ui-image-invert")
    EnableBackgroundBtn.setAttribute("checked", "false")

    const ColorPickerBGInput = document.createElement("input");   
    ColorPickerBGInput.dataset.templateBlock = "Block-" + templateCount;
    ColorPickerBGInput.id = "Input-Block-" + templateCount + "-BG";
    ColorPickerBGInput.dataset.type = "BG-Color";
    ColorPickerBGInput.type = "color";
    ColorPickerBGInput.style.display = "none";
    ColorPickerBGInput.classList.add("VDCEditorEx-Colorpicker");

    const BgTransDiv = document.createElement("div");
    BgTransDiv.classList.add("VDCEditorEx-Template-Flex")
    BgTransDiv.id = "Div-Block-" + templateCount + "-BGTrans";
    BgTransDiv.style.display = "none";

    const BgTransSlider = document.createElement("input");
    BgTransSlider.dataset.templateBlock = "Block-" + templateCount;
    BgTransSlider.id = "Input-Block-" + templateCount + "-BGTrans";
    BgTransSlider.dataset.type = "BG-Trans";
    BgTransSlider.type = "range";
    BgTransSlider.min = "0";
    BgTransSlider.match = "100";
    BgTransSlider.value = "20";
    BgTransSlider.step = "1";

    const BgTransSliderText = document.createElement("span");
    BgTransSliderText.id = "Text-Block-" + templateCount + "-BGTrans";
    BgTransSliderText.textContent = getTranslation("UDT-BGOpacity-Percent", 20)

    BgTransDiv.append(getTranslation("UDT-BGOpacity"), BgTransSlider, BgTransSliderText)

    ColorRow.append(getTranslation("UDT-Color"), ColorPickerInput, EnableBackground, EnableBackgroundBtn, ColorPickerBGInput, BgTransDiv, RemoveBlockSep, RemoveBlock);

    block.appendChild(ColorRow);
    //===============================================

    const NameRow = document.createElement("div");
    NameRow.classList.add("VDCEditorEx-Template-Row");

    const NameGrid = document.createElement("div");
    NameGrid.classList.add("VDCEditorEx-Template-Grid");
    

    const NameTempFlex = document.createElement("div");
    NameTempFlex.classList.add("VDCEditorEx-Template-Flex");

    const NameInputGrid = document.createElement("div");
    NameInputGrid.classList.add("VDCEditorEx-Template-Grid-Inputs");

    const NameInput = document.createElement("input");
    NameInput.id = "Block-" + templateCount + "-Index-" + "1"; // Index means how many inputs are there, there always must be 1, without it, the UDT won't exist
    NameInput.type = "text";
    NameInput.placeholder = "MyTemplateName";
    NameInputGrid.appendChild(NameInput);

    const AddNewName = document.createElement("div");
    AddNewName.classList.add("VDCEditorEx-TemplateBtn");
    AddNewName.id = "VDCEditorEx-AddNewName-Block-" + templateCount;
    AddNewName.innerHTML = `<img src="${getImage('settings/MwBtnPlus.png')}">`;
    AddNewName.dataset.added = UDTNameLen;
    AddNewName.dataset.max = MAX_TEMPLATE_NAMES;

    const RemoveNewName = document.createElement("div");
    RemoveNewName.classList.add("VDCEditorEx-TemplateBtn", "VDCEditorEx-TemplateBtn-Red");
    RemoveNewName.id = "VDCEditorEx-RemoveNewName-Block-" + templateCount;
    RemoveNewName.innerHTML = `<img src="${getImage('settings/MwBtnMinus.png')}">`;

    NameTempFlex.append(NameInputGrid, AddNewName, RemoveNewName)

    //===============================================

    const ParamsGrid = document.createElement("div");
    ParamsGrid.classList.add("VDCEditorEx-Template-Grid");

    const NameParamsFlex = document.createElement("div");
    NameParamsFlex.classList.add("VDCEditorEx-Template-Flex");

    const ParamInputGrid = document.createElement("div");
    ParamInputGrid.classList.add("VDCEditorEx-Template-Grid-Inputs");

    const ParamInputFlex = document.createElement("div");
    ParamInputFlex.classList.add("VDCEditorEx-Template-Flex");
    ParamInputFlex.dataset.index = "1";
    ParamInputGrid.appendChild(ParamInputFlex);

    const ParamInput = document.createElement("input");
    ParamInput.id = "Block-" + templateCount + "-Params-Index-" + "1"; // Index means how many inputs are there, there always must be 1, without it, the UDT won't exist
    ParamInput.type = "text";
    ParamInput.placeholder = "MyParam";
    ParamInputFlex.appendChild(ParamInput);

    const ParamColor = document.createElement("input");
    ParamColor.classList.add("VDCEditorEx-Colorpicker", "VDCEditorEx-Colorpicker-Params");
    ParamColor.id = "Block-" + templateCount + "-Params-Clr-Index-" + "1"; // Index means how many inputs are there, there always must be 1, without it, the UDT won't exist
    ParamColor.type = "color";
    ParamInputFlex.appendChild(ParamColor);

    const AddNewParam = document.createElement("div");
    AddNewParam.classList.add("VDCEditorEx-TemplateBtn");
    AddNewParam.id = "VDCEditorEx-AddNewParam-Block-" + templateCount;
    AddNewParam.innerHTML = `<img src="${getImage('settings/MwBtnPlus.png')}">`;
    AddNewParam.dataset.added = UDTParamLen;
    AddNewParam.dataset.max = MAX_TEMPLATE_PARAMS;

    const RemoveNewParam = document.createElement("div");
    RemoveNewParam.classList.add("VDCEditorEx-TemplateBtn", "VDCEditorEx-TemplateBtn-Red");
    RemoveNewParam.id = "VDCEditorEx-RemoveNewParam-Block-" + templateCount;
    RemoveNewParam.innerHTML = `<img src="${getImage('settings/MwBtnMinus.png')}">`;

    NameParamsFlex.append(ParamInputGrid, AddNewParam, RemoveNewParam)

    NameRow.append(NameGrid, ParamsGrid);
    NameGrid.append(getTranslation("UDT-Name"), NameTempFlex);
    ParamsGrid.append(getTranslation("UDT-Params"), NameParamsFlex);
    block.appendChild(NameRow);

    //===============================================

    const buttons = document.getElementById("Panel3-Buttons");
    buttons.parentNode.insertBefore(block, buttons.nextSibling);

    //===============================================
    // Block listeners
    //===============================================

    let BlockId = "Block-" + templateCount;

    let ThisData = BLOCK_DATA[BlockId] = {};
    ThisData["NAMES"] = {};
    ThisData["PARAMS"] = {};
    ThisData["PARAMS_COLOR"] = {};

    ThisData["TemplateColor"] = ColorPickerInput.value;

    RemoveBlock.addEventListener('click', (e) => {
        e.preventDefault();
        let blockNum = block.dataset.block;

        const blockId = `Block-${block.dataset.block}`;
        delete BLOCK_DATA[blockId]

        REMOVED_TEMPS.push(Number(blockNum));
        block.remove();
    });
    //===============================================

    ColorPickerInput.addEventListener("change", (e) => {
        e.preventDefault();
        ThisData["TemplateColor"] = ColorPickerInput.value;
    });

    NameInput.addEventListener("change", (e) => {
        e.preventDefault();

        let NameIndex = NameInput.id.match(/-Index-(\d+)$/)[1];
        ThisData["NAMES"][NameIndex] = capitalizeFirst(NameInput.value);

        if (NameInput.value == "")
            delete ThisData["NAMES"][NameIndex]
    });

    ParamInput.addEventListener("change", (e) => {
        e.preventDefault();
        let NameIndex = ParamInput.id.match(/-Index-(\d+)$/)[1];
        ThisData["PARAMS"][NameIndex] = capitalizeFirst(ParamInput.value);
        ThisData["PARAMS_COLOR"][NameIndex] = ParamColor.value;

        if (ParamInput.value == "")
            delete ThisData["PARAMS"][NameIndex]
    });

    NameInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            NameInput.blur();
        }
    });

    ParamInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            ParamInput.blur();
        }
    });


    ParamColor.addEventListener("change", (e) => {
        e.preventDefault();
        let NameIndex = ParamColor.id.match(/-Index-(\d+)$/)[1];
        ThisData["PARAMS_COLOR"][NameIndex] = ParamColor.value;

        if (ParamInput.value == "")
            delete ThisData["PARAMS_COLOR"][NameIndex]
    });


    EnableBackgroundBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (EnableBackgroundBtn.getAttribute("checked") == "false") {
            EnableBackgroundBtn.setAttribute("checked", "true")
            ColorPickerBGInput.style.display = "unset";
            BgTransDiv.style.display = "flex";
            ThisData["TemplateBackgroundColor"] = ColorPickerBGInput.value;
            ThisData["TemplateBGTrans"] = alphaToHex(BgTransSlider.value);
        }   
        else {
            EnableBackgroundBtn.setAttribute("checked", "false")
            ColorPickerBGInput.style.display = "none";
            BgTransDiv.style.display = "none";
            delete ThisData["TemplateBackgroundColor"];
            delete ThisData["TemplateBGTrans"];
        }
    });

    ColorPickerBGInput.addEventListener("change", (e) => {
        e.preventDefault();

        if (EnableBackgroundBtn.getAttribute("checked") == "true") {
            ThisData["TemplateBackgroundColor"] = ColorPickerBGInput.value;
            BgTransSlider.style.backgroundImage = `linear-gradient(90deg, transparent, ${ColorPickerBGInput.value}), var(--transBG)`;
        }
        else {
            delete ThisData["TemplateBackgroundColor"];
            BgTransSlider.style.backgroundImage = `linear-gradient(90deg, transparent, black), var(--transBG)`;
        }
    });

    BgTransSlider.addEventListener("input", () => {
        const percent = BgTransSlider.value;
        BgTransSliderText.textContent = getTranslation("UDT-BGOpacity-Percent", percent);

        if (EnableBackgroundBtn.getAttribute("checked") == "true") {
            ThisData["TemplateBGTrans"] = alphaToHex(BgTransSlider.value);
        }
        else {
            delete ThisData["TemplateBGTrans"];
        }
    });

    //===============================================

    AddNewName.addEventListener("click", (e) => {
        e.preventDefault();

        let count = parseInt(AddNewName.getAttribute("data-added"));
        let max = parseInt(AddNewName.getAttribute("data-max"));
        let PrevElement = document.getElementById(NameInput.id.replace(/\d+$/, count))?.value

        if (count < max && PrevElement != "") {
            count++;
            AddNewName.setAttribute("data-added", count);
            const NewInput = NameInput.cloneNode();
            NewInput.id = NewInput.id.replace(/\d+$/, count)
            NewInput.value = ""
            NameInputGrid.appendChild(NewInput);
            NewInput.addEventListener("change", (e) => {
                e.preventDefault();
                let NameIndex = NewInput.id.match(/-Index-(\d+)$/)[1];
                ThisData["NAMES"][NameIndex] = capitalizeFirst(NewInput.value);
            });

            NewInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    NewInput.blur();
                }
            });
        }
    });

    RemoveNewName.addEventListener('click', (e) => {
        e.preventDefault();

        let count = parseInt(AddNewName.getAttribute("data-added"));
        let min = "1";

        if (min < count) {
            const NewInput = document.getElementById(NameInput.id.replace(/\d+$/, count))
            let NameIndex = NewInput.id.match(/-Index-(\d+)$/)[1];
            if (NewInput) {
                NewInput.remove();
                delete ThisData["NAMES"][NameIndex];
            }
            count--;
            AddNewName.setAttribute("data-added", count)
        }
    });

    AddNewParam.addEventListener("click", (e) => {
        e.preventDefault();

        let count = parseInt(AddNewParam.getAttribute("data-added"));
        let max = parseInt(AddNewParam.getAttribute("data-max"));
        let PrevElement = document.getElementById(ParamInput.id.replace(/\d+$/, count))?.value

        if (count < max && PrevElement != "") {
            count++;
            AddNewParam.setAttribute("data-added", count);

            const ParamInputFlex2 = document.createElement("div");
            ParamInputFlex2.classList.add("VDCEditorEx-Template-Flex");
            ParamInputFlex2.dataset.index = count;

            const NewInput = ParamInput.cloneNode();
            NewInput.id = NewInput.id.replace(/\d+$/, count)
            NewInput.value = ""

            const NewInputClr = ParamColor.cloneNode();
            NewInputClr.id = NewInputClr.id.replace(/\d+$/, count)
            NewInputClr.value = "#000000"

            ParamInputFlex2.append(NewInput, NewInputClr);
            ParamInputGrid.appendChild(ParamInputFlex2);

            NewInput.addEventListener("change", (e) => {
                e.preventDefault();
                let NameIndex = NewInput.id.match(/-Index-(\d+)$/)[1];
                ThisData["PARAMS"][NameIndex] = NewInput.value;
                ThisData["PARAMS_COLOR"][NameIndex] = NewInputClr.value;
            });

            NewInput.addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    event.preventDefault();
                    NewInput.blur();
                }
            });

            NewInputClr.addEventListener("change", (e) => {
                e.preventDefault();
                let NameIndex = NewInputClr.id.match(/-Index-(\d+)$/)[1];
                ThisData["PARAMS_COLOR"][NameIndex] = NewInputClr.value;
                if (NewInput.value == "")
                    delete ThisData["PARAMS_COLOR"][NameIndex]
            });
        }
    });

    RemoveNewParam.addEventListener('click', (e) => {
        e.preventDefault();

        let count = parseInt(AddNewParam.getAttribute("data-added"));
        let min = "1";

        if (min < count) {
            const NewInput = document.querySelector(`div[data-index="${count}"]`)
            let NameIndex = NewInput.getAttribute("data-index");
            if (NewInput) {
                NewInput.remove();
                delete ThisData["PARAMS"][NameIndex];
            }
            count--;
            AddNewParam.setAttribute("data-added", count)
        }
    });
}


function Event_OnUDTLoad() {
    chrome.storage.local.get("VDC-UDT-CSS", (result) => {
        const data = result["VDC-UDT-CSS"];
        if (!data) { return; }

        let style = document.getElementById("VDCEditorEx-UDT-Styles");
        if (!style) {
            style = document.createElement("style");
            style.id = "VDCEditorEx-UDT-Styles";
            style.textContent = data;
            document.head.appendChild(style);
        }

    });

    chrome.storage.local.get("VDC-UDT", (result) => {
        const data = result["VDC-UDT"];
        if (!data) { return; }

        BLOCK_DATA = data;

    });

    chrome.storage.local.get("VDC-UDT-DAT", (result) => {
        const data = result["VDC-UDT-DAT"];
        if (!data) { return; }

        UDT_SHORTEST = new Map(Object.entries(data["SHORTEST"]));
        UDT_ALLNAMES = data["ALLNAMES"];
    });
}

function Event_OnImportedData(data, ClearCurrentData = false) {
    if (!data) { return; }

    const CurrentUDT = document.querySelectorAll("div[data-block]");

    CurrentUDT.forEach(el => {
        el.remove();
    });

    if (ClearCurrentData) {
        UDT_SHORTEST = new Map();
        UDT_ALLNAMES = [];
        chrome.storage.local.set({ "VDC-UDT-CSS": "" });
        chrome.storage.local.set({ "VDC-UDT-DAT": { "ALLNAMES": [], "SHORTEST": [] } });
    }
   

    const TemporaryText = document.getElementById("Panel3-TemporaryText");
    if (TemporaryText && data && Object.keys(data).length > 0)
        TemporaryText.remove();

    Object.entries(data).sort(([aKey], [bKey]) => {
        const aNum = parseInt(aKey.split("-")[1]);
        const bNum = parseInt(bKey.split("-")[1]);
        return aNum - bNum; // descending numeric order
    }).forEach(([blockId, blockData]) => {
        const templateCount = parseInt(blockId.split("-")[1]);

        const NameCount = Object.keys(blockData.NAMES || {}).length || 0;
        const SafeNameCount = NameCount > 0 ? NameCount : 1;

        const ParamCount = Object.keys(blockData.PARAMS || {}).length || 0;
        const SafeParamCount = ParamCount > 0 ? ParamCount : 1;

        CreateNewTemplateBlock(templateCount, SafeNameCount, SafeParamCount);

        let ThisData = BLOCK_DATA[blockId];

        ThisData["PARAMS"] = {};
        ThisData["PARAMS_COLOR"] = {};

        if (blockData.TemplateColor) {
            const colorInput = document.getElementById(`Input-Block-${templateCount}`);
            colorInput.value = blockData.TemplateColor;
            ThisData["TemplateColor"] = blockData.TemplateColor;
        }

        if (blockData.TemplateBackgroundColor && blockData.TemplateBGTrans) {
            const bgInput = document.getElementById(`Input-Block-${templateCount}-BG`);
            const bgBtn = document.querySelector(`#Settings-Temp-Block-${templateCount} .VDCEditorEx-Settings-Btn`);
            const bgTransDiv = document.getElementById(`Div-Block-${templateCount}-BGTrans`);
            const bgTransSlider = document.getElementById(`Input-Block-${templateCount}-BGTrans`);
            const BtTransText = document.getElementById(`Text-Block-${templateCount}-BGTrans`);
            bgInput.value = blockData.TemplateBackgroundColor;
            bgInput.style.display = "unset";
            bgBtn.setAttribute("checked", "true");

            ThisData["TemplateBackgroundColor"] = blockData.TemplateBackgroundColor;
            ThisData["TemplateBGTrans"] = blockData.TemplateBGTrans;

            if (!bgTransDiv && !BtTransText) return;

            bgTransDiv.style.display = "flex"
            bgTransSlider.value = hexAlphaToPercent(blockData.TemplateBGTrans);
            bgTransSlider.style.backgroundImage = `linear-gradient(90deg, transparent, ${blockData.TemplateBackgroundColor}), var(--transBG)`;
            BtTransText.textContent = hexAlphaToPercent(blockData.TemplateBGTrans) + "%";
        }

        if (blockData.NAMES) {
            Object.entries(blockData.NAMES).forEach(([idx, name]) => {
                const nameInputId = `Block-${templateCount}-Index-${idx}`;
                const nameInput = document.getElementById(nameInputId);

                if (nameInput) {
                    nameInput.value = name;
                } else {
                    const NameInputId = `Block-${templateCount}-Index-1`;
                    const NameInput = document.getElementById(NameInputId);
                    const CloneNameInput = NameInput?.cloneNode();
                    CloneNameInput.id = `Block-${templateCount}-Index-${idx}`;
                    CloneNameInput.value = name;
                    NameInput.parentElement.appendChild(CloneNameInput);

                    CloneNameInput.addEventListener("change", (e) => {
                        e.preventDefault();

                        let NameIndex = CloneNameInput.id.match(/-Index-(\d+)$/)[1];
                        ThisData["NAMES"][NameIndex] = capitalizeFirst(CloneNameInput.value);

                        if (CloneNameInput.value == "")
                            delete ThisData["NAMES"][NameIndex];
                    });

                    CloneNameInput.addEventListener("keydown", (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            CloneNameInput.blur();
                        }
                    });
                }
                ThisData["NAMES"][idx] = name;
            });
        }

        if (blockData.PARAMS) {
            Object.entries(blockData.PARAMS).forEach(([idx, param]) => {
                const paramInputId = `Block-${templateCount}-Params-Index-${idx}`;
                const paramColorId = `Block-${templateCount}-Params-Clr-Index-${idx}`;
                const paramInput = document.getElementById(paramInputId);
                const paramColor = document.getElementById(paramColorId);

                if (paramInput) {
                    paramInput.value = param;
                } else {
                    const ParamFlex = document.createElement("div");
                    ParamFlex.classList.add("VDCEditorEx-Template-Flex");
                    ParamFlex.dataset.index = idx;

                    const ParamInputId = `Block-${templateCount}-Params-Index-1`;
                    const ParamInput2 = document.getElementById(ParamInputId);
                    const CloneParamInput = ParamInput2?.cloneNode();
                    CloneParamInput.id = `Block-${templateCount}-Params-Index-${idx}`;
                    CloneParamInput.value = param;

                    const ParamInputClrId = `Block-${templateCount}-Params-Clr-Index-1`;
                    const ParamInputClr = document.getElementById(ParamInputClrId);
                    const CloneParamInputClr = ParamInputClr?.cloneNode();
                    CloneParamInputClr.id = `Block-${templateCount}-Params-Clr-Index-${idx}`;
                    CloneParamInputClr.value = blockData.PARAMS_COLOR[idx];

                    ParamFlex.append(CloneParamInput, CloneParamInputClr);

                    ParamInput2.parentElement.parentElement.appendChild(ParamFlex);

                    CloneParamInput.addEventListener("change", (e) => {
                        e.preventDefault();

                        let NameIndex = CloneParamInput.id.match(/-Index-(\d+)$/)[1];
                        ThisData["PARAMS"][NameIndex] = capitalizeFirst(CloneParamInput.value);

                        if (CloneParamInput.value == "")
                            delete ThisData["PARAMS"][NameIndex];
                    });

                    CloneParamInput.addEventListener("keydown", (event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            CloneParamInput.blur();
                        }
                    });

                    CloneParamInputClr.addEventListener("change", (e) => {
                        e.preventDefault();
                        let NameIndex = CloneParamInputClr.id.match(/-Index-(\d+)$/)[1];
                        ThisData["PARAMS_COLOR"][NameIndex] = CloneParamInputClr.value;

                        if (CloneParamInput.value == "")
                            delete ThisData["PARAMS_COLOR"][NameIndex];
                    });
                }

                if (paramColor && blockData.PARAMS_COLOR[idx]) {
                    paramColor.value = blockData.PARAMS_COLOR[idx];
                } else {

                }

                ThisData["PARAMS"][idx] = param;
                ThisData["PARAMS_COLOR"][idx] = blockData.PARAMS_COLOR[idx];
            });
        }
    });

    let NewCount = Math.max(...Object.keys(data).map(k => parseInt(k.split("-")[1])));
    if (NewCount != "NaN") {
        TEMPLATE_COUNT = NewCount;
    }
    else {
        throw new EditorError("Trying to get a number but got a NaN, failed to set up the editor correctly", "STORAGE_FAILURE");
    }
}

function Event_OnUDTLocalStorageLoad() {
    chrome.storage.local.get("VDC-UDT", (result) => {
        Event_OnImportedData(result["VDC-UDT"], false);
    });
}