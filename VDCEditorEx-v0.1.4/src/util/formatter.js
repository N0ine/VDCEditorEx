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
            if (block.NAMES[nameIdx] === templateName.trim()) {
                return block;
            }
        }
    }
    return null;
}

/**
 * Apply coloring to top-level parameters, ignoring nested templates' inner content.
 * @param {string} inner - Raw template content inside {{...}}
 * @param {object} blockData - UDT block data with PARAMS and PARAMS_COLOR
 * @returns {string} - fully colorized template inner string
 */
function applyUDTStyles(inner, blockData) {
    const { PARAMS = {}, PARAMS_COLOR = {} } = blockData;

    const blocks = [];
    let buf = '';
    let depth2 = 0, depth3 = 0, depthLink = 0;
    for (let i = 0; i < inner.length; i++) {
        if (inner.slice(i, i + 3) === '{{{') { depth3++; buf += '{{{'; i += 2; continue; }
        if (inner.slice(i, i + 3) === '}}}') { depth3--; buf += '}}}'; i += 2; continue; }
        if (inner.slice(i, i + 2) === '{{') { depth2++; buf += '{{'; i += 1; continue; }
        if (inner.slice(i, i + 2) === '}}') { depth2--; buf += '}}'; i += 1; continue; }
        if (inner.slice(i, i + 2) === '[[') { depthLink++; buf += '[['; i += 1; continue; }
        if (inner.slice(i, i + 2) === ']]') { depthLink--; buf += ']]'; i += 1; continue; }
        if (inner[i] === '|' && depth2 === 0 && depth3 === 0 && depthLink === 0) { blocks.push(buf); buf = ''; continue; }
        buf += inner[i];
    }
    blocks.push(buf);

    const formattedBlocks = [];
    const blockKeys = [];
    let positionalIndex = 1;
    const usedIndexes = new Set();

    for (let i = 0; i < blocks.length; i++) {
        const raw = blocks[i];
        if (i === 0) { formattedBlocks.push(raw); continue; }

        let key = null;

        const eqIndex = raw.indexOf('=');
        if (eqIndex > -1) {
            key = raw.slice(0, eqIndex).trim();
        } else {
            while (usedIndexes.has(positionalIndex.toString())) positionalIndex++;
            usedIndexes.add(positionalIndex.toString());
            key = positionalIndex.toString();
        }

        blockKeys.push({
            key: key,
            full: raw,
            invalid: false
        });
    }

    const keyCount = new Map();

    for (const { key } of blockKeys) {
        keyCount.set(key, (keyCount.get(key) || 0) + 1);
    }

    for (const block of blockKeys) {
        if (keyCount.get(block.key) > 1) {
            block.invalid = true;
        }
    }

    for (let i = 0; i < blockKeys.length; i++) {
        const { key, full, invalid } = blockKeys[i];
        const paramIndex = Object.keys(PARAMS).find(k => PARAMS[k] === key);
        let styled;

        if (invalid) {
            styled = `<editor-invalidtag>${full}</editor-invalidtag>`;
        }
        else if (paramIndex && PARAMS_COLOR[paramIndex]) {
            styled = `<span style="color:${PARAMS_COLOR[paramIndex]}">${full}</span>`;
        }
        else {
            styled = full;
        }

        formattedBlocks.push(styled);
    }
   

    // ================================

    return formattedBlocks.join('|');
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
                    name: name.trim(),
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


function findTopLevelPipeIndex(text) {
    let depthTpl = 0, depthLink = 0, depthExt = 0;

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const n = text[i + 1];

        if (c === "{" && n === "{") { depthTpl++; i++; continue; }
        if (c === "}" && n === "}") { depthTpl--; i++; continue; }

        if (c === "[" && n === "[") { depthLink++; i++; continue; }
        if (c === "]" && n === "]") { depthLink--; i++; continue; }

        if (c === "[" && depthLink === 0) { depthExt++; continue; }
        if (c === "]" && depthExt > 0) { depthExt--; continue; }

        if (c === "|" && depthTpl === 0 && depthLink === 0 && depthExt === 0) {
            return i;
        }
    }
    return -1;
}

/**
 * Gets the Pipe Depth for a line, to support multi lines or to color in css in the table/line
 * @param {string} text text containing the current line
 * @returns table containing parts and a seperator index "{ parts, sepIndex }"
 */
