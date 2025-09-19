//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

function findBlockByName(templateName, blockData) {
    for (const blockKey in blockData) {
        const block = blockData[blockKey];
        for (const nameIdx in block.NAMES) {
            if (block.NAMES[nameIdx] === templateName) {
                return block;
            }
        }
    }
    return null;
}
/**
 * Wrap captured parameters using defined colors, preserving nested templates and all characters.
 * @param {string} text - The raw template content inside `{{...}}`.
 * @param {object} blockData - The UDT block data from your new structure.
 * @returns {string} - Processed inner string with styled <span> wraps.
 */
function applyUDTStyles(inner, blockData) {
    const { PARAMS = {}, PARAMS_COLOR = {} } = blockData;

    const params = [];
    let buf = '';
    let depth2 = 0, depth3 = 0;
    for (let i = 0; i < inner.length; i++) {
        if (inner.slice(i, i + 3) === '{{{') { depth3++; buf += '{{{'; i += 2; continue; }
        if (inner.slice(i, i + 3) === '}}}') { depth3--; buf += '}}}'; i += 2; continue; }
        if (inner.slice(i, i + 2) === '{{') { depth2++; buf += '{{'; i += 1; continue; }
        if (inner.slice(i, i + 2) === '}}') { depth2--; buf += '}}'; i += 1; continue; }
        if (inner[i] === '|' && depth2 === 0 && depth3 === 0) { params.push(buf); buf = ''; continue; }
        buf += inner[i];
    }
    params.push(buf);

    const styledParams = [];
    let positionalIndex = 1;
    const seenKeys = new Set();

    const usedIndexes = new Set();

    for (let i = 0; i < params.length; i++) {
        const raw = params[i];
        let key, value, isNamed = false;

        if (i === 0) {
            styledParams.push(raw);
            continue;
        }

        const isNested = raw.includes('{{') || raw.includes('{{{');

        if (raw.includes('=') && raw.indexOf('=') > 0 && !isNested) {
            const eqIndex = raw.indexOf('=');
            key = raw.slice(0, eqIndex);
            value = raw.slice(eqIndex + 1);
            isNamed = true;

            if (/^\d+$/.test(key)) {
                const idx = parseInt(key, 10);
                key = idx.toString();
                usedIndexes.add(idx);
            }
        } else {
            while (usedIndexes.has(positionalIndex)) positionalIndex++;
            key = positionalIndex.toString();
            value = raw;
            usedIndexes.add(positionalIndex);
            positionalIndex++;
        }

        let styleParamsPush = undefined;

        if (isNamed) {
            if (seenKeys.has(key)) {
                styleParamsPush = `<editor-invalidtag>${raw}</editor-invalidtag>`;
            } else {
                seenKeys.add(key);
            }
        }

        if (!styleParamsPush) {
            const index = Object.keys(PARAMS).find(k => PARAMS[k] === key);
            if (index && PARAMS_COLOR[index]) {
                styleParamsPush = `<span style="color:${PARAMS_COLOR[index]}">${raw}</span>`;
            }
            else {
                styleParamsPush = raw;
            }
        }
        styledParams.push(styleParamsPush);
    }
    return styledParams.join('|');
}

/**
 * Finds all nested braced blocks in text, and classifies them
 * @param {string} text - text content of the editor
 * @returns {Array} - list of objects {start, end, content, name, type}
 */
function findAllBracedBlocks(text) {
    const results = [];
    const stack = [];

    for (let i = 0; i < text.length; i++) {
        let openCount = 0;
        while (text[i + openCount] === '{') openCount++;

        if (openCount == 2 || openCount == 3) {
            stack.push({ start: i, type: openCount });
            i += openCount - 1;
            continue;
        }
        else if (openCount > 3) {
            for (let j = 0; j < Math.floor(openCount / 2); j++) {
                stack.push({ start: i + j * 2, type: 2 });
            }
            i += openCount - 1;
        }

        let closeCount = 0;
        while (text[i + closeCount] === '}') closeCount++;

        if (closeCount >= 2 && stack.length > 0) {
            const last = stack[stack.length - 1];

            if (closeCount >= last.type) {
                const block = stack.pop();
                const end = i + last.type;
                const content = text.slice(block.start, end);
                const inner = content.slice(block.type, -block.type).trim();

                const match = inner.match(/^([^:|}]+)([:|}])?/);
                let name = match ? match[1] : "__UNKNOWN__";
                let separator = match && match[2] ? match[2] : "__NO_SEPARATOR__";
  
                if (block.type === 3) name = inner.split(/[|}]/, 1)[0] || "__PARAM__";
                else if (block.type === 2) name = inner.split(/[|}]/, 1)[0] || "__TEMPLATE__";

                if (separator === ":" && (name.startsWith("#") || /^[A-Za-z0-9_ ]+$/.test(name))) {
                    name = inner.split(/[:}]/, 1)[0] || "__SPECIAL__";
                }

                results.push({
                    start: block.start,
                    end: end,
                    content,
                    name,
                    type: block.type,
                    separator
                });

                i += last.type - 1;
            }
        }
    }
    return results.sort((a, b) => a.start - b.start);  
}

