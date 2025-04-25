//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

var Browser = (typeof InstallTrigger !== 'undefined' ? "Firefox" : "Chrome" );

BeforeStart();

function BeforeStart(evt)
{
	if ((document.getElementById('wpTextbox1')) && !document.getElementById('VDCEditorEx-Loaded'))
	{
		var jsInitChecktimer = setInterval(checkForJS_Finish, 1100);

		function checkForJS_Finish()
		{
			if (document.getElementById("wikiEditor-ui-toolbar"))
			{
				clearInterval(jsInitChecktimer);

				if (document.getElementById('VDCEditor-Loaded'))
				{
					console.error("VDCEditor is enabled, please disable the extension.");

					let content = document.getElementById("bodyContent")

					let message = document.createElement("div");
					message.classList = "mw-message-box-warning mw-message-box"
					message.innerHTML = "<p><strong>VDCEditorEx:</strong> <i>VDCEditor</i> is enabled, please disable the extension to use <b>VDCEditorExtended</b>.</p>"
	
					let place = content.children[4];

					content.insertBefore(message, place.nextSibling);
				}
				else
				{
					StyleMain();
					CreateToolbar();
					EditorMain();		
				}				
			}
		}
	}
}

function EditorMain()
{
	var Editor_copywarn = document.getElementById("editpage-copywarn");
	Editor_copywarn.style.paddingTop = "0.5em"; // by default, the text is way to close to the button, this fixes it
	
	var link = document.querySelector('a.oo-ui-buttonElement-button');
	link.style.color = Ed_Color_TEXT;
	link.classList.remove('oo-ui-buttonElement-button');


	let Span_ExtensionLoaded = document.createElement('span');
	
	Span_ExtensionLoaded.id = 'VDCEditorEx-Loaded';
	Span_ExtensionLoaded.style.display = "none";
	
	document.getElementById('editform').appendChild(Span_ExtensionLoaded);

	const Div_MainEditor = document.getElementsByClassName('wikiEditor-ui')[0];
	const Div_SubMainToolBar = document.getElementById('wikiEditor-ui-toolbar');
	const Div_SubMainTextArea = document.getElementsByClassName('wikiEditor-ui-text')[0];
	const Textarea_Code = document.getElementById('wpTextbox1');

	//================================================================
	// Varibales
	//================================================================

	var HighlightSameAsSelected = false;
	var WordWrap = false;
	var ScrollAfterLastLine = false;
	var ScrollNewLine = true;
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

	var Div_StatusBar = document.createElement('div');
	Div_StatusBar.id = "VDCEditorEx-StatusBar";

	var span_count = document.createElement('span');

	var Span_CodeLength = document.createElement('span');

	var Span_StatusBarDivider = document.createElement('span');
	Span_StatusBarDivider.style.margin = "0 0.5em";
	Span_StatusBarDivider.style.borderRight = "1px solid #666";
	Span_StatusBarDivider.style.height = "16px";

	var Span_CaretPosition = document.createElement('span');
	Span_CaretPosition.textContent = "0";

	span_count.appendChild(Span_CaretPosition);
	span_count.appendChild(Span_StatusBarDivider);
	span_count.appendChild(Span_CodeLength);

	

	var SelectionCount = document.createElement('span');

	SelectionCount.style.margin = "0 1.5em";
	var CurrentCount = document.createElement('span');
	CurrentCount.id = "VDCEditorEx-SelectionCount";

	SelectionCount.appendChild(CurrentCount);

	Div_StatusBar.appendChild(SelectionCount);
	Div_StatusBar.appendChild(span_count);

	var Div_MainEditorWrapper = document.createElement('div');

	Div_MainEditorWrapper.id = "VDCEditorEx-MainWrapper";

	Div_MainEditor.parentNode.insertBefore(Div_MainEditorWrapper, Div_MainEditor);

	Div_MainEditorWrapper.appendChild(Div_MainEditor);
	Div_MainEditorWrapper.appendChild(document.getElementsByClassName('wikiEditor-ui-clear')[0]);
	Div_MainEditorWrapper.appendChild(Div_StatusBar);
	Div_MainEditorWrapper.appendChild(document.getElementsByClassName('editOptions')[0]);

	var Div_SameSelection = document.createElement('div');

	Div_SameSelection.id = "VDCEditorEx-SameSelection";

	Div_SameSelection.setAttribute("contenteditable", "true");
	Div_SameSelection.setAttribute("tabindex", "-1");
	Div_SameSelection.setAttribute("translate", "no");
	Div_SameSelection.setAttribute("spellcheck", "false");
	Div_SameSelection.setAttribute("autocorrect", "off");
	Div_SameSelection.setAttribute("autocapitalize", "off");

	Div_SubMainTextArea.appendChild(Div_SameSelection);

	var Div_CodeLines = document.createElement('div');

	Div_CodeLines.id = "VDCEditorEx-CodeLines";

	Div_CodeLines.setAttribute("contenteditable", "true");
	Div_CodeLines.setAttribute("tabindex", "-1");
	Div_CodeLines.setAttribute("translate", "no");
	Div_CodeLines.setAttribute("spellcheck", "false");
	Div_CodeLines.setAttribute("autocorrect", "off");
	Div_CodeLines.setAttribute("autocapitalize", "off");

	Div_SubMainTextArea.appendChild(Div_CodeLines);

	var Div_StylizedCode = document.createElement('div');

	Div_StylizedCode.id = "VDCEditorEx-StylizedCode";

	Div_StylizedCode.style.color = Ed_Color_TEXT;

	Div_StylizedCode.setAttribute("contenteditable", "true");
	Div_StylizedCode.setAttribute("tabindex", "-1");
	Div_StylizedCode.setAttribute("translate", "no");
	Div_StylizedCode.setAttribute("spellcheck", "false");
	Div_StylizedCode.setAttribute("autocorrect", "off");
	Div_StylizedCode.setAttribute("autocapitalize", "off");

	Div_SubMainTextArea.appendChild(Div_StylizedCode);

	var Div_Editor = document.createElement('div');

	Div_Editor.id = "VDCEditorEx-Editor";

	Div_Editor.setAttribute("contenteditable", "true");
	Div_Editor.setAttribute("translate", "no");
	Div_Editor.setAttribute("spellcheck", "false");
	Div_Editor.setAttribute("autocorrect", "off");
	Div_Editor.setAttribute("autocapitalize", "off");

	Div_SubMainTextArea.appendChild(Div_Editor);

	var Div_LineNumbers = document.createElement('div');
	Div_LineNumbers.id = "VDCEditorEx-LineNumbers";
	Div_LineNumbers.style.left = "0";
	Div_LineNumbers.style.textAlign = "right";
	Div_LineNumbers.style.borderRight = "1px solid #666";

	Div_SubMainTextArea.appendChild(Div_LineNumbers);

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
			{
				// BUG: This messes up the height when the text size is above or under 14 px and 'i' with wordwrap is worse...
				Spans_Nums += `<span style="height: ${lines[i].offsetHeight + 4}px;">${i + 1}</span>`;

			}
		}
		else
		{
			for (var i = 0; i < lines.length; i++)
			{
				Spans_Nums += `<span>${i + 1}</span>`;
			}
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

		chrome.storage.sync.set({ EditorHeight: Div_SubMainTextArea.style.height });
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
		{
			Input_Summary.dir = "rtl";
		}
		else
		{
			Input_Summary.dir = "ltr";
		}
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

	new ResizeObserver(entry => {
		
		Func_ResizeEvent();
		
	}).observe(Div_SubMainTextArea);

	function Func_MoveBackToTextarea()
	{
		Textarea_Code.value = Div_Editor.textContent;
	}

	function Func_HTMLTagsFormatter(AllData, Begin, Tag, Slash, Attributes, End)
	{
		Attributes = Attributes.replace(/(?<==)(".*?"|[^ ].*?(?= |\n|$|")(\S*))/gs, '<editor-htmlattribvalues>$&</editor-htmlattribvalues>');

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

		//Text = Text.replace(/"(.*?)"/gs, '<span style="color:red">$&</span>');

		//Text = Text.replace(/(\\.)/gs, '<span style="color:orange">$1</span>');

		if (MwMultiComments)
		{
			Text = Text.replace(/&lt;!--/gs, '<editor-multilinecomments>$&');
			Text = Text.replace(/-->/gs, '$&</editor-multilinecomments>');
		}

		if(HTMLTagsFormatter)
		{
			Text = Text.replace(/(&lt;\/|&lt;)(abbr|bdi|bdo|big|blockquote|b|br|caption|center|cite|code|data|dd|dfn|del|div|dl|dt|font|hr|h1|h2|h3|h4|h5|h6|ins|i|kbd|li|mark|p|em|pre|q|rp|rt|ruby|s|samp|small|source|span|strike|strong|sub|sup|table|td|th|time|tr|tt|u|var|wbr)(\/|)( .+?|)(>)/gs, Func_HTMLTagsFormatter);
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
			Text = Text.replace(/&amp;\#[0-9]{2,3};/g, '<editor-htmlnum>$&</editor-htmlnum>');
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
			Text = Text.replace(/#(?!default|switch|if|ifeq|ifexist)([A-Za-z0-9]{3,8})/g, '<editor-number>#$1</editor-number>');
			Text = Text.replace(/[+-]?(\.)?\b\d+(px|em|deg|vh|vw|%)?/g, '<editor-number>$&</editor-number>');
				
		}

		if (MwFunctions)
		{	
			//Text = Text.replace(/({{{.+\|{{{.+\|{{{.+\|{{{.+\|{{{.+}}}\s?}}}\s?}}}\s?}}}\s?}}})|({{{.+\|{{{.+\|{{{.+\|{{{.+}}}\s?}}}\s?}}}\s?}}})|({{{.+\|{{{.+\|{{{.+}}}\s?}}}\s?}}})|({{{.+\|{{{.+}}}\s?}}})/g, '<editor-mwparams>$&</editor-mwparams>');
			Text = Text.replace(/({{{.+?}}})/g, '<editor-mwparams>$&</editor-mwparams>')
		}

		if (StylizedTemplates)
		{   
			Text = Text.replace(/{{(?!\#switch:|\#if:|\#ifeq:|\#iferror:|\#ifexpr:|\#expr:|\#time:)/g, '<editor-mwtemplates>$&');
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


	var listener = document.getElementsByClassName("wikiEditor-ui-text")[0];

	listener.onkeydown = function(ev) {
		
		const sel = window.getSelection();
		const node = sel.focusNode;
		const offset = sel.focusOffset;
		const pos = getCursorPosition(Div_Editor, node, offset, { pos: 0, done: false });

		var caretpos = Span_CaretPosition.textContent = Math.min(pos.pos, Div_Editor.textContent.length)

		if (ScrollNewLine) // Scroll down on a new line when pressing enter
		{
			if (caretpos == Span_CodeLength.textContent && Div_ScrollAfterLastLine.getAttribute("checked") == "false")
			{
				switch (ev.keyCode){
				case 13: //Enter
				var ScrollPosition = this.scrollTop;

				this.scrollTop = this.scrollHeight;
		
				if (this.scrollTop === ScrollPosition)
				{
					this.scrollTop = this.scrollHeight;
				}}
			}
		}
	};

	Div_Editor.addEventListener('paste', function (e) {
		
		// cancel paste
		e.preventDefault();

		// get text representation of clipboard
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

	Input_CP_Templates.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwtemplates = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Templates: e.target.value});
	});

	Input_Lang.addEventListener('change', function(e) {
		e.preventDefault();
		const upper = e.target.value.toUpperCase();
		console.log(upper);

		Input_Lang.value = upper
		chrome.storage.sync.set({ LANGUAGE: upper});
	});

	Input_CP_Links.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwlinks = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Links: e.target.value});
	});
	

	Input_CP_HtmlNum.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_htmlnum = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_HtmlNum: e.target.value});
	});

	Input_CP_Cats.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwcategories = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Cats: e.target.value});
	});

	Input_CP_File.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwfiles = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_File: e.target.value});
	});

	Input_CP_TempMW.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_tempmagicwords = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_TempMW: e.target.value});
	});

	Input_CP_Header.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwheaders = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Header: e.target.value});
	});

	Input_CP_MagicWords.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_magicwords = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_MagicWords: e.target.value});
	});

	Input_CP_Mnemonics.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_htmlmnemonics = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Mnemonics: e.target.value});
	});

	Input_CP_MultiComments.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_multilinecomments = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_MultiComments: e.target.value});
	});

	Input_CP_Post.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwapost = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Post: e.target.value});
	});

	Input_CP_Tags.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_mwtags = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Tags: e.target.value});
	});

	Input_CP_TimeStamp.addEventListener('change', function(e) {
		e.preventDefault();
		COLOR_timestamp = e.target.value
		StyleMain();
		chrome.storage.sync.set({ Input_CP_TimeStamp: e.target.value});
	});

	// Editor colors

	Input_CP_Border.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_Border = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Border: e.target.value });
	});
	
	Input_CP_Background.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_Background = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Background: e.target.value });
	});
	
	Input_CP_ToolbarText.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_ToolbarText = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_ToolbarText: e.target.value });
	});
	
	Input_CP_Button_Border.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_Button_Border = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Button_Border: e.target.value });
	});
	
	Input_CP_Button_BG.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_Button_BG = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_Button_BG: e.target.value });
	});
	
	Input_CP_SummaryBG.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_SummaryBG = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_SummaryBG: e.target.value });
	});
	
	Input_CP_ScrBar1.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_ScrBar1 = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_ScrBar1: e.target.value });
	});
	
	Input_CP_ScrBar2.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_ScrBar2 = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_ScrBar2: e.target.value });
	});
	
	Input_CP_TEXT.addEventListener('change', function(e) {
		e.preventDefault();
		Ed_Color_TEXT = e.target.value;
		Div_StylizedCode.style.color = e.target.value;
		StyleMain();
		chrome.storage.sync.set({ Input_CP_TEXT: e.target.value });
	});

	//================================================================
	// OnClick Events
	//================================================================

	function Func_HighlightSameAsSelected_OnClick()
	{
		if (Div_SameAsSelected.getAttribute("checked") == "false")
		{
			chrome.storage.sync.set({ Setting_HighlightSameAsSelected: "true" });
			Div_SameAsSelected.setAttribute("checked", "true");
			HighlightSameAsSelected = true;
			setTimeout(() => { Func_SelectionChange() }, 0);
		}
		else
		{
			chrome.storage.sync.set({ Setting_HighlightSameAsSelected: "false" });
			Div_SameAsSelected.setAttribute("checked", "false");
			HighlightSameAsSelected = false;
			Div_SameSelection.innerHTML = "";
		}
	}

	function Func_WordWrap_OnClick()
	{
		if (Div_WordWrap.getAttribute("checked") == "false")
		{
			chrome.storage.sync.set({ Setting_WordWrap: "true" });
			Div_WordWrap.setAttribute("checked", "true");
			WordWrap = true;
			Div_StylizedCode.style.whiteSpace = "pre-wrap";
			Div_SameSelection.style.whiteSpace = "pre-wrap";
			Div_CodeLines.style.whiteSpace = "pre-wrap";
			Div_Editor.style.whiteSpace = "pre-wrap";
			Div_Editor.style.minWidth = "unset";
			Div_Editor.style.paddingRight = "5px";
		}
		else
		{
			chrome.storage.sync.set({ Setting_WordWrap: "false" });
			Div_WordWrap.setAttribute("checked", "false");
			WordWrap = false;
			Div_StylizedCode.style.whiteSpace = "pre";
			Div_SameSelection.style.whiteSpace = "pre";
			Div_CodeLines.style.whiteSpace = "pre";
			Div_Editor.style.whiteSpace = "pre";
			Div_Editor.style.minWidth = "fit-content";
			Div_Editor.style.paddingRight = "128px";
		}

		Func_ResizeEvent();
	}

	function Func_ScrollAfterLastLine_OnClick()
	{
		if (Div_ScrollAfterLastLine.getAttribute("checked") == "false")
		{
			chrome.storage.sync.set({ Setting_ScrollAfterLastLine: "true" });
			Div_ScrollAfterLastLine.setAttribute("checked", "true");
			ScrollAfterLastLine = true;
		}
		else
		{
			chrome.storage.sync.set({ Setting_ScrollAfterLastLine: "false" });
			Div_ScrollAfterLastLine.setAttribute("checked", "false");
			ScrollAfterLastLine = false;
		}
		
		Func_ResizeEvent();
	}

	function Func_StylizedTemplates_OnClick()
	{
		if (Div_StylizedTemplates.getAttribute("checked") == "false")
		{
			chrome.storage.sync.set({ Setting_StylizedTemplates: "true" });
			Div_StylizedTemplates.setAttribute("checked", "true");
			StylizedTemplates = true;
		}
		else
		{
			chrome.storage.sync.set({ Setting_StylizedTemplates: "false" });
			Div_StylizedTemplates.setAttribute("checked", "false");
			StylizedTemplates = false;
		}
		
		EditorFormatting();
	}
	
	function Func_StylizedLinks_OnClick()
	{
		if (Div_StylizedLinks.getAttribute("checked") == "false")
		{
			chrome.storage.sync.set({ Setting_StylizedLinks: "true" });
			Div_StylizedLinks.setAttribute("checked", "true");
			StylizedLinks = true;
		}
		else
		{
			chrome.storage.sync.set({ Setting_StylizedLinks: "false" });
			Div_StylizedLinks.setAttribute("checked", "false");
			StylizedLinks = false;
		}
		
		EditorFormatting();
	}

	//==================================================

	function Func_ReplaceLinks_OnClick()
	{
		Func_ReplaceLinks();
	}

	//==================================================

	
	function Func_HTMLTagsFormatter_OnClick()
	{
		if (Div_HTMLTagsFormatter.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_HTMLTagsFormatter: "true" });
				Div_HTMLTagsFormatter.setAttribute("checked", "true");
				HTMLTagsFormatter = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_HTMLTagsFormatter: "false" });
				Div_HTMLTagsFormatter.setAttribute("checked", "false");
				HTMLTagsFormatter = false;
			}
			
			EditorFormatting();
	}

	function Func_ColoredNumbers_OnClick()
	{
		if (Div_ColoredNumbers.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_ColoredNumbers: "true" });
				Div_ColoredNumbers.setAttribute("checked", "true");
				ColoredNumbers = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_ColoredNumbers: "false" });
				Div_ColoredNumbers.setAttribute("checked", "false");
				ColoredNumbers = false;
			}
			
			EditorFormatting();
	}

	function Func_MwHighlight_OnClick()
	{
		if (Div_MwHighlight.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwHighlight: "true" });
				Div_MwHighlight.setAttribute("checked", "true");
				MwHighlight = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwHighlight: "false" });
				Div_MwHighlight.setAttribute("checked", "false");
				MwHighlight = false;
			}
			
			EditorFormatting();
	}
	

	function Func_MwCategory_OnClick()
	{
		if (Div_MwCategory.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwCategory: "true" });
				Div_MwCategory.setAttribute("checked", "true");
				MwCategory = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwCategory: "false" });
				Div_MwCategory.setAttribute("checked", "false");
				MwCategory = false;
			}
			
			EditorFormatting();
	}

	function Func_MwFile_OnClick()
	{
		if (Div_MwFile.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwFile: "true" });
				Div_MwFile.setAttribute("checked", "true");
				MwFile = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwFile: "false" });
				Div_MwFile.setAttribute("checked", "false");
				MwFile = false;
			}
			
			EditorFormatting();
	}

	function Func_TempMagicWords_OnClick()
	{
		if (Div_TempMagicWords.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_TempMagicWords: "true" });
				Div_TempMagicWords.setAttribute("checked", "true");
				TempMagicWords = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_TempMagicWords: "false" });
				Div_TempMagicWords.setAttribute("checked", "false");
				TempMagicWords = false;
			}
			
			EditorFormatting();
	}

	function Func_MwHeader_OnClick()
	{
		if (Div_MwHeader.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwHeader: "true" });
				Div_MwHeader.setAttribute("checked", "true");
				MwHeader = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwHeader: "false" });
				Div_MwHeader.setAttribute("checked", "false");
				MwHeader = false;
			}
			
			EditorFormatting();
	}


	function Func_MwMagicWords_OnClick()
	{
		if (Div_MwMagicWords.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwMagicWords: "true" });
				Div_MwMagicWords.setAttribute("checked", "true");
				MwMagicWords = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwMagicWords: "false" });
				Div_MwMagicWords.setAttribute("checked", "false");
				MwMagicWords = false;
			}
			
			EditorFormatting();
	}

	function Func_MwMnemonics_OnClick()
	{
		if (Div_MwMnemonics.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwMnemonics: "true" });
				Div_MwMnemonics.setAttribute("checked", "true");
				MwMnemonics = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwMnemonics: "false" });
				Div_MwMnemonics.setAttribute("checked", "false");
				MwMnemonics = false;
			}
			
			EditorFormatting();
	}

	function Func_MwMultiComments_OnClick()
	{
		if (Div_MwMultiComments.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwMultiComments: "true" });
				Div_MwMultiComments.setAttribute("checked", "true");
				MwMultiComments = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwMultiComments: "false" });
				Div_MwMultiComments.setAttribute("checked", "false");
				MwMultiComments = false;
			}
			
			EditorFormatting();
	}

	function Func_MwPost_OnClick()
	{
		if (Div_MwPost.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwPost: "true" });
				Div_MwPost.setAttribute("checked", "true");
				MwPost = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwPost: "false" });
				Div_MwPost.setAttribute("checked", "false");
				MwPost = false;
			}
			
			EditorFormatting();
	}

	function Func_MwTags_OnClick()
	{
		if (Div_MwTags.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwTags: "true" });
				Div_MwTags.setAttribute("checked", "true");
				MwTags = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwTags: "false" });
				Div_MwTags.setAttribute("checked", "false");
				MwTags = false;
			}
			
			EditorFormatting();
	}

	function Func_MwTimeStamp_OnClick()
	{
		if (Div_MwTimeStamp.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwTimeStamp: "true" });
				Div_MwTimeStamp.setAttribute("checked", "true");
				MwTimeStamp = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwTimeStamp: "false" });
				Div_MwTimeStamp.setAttribute("checked", "false");
				MwTimeStamp = false;
			}
			
			EditorFormatting();
	}

	function Func_MwFunctions_OnClick()
	{
		if (Div_MwFunctions.getAttribute("checked") == "false")
			{
				chrome.storage.sync.set({ Setting_MwFunctions: "true" });
				Div_MwFunctions.setAttribute("checked", "true");
				MwFunctions = true;
			}
			else
			{
				chrome.storage.sync.set({ Setting_MwFunctions: "false" });
				Div_MwFunctions.setAttribute("checked", "false");
				MwFunctions = false;
			}
			
			EditorFormatting();
	}

	function Func_DropDownWindow_OnClick()
	{
		if (DropDownWin == false)
		{
			Div_DropDownWin.setAttribute("checked", "true");
			DropDownWin = true;
		}
		else
		{
			Div_DropDownWin.setAttribute("checked", "false");
			DropDownWin = false;
		}
		Div_DropDownWin2.setAttribute("checked", "false");
		DropDownWin2 = false;
		Div_DropDownWin3.setAttribute("checked", "false");
		DropDownWin3 = false;
	}

	function Func_DropDownWindow2_OnClick()
	{
		if (DropDownWin2 == false)
		{
			Div_DropDownWin2.setAttribute("checked", "true");
			DropDownWin2 = true;
		}
		else
		{
			Div_DropDownWin2.setAttribute("checked", "false");
			DropDownWin2 = false;
		}
		Div_DropDownWin3.setAttribute("checked", "false");
		DropDownWin3 = false;
		Div_DropDownWin.setAttribute("checked", "false");
		DropDownWin = false;
	}

	function Func_DropDownWindow3_OnClick()
	{
		if (DropDownWin3 == false)
		{
			Div_DropDownWin3.setAttribute("checked", "true");
			DropDownWin3 = true;
		}
		else
		{
			Div_DropDownWin3.setAttribute("checked", "false");
			DropDownWin3 = false;
		}
		Div_DropDownWin2.setAttribute("checked", "false");
		DropDownWin2 = false;
		Div_DropDownWin.setAttribute("checked", "false");
		DropDownWin = false;
	}

	function Func_rightToLeft_OnClick()
	{
		const setting_text = document.querySelectorAll('.VDCEditorEx-Td');
		const pref_btn = document.querySelectorAll('.VDCEditorEx-DropDown-Btn');
		const style_input = document.querySelectorAll('.VDCEditorEx-DropDown-Colorpicker');

		let wpMinoredit = document.getElementById("mw-editpage-minoredit");

		const removeAttribs = 
		[
			Div_LineNumbers, 
			Div_DropDownWin3, Div_DropDownWin2, Div_DropDownWin, 
			Td_rtl, Td_rtl_btn,
			Td_ResWin, Td_ResWin_btn,
			Td_ScrollNewLine, Td_ScrollNewLine_btn,
			Td_CP_Templates, Input_CP_Templates,
			Td_CP_Links, Input_CP_Links,
			Td_CP_Cats, Input_CP_Cats,
			Td_CP_HtmlNum, Input_CP_HtmlNum,
			Td_CP_File, Input_CP_File,
			Td_CP_TempMW, Input_CP_TempMW,
			Td_CP_Header, Input_CP_Header,
			Td_CP_MagicWords, Input_CP_MagicWords,
			Td_CP_Mnemonics, Input_CP_Mnemonics,
			Td_CP_MultiComments, Input_CP_MultiComments,
			Td_CP_Post, Input_CP_Post,
			Td_CP_Tags, Input_CP_Tags,
			Td_CP_TimeStamp, Input_CP_TimeStamp,
			Td_Lang, Input_Lang,

			Td_CP_Border, Input_CP_Border,
			Td_CP_Background, Input_CP_Background,
			Td_CP_ToolbarText, Input_CP_ToolbarText,
			Td_CP_Button_Border, Input_CP_Button_Border,
			Td_CP_Button_BG, Input_CP_Button_BG,
			Td_CP_SummaryBG, Input_CP_SummaryBG,
			Td_CP_ScrBar1, Input_CP_ScrBar1,
			Td_CP_ScrBar2, Input_CP_ScrBar2,
			Td_CP_TEXT, Input_CP_TEXT,

		];

		for (let i = 0; i < removeAttribs.length; i++) {
			removeAttribs[i].removeAttribute("style");
		}

		if (Td_rtl_btn.getAttribute("checked") == "false")
		{
			//Right to left
			chrome.storage.sync.set({ Setting_MwRtl: "true" });
			Td_rtl_btn.setAttribute("checked", "true");
			Td_rtl_btn.innerHTML = '<img src="' + chrome.runtime.getURL("images/settings/MwBtnChecked.png") + '">';

			document.getElementById("mw-content-text").setAttribute("dir", "rtl");

			Div_LineNumbers.style.right = "0";
			Div_LineNumbers.style.textAlign = "left";
			Div_LineNumbers.style.borderLeft = "1px solid #666";

			Div_DropDownWin3.style.left = "10.7em";

			Div_DropDownWin2.style.left = "7em";

			Div_DropDownWin.style.left = "1.3em";

			Input_Lang.style.left = "0.9em";

			wpMinoredit.style.marginLeft = "1em";
			wpMinoredit.style.marginRight = "0em";

			for (let i = 0; i < setting_text.length; i++) {
				setting_text[i].style.paddingLeft = "3em";
			}

			for (let i = 0; i < pref_btn.length; i++) {
				pref_btn[i].style.left = "1em";
			}

			for (let i = 0; i < style_input.length; i++) {
				style_input[i].style.left = "1em";
			}
			MwRtl = true;
		}
		else
		{	
			//Default
			chrome.storage.sync.set({ Setting_MwRtl: "false" });
			Td_rtl_btn.setAttribute("checked", "false");
			Td_rtl_btn.innerHTML = '<img src="' + chrome.runtime.getURL("images/settings/MwBtnUnchecked.png") + '">';

			document.getElementById("mw-content-text").setAttribute("dir", "ltr");

			Div_LineNumbers.style.left = "0";
			Div_LineNumbers.style.textAlign = "right";
			Div_LineNumbers.style.borderRight = "1px solid #666";

			Div_DropDownWin3.style.right = "10.7em";

			Div_DropDownWin2.style.right = "7em";

			Div_DropDownWin.style.right = "1.3em";

			Input_Lang.style.right = "0.9em";

			wpMinoredit.style.marginLeft = "0em";
			wpMinoredit.style.marginRight = "1em";

			for (let i = 0; i < setting_text.length; i++) {
				setting_text[i].style.paddingRight = "3em";
			}

			for (let i = 0; i < pref_btn.length; i++) {
				pref_btn[i].style.right = "1em";
			}

			for (let i = 0; i < style_input.length; i++) {
				style_input[i].style.right = "1em";
			}

			MwRtl = false;
		}

		Func_SummaryDir();
		Func_ResizeEvent();
	}

	function Func_ResetColors()
	{
		COLOR_multilinecomments 	= "#228B22";		Input_CP_MultiComments.value= "#228B22";
		COLOR_magicwords 			= "#40E0D0";		Input_CP_MagicWords.value 	= "#40E0D0";
		COLOR_tempmagicwords 		= "#40E0D0";		Input_CP_TempMW.value 		= "#40E0D0";
		COLOR_htmlnum 				= "#00FCFF";		Input_CP_HtmlNum.value 		= "#00FCFF";
		COLOR_htmlmnemonics 		= "#00FCFF";		Input_CP_Mnemonics.value 	= "#00FCFF";
		COLOR_mwtags 				= "#5F9EA0";		Input_CP_Tags.value 		= "#5F9EA0";
		COLOR_mwheaders 			= "#D2B48C";		Input_CP_Header.value 		= "#D2B48C";
		COLOR_mwapost			 	= "#369FFF";		Input_CP_Post.value 		= "#369FFF";
		COLOR_mwtemplates 			= "#EE69B1";		Input_CP_Templates.value 	= "#EE69B1";
		COLOR_mwcategories 			= "#01B700";		Input_CP_Cats.value 		= "#01B700";
		COLOR_mwlinks 				= "#87CEEB";		Input_CP_Links.value 		= "#87CEEB";
		COLOR_mwfiles 				= "#FFE599";		Input_CP_File.value 		= "#FFE599";
		COLOR_timestamp 			= "#40E0D0";		Input_CP_TimeStamp.value 	= "#40E0D0";

		StyleMain(); // updates colors
		

		chrome.storage.sync.set({  
			Input_CP_MultiComments:	"#228B22",
			Input_CP_MagicWords:	"#40E0D0",
			Input_CP_TempMW:		"#40E0D0",
			Input_CP_HtmlNum:		"#00FCFF",
			Input_CP_Mnemonics:		"#00FCFF",
			Input_CP_Tags:			"#5F9EA0",
			Input_CP_Header:		"#D2B48C",
			Input_CP_Post:			"#369FFF",
			Input_CP_Templates:		"#EE69B1",
			Input_CP_Cats:			"#01B700",
			Input_CP_Links:			"#87CEEB",
			Input_CP_File:			"#FFE599",
			Input_CP_TimeStamp:		"#40E0D0",
			Setting_ResetColors: [
				"#228B22", "#40E0D0", "#40E0D0",
				"#00FCFF", "#00FCFF", "#5F9EA0",
				"#D2B48C", "#369FFF", "#EE69B1",
				"#01B700", "#87CEEB", "#FFE599",
				"#40E0D0"
			],
		});
	}

	function Func_ResetColors_Editor()
	{
		Ed_Color_Border 		= "#666666";	Input_CP_Border.value 			= "#666666"; 
		Ed_Color_Background 	= "#202020";	Input_CP_Background.value 		= "#202020";
		Ed_Color_ToolbarText 	= "#ffb317";	Input_CP_ToolbarText.value 		= "#ffb317";
		Ed_Color_Button_Border 	= "#7f5400";	Input_CP_Button_Border.value 	= "#7f5400";
		Ed_Color_Button_BG 		= "#422c00";	Input_CP_Button_BG.value 		= "#422c00";
		Ed_Color_SummaryBG 		= "#3A3A3A";	Input_CP_SummaryBG.value 		= "#3A3A3A";
		Ed_Color_ScrBar1 		= "#666666";	Input_CP_ScrBar1.value 			= "#666666";
		Ed_Color_ScrBar2 		= "#2A2A2A";	Input_CP_ScrBar2.value 			= "#2A2A2A";
		Ed_Color_TEXT 			= "#D8D7D6";	Input_CP_TEXT.value 			= "#D8D7D6";

		StyleMain(); // updates colors
		Div_StylizedCode.style.color = Ed_Color_TEXT;

		chrome.storage.sync.set({  
			Input_CP_Border: 			"#666666",
			Input_CP_Background: 		"#202020",
			Input_CP_ToolbarText: 		"#ffb317",
			Input_CP_Button_Border: 	"#7f5400",
			Input_CP_Button_BG: 		"#422c00",
			Input_CP_SummaryBG: 		"#3A3A3A",
			Input_CP_ScrBar1: 			"#666666",
			Input_CP_ScrBar2: 			"#2A2A2A",
			Input_CP_TEXT: 				"#D8D7D6",
			Setting_ResetColors: [
				"#666666", "#202020", "#ffb317",
				"#7f5400", "#422c00", "#3A3A3A",
				"#666666", "#2A2A2A", "#D8D7D6"
			],
		});
	}
	
	function Func_ScrollNewLine_OnClick()
	{	
		if (Td_ScrollNewLine_btn.getAttribute("checked") == "false")
		{
			Td_ScrollNewLine_btn.innerHTML = '<img src="' + chrome.runtime.getURL("images/settings/MwBtnChecked.png") + '">';

			chrome.storage.sync.set({ Setting_ScrollNewLine: "true" });
			Td_ScrollNewLine_btn.setAttribute("checked", "true");
			ScrollNewLine = true;
		}
		else
		{
			Td_ScrollNewLine_btn.innerHTML = '<img src="' + chrome.runtime.getURL("images/settings/MwBtnUnchecked.png") + '">';

			chrome.storage.sync.set({ Setting_ScrollNewLine: "false" });
			Td_ScrollNewLine_btn.setAttribute("checked", "false");
			ScrollNewLine = false;
		}
	}

	//================================================================
	//
	// Attach an Event
	//
	//================================================================
	Div_WordWrap.onclick = Func_WordWrap_OnClick;
	Div_SameAsSelected.onclick = Func_HighlightSameAsSelected_OnClick;
	Div_ScrollAfterLastLine.onclick = Func_ScrollAfterLastLine_OnClick;
	Div_MwFunctions.onclick = Func_MwFunctions_OnClick;
	Div_StylizedTemplates.onclick = Func_StylizedTemplates_OnClick;
	Div_StylizedLinks.onclick = Func_StylizedLinks_OnClick;
	Div_ReplaceLinks.onclick = Func_ReplaceLinks_OnClick;
	Div_HTMLTagsFormatter.onclick = Func_HTMLTagsFormatter_OnClick;
	Div_ColoredNumbers.onclick = Func_ColoredNumbers_OnClick;
	Div_MwHighlight.onclick = Func_MwHighlight_OnClick;
	Div_MwCategory.onclick = Func_MwCategory_OnClick;
	Div_MwFile.onclick = Func_MwFile_OnClick;
	Div_TempMagicWords.onclick = Func_TempMagicWords_OnClick;
	Div_MwHeader.onclick = Func_MwHeader_OnClick;
	Div_MwMagicWords.onclick = Func_MwMagicWords_OnClick;
	Div_MwMnemonics.onclick = Func_MwMnemonics_OnClick;
	Div_MwMultiComments.onclick = Func_MwMultiComments_OnClick;
	Div_MwPost.onclick = Func_MwPost_OnClick;
	Div_MwTags.onclick = Func_MwTags_OnClick;
	Div_MwTimeStamp.onclick = Func_MwTimeStamp_OnClick;
	//============================================================
	Div_DropDown3.onclick = Func_DropDownWindow3_OnClick;
	Div_DropDown2.onclick = Func_DropDownWindow2_OnClick;
	Div_DropDown.onclick = Func_DropDownWindow_OnClick;
	Td_rtl_btn.onclick = Func_rightToLeft_OnClick;
	Td_ResWin_btn.onclick = Func_ResetWindow;
	Div_Reset_btn.onclick = Func_ResetColors;
	Div_Reset_btn2.onclick = Func_ResetColors_Editor;
	Td_ScrollNewLine_btn.onclick = Func_ScrollNewLine_OnClick;
	//================================================================
	//
	// Chrome Storage
	//
	//================================================================

	chrome.storage.sync.get('Setting_WordWrap', function(data) {

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

	chrome.storage.sync.get('Setting_HighlightSameAsSelected', function(data) {

		if (data.Setting_HighlightSameAsSelected == "true")
			Func_HighlightSameAsSelected_OnClick();
	});

	chrome.storage.sync.get('Setting_ScrollAfterLastLine', function(data) {

		if (data.Setting_ScrollAfterLastLine == "true")
			Func_ScrollAfterLastLine_OnClick();
	});

	chrome.storage.sync.get('Setting_MwFunctions', function(data) {

		if (data.Setting_MwFunctions == "true")
			Func_MwFunctions_OnClick();
	});

	chrome.storage.sync.get('Setting_StylizedTemplates', function(data) {

		if (data.Setting_StylizedTemplates == "true")
			Func_StylizedTemplates_OnClick();
	});
	
	chrome.storage.sync.get('Setting_StylizedLinks', function(data) {

		if (data.Setting_StylizedLinks == "true")
			Func_StylizedLinks_OnClick();
	});

	chrome.storage.sync.get('Setting_HTMLTagsFormatter', function(data) {

		if (data.Setting_HTMLTagsFormatter == "true")
			Func_HTMLTagsFormatter_OnClick();
	});

	chrome.storage.sync.get('Setting_ColoredNumbers', function(data) {

		if (data.Setting_ColoredNumbers == "true")
			Func_ColoredNumbers_OnClick();
	});

	chrome.storage.sync.get('Setting_MwHighlight', function(data) {

		if (data.Setting_MwHighlight == "true")
			Func_MwHighlight_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwCategory', function(data) {

		if (data.Setting_MwCategory == "true")
			Func_MwCategory_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwFile', function(data) {

		if (data.Setting_MwFile == "true")
			Func_MwFile_OnClick();
	});
	
	chrome.storage.sync.get('Setting_TempMagicWords', function(data) {

		if (data.Setting_TempMagicWords == "true")
			Func_TempMagicWords_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwHeader', function(data) {

		if (data.Setting_MwHeader == "true")
			Func_MwHeader_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwMagicWords', function(data) {

		if (data.Setting_MwMagicWords == "true")
			Func_MwMagicWords_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwMnemonics', function(data) {

		if (data.Setting_MwMnemonics == "true")
			Func_MwMnemonics_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwMultiComments', function(data) {

		if (data.Setting_MwMultiComments == "true")
			Func_MwMultiComments_OnClick();
	});

	chrome.storage.sync.get('Setting_MwPost', function(data) {

		if (data.Setting_MwPost == "true")
			Func_MwPost_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwTags', function(data) {

		if (data.Setting_MwTags == "true")
			Func_MwTags_OnClick();
	});
	
	chrome.storage.sync.get('Setting_MwTimeStamp', function(data) {

		if (data.Setting_MwTimeStamp == "true")
			Func_MwTimeStamp_OnClick();
	});

	chrome.storage.sync.get('Setting_MwRtl', function(data) {

		if (data.Setting_MwRtl == "true")
			Func_rightToLeft_OnClick();
	});

	chrome.storage.sync.get('Setting_ScrollNewLine', function(data) {

		if (data.Setting_ScrollNewLine == "true")
			Func_ScrollNewLine_OnClick();
	});

	//================================================================

	chrome.storage.sync.get('EditorHeight', function(data) {

		if (data.EditorHeight)
			Div_SubMainTextArea.style.height = data.EditorHeight;
		else
			Div_SubMainTextArea.style.height = "500px";
	});

	//================================================================

	chrome.storage.sync.get('Setting_ResetColors', function(data) {

		const INPUT = [
			Input_CP_MultiComments,
			Input_CP_MagicWords,
			Input_CP_TempMW,
			Input_CP_HtmlNum,
			Input_CP_Mnemonics,
			Input_CP_Tags,
			Input_CP_Header,
			Input_CP_Post,
			Input_CP_Templates,
			Input_CP_Cats,
			Input_CP_Links,
			Input_CP_File,
			Input_CP_TimeStamp
		]

		for (let i = 0; i < data.Setting_ResetColors.length; i++)
		{
			INPUT[i].value = data.Setting_ResetColors[i];
		}

	});

	chrome.storage.sync.get('Input_CP_MultiComments', function(data) {

		chrome.storage.sync.set({ Input_CP_MultiComments: data.Input_CP_MultiComments});
		COLOR_multilinecomments = data.Input_CP_MultiComments;	
		Input_CP_MultiComments.value = data.Input_CP_MultiComments;	

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_MagicWords', function(data) {

		chrome.storage.sync.set({ Input_CP_MagicWords: data.Input_CP_MagicWords});
		COLOR_magicwords = data.Input_CP_MagicWords;
		Input_CP_MagicWords.value = data.Input_CP_MagicWords;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_TempMW', function(data) {

		chrome.storage.sync.set({ Input_CP_TempMW: data.Input_CP_TempMW});
		COLOR_tempmagicwords = data.Input_CP_TempMW;
		Input_CP_TempMW.value = data.Input_CP_TempMW;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_HtmlNum', function(data) {

		chrome.storage.sync.set({ Input_CP_HtmlNum: data.Input_CP_HtmlNum});
		COLOR_htmlnum = data.Input_CP_HtmlNum;
		Input_CP_HtmlNum.value = data.Input_CP_HtmlNum;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Mnemonics', function(data) {

		chrome.storage.sync.set({ Input_CP_Mnemonics: data.Input_CP_Mnemonics});
		COLOR_htmlmnemonics = data.Input_CP_Mnemonics;
		Input_CP_Mnemonics.value = data.Input_CP_Mnemonics;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Tags', function(data) {

		chrome.storage.sync.set({ Input_CP_Tags: data.Input_CP_Tags});
		COLOR_mwtags = data.Input_CP_Tags;
		Input_CP_Tags.value = data.Input_CP_Tags;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Header', function(data) {

		chrome.storage.sync.set({ Input_CP_Header: data.Input_CP_Header});
		COLOR_mwheaders = data.Input_CP_Header;
		Input_CP_Header.value = data.Input_CP_Header;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Post', function(data) {

		chrome.storage.sync.set({ Input_CP_Post: data.Input_CP_Post});
		COLOR_mwapost = data.Input_CP_Post;
		Input_CP_Post.value = data.Input_CP_Post;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Templates', function(data) {

		chrome.storage.sync.set({ Input_CP_Templates: data.Input_CP_Templates});
		COLOR_mwtemplates = data.Input_CP_Templates;
		Input_CP_Templates.value = data.Input_CP_Templates;	

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Cats', function(data) {

		chrome.storage.sync.set({ Input_CP_Cats: data.Input_CP_Cats});
		COLOR_mwcategories = data.Input_CP_Cats;
		Input_CP_Cats.value = data.Input_CP_Cats;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Links', function(data) {

		chrome.storage.sync.set({ Input_CP_Links: data.Input_CP_Links});
		COLOR_mwlinks = data.Input_CP_Links;
		Input_CP_Links.value = data.Input_CP_Links;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_File', function(data) {

		chrome.storage.sync.set({ Input_CP_File: data.Input_CP_File});
		COLOR_mwfiles = data.Input_CP_File;
		Input_CP_File.value = data.Input_CP_File;	

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_TimeStamp', function(data) {

		chrome.storage.sync.set({ Input_CP_TimeStamp: data.Input_CP_TimeStamp});
		COLOR_timestamp = data.Input_CP_TimeStamp;
		Input_CP_TimeStamp.value = data.Input_CP_TimeStamp;

		StyleMain();
	});

	chrome.storage.sync.get('LANGUAGE', function(data) {

		chrome.storage.sync.set({ LANGUAGE: data.LANGUAGE});
		Input_Lang.value = data.LANGUAGE
	});

	// Editor colors
	
	chrome.storage.sync.get('Input_CP_Border', function(data) {

		chrome.storage.sync.set({ Input_CP_TimeStamp: data.Input_CP_Border});
		Ed_Color_Border = data.Input_CP_Border;
		Input_CP_Border.value = data.Input_CP_Border;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Background', function(data) {

		chrome.storage.sync.set({ Input_CP_Background: data.Input_CP_Background});
		Ed_Color_Background = data.Input_CP_Background;
		Input_CP_Background.value = data.Input_CP_Background;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_ToolbarText', function(data) {

		chrome.storage.sync.set({ Input_CP_ToolbarText: data.Input_CP_ToolbarText});
		Ed_Color_ToolbarText = data.Input_CP_ToolbarText;
		Input_CP_ToolbarText.value = data.Input_CP_ToolbarText;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Button_Border', function(data) {

		chrome.storage.sync.set({ Input_CP_Button_Border: data.Input_CP_Button_Border});
		Ed_Color_Button_Border = data.Input_CP_Button_Border;
		Input_CP_Button_Border.value = data.Input_CP_Button_Border;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_Button_BG', function(data) {

		chrome.storage.sync.set({ Input_CP_Button_BG: data.Input_CP_Button_BG});
		Ed_Color_Button_BG = data.Input_CP_Button_BG;
		Input_CP_Button_BG.value = data.Input_CP_Button_BG;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_SummaryBG', function(data) {

		chrome.storage.sync.set({ Input_CP_SummaryBG: data.Input_CP_SummaryBG});
		Ed_Color_SummaryBG = data.Input_CP_SummaryBG;
		Input_CP_SummaryBG.value = data.Input_CP_SummaryBG;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_ScrBar1', function(data) {

		chrome.storage.sync.set({ Input_CP_ScrBar1: data.Input_CP_ScrBar1});
		Ed_Color_ScrBar1 = data.Input_CP_ScrBar1;
		Input_CP_ScrBar1.value = data.Input_CP_ScrBar1;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_ScrBar2', function(data) {

		chrome.storage.sync.set({ Input_CP_ScrBar2: data.Input_CP_ScrBar2});
		Ed_Color_ScrBar2 = data.Input_CP_ScrBar2;
		Input_CP_ScrBar2.value = data.Input_CP_ScrBar2;

		StyleMain();
	});

	chrome.storage.sync.get('Input_CP_TEXT', function(data) {

		chrome.storage.sync.set({ Input_CP_TEXT: data.Input_CP_TEXT});
		Ed_Color_TEXT = data.Input_CP_TEXT;
		Input_CP_TEXT.value = data.Input_CP_TEXT;
		Div_StylizedCode.style.color = data.Input_CP_TEXT;

		StyleMain();
	});
}