function pipeDepth(text) {
    let parts = [];
    let buf = "";

    let depthTpl = 0;   // {{ }} and {{{ }}}
    let depthLink = 0;  // [[ ]]
    let depthExt = 0;   // [ ]

    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        const n = text[i + 1];

        // Template braces {{ }}
        if (c === "{" && n === "{") { depthTpl++; buf += "{{"; i++; continue; }
        if (c === "}" && n === "}") { depthTpl--; buf += "}}"; i++; continue; }

        // Wiki links [[ ]]
        if (c === "[" && n === "[") { depthLink++; buf += "[["; i++; continue; }
        if (c === "]" && n === "]") { depthLink--; buf += "]]"; i++; continue; }

        // Single brackets [ ] (external links)
        if (c === "[" && depthLink === 0) { depthExt++; buf += "["; continue; }
        if (c === "]" && depthExt > 0) { depthExt--; buf += "]"; continue; }

        // Top-level pipe
        if (c === "|" && depthTpl === 0 && depthLink === 0 && depthExt === 0) {
            if (buf) {
                parts.push(buf); // push content before pipe
                buf = "";
            }
            
            // check for consecutive pipe (||)
            if (n === "|") {
                parts.push("||");
                i++; // skip second pipe
            } else {
                parts.push("|");
            }
            continue;
        }

        buf += c;
    }

    if (buf) parts.push(buf); // final content

    return parts;
}


/**
 *  Optimized helper function to parse tables
 * @param {string} text text content of the editor
 * */