/**
 *  Optimized helper function to parse links and files and categories
 * @param {string} text text content of the editor
 * */
function findAllLinkBlocks(text) {
    const results = [];
    const stack = [];

    for (let i = 0; i < text.length; i++) {
        let openCount = 0;
        while (text[i + openCount] === '[') openCount++;

        if (openCount == 1 || openCount == 2) {
            stack.push({ start: i, type: openCount });
            i += openCount - 1;
            continue;
        }
        else if (openCount > 2) {
            for (let j = 0; j < Math.floor(openCount / 2); j++) {
                stack.push({ start: i + j * 2, type: 2 });
            }
            i += openCount - 1;
        }

        let closeCount = 0;
        while (text[i + closeCount] === ']') closeCount++;

        if (closeCount >= 1 && stack.length > 0) {
            const last = stack[stack.length - 1];

            if (closeCount >= last.type) {
                const block = stack.pop();
                const end = i + last.type;
                const content = text.slice(block.start, end);
                const inner = content.slice(block.type, -block.type).trim();

                const match = inner.match(/^([^|\]]+)([|\]])?/);
                let name = match ? match[1] : "__UNKNOWN__";
                let CleanedName = name.replace(/<\/?(editor|udt)-[^>]+>/g, '');
                let separator = match && match[2] ? match[2] : "__NO_SEPARATOR__";

                if (block.type === 2) name = inner.split(/[|}]/, 1)[0] || "__LINK__";

                results.push({
                    start: block.start,
                    end: end,
                    content,
                    name,
                    CleanedName,
                    type: block.type,
                    separator
                });

                i += last.type - 1;
            }
        }
    }
    return results.sort((a, b) => a.start - b.start);
}

/**
 *  Optimized helper function to parse tables
 * @param {string} text text content of the editor
 * */
