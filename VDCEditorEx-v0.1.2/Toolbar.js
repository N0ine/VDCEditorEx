//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

function makeElements(map) {
	const elements = {};
	for (const [key, tag] of Object.entries(map)) {
		elements[key] = document.createElement(tag);
	}
	return elements;
}
// Atleast no more consts
const {
	Div_WordWrap, 			Div_SameAsSelected, 	Div_ScrollAfterLastLine,
	Div_HTMLTagsFormatter, 	Div_ColoredNumbers, 	Div_MwFunctions,
	Div_StylizedTemplates, 	Div_StylizedLinks,
	Div_MwHighlight, 		Div_MwCategory, 		Div_MwFile,
	Div_TempMagicWords,		Div_MwHeader, 			Div_MwMagicWords,
	Div_MwMnemonics, 		Div_MwMultiComments, 	Div_MwPost,
	Div_MwTags,				Div_MwTimeStamp,
	Div_ReplaceLinks, 		Div_Reset_btn, Div_Reset_btn2,

    Tr_CP_Highlight,		Td_CP_Highlight,		Input_CP_Highlight,
    Tr_CP_Numbers,			Td_CP_Numbers,			Input_CP_Numbers,
	Tr_CP_Templates, 		Td_CP_Templates, 		Input_CP_Templates,
	Tr_CP_Links, 			Td_CP_Links, 			Input_CP_Links,
	Tr_CP_HtmlEnts, 		Td_CP_HtmlEnts, 		Input_CP_HtmlEnts,
	Tr_CP_Cats, 			Td_CP_Cats, 			Input_CP_Cats,
	Tr_CP_File, 			Td_CP_File, 			Input_CP_File,
	Tr_CP_TempMW, 			Td_CP_TempMW, 			Input_CP_TempMW,
	Tr_CP_Header, 			Td_CP_Header, 			Input_CP_Header,
	Tr_CP_MagicWords, 		Td_CP_MagicWords, 		Input_CP_MagicWords,
	Tr_CP_Mnemonics, 		Td_CP_Mnemonics, 		Input_CP_Mnemonics,
	Tr_CP_MultiComments, 	Td_CP_MultiComments, 	Input_CP_MultiComments,
	Tr_CP_Post, 			Td_CP_Post, 			Input_CP_Post,
	Tr_CP_Tags, 			Td_CP_Tags, 			Input_CP_Tags,
	Tr_CP_TimeStamp, 		Td_CP_TimeStamp, 		Input_CP_TimeStamp,
	Div_DropDown, 			Div_DropDownWin,
	Div_DropDown2, 			Div_DropDownWin2,
	Div_DropDown3,			Div_DropDownWin3,
	Tr_rtl, 				Td_rtl, 					Td_rtl_btn,
	Tr_ResWin, 				Td_ResWin, 					Td_ResWin_btn,
	Tr_MatBr,				Td_MatBr,					Td_MatBr_btn,
	Tr_Lang, 				Td_Lang, 					Input_Lang,

	Tr_CP_Border, 			Td_CP_Border, 			Input_CP_Border,
	Tr_CP_Background, 		Td_CP_Background, 		Input_CP_Background,
	Tr_CP_ToolbarText, 		Td_CP_ToolbarText, 		Input_CP_ToolbarText,
	Tr_CP_Button_Border, 	Td_CP_Button_Border, 	Input_CP_Button_Border,
	Tr_CP_Button_BG, 		Td_CP_Button_BG,		Input_CP_Button_BG,
	Tr_CP_SummaryBG, 		Td_CP_SummaryBG, 		Input_CP_SummaryBG,
	Tr_CP_ScrBar1, 			Td_CP_ScrBar1, 			Input_CP_ScrBar1,
	Tr_CP_ScrBar2,			Td_CP_ScrBar2, 			Input_CP_ScrBar2,
	Tr_CP_TEXT, 			Td_CP_TEXT, 			Input_CP_TEXT,
	
} = makeElements({
	// Divs
	Div_WordWrap: 'div', 			Div_SameAsSelected: 'div', 	Div_ScrollAfterLastLine: 'div',
	Div_HTMLTagsFormatter: 'div', 	Div_ColoredNumbers: 'div', 	Div_MwFunctions: 'div',
	Div_StylizedTemplates: 'div', 	Div_StylizedLinks: 'div', 	Div_MwHighlight: 'div',
	Div_MwCategory: 'div', 			Div_MwFile: 'div', 			Div_TempMagicWords: 'div', 		Div_MwHeader: 'div',
	Div_MwMagicWords: 'div', 		Div_MwMnemonics: 'div', 	Div_MwMultiComments: 'div',
	Div_MwPost: 'div', 				Div_MwTags: 'div', 			Div_MwTimeStamp: 'div', 		Div_ReplaceLinks: 'div',
	Div_DropDown3: 'div',			Div_DropDownWin3: 'div',
	Div_DropDown2: 'div', 			Div_DropDownWin2: 'div', 	Div_Reset_btn: 'div', 			Div_Reset_btn2: 'div',
	Div_DropDown: 'div', 			Div_DropDownWin: 'div',
	
	// Table rows
    Tr_CP_Highlight: 'tr',			Tr_CP_Numbers: 'tr',
	Tr_CP_Templates: 'tr', 			Tr_CP_Links: 'tr', 			Tr_CP_HtmlEnts: 'tr', 	Tr_CP_Cats: 'tr',
	Tr_CP_File: 'tr', 				Tr_CP_TempMW: 'tr', 		Tr_CP_Header: 'tr', 	Tr_CP_MagicWords: 'tr',
	Tr_CP_Mnemonics: 'tr', 			Tr_CP_MultiComments: 'tr', 	Tr_CP_Post: 'tr',
	Tr_CP_Tags: 'tr', 				Tr_CP_TimeStamp: 'tr', 		Tr_rtl: 'tr', 			Tr_ResWin: 'tr',
	Tr_Lang: 'tr',
	Tr_MatBr: 'tr',

	Tr_CP_Border: 'tr', 			Tr_CP_Background: 'tr', 	Tr_CP_ToolbarText: 'tr',
	Tr_CP_Button_Border: 'tr', 		Tr_CP_Button_BG: 'tr', 		Tr_CP_SummaryBG: 'tr',
	Tr_CP_ScrBar1: 'tr', 			Tr_CP_ScrBar2: 'tr', 		Tr_CP_TEXT: 'tr',

	// Table cells
    Td_CP_Highlight: 'td',			Td_CP_Numbers: 'td',
	Td_CP_Templates: 'td', 			Td_CP_Links: 'td', 			Td_CP_HtmlEnts: 'td', 	Td_CP_Cats: 'td',
	Td_CP_File: 'td', 				Td_CP_TempMW: 'td', 		Td_CP_Header: 'td', 	Td_CP_MagicWords: 'td',
	Td_CP_Mnemonics: 'td', 			Td_CP_MultiComments: 'td', 	Td_CP_Post: 'td',
	Td_CP_Tags: 'td', 				Td_CP_TimeStamp: 'td', 		Td_rtl: 'td', 			Td_rtl_btn: 'td',
	Td_ResWin: 'td', 				Td_ResWin_btn: 'td',
	Td_ScrollNewLine_btn: 'td', 	Td_Lang: 'td',				Td_MatBr: 'td',			Td_MatBr_btn: 'td',

	Td_CP_Border: 'td', 			Td_CP_Background: 'td', 	Td_CP_ToolbarText: 'td',
	Td_CP_Button_Border: 'td',		Td_CP_Button_BG: 'td', 		Td_CP_SummaryBG: 'td',
	Td_CP_ScrBar1: 'td',			Td_CP_ScrBar2: 'td', 		Td_CP_TEXT: 'td',

	// Inputs
    Input_CP_Highlight: 'input',		Input_CP_Numbers: 'input',
	Input_CP_Templates: 'input', 		Input_CP_Links: 'input', 		Input_CP_HtmlEnts: 'input',
	Input_CP_Cats: 'input', 			Input_CP_File: 'input', 		Input_CP_TempMW: 'input',
	Input_CP_Header: 'input', 			Input_CP_MagicWords: 'input', 	Input_CP_Mnemonics: 'input',
	Input_CP_MultiComments: 'input', 	Input_CP_Post: 'input', 		Input_CP_Tags: 'input',
	Input_CP_TimeStamp: 'input', 		Input_Lang: 'input',

	Input_CP_Border: 'input', 			Input_CP_Background: 'input', 		Input_CP_ToolbarText: 'input',
	Input_CP_Button_Border: 'input', 	Input_CP_Button_BG: 'input', 		Input_CP_SummaryBG: 'input',
	Input_CP_ScrBar1: 'input', 			Input_CP_ScrBar2: 'input',			Input_CP_TEXT: 'input',
});

