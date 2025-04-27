//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// Probably it still could be optimized.
//================================================================

var Browser = (typeof InstallTrigger !== 'undefined' ? "Firefox" : "Chrome" );

async function WarnIfNewVersion()
{
	// Direct URL to the VDCEditor page.
    var page = await fetch('https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor');
    var html = await page.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, 'text/html');

    let latestBox = doc.getElementById("Ed-Latest");
    let firstTd = latestBox.querySelector('td');

    let version = firstTd.childNodes[0].textContent.trim(); 

    if (version != "v0.1.1")
    {
        console.error("New version available ($1). Limited support for VDCEditorEx.", version);

        let content = document.getElementById("bodyContent");

        let message = document.createElement("div");
        message.className = "VDCEditorEx-WarningBox mw-message-box";
		message.innerHTML = `<p>A new version of <a href="https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor" target="_blank">VDCEditor</a> (${version}) is available.<br><strong>VDCEditorEx has limited support and will no longer receive updates. Please switch to the latest version.</strong></p>`;

        let place = content.children[4];
        content.insertBefore(message, place.nextSibling);
    }
}


if (document.body.querySelector('form textarea#wpTextbox1')) {
	const IntervalId = setInterval(ExtensionLauncher, 150);

	function ExtensionLauncher() {
		if (document.body.querySelector(".wikiEditor-ui")) {
			clearInterval(IntervalId);
			WarnIfNewVersion();
			StyleMain();
			CreateToolbar();
			EditorMain();	
		}
	}
}

//================================================================
// Varibales
//================================================================

var HighlightSameAsSelected = false;
var WordWrap = false;
var ScrollAfterLastLine = false;
var StylizedTemplates = false;
var StylizedLinks = false;
var HTMLTagsFormatter = false;
var MwHighlight = false;
var MwCategory = false;
var MwFile = false;
var MwFunctions = false;
var TempMagicWords = false;
var MwHeader = false;
var MwMagicWords = false;
var MwMnemonics = false;
var MwMultiComments = false;
var MwPost = false;
var MwTags = false;
var MwTimeStamp = false;
var ColoredNumbers = false;

var DropDownWin3 = false;
var DropDownWin2 = false;
var DropDownWin = false;
var MwRtl = false;