function findAllTables(text) {
    const results = [];
    let stack = 0;
    let start = -1;

    for (let i = 0; i < text.length - 1; i++) {
        const pair = text.slice(i, i + 2);
        if (pair === '{|') {
            if (stack === 0) start = i;
            stack++;
            i++;
        } else if (pair === '|}') {
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

function parseWikiTables(str) {
    const tables = findAllTables(str);

    if (!tables.length) return str;

    let result = str;

    for (let i = tables.length - 1; i >= 0; i--) {
        const tpl = tables[i];
        const original = tpl.content;

        const tableStartMatch = original.match(/^(\{\|)([^\n]*)/m);

        if (!tableStartMatch) continue;

        let full = tableStartMatch[0];
        let opener = tableStartMatch[1];
        let attribs = tableStartMatch[2];

        let formattedAttribs = Func_AttribsFormatter(original, "", "", attribs, true, "htmltags");

        let rebuilt = opener + formattedAttribs;

        let wrapped = original.replace(/^(\{\|[^\n]*)/m, rebuilt);

        wrapped = wrapped.replace(/^\!.*$/gm, '<editor-table-header>$&</editor-table-header>');

        wrapped = wrapped.replace(/^(\|)(.*)$/gm, (match, pipe, rest) => {
            const trimmed = rest.trim();

            if (trimmed === "-" || trimmed === "}") return match;

            if (rest.includes("||")) {
                return "|" + rest
                    .split("||")
                    .map(cell => {
                        let FormattedCellData = cell ? '<editor-default>' + cell + "</editor-default>" : "";
                        return FormattedCellData;
                    })
                    .join("||");
            }

            let singlePipeMatch = rest.match(/^(.*?)(\{|\[|<.+?>.*?\|.*?<\/.+?>|\s*\|\s*)(.*)$/);

            let attribs = "";
            let cellSep = "|";
            let cellData = rest;

            if (singlePipeMatch) {
                if (singlePipeMatch[2] === "{" || singlePipeMatch[2] === "["  || singlePipeMatch[2].startsWith("<")) {
                    return `|<editor-default>${rest}</editor-default>`;
                }

                attribs = singlePipeMatch[1] || "";
                cellSep = singlePipeMatch[2] || "";
                cellData = singlePipeMatch[3] || "";
            }

            let FormattedCellData = cellData ? '<editor-default>' + cellData + "</editor-default>" : "";

            let formattedAttribs = attribs ? Func_AttribsFormatter(match, "", "", attribs, true, "htmltags") : "";

            return `|${formattedAttribs}${formattedAttribs ? cellSep : ""}${FormattedCellData}`;
        });

        // Using editor-table helps to contain the table that it captured, i could invert it so it colors the pipes and etc, 
        // but then it won't be contained, this would make more tags that would probably bloat the DOM
        result = result.slice(0, tpl.start) + "<editor-table>" + wrapped + "</editor-table>" + result.slice(tpl.end);
    }

    return result;
}


/**
 * Recursively color nested braced link blocks
 * @param {string} text - the text to colorize
 * @returns {string} - HTML with colored link braces
 */
function ColorLinkBraces(text) {
    const blocks = findAllLinkBlocks(text);

    if (!blocks.length) return text;

    let result = '';
    let lastIndex = 0;

    function IsEnabled(value, tag, text) {
        if (value)
            return `<editor-${tag}>${text}</editor-${tag}>`
        else
            return text
    }

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (block.start < lastIndex) continue;

        result += text.slice(lastIndex, block.start);

        const inner = block.content.slice(block.type, -block.type);
        const coloredInner = ColorLinkBraces(inner);

        let TemplateName = capitalizeFirst(block.name);

        let wrapped;
        if (block.type === 1) {
            if (/^\w+:\/\//.test(block.CleanedName) || /^{{(fullurl|FULLURL):/.test(block.CleanedName)) {
                wrapped = IsEnabled(EditorSettings.StylizedLinks, "mwlinks", `[${inner}]`);
            } else {
                wrapped = `[${inner}]`;
            }
        } else if (block.type === 2) {
            if (/^[Cc]ategory:/.test(TemplateName)) {
                wrapped = IsEnabled(EditorSettings.MwCategory, "mwcategories", `[[${coloredInner}]]`);
            } else if (/^[Ff]ile:/.test(TemplateName)) {
                wrapped = IsEnabled(EditorSettings.MwFile, "mwfiles", `[[${coloredInner}]]`);
            } else {
                wrapped = IsEnabled(EditorSettings.StylizedLinks, "mwlinks", `[[${coloredInner}]]`);
            }
        } else {
            if (!EditorSettings.Dbg_ShowWeirdBlocks) {
                wrapped = block.content;
            } else {
                // I hope this doesn't fire...
                wrapped = `<editor-invalidtag>${block.content}</editor-invalidtag>`;
                console.warn("[ColorLinkBraces]: Got a weird block, could not indetify type: " + block.content)
            }
           
        }

        result += wrapped;
        lastIndex = block.end;
    }

    result += text.slice(lastIndex);

    return result;
}

/**
 * Recursively color nested braced blocks
 * @param {string} text - the text to colorize
 * @returns {string} - HTML with colored braces
 */
function ColorBraces(text) {
    const blocks = findAllBracedBlocks(text);

    if (!blocks.length) return text;

    let result = '';
    let lastIndex = 0;

    function IsEnabled(value, tag, text) {
        if (value)
            return `<editor-${tag}>${text}</editor-${tag}>`
        else
            return text
    }

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (block.start < lastIndex) continue;

        result += text.slice(lastIndex, block.start);

        const inner = block.content.slice(block.type, -block.type);
        const coloredInner = ColorBraces(inner);

        let TemplateName = capitalizeFirst(block.name);

        let wrapped;
        if (block.name?.startsWith('#')) {
            if (MwFunctionsRegex.test(TemplateName)) {
                wrapped = IsEnabled(EditorSettings.MwFunctions, "mwfuncs", `{{${coloredInner}}}`);
            } else {
                wrapped = IsEnabled(EditorSettings.MwFunctions, "mwotherfuncs", `{{${coloredInner}}}`);

            }  
        } else if (block.type === 2) {
            
            if (UDT_ALLNAMES?.includes(TemplateName)) {

                if (EditorSettings.StylizedTemplates) {
                    const templateKey = UDT_SHORTEST.get(TemplateName);

                    let rebuiltContent = coloredInner;

                    const block = findBlockByName(TemplateName, BLOCK_DATA);
                    if (block) {
                        rebuiltContent = applyUDTStyles(rebuiltContent, block);
                    }

                    if (templateKey)
                        wrapped = `<udt-${templateKey}>{{${rebuiltContent}}}</udt-${templateKey}>`;
                    else
                        wrapped = IsEnabled(EditorSettings.StylizedTemplates, "mwtemplates", `{{${rebuiltContent}}}`);
                } else {
                    wrapped = `{{${coloredInner}}}`;
                }
            }
            else if (MwLinksRegex.test(TemplateName)) {
                wrapped = IsEnabled(EditorSettings.StylizedLinks, "mwlinks", `{{${coloredInner}}}`);
            }
            else if (MwCatRegex.test(TemplateName)) {
                wrapped = IsEnabled(EditorSettings.MwCategory, "mwcategories", `{{${coloredInner}}}`);
            }
            else if (MagicWordsTempRegex.test(block.name)) {
                wrapped = IsEnabled(EditorSettings.TempMagicWords, "tempmagicwords", `{{${coloredInner}}}`);
            }
            else if (MagicWordsAllowedRegex.test(block.name) && (block.separator != "|" && block.separator != "__NO_SEPARATOR__")) { 
                wrapped = IsEnabled(EditorSettings.TempMagicWords, "tempmagicwords", `{{${coloredInner}}}`);
            }
            else if (TimeStampRegex.test(TemplateName)) {
                wrapped = IsEnabled(EditorSettings.MwTimeStamp, "timestamp", `{{${coloredInner}}}`);
            }
            else {
                wrapped = IsEnabled(EditorSettings.StylizedTemplates, "mwtemplates", `{{${coloredInner}}}`);
            }    
        }
        else if (block.type === 3) {
            wrapped = IsEnabled(EditorSettings.MwFunctions, "mwparams", `{{{${coloredInner}}}}`);
        }
        else {
            if (!EditorSettings.Dbg_ShowWeirdBlocks) {
                wrapped = block.content;
            } else {
                // I hope this doesn't fire...
                wrapped = `<editor-invalidtag>${block.content}</editor-invalidtag>`;
                console.warn("[ColorBraces]: Got a weird block, could not indetify type: " + block.content)
            }
        }

        result += wrapped;
        lastIndex = block.end;
    }

    result += text.slice(lastIndex);

    return result;
}

function Func_AttribsFormatter(AllData, Tag, Space, Attribs, IsValid, TagType = "htmltags") {
    Attribs = Attribs.replace(/(=\s*)("|'|`)(.*?)(\2)|(=\s*)(.*?)(?= )|(=\s*)(.*?)$/gs, (match, eq, tag, txt, tag2, eq2, txt2, eq3, txt3) => {
        if (!EditorSettings.ColoredNumbers) {
            if (txt) {
                txt = txt.replace(/\b(\.?\d+(?:\.\d+)*)(px|em|deg|vh|vw|rem|%|#)?|#[0-9a-fA-F]{3,6}\b/g, '<editor-number>$&</editor-number>');
                txt = txt.replace(/\b(transparent|AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGray|DarkGrey|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkSlateGrey|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DimGrey|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gray|Grey|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGray|LightGrey|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSlateGrey|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|SlateGrey|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)\b/gi, '<editor-color>$&</editor-color>');
            }
        }
        return `<editor-${TagType}>${eq || eq2 || eq3}${tag || ''}<editor-htmlattribvalues>${txt || txt2 || txt3 || ''}</editor-htmlattribvalues>${tag2 || ''}</editor-${TagType}>`;
    });

    let IsValidTag = IsValid ? Tag : `<editor-invalidtag>${Tag}</editor-invalidtag>`;
    let attribs = Attribs !== "" ? `<editor-htmltagattribs>${Attribs}</editor-htmltagattribs>` : "";

    return `${IsValidTag}${Space || ''}${attribs}`;
}

function findTagBlocks(text) {
    if (!EditorSettings.HTMLInvalidTags)
        return [];

    const tagRegex = /&lt;\/?(\w+)(.*?)&gt;/gs;
    const results = [];
    const stack = [];

    let match;
    while ((match = tagRegex.exec(text)) !== null) {
        const full = match[0];
        const tag = match[1];
        const index = match.index;
        const isClosing = full.startsWith("&lt;/");

        // Even if its not supported, its best to have them just in case
        if (["br", "hr", "img", "input", "meta", "link"].includes(tag)) {
            continue;
        }

        if (!isClosing) {
            stack.push({ tag, index, text: full });
        } else {
            let foundIndex = stack.findLastIndex(el => el.tag === tag);

            if (foundIndex !== -1) {
                for (let i = stack.length - 1; i > foundIndex; i--) {
                    results.push({
                        valid: false,
                        open: stack[i]
                    });
                    stack.pop();
                }
                const opener = stack.pop();
                results.push({
                    valid: true,
                    open: opener,
                    close: { tag, index, text: full }
                });
            } else {
                results.push({
                    valid: false,
                    close: { tag, index, text: full }
                });
            }
        }
    }

    while (stack.length) {
        const opener = stack.pop();
        results.push({
            valid: false,
            open: opener
        });
    }

    return results;
}

function Func_MainTagsFormatter(text) {

    const tagBlocks = findTagBlocks(text);

    const invalidIndexes = new Set();
    for (const block of tagBlocks) {
        if (!block.valid) {
            if (block.open) invalidIndexes.add(block.open.index);
            if (block.close) invalidIndexes.add(block.close.index);
        }
    }

    return text.replace(/(&lt;\/?)(\w+)([ ]+)?(.*?)(\s*\/?)(&gt;)/gs, (match, Begin, Tag, Space, Attributes, Slash, End, Offset) => {
        if (!((EditorSettings.HTMLTagsFormatter && ELEMTAGS.includes(Tag)) || (EditorSettings.MwTags && WIKITAGS.includes(Tag)))) {
            return EditorSettings.HTMLUnsupportedTags ? `<editor-invalidtag>${match}</editor-invalidtag>` : match;
        }

        let CurrentTag = WIKITAGS.includes(Tag) ? "mwtags" : "htmltags";
        const isInvalidHere = invalidIndexes && invalidIndexes.has(Offset);

        if (!/&lt;\//.test(Begin)) {
            return `<editor-${CurrentTag}>${Begin}${Func_AttribsFormatter(match, Tag, Space, Attributes, !isInvalidHere, CurrentTag)}${Slash}${End}</editor-${CurrentTag}>`;
        }

        let InvalidTagName = isInvalidHere ? `<editor-invalidtag>${Tag}</editor-invalidtag>` : Tag;
        let cleanedAttribs = Attributes?.replace(/<\/?(editor|udt)-[^>]+>/g, '');

        return `<editor-${CurrentTag}>${Begin}${InvalidTagName}${Space || ''}${cleanedAttribs || ''}${Slash}${End}</editor-${CurrentTag}>`;
    });
}

function ShowAllCharacters(text) {
    return text.replace(/(<[^>]+>|[^<]+)/g, (m, isTag) => {
        if (m.startsWith("<")) return m;
        if (EditorSettings.WordWrap) {         
            return m
                .replace(/ /g, "<editor-space-w> </editor-space-w>")
                .replace(/\t/g, "<editor-tab-w>$&</editor-tab-w>")
                .replace(/\n/g, "<editor-endl-w><br></editor-endl-w>");
        }
        else {
            return m
                .replace(/ /g, "<editor-space> </editor-space>")
                .replace(/\t/g, "<editor-tab>$&</editor-tab>")
                .replace(/\n/g, "<editor-endl><br></editor-endl>");
        }
    });
}

let charsUpdateTimeout;

function updateChars(text) {
    if (!EditorSettings.ShowAllChars) return;

    clearTimeout(charsUpdateTimeout);

    charsUpdateTimeout = setTimeout(() => {
        Div_StylizedCode.innerHTML = ShowAllCharacters(text);
    }, 200);
}

function EditorFormatter() {
	var text = Div_Editor.textContent;


	if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
		text += "\n";

    StatusBar_Info("StatusBar-Len", "StatusBar-Length", text.length - 1);

	text = text.replaceAll("&", "&amp;");
	text = text.replaceAll("<", '&lt;');
	text = text.replaceAll(">", '&gt;');

	text = text.substring(0, text.length - 1);

	Div_CodeLines.innerHTML = '<editor-line>' + text.replace(/\n/g, '</editor-line>$&<editor-line>');

    //======================================================

    if (EditorSettings.HTMLTagsFormatter || EditorSettings.MwTags) {
        text = Func_MainTagsFormatter(text, true)
    }

    if (EditorSettings.StylizedTemplates || EditorSettings.StylizedLinks) {
        text = ColorBraces(text)
    }

    if (EditorSettings.MwFile ||EditorSettings.MwCategory || EditorSettings.StylizedLinks) {
        text = ColorLinkBraces(text);
        text = EditorSettings.StylizedLinks ? text.replace(/(\[)?(\w+:\/\/)(.*?)(?=[ \n]|$)/g, (match, openBracket, scheme, rest) => {
                if (!openBracket) {
                    return `<editor-mwlinks>${scheme}${rest}</editor-mwlinks>`;
                }
                return match;
            })
            : text;
    }

    if (EditorSettings.MwMagicWords) {
        text = text.replace(MagicWordsRegex, '<editor-magicwords>$&</editor-magicwords>');
    }

    if (EditorSettings.HTMLEnts)
        text = text.replace(/(&amp;amp;|&amp;)\#[0-9]{2,3};/g, '<editor-htmlents>$&</editor-htmlents>');

    if (EditorSettings.MwMnemonics) {
        text = text.replace(/(&amp;amp;|&amp;)(num|nbsp|iexcl|cent|pound|curren|yen|amp|euro|copy|reg|trade|image|weierp|real|alefsym|spades|clubs|hearts|diams|loz|tilde|circ|ensp|emsp|thinsp|zwnj|zwj|lrm|rlm|brvbar|sect|uml|ordf|shy|macr|acute|micro|para|middot|cedil|ordm|iquest|ndash|mdash|dagger|Dagger|bull|hellip|prime|Prime|oline|frasl|quot|apos|laquo|raquo|lsquo|rsquo|sbquo|ldquo|rdquo|bdquo|lsaquo|rsaquo|frac14|frac12|frac34|minus|times|divide|ne|plusmn|not|lt|gt|deg|sup1|sup2|sup3|fnof|permil|forall|part|exist|empty|nabla|isin|notin|ni|prod|sum|lowast|radic|prop|infin|ang|and|or|cap|cup|int|there4|sim|cong|asymp|equiv|le|ge|sub|sup|sube|supe|oplus|otimes|perp|sdot|lceil|rceil|lfloor|rfloor|lang|rang);/g, '<editor-htmlmnemonics>$&</editor-htmlmnemonics>');
    }

    if (EditorSettings.MwHeader)
        text = text.replace(/^(={2,6})(.+?)(\1)(\s*)(&lt;!--.*?[^\n]*)*$/gm, '<editor-mwheaders>$1<editor-mwheaders-name>$2</editor-mwheaders-name>$3</editor-mwheaders>$4$5');

    if (EditorSettings.MwPost)
        text = text.replace(/(\'{2,5})(.+?)(\1)/gm, '<editor-mwapost>$1</editor-mwapost>$2<editor-mwapost>$3</editor-mwapost>');

    if (EditorSettings.MwMarkup)
        text = text.replace(/^[*:;#]+/gm, '<editor-mwmarkup>$&</editor-mwmarkup>');

    if (EditorSettings.ColoredNumbers) {
        text = text.replace(/(\.?\d+(?:\.\d+)*)(px|em|deg|vh|vw|rem|%|#)?|#[0-9a-fA-F]{3,6}\b/g, '<editor-number>$&</editor-number>');
    }

    if (EditorSettings.MwTables) {
        text = parseWikiTables(text);
    }

    if (EditorSettings.MwMultiComments) {
        text = text.replace(/(&lt;!--)(.*?)(--&gt;|$)/gs, function (match, start, content, end) {
            let cleanedContent = content.replace(/<\/?(editor|udt)-[^>]+>/g, '');
            return `<editor-multilinecomments>${start}${cleanedContent}${end}</editor-multilinecomments>`;
        });
    }

	//======================================================

    Div_StylizedCode.innerHTML = text;

    updateChars(text)

	Func_UpdateSizes();

    Func_MoveBackToTextarea();

}