function getToolbarData() {
	return [
	  //Div element, 			image filename, 				translation
	  [Div_WordWrap, 			"WordWrap.png", 				getTranslation("WordWrap")				],
	  [Div_SameAsSelected, 		"HighlightSameAsSelected.png", 	getTranslation("SameAsSelected")		],
	  [Div_ScrollAfterLastLine, "ScrollAfterLastLine.png", 		getTranslation("ScrollAfterLastLine")	],
	  [Div_HTMLTagsFormatter, 	"HTMLTagsFormatter.png", 		getTranslation("HTMLTagsFormatter")		],
	  [Div_ColoredNumbers, 		"ColoredNumbers.png", 			getTranslation("ColoredNumbers")		],
	  [Div_MwFunctions, 		"MwFunctions.png", 				getTranslation("Functions")				],
	  [Div_StylizedTemplates, 	"StylizedTemplates.png", 		getTranslation("StylizedTemplates")		],
	  [Div_StylizedLinks, 		"StylizedLinks.png", 			getTranslation("StylizedLinks")			],
	  [Div_MwHighlight, 		"MwHighlight.png", 				getTranslation("Highlight")				],
	  [Div_MwCategory, 			"MwCategory.png", 				getTranslation("Category")				],
	  [Div_MwFile, 				"MwFile.png", 					getTranslation("File")					],
	  [Div_TempMagicWords, 		"MwPageName.png", 				getTranslation("TempMagicWords")		],
	  [Div_MwHeader, 			"MwHeader.png", 				getTranslation("Header")				],
	  [Div_MwMagicWords, 		"MwMagicWords.png",		 		getTranslation("MagicWords")			],
	  [Div_MwMnemonics, 		"MwMnemonics.png", 				getTranslation("Mnemonics")				],
	  [Div_MwMultiComments, 	"MwMultiComments.png", 			getTranslation("MultiComments")			],
	  [Div_MwPost, 				"MwPost.png", 					getTranslation("Post")					],
	  [Div_MwTags, 				"MwTags.png", 					getTranslation("Tags")					],
	  [Div_MwTimeStamp, 		"MwTimeStamp.png", 				getTranslation("TimeStamp")				],
	  [Div_ReplaceLinks, 		"ReplaceLinks.png", 			getTranslation("RepLinks")				]
	];
  }
  
  // Style Data Table function
  function getStyleData() {
	return [
		//TD element, 			translation, 							input element, 				color, 		TR element
	  [Td_CP_Highlight,			getTranslation("CP_Highlight"),			Input_CP_Highlight,			"#5d5d2c",	Tr_CP_Highlight		],
      [Td_CP_Numbers,			getTranslation("CP_Numbers"),			Input_CP_Numbers,			"#FFB300",	Tr_CP_Numbers		],
	  [Td_CP_Templates, 		getTranslation("CP_Templates"), 		Input_CP_Templates, 		"#EE69B1", 	Tr_CP_Templates		],
	  [Td_CP_Links, 			getTranslation("CP_Links"), 			Input_CP_Links, 			"#87CEEB", 	Tr_CP_Links			],
	  [Td_CP_HtmlEnts, 			getTranslation("CP_HtmlEnts"), 			Input_CP_HtmlEnts, 			"#00FCFF", 	Tr_CP_HtmlEnts		],
	  [Td_CP_Cats, 				getTranslation("CP_Cats"), 				Input_CP_Cats, 				"#01B700", 	Tr_CP_Cats			],
	  [Td_CP_File, 				getTranslation("CP_File"), 				Input_CP_File, 				"#FFE599", 	Tr_CP_File			],
	  [Td_CP_TempMW, 			getTranslation("CP_TempMW"), 			Input_CP_TempMW, 			"#40E0D0", 	Tr_CP_TempMW		],
	  [Td_CP_Header, 			getTranslation("CP_Header"), 			Input_CP_Header, 			"#D2B48C", 	Tr_CP_Header		],
	  [Td_CP_MagicWords, 		getTranslation("CP_MagicWords"), 		Input_CP_MagicWords, 		"#40E0D0", 	Tr_CP_MagicWords	],
	  [Td_CP_Mnemonics, 		getTranslation("CP_Mnemonics"), 		Input_CP_Mnemonics, 		"#00FCFF", 	Tr_CP_Mnemonics		],
	  [Td_CP_MultiComments, 	getTranslation("CP_Multicomments"), 	Input_CP_MultiComments, 	"#228B22", 	Tr_CP_MultiComments	],
	  [Td_CP_Post, 				getTranslation("CP_Post"), 				Input_CP_Post, 				"#369FFF", 	Tr_CP_Post			],
	  [Td_CP_Tags, 				getTranslation("CP_Tags"), 				Input_CP_Tags, 				"#5F9EA0", 	Tr_CP_Tags			],
	  [Td_CP_TimeStamp, 		getTranslation("CP_TimeStamps"), 		Input_CP_TimeStamp, 		"#40E0D0", 	Tr_CP_TimeStamp		]
	];
  }
  
  // Settings Data Table function
  function getSettingsData() {
	return [
	  //TR element, 		TD element, 		translation, 						TD button
	  [Tr_rtl, 				Td_rtl, 			getTranslation("Rtl"), 				Td_rtl_btn			],
	  [Tr_ResWin, 			Td_ResWin, 			getTranslation("ResWin"), 			Td_ResWin_btn		],
	  [Tr_MatBr, 			Td_MatBr, 			getTranslation("MatBr"), 			Td_MatBr_btn		],
	];
  }

   // Settings Data Table function for Editor
   function getSettingsDataEditor() {
	return [
	  //TD element, 		translation, 							input element, 				color, 		TR element
	  [Td_CP_Border, 		getTranslation("CP_Border"), 			Input_CP_Border, 			"#666666", 	Tr_CP_Border		],
	  [Td_CP_Background, 	getTranslation("CP_Background"), 		Input_CP_Background, 		"#202020", 	Tr_CP_Background	],
	  [Td_CP_ToolbarText, 	getTranslation("CP_ToolbarText"), 		Input_CP_ToolbarText, 		"#ffb317", 	Tr_CP_ToolbarText	],
	  [Td_CP_Button_Border, getTranslation("CP_Button_Border"), 	Input_CP_Button_Border, 	"#7f5400", 	Tr_CP_Button_Border	],
	  [Td_CP_Button_BG, 	getTranslation("CP_Button_BG"), 		Input_CP_Button_BG, 		"#422c00", 	Tr_CP_Button_BG		],
	  [Td_CP_SummaryBG, 	getTranslation("CP_SummaryBG"), 		Input_CP_SummaryBG, 		"#3A3A3A", 	Tr_CP_SummaryBG		],
	  [Td_CP_ScrBar1, 		getTranslation("CP_ScrBar1"), 			Input_CP_ScrBar1, 			"#666666", 	Tr_CP_ScrBar1		],
	  [Td_CP_ScrBar2, 		getTranslation("CP_ScrBar2"), 			Input_CP_ScrBar2, 			"#2A2A2A", 	Tr_CP_ScrBar2		],
	  [Td_CP_TEXT, 			getTranslation("CP_TEXT"), 				Input_CP_TEXT, 				"#D8D7D6", 	Tr_CP_TEXT			]
	];
  }