function EditorMain()
{
	document.getElementById("editpage-copywarn").style.paddingTop = "0.5em";

	const link = document.querySelector('a.oo-ui-buttonElement-button');
	link.style.color = Ed_Color_TEXT;
	link.classList.remove('oo-ui-buttonElement-button');

	const spanExtensionLoaded = document.createElement('span');
	spanExtensionLoaded.id = 'VDCEditorEx-Loaded';
	spanExtensionLoaded.style.display = "none";
	document.getElementById('editform').appendChild(spanExtensionLoaded);

	const Div_MainEditor = document.querySelector('.wikiEditor-ui');
	const Div_SubMainToolBar = document.getElementById('wikiEditor-ui-toolbar');
	const Div_SubMainTextArea = document.querySelector('.wikiEditor-ui-text');
	const Textarea_Code = document.getElementById('wpTextbox1');

	const Div_StatusBar = document.createElement('div');
	Div_StatusBar.id = "VDCEditorEx-StatusBar";

	const span_count = document.createElement('span');
	const Span_CodeLength = document.createElement('span');
	const Span_StatusBarDivider = document.createElement('span');
	Span_StatusBarDivider.style.margin = "0 0.5em";
	Span_StatusBarDivider.style.borderRight = "1px solid #666";
	Span_StatusBarDivider.style.height = "16px";

	const Span_CaretPosition = document.createElement('span');
	Span_CaretPosition.textContent = "0";

	span_count.append(Span_CaretPosition, Span_StatusBarDivider, Span_CodeLength);

	const SelectionCount = document.createElement('span');
	SelectionCount.style.margin = "0 1.5em";
	const CurrentCount = document.createElement('span');
	CurrentCount.id = "VDCEditorEx-SelectionCount";

	SelectionCount.appendChild(CurrentCount);
	Div_StatusBar.append(SelectionCount, span_count);

	const Div_MainEditorWrapper = document.createElement('div');
	Div_MainEditorWrapper.id = "VDCEditorEx-MainWrapper";

	Div_MainEditor.parentNode.insertBefore(Div_MainEditorWrapper, Div_MainEditor);
	Div_MainEditorWrapper.append(Div_MainEditor, document.querySelector('.wikiEditor-ui-clear'), Div_StatusBar, document.querySelector('.editOptions'));

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

	const Div_SameSelection = createEditableDiv("VDCEditorEx-SameSelection");
	const Div_CodeLines = createEditableDiv("VDCEditorEx-CodeLines");
	const Div_StylizedCode = createEditableDiv("VDCEditorEx-StylizedCode");
	Div_StylizedCode.style.color = Ed_Color_TEXT;

	Div_SubMainTextArea.append(Div_SameSelection, Div_CodeLines, Div_StylizedCode);

	const Div_Editor = createEditableDiv("VDCEditorEx-Editor");
	const Div_LineNumbers = document.createElement('div');
	Div_LineNumbers.id = "VDCEditorEx-LineNumbers";
	Div_LineNumbers.style.left = "0";
	Div_LineNumbers.style.textAlign = "right";
	Div_LineNumbers.style.borderRight = "1px solid #666";

	Div_SubMainTextArea.append(Div_Editor, Div_LineNumbers);

	Div_Editor.textContent = Div_StylizedCode.textContent = Textarea_Code.value + '\n';

	function getCursorPosition(parent, node, offset, stat)
	{
		if (stat.done) return stat;

		let currentNode = null;
		
		if (parent.childNodes.length == 0) 
			stat.pos += parent.textContent.length;
		else
		{
			for (let i = 0; i < parent.childNodes.length && !stat.done; i++)
			{
				currentNode = parent.childNodes[i];
				if (currentNode === node)
				{
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

	function setCursorPosition(parent, range, stat)
	{
		if (stat.done) return range;

		if (parent.childNodes.length == 0)
		{
			if (parent.textContent.length >= stat.pos)
			{
				range.setStart(parent, stat.pos);
				stat.done = true;
			}
			else
				stat.pos = stat.pos - parent.textContent.length;
		}
		else
		{
			for (let i = 0; i < parent.childNodes.length && !stat.done; i++)
			{
				currentNode = parent.childNodes[i];
				setCursorPosition(currentNode, range, stat);
			}
		}
		return range;
	}

	function Func_UpdateLineNumbering()
	{
		const lines = document.querySelectorAll('editor-line');

		var Spans_Nums = "";

		if (WordWrap)
		{
			for (var i = 0; i < lines.length; i++)
				Spans_Nums += `<span style="height: ${lines[i].offsetHeight + 4}px;">${i + 1}</span>`;
		}
		else
		{
			for (var i = 0; i < lines.length; i++)
				Spans_Nums += `<span>${i + 1}</span>`;
		}
		
		Div_LineNumbers.innerHTML = Spans_Nums;
	}

	function Func_UpdateSizes()
	{
		Func_UpdateLineNumbering();

		if (MwRtl)
		{		
			Div_Editor.style.paddingRight = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_StylizedCode.style.paddingRight = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_SameSelection.style.paddingRight = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_CodeLines.style.paddingRight = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_Editor.style.paddingLeft = "5px";
			Div_StylizedCode.style.paddingLeft = "5px";
			Div_SameSelection.style.paddingLeft = "5px";
			Div_CodeLines.style.paddingLeft = "5px";
		}
		else
		{
			Div_Editor.style.paddingRight = "5px";
			Div_StylizedCode.style.paddingRight = "5px";
			Div_SameSelection.style.paddingRight = "5px";
			Div_CodeLines.style.paddingRight = "5px";
			Div_Editor.style.paddingLeft = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_StylizedCode.style.paddingLeft = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_SameSelection.style.paddingLeft = (5 + Div_LineNumbers.clientWidth) + "px";
			Div_CodeLines.style.paddingLeft = (5 + Div_LineNumbers.clientWidth) + "px";
		}

		Div_StylizedCode.style.color = Ed_Color_TEXT;
		Div_StylizedCode.style.width = "calc(100% - " + (10 + Div_LineNumbers.clientWidth) + "px" + ")";	
		Div_SameSelection.style.width = "calc(100% - " + (10 + Div_LineNumbers.clientWidth) + "px" + ")";
		Div_CodeLines.style.width = "calc(100% - " + (10 + Div_LineNumbers.clientWidth) + "px" + ")";
		Div_LineNumbers.style.height = "max(" + (Div_Editor.clientHeight - 4) + "px, " + (Div_SubMainTextArea.clientHeight - 4) + "px)";
	}

	function Func_ResizeEvent()
	{
		if (ScrollAfterLastLine)	
			Div_Editor.style.paddingBottom = "min(" + (Div_SubMainTextArea.clientHeight - (FontSize * 1.5) - 2) + "px, 100vh - " + (FontSize * 1.5 + 4) + "px)";
		else
			Div_Editor.style.paddingBottom = "2px";
		
		Func_UpdateSizes();

		chrome.storage.local.set({ EditorHeight: Div_SubMainTextArea.style.height });
	}
	
	var Input_Summary = document.getElementById("wpSummary");

	var Div_ResetWin = document.getElementsByClassName("wikiEditor-ui-text")[0];

	function Func_ResetWindow()
	{
		Div_ResetWin.style.height = "500px";
	}

	function Func_SummaryDir()
	{
		Input_Summary.removeAttribute("style");

		if(MwRtl)
			Input_Summary.dir = "rtl";
		else
			Input_Summary.dir = "ltr";
	}

	function Func_SelectCodePart(Start, End)
	{
		var range = document.createRange();
		var sel = window.getSelection();
		
		range.setStart(Div_Editor.childNodes[i], Start);
		range.setEnd(Div_Editor.childNodes[i], Math.min(End, parseInt(Span_CodeLength.textContent)));
		sel.removeAllRanges();
		sel.addRange(range);
	}

	new ResizeObserver(entry => { Func_ResizeEvent(); }).observe(Div_SubMainTextArea);

	function Func_MoveBackToTextarea()
	{
		Textarea_Code.value = Div_Editor.textContent;
	}

	function Func_HTMLTagsFormatter(AllData, Begin, Tag, Attributes, Slash, End)
	{
		Attributes = Attributes.replace(/(=)(\s*?)(")(.*?)(")(\s*?)/gs, '<editor-htmltags>$1$2$3</editor-htmltags><editor-htmlattribvalues>$4</editor-htmlattribvalues><editor-htmltags>$5$6</editor-htmltags>');

		return '<editor-htmltags>' + Begin + Tag + '</editor-htmltags><editor-htmltagattribs>' + Attributes + '</editor-htmltagattribs><editor-htmltags>' + Slash + End + '</editor-htmltags>';
	}

	function EditorFormatting()
	{
		var Text = Div_Editor.textContent;

		if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
			Text += "\n";

		Span_CodeLength.innerHTML = Text.length - 1;

		Text = Text.replaceAll("&", "&amp;");
		Text = Text.replaceAll("<", '&lt;');

		Text = Text.substring(0, Text.length - 1);

		Div_CodeLines.innerHTML = '<editor-line>' + Text.replace(/\n/g, '</editor-line>$&<editor-line>');

		if (MwMultiComments)
		{
			Text = Text.replace(/&lt;!--/gs, '<editor-multilinecomments>$&');
			Text = Text.replace(/-->/gs, '$&</editor-multilinecomments>');
		}

		if(HTMLTagsFormatter)
		{
			// NOTE: Regex matches from left to right. 
			//		 If shorter tags appear before longer ones, 
			//		 they may match first and prevent longer tags from being matched.
			//		 Always list longer tags before shorter ones.
			Text = Text.replace(/(&lt;\/|&lt;)(abbr|blockquote|caption|center|cite|code|data|del|dfn|div|dl|dt|em|font|h1|h2|h3|h4|h5|h6|hr|i|ins|kbd|li|mark|p|pre|q|rp|rt|ruby|samp|small|source|span|strike|strong|sub|sup|s|table|td|th|time|tr|tt|u|var|wbr|bdi|bdo|big|br|b)( .*?|)(\s*\/?)(>)/gs, Func_HTMLTagsFormatter);
		}

		if(MwTags)
		{
			Text = Text.replace(/(&lt;\/|&lt;)(categorytree|gallery|indicator|nowiki|syntaxhighlight|includeonly|onlyinclude|noinclude)( .*?|)(>)/gs, '<editor-mwtags>$&</editor-mwtags>');
		}
	
		if (MwMagicWords)
		{
			Text = Text.replace(/__NOTOC__|__FORCETOC__|__TOC__|__NOEDITSECTION__|__NEWSECTIONLINK__|__NONEWSECTIONLINK__|__NOGALLERY__|__HIDDENCAT__|__NOCONTENTCONVERT__|__NOCC__|__NOTITLECONVERT__|__NOTC__|__INDEX__|__NOINDEX__|__STATICREDIRECT__/g, '<editor-magicwords>$&</editor-magicwords>');
		}

		if (MwTimeStamp)
		{
			Text = Text.replace(/{{(CURRENT|LOCAL)(YEAR|MONTH|MONTH1|MONTH2|MONTHNAME|MONTHNAMEGEN|MONTHABBREV|DAY|DAY2|DOW|DAYNAME|TIME|HOUR|WEEK|TIMESTAMP)(.*?)}}/g, '<editor-timestamp>{{$1$2$3}}</editor-timestamp>');
		}

		if (TempMagicWords)
		{
			Text = Text.replace(/{{(SITENAME|SERVER|SERVERNAME|DIRMARK|DIRECTIONMARK|ARTICLEPATH|SCRIPTPATH|STYLEPATH|CURRENTVERSION|CONTENTLANGUAGE|CONTENTLANG|PAGEID|PAGELANGUAGE|CASCADINGSOURCES|REVISIONID|REVISIONDAY|REVISIONDAY2|REVISIONMONTH|REVISIONMONTH1|REVISIONYEAR|REVISIONTIMESTAMP|REVISIONUSER|REVISIONSIZE|NUMBEROFPAGES|NUMBEROFARTICLES|NUMBEROFFILES|NUMBEROFEDITS|NUMBEROFUSERS|NUMBEROFADMINS|NUMBEROFACTIVEUSERS|NAMESPACENUMBER)(.*?)}}/g, '<editor-magicwords>{{$1$2}}</editor-magicwords>');
			Text = Text.replace(/{{(FULLPAGE|PAGE|BASEPAGE|ROOTPAGE|SUBPAGE|SUBJECTPAGE|ARTICLEPAGE|TALKPAGE)(NAME|NAMEE)}}/g, '<editor-tempmagicwords>{{$1$2}}</editor-tempmagicwords>');
			Text = Text.replace(/{{(NAME|SUBJECT|ARTICLE|TALK)(SPACE|SPACEE)}}/g, '<editor-magicwords>{{$1$2}}</editor-magicwords>');
		}

		if (MwMnemonics)
		{
			Text = Text.replace(/(&amp;amp;|&amp;)(num|nbsp|iexcl|cent|pound|curren|yen|amp|euro|copy|reg|trade|image|weierp|real|alefsym|spades|clubs|hearts|diams|loz|tilde|circ|ensp|emsp|thinsp|zwnj|zwj|lrm|rlm|brvbar|sect|uml|ordf|shy|macr|acute|micro|para|middot|cedil|ordm|iquest|ndash|mdash|dagger|Dagger|bull|hellip|prime|Prime|oline|frasl|quot|apos|laquo|raquo|lsquo|rsquo|sbquo|ldquo|rdquo|bdquo|lsaquo|rsaquo|frac14|frac12|frac34|minus|times|divide|ne|plusmn|not|lt|gt|deg|sup1|sup2|sup3|fnof|permil|forall|part|exist|empty|nabla|isin|notin|ni|prod|sum|lowast|radic|prop|infin|ang|and|or|cap|cup|int|there4|sim|cong|asymp|equiv|le|ge|sub|sup|sube|supe|oplus|otimes|perp|sdot|lceil|rceil|lfloor|rfloor|lang|rang);/g, '<editor-htmlmnemonics>$&</editor-htmlmnemonics>');
		}

		if (MwHighlight)
		{
			Text = Text.replace(/&amp;\#[0-9]{2,3};/g, '<editor-htmlents>$&</editor-htmlents>');
		}

		if (MwCategory)
		{
			Text = Text.replace(/\[\[(Category:|category:)(.+?)]]/g, '<editor-mwcategories>[[$1$2]]</editor-mwcategories>');
			Text = Text.replace(/{{(ACategory\|)(.+?)}}/g, '<editor-mwcategories>{{$1$2}}</editor-mwcategories>');
		}

		if (MwHeader)
		{
			Text = Text.replace(/^(?<first>={2,6})(.+?)(\k<first>)$/gm, '<editor-mwheaders>$1</editor-mwheaders>$2<editor-mwheaders>$3</editor-mwheaders>');
		}
	
		if (MwPost)
		{
			Text = Text.replace(/(?<first>\'{2,5})(.+?)(\k<first>)/gm, '<editor-mwapost>$1</editor-mwapost>$2<editor-mwapost>$3</editor-mwapost>');
		}
	
		if (MwFile)
		{
			Text = Text.replace(/\[\[(File:|file:)(.+?)]]/g, '<editor-mwfiles>[[$1$2]]</editor-mwfiles>');
		}
	
		if (StylizedLinks)
		{
			Text = Text.replace(/{{(L\||Lx\||LCategory\||LHelp\||LProject\||LMainPage\||LSpecial\|)(.+?)}}/g, '<editor-mwlinks>{{$1$2}}</editor-mwlinks>');
			Text = Text.replace(/\[(https:\/\/|http:\/\/)(.+?)]/g, '<editor-mwlinks>[$1$2]</editor-mwlinks>');
			Text = Text.replace(/\[\[(?![Cc]ategory|[Ff]ile)(.+?)]]/g, '<editor-mwlinks>[[$1]]</editor-mwlinks>');
		}

		if (ColoredNumbers)
		{
			Text = Text.replace(
				/#[0-9a-fA-F]{3,6}\b/g,
				'<editor-number>$&</editor-number>'
			);

			Text = Text.replace(
				/(\d+(\.\d+)?)(px|em|deg|vh|vw|rem|%|#)?/g,
				'<editor-number>$&</editor-number>'
			);

			Text = Text.replace(
				/\bv?(\d+)(?=\.)|\.(\d+)/g,
				(match, g1, g2) => {
					if (g1) return `<editor-number>${g1}</editor-number>`;
					if (g2) return `.<editor-number>${g2}</editor-number>`;
					return match;
				}
			);
				
		}

		if (MwFunctions)
		{	
			Text = Text.replace(/({{{.+?}}})/g, '<editor-mwparams>$&</editor-mwparams>')
		}

		if (StylizedTemplates)
		{   
			Text = Text.replace(/{{/g, '<editor-mwtemplates>$&');
			Text = Text.replace(/}}/g, '$&</editor-mwtemplates>');
		}
	
		Div_StylizedCode.innerHTML = Text;

		Func_UpdateSizes();
	
		Func_MoveBackToTextarea();
	}

	EditorFormatting();

	// Purpose: Replaces Links with special templates
	function Func_ReplaceLinks()
	{
		var TextEditor = Div_Editor.innerHTML;

		var bool_confirm = confirm("Are you sure you want to replace links?\nThis can't be undone.");

		if(bool_confirm)
		{
			TextEditor = TextEditor.replace(/\[\[(?!:Category:|Category:|Category[ _]talk:|Dictionary:|file:|File:|File[ _]talk:|Google:|GoogleGroups:|help:|Help:|Help[ _]talk:|IMDB:|Image:|Image[ _]talk:|m:|M:|mw:|MW:|Media:|MediaWiki:|MediaWiki[ _]talk:|Meta:|project:|Project:|Project[ _]talk:|SdkBug:|SourceForge:|Special:|Steampowered:|Talk:|template:|Template:|Template[ _]talk:|User:|user:|User([ _]talk):|Valve[ _]Developer[ _]Community:|Valve[ _]Developer[ _]Community[ _]talk:|W:|WP:|wp:|Wiki:|wiki:|WikiBooks:|Wikipedia:|wikipedia:|Wikiquote:|Wiktionary:|c:|commons:|special:|Metawikipedia:|\#|\/)(.+?)]]/g, "{{L&#124;$2}}")
			TextEditor = TextEditor.replace(/\[\[:(Category:|category:)(.+?)]]/g, "{{LCategory&#124;$2}}")
			TextEditor = TextEditor.replace(/\[\[(Category:|category:)(.+?)]]/g, "{{ACategory&#124;$2}}")
			TextEditor = TextEditor.replace(/\[\[(Help:|help:)(.+?)]]/g, "{{LHelp&#124;$2}}")
			TextEditor = TextEditor.replace(/\[\[(Project:|project:|Valve[ _]Developer[ _]Community:)(.+?)]]/g, "{{LProject&#124;$2}}")
			TextEditor = TextEditor.replace(/\[\[(Special:|special:)(.+?)]]/g, "{{LSpecial&#124;$2}}")
	
			Div_Editor.innerHTML = TextEditor;
			EditorFormatting();
		}
	}

	Div_Editor.addEventListener('input', () => {
		
		if (Div_Editor.textContent.length == 0)
			Div_Editor.innerHTML = '\n';

		EditorFormatting();
	});

	document.getElementById('wpSave').onclick = Func_MoveBackToTextarea;
	document.getElementById('wpPreview').onclick = Func_MoveBackToTextarea;
	document.getElementById('wpDiff').onclick = Func_MoveBackToTextarea;

	function Func_SelectionChange()
	{
		try
		{
			if (HighlightSameAsSelected && window.getSelection().focusNode.parentNode.id == "VDCEditorEx-Editor")
			{
				if (window.getSelection().toString().length != 0)
				{
					var TecnicalText = Div_Editor.textContent;
					TecnicalText = TecnicalText.replaceAll("&", "&amp;");
					TecnicalText = TecnicalText.replaceAll("<", '&lt;');
					
					var selected = window.getSelection().toString();
					selected = selected.replaceAll("&", "&amp;");
					selected = selected.replaceAll("<", '&lt;');
					
					switch (selected)
					{
						case "l":
							selected = new RegExp("(?<!&)l", "g");
							break;
						
						case "t":
							selected = new RegExp("(?<!&l)t", "g");
							break;
						
						case "a":
							selected = new RegExp("(?<!&)a", "g");
							break;
						
						case "m":
							selected = new RegExp("(?<!&a)m", "g");
							break;
						
						case "p":
							selected = new RegExp("(?<!&am)p", "g");
							break;
						
						case ";":
							selected = new RegExp("(?<!&lt|&amp);", "g");
							break;
						
						case "lt":
							selected = new RegExp("(?<!&)lt", "g");
							break;
						
						case "am":
							selected = new RegExp("(?<!&)am", "g");
							break;
						
						case "mp":
							selected = new RegExp("(?<!&a)mp", "g");
							break;
						
						case "amp":
							selected = new RegExp("(?<!&)amp", "g");
							break;
						
						case "amp;":
							selected = new RegExp("(?<!&)amp;", "g");
							break;
						
						case "p;":
							selected = new RegExp("(?<!&am)p;", "g");
							break;
						
						case "mp;":
							selected = new RegExp("(?<!&a)mp;", "g");
							break;
						
						case "t;":
							selected = new RegExp("(?<!&l)t;", "g");
							break;
						
						case "lt;":
							selected = new RegExp("(?<!&)lt;", "g");
							break;
					}
					
					TecnicalText = TecnicalText.replaceAll(selected, '<span class="VDCEditorEx-SameAsSelected">$&</span>');
					
					Div_SameSelection.innerHTML = TecnicalText;
				}
				else
					Div_SameSelection.innerHTML = "";
			}
			else
				Div_SameSelection.innerHTML = "";

			const SameSelectionCount = document.getElementById('VDCEditorEx-SameSelection').querySelectorAll('.VDCEditorEx-SameAsSelected');
			CurrentCount.innerHTML = getTranslation("Found") + SameSelectionCount.length;
				
			setTimeout(() => { 
				
				const sel = window.getSelection();
				const node = sel.focusNode;
				const offset = sel.focusOffset;
				const pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });
				
				if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
					Span_CaretPosition.textContent = Math.min(pos.pos, Div_Editor.textContent.length);
				else
					Span_CaretPosition.textContent = Math.min(pos.pos, Div_Editor.textContent.length - 1);
			}, 0);
		}
		catch (e) {}
	}

	document.addEventListener("selectionchange", Func_SelectionChange);

	document.querySelector('#VDCEditorEx-Editor').onkeydown = function(e) {
		
		switch (e.keyCode)
		{
			case 90: // Z
				if (e.ctrlKey)
					setTimeout(() => { Func_SelectionChange() }, 0);
				return true;
			
			case 88: // X
				if (e.ctrlKey)
				{
					var sel = window.getSelection();
					
					if (Browser != "Firefox" && sel.toString().length == 0)
					{
						var node = sel.focusNode;
						var offset = sel.focusOffset;
						var pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });
						
						const Lines = Div_Editor.textContent.split('\n');
						var TextAmount = 0;
						
						for (var i = 0; i < Lines.length; i++)
						{
							TextAmount += Lines[i].length;
							
							if (TextAmount >= pos.pos)
							{
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
				if (e.ctrlKey)
				{
					e.preventDefault();
					
					var sel = window.getSelection();
					var node = sel.focusNode;
					var offset = sel.focusOffset;
					var pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });
					
					const Lines = Div_Editor.textContent.split('\n');
					var TextAmount = 0;
					
					for (var i = 0; i < Lines.length; i++)
					{
						TextAmount += Lines[i].length;
						
						if (TextAmount >= pos.pos)
						{
							if (sel == 0)
							{
								var CurrentLine = Div_Editor.textContent.substring(TextAmount - Lines[i].length, TextAmount);

								CurrentLine = CurrentLine.replaceAll("&", "&amp;");
								CurrentLine = CurrentLine.replaceAll("<", '&lt;');
								
								sel.removeAllRanges();
								const range = setCursorPosition(Div_Editor, document.createRange(), {
									pos: TextAmount,
									done: false,
								});
								
								range.collapse(true);
								sel.addRange(range);
								
								document.execCommand('insertHTML', false, '\n' + CurrentLine);
							}
							else
							{
								var string = sel.toString();

								string = string.replaceAll("&", "&amp;");
								string = string.replaceAll("<", '&lt;');
								
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
				
				for (var i = 0; i < Lines.length; i++)
				{
					TextAmount += Lines[i].length;
					
					if (TextAmount >= pos.pos)
					{
						TextAmount -= Lines[i].length;
						var CurrentLine = Div_Editor.textContent.substring(TextAmount, pos.pos)
						const t = CurrentLine.length;
						
						for (var l = 0; l < t; l++)
						{
							if (CurrentLine.charAt(0) == '\t')
							{
								Paddings += '\t';
								CurrentLine = CurrentLine.substring(1, CurrentLine.length);
							}
							else if (CurrentLine.charAt(0) == ' ')
							{
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

				if (Div_Editor.innerHTML.charAt(Div_Editor.innerHTML.length - 1) != '\n')
				{
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
			
			default:
				return true;
		}
	};

	const listener = document.getElementsByClassName("wikiEditor-ui-text")[0];

	listener.onkeydown = function (ev) {
		const sel = window.getSelection();
		if (!sel?.focusNode) return;

		const { focusNode, focusOffset } = sel;
		const pos = getCursorPosition(Div_Editor, focusNode, focusOffset, { pos: 0, done: false });
		const caretPos = Math.min(pos.pos, Div_Editor.textContent.length);

		Span_CaretPosition.textContent = caretPos;

		if (
			caretPos == Span_CodeLength.textContent &&
			Div_ScrollAfterLastLine.getAttribute("checked") === "false" &&
			ev.key === "Enter"
		) {
			const scrollBefore = this.scrollTop;
			this.scrollTop = this.scrollHeight;

			if (this.scrollTop === scrollBefore) {
				this.scrollTop = this.scrollHeight;
			}
		}
	};

	Div_Editor.addEventListener('paste', function (e) {
		e.preventDefault();

		var text = (e.originalEvent || e).clipboardData.getData('text/plain');

		text = text.replaceAll("&", "&amp;");
		text = text.replaceAll("<", '&lt;');

		document.execCommand("insertHTML", false, text);
	});


	Div_Editor.addEventListener('drop', function(e) {	
		e.preventDefault();
		
		var text = e.dataTransfer.getData('text/plain');

		text = text.replaceAll("&", "&amp;");
		text = text.replaceAll("<", '&lt;');
		
		var range = document.caretRangeFromPoint(e.clientX, e.clientY);
		range.deleteContents();
		
		var selection = window.getSelection();
		selection.removeAllRanges();
		selection.addRange(range);
		
		document.execCommand("insertHTML", false, text);
	});

	Input_Lang.addEventListener('change', function (e) {
		e.preventDefault();
		const upper = e.target.value.toUpperCase();

		Input_Lang.value = upper
		chrome.storage.local.set({ LANGUAGE: upper });
	});

	//================================================================
	//
	// Input events and storage events for the stylized text colors
	//
	//================================================================

	const storageTextStyle = [
		// Input elements, 			storage keys, 				variables
        [Input_CP_Highlight,		"Input_CP_Highlight",		"COLOR_Highlight"			],	
        [Input_CP_Numbers,			"Input_CP_Numbers",			"COLOR_numbers"				],
		[Input_CP_Templates, 		"Input_CP_Templates", 		"COLOR_mwtemplates"			],
		[Input_CP_Links, 			"Input_CP_Links", 			"COLOR_mwlinks"				],
		[Input_CP_HtmlEnts, 		"Input_CP_HtmlEnts", 		"COLOR_htmlents"			],
		[Input_CP_Cats, 			"Input_CP_Cats", 			"COLOR_mwcategories"		],
		[Input_CP_File, 			"Input_CP_File", 			"COLOR_mwfiles"				],
		[Input_CP_TempMW, 			"Input_CP_TempMW", 			"COLOR_tempmagicwords"		],
		[Input_CP_Header, 			"Input_CP_Header", 			"COLOR_mwheaders"			],
		[Input_CP_MagicWords, 		"Input_CP_MagicWords", 		"COLOR_magicwords"			],
		[Input_CP_Mnemonics, 		"Input_CP_Mnemonics", 		"COLOR_htmlmnemonics"		],
		[Input_CP_MultiComments, 	"Input_CP_MultiComments", 	"COLOR_multilinecomments"	],
		[Input_CP_Post, 			"Input_CP_Post", 			"COLOR_mwapost"				],
		[Input_CP_Tags, 			"Input_CP_Tags", 			"COLOR_mwtags"				],
		[Input_CP_TimeStamp, 		"Input_CP_TimeStamp", 		"COLOR_timestamp"			],
	]

	const storageEditorStyle = [
		// Input elements, 			storage keys, 				variables
		[Input_CP_Border, 			"Input_CP_Border", 			"Ed_Color_Border"			],
		[Input_CP_Background, 		"Input_CP_Background", 		"Ed_Color_Background"		],
		[Input_CP_ToolbarText, 		"Input_CP_ToolbarText", 	"Ed_Color_ToolbarText"		],
		[Input_CP_Button_Border, 	"Input_CP_Button_Border", 	"Ed_Color_Button_Border"	],
		[Input_CP_Button_BG, 		"Input_CP_Button_BG", 		"Ed_Color_Button_BG"		],
		[Input_CP_SummaryBG, 		"Input_CP_SummaryBG", 		"Ed_Color_SummaryBG"		],
		[Input_CP_ScrBar1, 			"Input_CP_ScrBar1", 		"Ed_Color_ScrBar1"			],
		[Input_CP_ScrBar2, 			"Input_CP_ScrBar2", 		"Ed_Color_ScrBar2"			],
		[Input_CP_TEXT, 			"Input_CP_TEXT", 			"Ed_Color_TEXT"				],		
	]

	function loadSettingAndStore(inputElement, storageKey, variable) {
		inputElement.addEventListener('change', function(e) {
			e.preventDefault();

			window[variable] = e.target.value;
			StyleMain();

			chrome.storage.local.set({ [storageKey]: e.target.value });
		});
	}

	function loadSettingFromStorage(inputElement, storageKey, variable) {
		chrome.storage.local.get(storageKey, function(data) {
			const storedValue = data[storageKey];
			if (isValidHex(storedValue)) {
				window[variable] = storedValue;
				inputElement.value = storedValue;
				StyleMain();
			}
		});
	}

	function isValidHex(hex) {
		return /^#([0-9A-Fa-f]{3}){1,2}$/.test(hex);
	}

	storageTextStyle.forEach(([inputElement, storageKey, variable]) => {
    	loadSettingFromStorage(inputElement, storageKey, variable);
    	loadSettingAndStore(inputElement, storageKey, variable);
	});

	
	storageEditorStyle.forEach(([inputElement, storageKey, variable]) => {
		loadSettingFromStorage(inputElement, storageKey, variable);
		loadSettingAndStore(inputElement, storageKey, variable);
	});
	
	//================================================================
	// OnClick Events
	//================================================================

	function Func_WordWrap_OnClick()
	{
		const enabled = Div_WordWrap.getAttribute("checked") == "false";

		Div_WordWrap.setAttribute("checked", String(enabled));
		WordWrap = enabled;
		chrome.storage.local.set({ Setting_WordWrap: String(enabled) });

		const whiteSpaceValue = enabled ? "pre-wrap" : "pre";
		[Div_StylizedCode, Div_SameSelection, Div_CodeLines, Div_Editor].forEach(el => {
			el.style.whiteSpace = whiteSpaceValue;
		});

		Div_Editor.style.minWidth = enabled ? "unset" : "fit-content";
		Div_Editor.style.paddingRight = enabled ? "5px" : "128px";

		Func_ResizeEvent();
	}

	//==================================================

	const buttons = [
		// button, 					editorBoolKey, 				storageKey
		//[Div_WordWrap, 				"WordWrap", 					"Setting_WordWrap"	 			],
		[Div_SameAsSelected, 		"HighlightSameAsSelected", 	"Setting_HighlightSameAsSelected" 	],
		[Div_ScrollAfterLastLine, 	"ScrollAfterLastLine", 			"Setting_ScrollAfterLastLine" 	],	
		// ----			
		[Div_HTMLTagsFormatter, 	"HTMLTagsFormatter", 		"Setting_HTMLTagsFormatter"			],
		[Div_ColoredNumbers,		"ColoredNumbers",			"Setting_ColoredNumbers"			],
		[Div_MwMagicWords,			"MwMagicWords",				"Setting_MwMagicWords"				],
		[Div_MwFunctions, 			"MwFunctions", 				"Setting_MwFunctions" 				],
		// ----
		[Div_StylizedTemplates, 	"StylizedTemplates", 		"Setting_StylizedTemplates" 		],
		[Div_StylizedLinks, 		"StylizedLinks", 			"Setting_StylizedLinks" 			],
		[Div_MwHighlight, 			"MwHighlight", 				"Setting_MwHighlight" 				],
		[Div_MwCategory, 			"MwCategory", 				"Setting_MwCategory" 				],
		[Div_MwFile, 				"MwFile", 					"Setting_MwFile" 					],
		[Div_TempMagicWords, 		"TempMagicWords", 			"Setting_TempMagicWords" 			],
		[Div_MwHeader, 				"MwHeader", 				"Setting_MwHeader" 					],
		[Div_MwMnemonics, 			"MwMnemonics", 				"Setting_MwMnemonics" 				],
		[Div_MwMultiComments, 		"MwMultiComments", 		    "Setting_MwMultilineComments" 		],
		[Div_MwPost, 				"MwPost", 					"Setting_MwPost" 					],
		[Div_MwTags, 				"MwTags", 					"Setting_MwTags" 					],
		[Div_MwTimeStamp, 			"MwTimeStamp", 				"Setting_MwTimeStamp" 				],
	]

	function toggleButton(button, editorBoolKey, storageKey)
	{
		if (button.getAttribute("checked") == "false")
		{			
			button.setAttribute("checked", "true");
			window[editorBoolKey] = true;
			chrome.storage.local.set({ [storageKey]: "true" });
		}
		else
		{			
			button.setAttribute("checked", "false");
			window[editorBoolKey] = false;			
			if (storageKey == "Setting_HighlightSameAsSelected")
				Div_SameSelection.innerHTML = "";
			chrome.storage.local.set({ [storageKey]: "false" });
		}

		EditorFormatting();
	}

	buttons.forEach(([button, editorBool, storageKey]) => { 
		button.addEventListener("click", () => toggleButton(button, editorBool, storageKey))
	});

	//==================================================

	function bindDropDownToggle(btn, main, others) {
		btn.addEventListener("click", function () {
			const isOpen = main.getAttribute("checked") === "true";

			main.setAttribute("checked", isOpen ? "false" : "true");

			others.forEach(other => {
				if (other !== main) {
					other.setAttribute("checked", "false");
				}
			});
		});
	}

	bindDropDownToggle(Div_DropDown,  Div_DropDownWin,  [Div_DropDownWin2, Div_DropDownWin3]);
	bindDropDownToggle(Div_DropDown2, Div_DropDownWin2, [Div_DropDownWin,  Div_DropDownWin3]);
	bindDropDownToggle(Div_DropDown3, Div_DropDownWin3, [Div_DropDownWin,  Div_DropDownWin2]);

	//==================================================

	function Func_rightToLeft_OnClick() {
		const setting_text = document.querySelectorAll('.VDCEditorEx-Td');
		const pref_btn = document.querySelectorAll('.VDCEditorEx-DropDown-Btn');
		const style_input = document.querySelectorAll('.VDCEditorEx-DropDown-Colorpicker');
		const wpMinoredit = document.getElementById("mw-editpage-minoredit");
		const isRtl = Td_rtl_btn.getAttribute("checked") === "false";

		const config = {
			true: {
				dir: "rtl",
				lineNumbers: { side: "right", align: "left", border: "borderLeft" },
				marginLeft: "1em", marginRight: "0em",
				dropdowns: ["10.7em", "7em", "1.3em"],
				langPos: "0.9em",
				paddingSide: "paddingLeft",
				btnSide: "left",
				icon: "MwBtnChecked.png",
				setting: "true"
			},
			false: {
				dir: "ltr",
				lineNumbers: { side: "left", align: "right", border: "borderRight" },
				marginLeft: "0em", marginRight: "1em",
				dropdowns: ["10.7em", "7em", "1.3em"],
				langPos: "0.9em",
				paddingSide: "paddingRight",
				btnSide: "right",
				icon: "MwBtnUnchecked.png",
				setting: "false"
			}
		};

		const c = config[isRtl];

		[
			Div_LineNumbers, Div_DropDownWin3, Div_DropDownWin2, Div_DropDownWin,
			Td_rtl, Td_rtl_btn, Td_ResWin, Td_ResWin_btn,
			Td_CP_Templates, Input_CP_Templates, Td_CP_Links, Input_CP_Links,
			Td_CP_Cats, Input_CP_Cats, Td_CP_HtmlEnts, Input_CP_HtmlEnts, Td_CP_File, Input_CP_File,
			Td_CP_TempMW, Input_CP_TempMW, Td_CP_Header, Input_CP_Header,
			Td_CP_MagicWords, Input_CP_MagicWords, Td_CP_Mnemonics, Input_CP_Mnemonics,
			Td_CP_MultiComments, Input_CP_MultiComments, Td_CP_Post, Input_CP_Post,
			Td_CP_Tags, Input_CP_Tags, Td_CP_TimeStamp, Input_CP_TimeStamp,
			Td_Lang, Input_Lang, Td_CP_Border, Input_CP_Border,
			Td_CP_Background, Input_CP_Background, Td_CP_ToolbarText, Input_CP_ToolbarText,
			Td_CP_Button_Border, Input_CP_Button_Border, Td_CP_Button_BG, Input_CP_Button_BG,
			Td_CP_SummaryBG, Input_CP_SummaryBG, Td_CP_ScrBar1, Input_CP_ScrBar1,
			Td_CP_ScrBar2, Input_CP_ScrBar2, Td_CP_TEXT, Input_CP_TEXT
		].forEach(el => el.removeAttribute("style"));

		Td_rtl_btn.setAttribute("checked", isRtl);
		Td_rtl_btn.innerHTML = `<img src="${chrome.runtime.getURL("images/settings/" + c.icon)}">`;
		document.getElementById("mw-content-text").setAttribute("dir", c.dir);

		Div_LineNumbers.style[c.lineNumbers.side] = "0";
		Div_LineNumbers.style.textAlign = c.lineNumbers.align;
		Div_LineNumbers.style[c.lineNumbers.border] = `1px solid ${Ed_Color_Border}`;

		[Div_DropDownWin3, Div_DropDownWin2, Div_DropDownWin].forEach((el, i) => {
			el.style[c.btnSide] = c.dropdowns[i];
		});

		Input_Lang.style[c.btnSide] = c.langPos;
		wpMinoredit.style.marginLeft = c.marginLeft;
		wpMinoredit.style.marginRight = c.marginRight;

		setting_text.forEach(el => {
			el.style[c.paddingSide] = "3em";
		});
		pref_btn.forEach(el => {
			el.style[c.btnSide] = "1em";
		});
		style_input.forEach(el => {
			el.style[c.btnSide] = "1em";
		});

		MwRtl = isRtl;
		chrome.storage.local.set({ Setting_MwRtl: c.setting });

		Func_SummaryDir();
		Func_ResizeEvent();
	}


	function Func_ResetColors()
	{
		var bool_confirm = confirm("Are you sure you want to reset color?\nThis can't be undone.");

		if (!bool_confirm)
			return;

		COLOR_multilinecomments 	= "#228B22";		Input_CP_MultiComments.value= "#228B22";
		COLOR_magicwords 			= "#40E0D0";		Input_CP_MagicWords.value 	= "#40E0D0";
		COLOR_tempmagicwords 		= "#40E0D0";		Input_CP_TempMW.value 		= "#40E0D0";
		COLOR_htmlents 				= "#00FCFF";		Input_CP_HtmlEnts.value 	= "#00FCFF";
		COLOR_htmlmnemonics 		= "#00FCFF";		Input_CP_Mnemonics.value 	= "#00FCFF";
		COLOR_mwtags 				= "#5F9EA0";		Input_CP_Tags.value 		= "#5F9EA0";
		COLOR_mwheaders 			= "#D2B48C";		Input_CP_Header.value 		= "#D2B48C";
		COLOR_mwapost			 	= "#369FFF";		Input_CP_Post.value 		= "#369FFF";
		COLOR_mwtemplates 			= "#EE69B1";		Input_CP_Templates.value 	= "#EE69B1";
		COLOR_mwcategories 			= "#01B700";		Input_CP_Cats.value 		= "#01B700";
		COLOR_mwlinks 				= "#87CEEB";		Input_CP_Links.value 		= "#87CEEB";
		COLOR_mwfiles 				= "#FFE599";		Input_CP_File.value 		= "#FFE599";
		COLOR_timestamp 			= "#40E0D0";		Input_CP_TimeStamp.value 	= "#40E0D0";
		COLOR_numbers				= "#FFB300";		Input_CP_Numbers.value		= "#FFB300";
		COLOR_Highlight				= "#5d5d2c";		Input_CP_Highlight.value	= "#5d5d2c";

		StyleMain();
			
		chrome.storage.local.set({  
			Input_CP_MultiComments:	"#228B22",
			Input_CP_MagicWords:	"#40E0D0",
			Input_CP_TempMW:		"#40E0D0",
			Input_CP_HtmlEnts:		"#00FCFF",
			Input_CP_Mnemonics:		"#00FCFF",
			Input_CP_Tags:			"#5F9EA0",
			Input_CP_Header:		"#D2B48C",
			Input_CP_Post:			"#369FFF",
			Input_CP_Templates:		"#EE69B1",
			Input_CP_Cats:			"#01B700",
			Input_CP_Links:			"#87CEEB",
			Input_CP_File:			"#FFE599",
			Input_CP_TimeStamp:		"#40E0D0",
			Input_CP_Numbers:		"#FFB300",
			Input_CP_Highlight:		"#5d5d2c"
		});
	}

	function Func_ResetColors_Editor()
	{
		var bool_confirm = confirm("Are you sure you want to reset color?\nThis can't be undone.");

		if (!bool_confirm)
			return;

		Ed_Color_Border 		= "#666666";	Input_CP_Border.value 			= "#666666"; 
		Ed_Color_Background 	= "#202020";	Input_CP_Background.value 		= "#202020";
		Ed_Color_ToolbarText 	= "#ffb317";	Input_CP_ToolbarText.value 		= "#ffb317";
		Ed_Color_Button_Border 	= "#7f5400";	Input_CP_Button_Border.value 	= "#7f5400";
		Ed_Color_Button_BG 		= "#422c00";	Input_CP_Button_BG.value 		= "#422c00";
		Ed_Color_SummaryBG 		= "#3A3A3A";	Input_CP_SummaryBG.value 		= "#3A3A3A";
		Ed_Color_ScrBar1 		= "#666666";	Input_CP_ScrBar1.value 			= "#666666";
		Ed_Color_ScrBar2 		= "#2A2A2A";	Input_CP_ScrBar2.value 			= "#2A2A2A";
		Ed_Color_TEXT 			= "#D8D7D6";	Input_CP_TEXT.value 			= "#D8D7D6";

		StyleMain();
		Div_StylizedCode.style.color = Ed_Color_TEXT;

		chrome.storage.local.set({  
			Input_CP_Border: 		"#666666",
			Input_CP_Background: 	"#202020",
			Input_CP_ToolbarText: 	"#ffb317",
			Input_CP_Button_Border: "#7f5400",
			Input_CP_Button_BG: 	"#422c00",
			Input_CP_SummaryBG: 	"#3A3A3A",
			Input_CP_ScrBar1: 		"#666666",
			Input_CP_ScrBar2: 		"#2A2A2A",
			Input_CP_TEXT: 			"#D8D7D6",
		});
	}

	//================================================================
	//
	// Attach an Event
	//
	//================================================================

	Div_WordWrap.onclick = Func_WordWrap_OnClick;

	Div_ReplaceLinks.onclick = Func_ReplaceLinks;
	Td_rtl_btn.onclick = Func_rightToLeft_OnClick;
	Td_ResWin_btn.onclick = Func_ResetWindow;
	Div_Reset_btn.onclick = Func_ResetColors;
	Div_Reset_btn2.onclick = Func_ResetColors_Editor;
	
	//================================================================
	//
	// Chrome Storage
	//
	//================================================================

	function loadStoredSettings(buttons) {
		buttons.forEach(([button, editorBoolKey, storageKey]) => {
			chrome.storage.local.get(storageKey, (data) => {
				if (data[storageKey] == "true") {
					toggleButton(button, editorBoolKey, storageKey);
				}
			});
		});
	}

	loadStoredSettings(buttons);

	chrome.storage.local.get('Setting_WordWrap', function(data) {

		if (data.Setting_WordWrap == "true")
		{
			Func_WordWrap_OnClick();
		}
		else
		{
			Div_StylizedCode.style.whiteSpace = "pre";
			Div_SameSelection.style.whiteSpace = "pre";
			Div_CodeLines.style.whiteSpace = "pre";
			Div_Editor.style.whiteSpace = "pre";
			Div_Editor.style.minWidth = "fit-content";
			Div_Editor.style.paddingRight = "128px";
		}
			
	});

	chrome.storage.local.get('EditorHeight', function(data) {

		if (data.EditorHeight)
			Div_SubMainTextArea.style.height = data.EditorHeight;
		else
			Div_SubMainTextArea.style.height = "500px";
	});
	
	chrome.storage.local.get('LANGUAGE', function(data) {
		
		Input_Lang.value = data.LANGUAGE
		chrome.storage.local.set({ LANGUAGE: data.LANGUAGE});
	});

	chrome.storage.local.get("Setting_MwRtl", (data) => {
		if (data.Setting_MwRtl == "true") {
			Func_rightToLeft_OnClick();
			chrome.storage.local.set({ Setting_MwRtl: "true" });
		}
	});
}