function findAllTables(text) {
    const results = [];
    const lines = text.split("\n");

    let stack = 0;
    let startIndex = -1;
    let charIndex = 0;

    for (let line of lines) {
        const trimmed = line.trimStart();

        // TABLE START
        if (trimmed.startsWith("{|")) {
            if (stack === 0) {
                startIndex = charIndex;
            }
            stack++;
        }

        // TABLE END
        if (trimmed.startsWith("|}")) {
            if (stack > 0) {
                stack--;
                if (stack === 0 && startIndex !== -1) {
                    const endIndex = charIndex + line.length;
                    results.push({
                        start: startIndex,
                        end: endIndex,
                        content: text.slice(startIndex, endIndex)
                    });
                    startIndex = -1;
                }
            }
        }

        charIndex += line.length + 1; // +1 for '\n'
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

        const lines = original.split("\n");
        let out = [];

        let cellOpen = false;

        for (let line of lines) {

            // TABLE START
            const tblStart = line.match(/^(\s*)(\{\|)(.*)$/);
            if (tblStart) {
                const indent  = tblStart[1];
                const token   = tblStart[2];
                const attribs = tblStart[3] || "";

                const formatted = Func_AttribsFormatter(line, "", "", attribs, true, "htmltags");
                out.push(indent + token + formatted);

                cellOpen = false;
                continue;
            }

            // TABLE END
            if (line.trim() === "|}") {
                out.push(line);
                cellOpen = false;
                continue;
            }

            // ROW START
            const tblRow = line.match(/^(\s*)(\|-)(\s*)(.*)$/);
            if (tblRow) {
                const indent    = tblRow[1];
                const token     = tblRow[2];
                const indent2   = tblRow[3];
                const attribs   = tblRow[4] || "";
                const formatted = attribs
                    ? Func_AttribsFormatter(line, "", "", attribs, true, "htmltags")
                    : "";

                out.push(indent + token + indent2 + formatted);
                cellOpen = false;
                continue;
            }

            // HEADER ROW
            const tblHeader = line.match(/^(\s*)(\!)(.*)$/);
            if (tblHeader) {
                const indent    = tblHeader[1];
                const token     = tblHeader[2];
                const content   = tblHeader[3] || "";
                const parts = pipeDepth(content);

                if (parts.length > 1) {
                    const firstPart = parts[0];
                    const formattedAttribs =
                        parts[1] !== "||" && firstPart
                            ? Func_AttribsFormatter(line, "", "", firstPart, true, "htmltags")
                            : `<editor-default>${firstPart}</editor-default>`;

                    let cells = [];

                    for (let i = 1; i < parts.length; i++) {
                        cells.push(parts[i]);
                    }

                    out.push(indent + "<editor-table-header>" + token + formattedAttribs + cells.join("") + "</editor-table-header>");

                    cellOpen = true;
                    continue;
                }

                out.push(indent + `<editor-table-header>${token + content}</editor-table-header>`);
                cellOpen = false;
                continue;
            }

            // CELL START
            const tblContent = line.match(/^(\s*)(\|)(.*)$/);
            if (tblContent) {
                const indent  = tblContent[1];
                const token   = tblContent[2];
                const content = tblContent[3] || "";
                const parts = pipeDepth(content);

                if (parts.length > 1) {
                    const firstPart = parts[0];
                    const formattedAttribs =
                        parts[1] !== "||" && firstPart
                            ? Func_AttribsFormatter(line, "", "", firstPart, true, "htmltags")
                            : `<editor-default>${firstPart}</editor-default>`;


                    let cells = []
        
                    if (parts[1] === "|" || parts[1] === "||") {
                        cells.push(`<editor-table>${parts[1]}</editor-table>`)
                    }

                    for (let i = 2; i < parts.length; i++) {
                        cells.push(parts[i] === "||" ? `<editor-table>${parts[i]}</editor-table>` : `<editor-default>${parts[i]}</editor-default>`);
                    }

                    out.push(indent + token + formattedAttribs + cells.join(""));
                    cellOpen = true;
                    continue;
                }

                out.push(indent + token + `<editor-default>${content}</editor-default>`);
                cellOpen = true;
                continue;
            }

            // MULTILINE CONTINUATION
            if (cellOpen) {
                out.push(`<editor-default>${line}</editor-default>`);
                continue;
            }

            // FALLBACK
            out.push(line);
        }

        const wrapped = `<editor-table>${out.join("\n")}</editor-table>`;
        result = result.slice(0, tpl.start) + wrapped + result.slice(tpl.end);
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
function ColorBraces(text, curDepth) {
    const blocks = findAllBracedBlocks(text);

    if (!blocks.length) return text;

    let result = '';
    let lastIndex = 0;

    const bracketTags = [ "br-1", "br-2", "br-3" ]
    const currentBrTag = bracketTags[curDepth % bracketTags.length];

    function ColorizeBracketDepth(text) {
        if (!EditorSettings.BracketColorDepth) return text;

        let open = "";
        let close = "";

        if (text.startsWith("{{{") && text.endsWith("}}}")) {
            open = "{{{";
            close = "}}}";
        } else if (text.startsWith("{{") && text.endsWith("}}")) {
            open = "{{";
            close = "}}";
        } else {
            return text;
        }

        const inner = text.slice(open.length, -close.length);

        return (
            `<editor-${currentBrTag}>${open}</editor-${currentBrTag}>` +
            inner +
            `<editor-${currentBrTag}>${close}</editor-${currentBrTag}>`
        );
    }

    function IsEnabled(value, tag, text) {
        const processed = ColorizeBracketDepth(text);
        if (value) {
            return `<editor-${tag}>${processed}</editor-${tag}>`;
        }

        return processed;
    }

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (block.start < lastIndex) continue;
        

        result += text.slice(lastIndex, block.start);

        const inner = block.content.slice(block.type, -block.type);
        const coloredInner = ColorBraces(inner, curDepth + 1);

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
                        wrapped = `<udt-${templateKey}>${ColorizeBracketDepth(`{{${rebuiltContent}}}`)}</udt-${templateKey}>`;
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
    const { masked, comments } = maskComments(Attribs);
    
    let AttribsFormatted = masked.replace(/({{=}}|=)(\s*)(?:(["'`])(.*?)\3|([^ ]+))/gs, (match, eq, space, quote, quotedValue, unquotedValue) => {
        let value = quotedValue ?? unquotedValue ?? "";
        if (value === "") return `<editor-${TagType}>${eq + space}${quote || ''}<editor-htmlattribvalues>${value}</editor-htmlattribvalues>${quote || ''}</editor-${TagType}>`;; // Don't process empty values

        if (!EditorSettings.ColoredNumbers) {
            value = value.replace(/\b(\.?\d+(?:\.\d+)*)(px|em|deg|vh|vw|rem|%|#)?|#[0-9a-fA-F]{3,6}\b/g, (match, p1, p2, offset, fullText) => {
                const before = fullText.slice(offset - 5, offset);
                const after = fullText[offset + match.length] || '';
                if (before.endsWith('&amp;') && after === ';') return match;
                return `<editor-number>${match}</editor-number>`;
            });

            value = value.replace(/\b(transparent|AliceBlue|AntiqueWhite|Aqua|Aquamarine|Azure|Beige|Bisque|Black|BlanchedAlmond|Blue|BlueViolet|Brown|BurlyWood|CadetBlue|Chartreuse|Chocolate|Coral|CornflowerBlue|Cornsilk|Crimson|Cyan|DarkBlue|DarkCyan|DarkGoldenRod|DarkGray|DarkGrey|DarkGreen|DarkKhaki|DarkMagenta|DarkOliveGreen|DarkOrange|DarkOrchid|DarkRed|DarkSalmon|DarkSeaGreen|DarkSlateBlue|DarkSlateGray|DarkSlateGrey|DarkTurquoise|DarkViolet|DeepPink|DeepSkyBlue|DimGray|DimGrey|DodgerBlue|FireBrick|FloralWhite|ForestGreen|Fuchsia|Gainsboro|GhostWhite|Gold|GoldenRod|Gray|Grey|Green|GreenYellow|HoneyDew|HotPink|IndianRed|Indigo|Ivory|Khaki|Lavender|LavenderBlush|LawnGreen|LemonChiffon|LightBlue|LightCoral|LightCyan|LightGoldenRodYellow|LightGray|LightGrey|LightGreen|LightPink|LightSalmon|LightSeaGreen|LightSkyBlue|LightSlateGray|LightSlateGrey|LightSteelBlue|LightYellow|Lime|LimeGreen|Linen|Magenta|Maroon|MediumAquaMarine|MediumBlue|MediumOrchid|MediumPurple|MediumSeaGreen|MediumSlateBlue|MediumSpringGreen|MediumTurquoise|MediumVioletRed|MidnightBlue|MintCream|MistyRose|Moccasin|NavajoWhite|Navy|OldLace|Olive|OliveDrab|Orange|OrangeRed|Orchid|PaleGoldenRod|PaleGreen|PaleTurquoise|PaleVioletRed|PapayaWhip|PeachPuff|Peru|Pink|Plum|PowderBlue|Purple|RebeccaPurple|Red|RosyBrown|RoyalBlue|SaddleBrown|Salmon|SandyBrown|SeaGreen|SeaShell|Sienna|Silver|SkyBlue|SlateBlue|SlateGray|SlateGrey|Snow|SpringGreen|SteelBlue|Tan|Teal|Thistle|Tomato|Turquoise|Violet|Wheat|White|WhiteSmoke|Yellow|YellowGreen)\b/gi, '<editor-color>$&</editor-color>');
        }
        return `<editor-${TagType}>${eq + space}${quote || ''}<editor-htmlattribvalues>${value}</editor-htmlattribvalues>${quote || ''}</editor-${TagType}>`;
    });

    let restoredAttribs = restoreComments(AttribsFormatted, comments);

    let IsValidTag = IsValid ? Tag : `<editor-invalidtag>${Tag}</editor-invalidtag>`;
    let attribs = Attribs !== "" ? `<editor-htmltagattribs>${restoredAttribs}</editor-htmltagattribs>` : "";

    return `${IsValidTag}${Space || ''}${attribs}`;
}

/**
 * Finds all &lt; ... &gt; blocks in text
 * Only returns properly closed ones
 * @param {string} text
 * @returns {Array<{start:number,end:number,content:string}>}
 */
function findAllHTMLBlocks(text) {
    const results = [];
    const stack = [];

    for (let i = 0; i < text.length; i++) {
        if (text.slice(i, i + 4) === '&lt;') {
            if (text.slice(i, i + 7) === '&lt;!--') {
                const commentEnd = text.indexOf('--&gt;', i + 7);
                if (commentEnd !== -1) {
                    i = commentEnd + 5;
                    continue;
                }
            }

            stack.push({ start: i });
        }

        else if (text.slice(i, i + 4) === '&gt;' && stack.length > 0) {
            const last = stack.pop();
            results.push({
                start: last.start,
                end: i + 4,
                content: text.slice(last.start, i + 4)
            });
        }
    }

    return results;
}

function Func_MainTagsFormatter(text) {
    const blocks = findAllHTMLBlocks(text);
    if (!blocks.length) return text;

    const unmatchedTags = new Set();
    const openingTagsByName = {};

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];
        const inner = block.content.slice(4, -4);
        const tagMatch = inner.match(/^\/?([^\s/>]+)/);
        const isClosing = inner.startsWith('/');
        const tagName = tagMatch ? tagMatch[1] : null;

        if (!tagName) continue;
        if (inner.endsWith('/')) continue;
        
        // Even if its not supported, its best to have them just in case
        // "br" and "hr" are supported, just doesn't need a closing tag
        if (["br", "hr", "img", "input", "meta", "link"].includes(tagName.toLowerCase())) {
            continue;
        }

        if (isClosing) {
            if (openingTagsByName[tagName] && openingTagsByName[tagName].length > 0) {
                openingTagsByName[tagName].pop();
            } else {
                unmatchedTags.add(i);
            }
        } else {
            if (!openingTagsByName[tagName]) {
                openingTagsByName[tagName] = [];
            }
            openingTagsByName[tagName].push(i);
        }
    }

    for (const tagName in openingTagsByName) {
        openingTagsByName[tagName].forEach(blockIndex => {
            unmatchedTags.add(blockIndex);
        });
    }

    let result = '';
    let lastIndex = 0;

    for (let i = 0; i < blocks.length; i++) {
        const block = blocks[i];

        if (block.start < lastIndex) continue;

        result += text.slice(lastIndex, block.start);

        const inner = block.content.slice(4, -4);

        const tagMatch = inner.match(/^\/?([^\s/>]+)/);
        const tagName = tagMatch ? tagMatch[1] : null;

        let wrapped;

        if (tagName) {
            const isValidTag = (EditorSettings.HTMLTagsFormatter && ELEMTAGS.includes(tagName)) || 
                              (EditorSettings.MwTags && WIKITAGS.includes(tagName));
            
            if (!isValidTag) {
                wrapped = EditorSettings.HTMLUnsupportedTags 
                    ? `<editor-invalidtag>${block.content}</editor-invalidtag>` 
                    : block.content;
            } else {
                const isInvalidHere = unmatchedTags.has(i);

                let curTag = "htmltags";
                let formatted = inner.replace(/(\/?)(\w+)([ ]+)?(.*?)(\s*\/?)$/gs, (match, SlashStart, Tag, Space, Attributes, SlashEnd, Offset) => {
                    let CurrentTag = WIKITAGS.includes(Tag) ? "mwtags" : "htmltags";
                    curTag = CurrentTag;

                    if (!/\//.test(SlashStart)) {
                        return `${Func_AttribsFormatter(match, Tag, Space, Attributes, !isInvalidHere, CurrentTag)}${SlashEnd}`;
                    }

                    let InvalidTagName = isInvalidHere ? `<editor-invalidtag>${Tag}</editor-invalidtag>` : Tag;
                    let cleanedAttribs = Attributes?.replace(/<\/?(editor|udt)-[^>]+>/g, '');

                    return `${SlashStart}${InvalidTagName}${Space || ''}${cleanedAttribs || ''}${SlashEnd}`;
                });

                wrapped = `<editor-${curTag}>&lt;` + formatted + `&gt;</editor-${curTag}>`;
            }
        } else {
            wrapped = !EditorSettings.HTMLUnsupportedTags
                ? block.content
                : `<editor-invalidtag>${block.content}</editor-invalidtag>`;
        }

        result += wrapped;
        lastIndex = block.end;
    }

    result += text.slice(lastIndex);

    return result;
}

function ShowAllCharacters(text) {
    return text.replace(/(<[^>]+>|[^<]+)/g, (m) => {
        if (m.startsWith("<")) return m;
        if (EditorSettings.WordWrap) {         
            return m.replace(/ /g, "<editor-space-w> </editor-space-w>")
                    .replace(/\t/g, "<editor-tab-w>$&</editor-tab-w>")
                    .replace(/\n/g, "<editor-endl-w>&#182;</editor-endl-w><br>");
        }
        else {
            return m.replace(/ /g, "<editor-space> </editor-space>")
                    .replace(/\t/g, "<editor-tab>$&</editor-tab>")
                    .replace(/\n/g, "<editor-endl>&#182;</editor-endl><br>");
        }
    });
}

let charsUpdateTimeout;

function updateChars(text) {
    if (!EditorSettings.ShowAllChars) return;

    clearTimeout(charsUpdateTimeout);

    charsUpdateTimeout = setTimeout(() => {
        Div_StylizedCode.innerHTML = ShowAllCharacters(text);
    }, 100);
}

//let formatterTimer;

function EditorFormatter() {
    
	var text = Div_Editor.textContent;

	if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
		text += "\n";

    StatusBar_Info("StatusBar-Len", "StatusBar-Length", text.length - 1);

    text = encodeHTML(text);

	text = text.substring(0, text.length - 1);

	Div_CodeLines.innerHTML = '<editor-line>' + text.replace(/\n/g, '</editor-line>$&<editor-line>');

    //======================================================

    Div_StylizedCode.innerHTML = text;

    //Func_UpdateSizes();

    //Func_MoveBackToTextarea();

    //clearTimeout(formatterTimer);

    //formatterTimer = setTimeout(() => {

        if (EditorSettings.HTMLTagsFormatter || EditorSettings.MwTags) {
            text = Func_MainTagsFormatter(text)
        }

        if (EditorSettings.StylizedTemplates || EditorSettings.StylizedLinks) {
            text = ColorBraces(text, 0)
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
    //}, 50);
}