function createDropdown({ id, label, right, items, elem, resetButton, container }) {
	const btn = document.createElement("div");
	btn.id = `DropDownButton${id}`;
	btn.classList.add("VDCEditorEx-DropDown");
	btn.innerHTML = getTranslation(label);
	container.appendChild(btn);

	elem.id = `DropDownWindow${id}`;
	elem.classList.add("VDCEditorEx-DropDownWin");
	elem.setAttribute("checked", "false");
	elem.style.right = right;
	document.querySelector(".wikiEditor-ui-bottom").appendChild(elem);

	const centerDiv = document.createElement("div");
	centerDiv.style.display = "flex";
	centerDiv.style.justifyContent = "center";
	centerDiv.classList.add("VDCEditorEx-Div");
	elem.appendChild(centerDiv);

	resetButton.innerHTML = getTranslation("Reset");
	resetButton.id = `ResetButton${id}`;
	resetButton.classList.add("VDCEditorEx-ResetBtn");
	centerDiv.appendChild(resetButton);

	items.forEach(([td, label, input, color, tr]) => {
		td.innerHTML = label;
		td.classList.add("VDCEditorEx-Td");
		td.style.paddingRight = "3em";

		input.type = "color";
		input.value = color;
		input.style.right = "1em";
		input.classList.add("VDCEditorEx-DropDown-Colorpicker");

		tr.appendChild(td);
		tr.appendChild(input);
		elem.appendChild(tr);
	});
}

function setupPreferences(container) {
	const win = Div_DropDownWin;
	Div_DropDown.innerHTML = getTranslation("Pref");
	Div_DropDown.id = "DropDownButton1";
	Div_DropDown.classList.add("VDCEditorEx-DropDown");
	container.appendChild(Div_DropDown);

	win.innerHTML = "";
	win.id = "DropDownWindow1";
	win.setAttribute("checked", "false");
	win.classList.add("VDCEditorEx-DropDownWin");
	win.style.right = "1.2em";
	document.querySelector(".wikiEditor-ui-bottom").appendChild(win);

	getSettingsData().forEach(([tr, td, label, btnTd]) => {
		td.innerHTML = label;
		td.classList.add("VDCEditorEx-Td");
		td.style.paddingRight = "3em";

		tr.innerHTML = "";
		tr.appendChild(td);
		if (btnTd) {
			btnTd.innerHTML = `<img src="${chrome.runtime.getURL("images/settings/MwBtnUnchecked.png")}">`;
			btnTd.classList.add("VDCEditorEx-DropDown-Btn");
			btnTd.setAttribute("checked", "false");
			btnTd.style.right = "1em";
			tr.appendChild(btnTd);
		}
		win.appendChild(tr);
	});

	// Language setting
	Tr_Lang.innerHTML = "";
	Td_Lang.innerHTML = getTranslation("Language");
	Td_Lang.classList.add("VDCEditorEx-Td");
	Td_Lang.style.paddingRight = "3em";
	Input_Lang.type = "text";
	Input_Lang.value = "EN";
	Input_Lang.style.position = "absolute";
	Input_Lang.style.right = "0.9em";
	Input_Lang.classList.add("VDCEditorEx-Input");
	Tr_Lang.appendChild(Td_Lang);
	Tr_Lang.appendChild(Input_Lang);
	win.appendChild(Tr_Lang);
}

function setupDropdownToggle(buttonId, allDropdownIds = []) {
	const button = document.getElementById(`DropDownButton${buttonId}`);
	const win = document.getElementById(`DropDownWindow${buttonId}`);
	if (!button || !win) return;

	button.addEventListener('click', () => {
		const isOpen = win.getAttribute("checked") == "true";

		// Close all dropdowns
		allDropdownIds.forEach(id => {
			const otherWin = document.getElementById(`DropDownWindow${id}`);
			if (otherWin) {
				otherWin.setAttribute("checked", "false");
			}
		});

		// Reopen the clicked one if it was previously closed
		if (!isOpen) {
			win.setAttribute("checked", "true");
		}
	});
}

function CreateToolbar() {
	const toolbar = document.getElementById("wikiEditor-ui-toolbar");
	toolbar.innerHTML = `<a target="_blank" href="https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor" id="VDCEditorEx-Link" style="color: #ffb317;"><img src="${chrome.runtime.getURL("images/icons/16.png")}">VDCEditor</a><span class="VDCEditorEx-SettingsSeparator"></span>`;

	getToolbarData().forEach(([div, icon, title], i) => {
		div.classList.add("VDCEditorEx-Setting");
		div.setAttribute("checked", "false");
		div.setAttribute("title", title);
		div.innerHTML = `<img src="${chrome.runtime.getURL("images/toolbar/" + icon)}">`;
		toolbar.appendChild(div);
		if ([2, 6, 17].includes(i)) {
			const sep = document.createElement("span");
			sep.classList.add("VDCEditorEx-SettingsSeparator");
			toolbar.appendChild(sep);
		}
	});

	const spacer = document.createElement("div");
	spacer.classList.add("VDCEditorEx-Div-Left");
	toolbar.appendChild(spacer);

	createDropdown({ id: 3, label: "EdStyle", right: "10.7em", items: getSettingsDataEditor(), elem: Div_DropDownWin3, resetButton: Div_Reset_btn2, container: toolbar });
	createDropdown({ id: 2, label: "Style", right: "7em", items: getStyleData(), elem: Div_DropDownWin2, resetButton: Div_Reset_btn, container: toolbar });
	setupPreferences(toolbar);

	setupDropdownToggle(1, [1, 2, 3]); 
	setupDropdownToggle(2, [1, 2, 3]);
	setupDropdownToggle(3, [1, 2, 3]);

}
