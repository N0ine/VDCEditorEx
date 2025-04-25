//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

// THERE ARE TO MANY CONSTS... FIX IT

//================================================================
// Public variables
// Each comment is a visual of each button in order
//================================================================
const Div_WordWrap = document.createElement('div');
const Div_SameAsSelected = document.createElement('div');
const Div_ScrollAfterLastLine = document.createElement('div');
//================================================================
const Div_HTMLTagsFormatter = document.createElement("div");
const Div_ColoredNumbers = document.createElement("div");
const Div_MwFunctions = document.createElement("div");
const Div_StylizedTemplates = document.createElement('div');
const Div_StylizedLinks = document.createElement('div');
//================================================================
const Div_MwHighlight = document.createElement("div");
const Div_MwCategory = document.createElement("div");
const Div_MwFile = document.createElement("div");
const Div_TempMagicWords = document.createElement("div");
const Div_MwHeader = document.createElement("div");
const Div_MwMagicWords = document.createElement("div");
const Div_MwMnemonics = document.createElement("div");
const Div_MwMultiComments = document.createElement("div");
const Div_MwPost = document.createElement("div");
const Div_MwTags = document.createElement("div");
const Div_MwTimeStamp = document.createElement("div");
//================================================================
const Div_ReplaceLinks = document.createElement('div');
//================================================================
// Dropdown : Style
const Div_DropDown2 = document.createElement('div');
const Div_DropDownWin2 = document.createElement('div');
// Dropdown : Style = Settings
const Div_Reset_btn = document.createElement('div');
// ----------
const Tr_CP_Templates = document.createElement('tr');
const Td_CP_Templates = document.createElement('td');
const Input_CP_Templates = document.createElement('input');
// ----------
const Tr_CP_Links = document.createElement('tr');
const Td_CP_Links = document.createElement('td');
const Input_CP_Links = document.createElement('input');
// ----------
const Tr_CP_HtmlNum = document.createElement('tr');
const Td_CP_HtmlNum = document.createElement('td');
const Input_CP_HtmlNum = document.createElement('input');
// ----------
const Tr_CP_Cats = document.createElement('tr');
const Td_CP_Cats = document.createElement('td');
const Input_CP_Cats = document.createElement('input');
// ----------
const Tr_CP_File = document.createElement('tr');
const Td_CP_File = document.createElement('td');
const Input_CP_File = document.createElement('input');
// ----------
const Tr_CP_TempMW = document.createElement('tr');
const Td_CP_TempMW = document.createElement('td');
const Input_CP_TempMW = document.createElement('input');
// ----------
const Tr_CP_Header = document.createElement('tr');
const Td_CP_Header = document.createElement('td');
const Input_CP_Header = document.createElement('input');
// ----------
const Tr_CP_MagicWords = document.createElement('tr');
const Td_CP_MagicWords = document.createElement('td');
const Input_CP_MagicWords = document.createElement('input');
// ----------
const Tr_CP_Mnemonics = document.createElement('tr');
const Td_CP_Mnemonics = document.createElement('td');
const Input_CP_Mnemonics = document.createElement('input');
// ----------
const Tr_CP_MultiComments = document.createElement('tr');
const Td_CP_MultiComments = document.createElement('td');
const Input_CP_MultiComments = document.createElement('input');
// ----------
const Tr_CP_Post = document.createElement('tr');
const Td_CP_Post = document.createElement('td');
const Input_CP_Post = document.createElement('input');
// ----------
const Tr_CP_Tags = document.createElement('tr');
const Td_CP_Tags = document.createElement('td');
const Input_CP_Tags = document.createElement('input');
// ----------
const Tr_CP_TimeStamp = document.createElement('tr');
const Td_CP_TimeStamp = document.createElement('td');
const Input_CP_TimeStamp = document.createElement('input');
// Dropdown : Preferences
const Div_DropDown = document.createElement('div');
const Div_DropDownWin = document.createElement('div');
// Dropdown : Preferences = Settings
const Div_rtl = document.createElement('div');
const Tr_rtl = document.createElement('tr');
const Td_rtl = document.createElement('td');
const Td_rtl_btn = document.createElement('td');
const Div_ResWin = document.createElement('div');
const Tr_ResWin = document.createElement('tr');
const Td_ResWin = document.createElement('td');
const Td_ResWin_btn = document.createElement('td');
const Div_ScrollNewLine = document.createElement('div');
const Tr_ScrollNewLine = document.createElement('tr');
const Td_ScrollNewLine = document.createElement('td');
const Td_ScrollNewLine_btn = document.createElement('td');
const Div_Lang = document.createElement('div');
const Tr_Lang = document.createElement('tr');
const Td_Lang = document.createElement('td');
const Input_Lang = document.createElement('input');
// ----------

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
	  [Td_CP_Templates, 		getTranslation("CP_Templates"), 		Input_CP_Templates, 		"#EE69B1", 	Tr_CP_Templates		],
	  [Td_CP_Links, 			getTranslation("CP_Links"), 			Input_CP_Links, 			"#87CEEB", 	Tr_CP_Links			],
	  [Td_CP_HtmlNum, 			getTranslation("CP_HtmlNum"), 			Input_CP_HtmlNum, 			"#00FCFF", 	Tr_CP_HtmlNum		],
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
	  //DIV element, 		TR element, 		TD element, 		translation, 						TD button
	  [Div_rtl, 			Tr_rtl, 			Td_rtl, 			getTranslation("Rtl"), 				Td_rtl_btn			],
	  [Div_ResWin, 			Tr_ResWin, 			Td_ResWin, 			getTranslation("ResWin"), 			Td_ResWin_btn		],
	  [Div_ScrollNewLine, 	Tr_ScrollNewLine, 	Td_ScrollNewLine, 	getTranslation("ScrollNewLine"), 	Td_ScrollNewLine_btn]
	];
  }


function CreateToolbar()
{
	TOOLBAR_DATA = getToolbarData();
	STYLE_DATA = getStyleData();
	SETTINGS_DATA = getSettingsData();

    const Div_SubMainToolBar = document.getElementById('wikiEditor-ui-toolbar');
    const Div_MainBottomToolBar = document.getElementsByClassName('wikiEditor-ui-bottom')[0];

	//================================================================
	Div_SubMainToolBar.innerHTML = `
	<a target="_blank" href="https://developer.valvesoftware.com/wiki/User:Max34/VDCEditor" id="VDCEditorEx-Link" style="text-decoration:none; user-select:none; display:flex; gap:4px; align-items:center; font-weight:bold; color: #ffb317;">
		<img src="${chrome.runtime.getURL("images/icons/16.png")}">VDCEditor
	</a>
	<span class="VDCEditorEx-SettingsSeparator"></span>`;
	//================================================================

	//Create toolbar
	for (let i = 0; i < TOOLBAR_DATA.length; i++) {
		TOOLBAR_DATA[i][0].classList.add("VDCEditorEx-Setting");
		TOOLBAR_DATA[i][0].setAttribute("checked", "false");
		Div_SubMainToolBar.appendChild(TOOLBAR_DATA[i][0]);
		TOOLBAR_DATA[i][0].setAttribute("title", TOOLBAR_DATA[i][2]);
		TOOLBAR_DATA[i][0].innerHTML = `<img src="${chrome.runtime.getURL("images/toolbar/" + TOOLBAR_DATA[i][1])}">`;

		// adds a seperator if 'i' is this 'number'
		if (i == 2 || i == 6 || i == 17)
		{
			let Span_Separator = document.createElement('span');
			Span_Separator.classList.add("VDCEditorEx-SettingsSeparator");
			Div_SubMainToolBar.appendChild(Span_Separator);
		}
	}

	//================================================================
	{
		let Span_Separator = document.createElement('div');
		Span_Separator.classList.add("VDCEditorEx-Div-Left");
		Div_SubMainToolBar.appendChild(Span_Separator);
	}
	//================================================================
	// Dropdown : Style
	//================================================================

	Div_DropDown2.innerHTML = getTranslation("Style");
	Div_DropDown2.id = "DropDownButton";
	Div_DropDown2.classList.add("VDCEditorEx-DropDown");
	Div_SubMainToolBar.appendChild(Div_DropDown2);

	Div_DropDownWin2.innerHTML = "";
	Div_DropDownWin2.id = "DropDownWindow2";
	Div_DropDownWin2.setAttribute("checked", "false");
	Div_DropDownWin2.style.right = "8.5em";
	Div_DropDownWin2.classList.add("VDCEditorEx-DropDownWin");
	Div_MainBottomToolBar.appendChild(Div_DropDownWin2);

	//================================================================
	// Dropdown : Style = Settings
	//================================================================

	const Div_Center_rst_btn = document.createElement('div');
	Div_Center_rst_btn.style.display = "flex";
	Div_Center_rst_btn.style.justifyContent = "center";
	Div_DropDownWin2.appendChild(Div_Center_rst_btn);

	Div_Reset_btn.innerHTML = getTranslation("Reset");
	Div_Reset_btn.id = "ResetButton";
	Div_Reset_btn.classList.add("VDCEditorEx-ResetBtn");
	Div_Center_rst_btn.classList.add("VDCEditorEx-Div");
	Div_Center_rst_btn.appendChild(Div_Reset_btn);

	//================================================================

	// Create style settings
	for (let i = 0; i < STYLE_DATA.length; i++) {

		STYLE_DATA[i][0].innerHTML = STYLE_DATA[i][1];
		STYLE_DATA[i][0].classList.add("VDCEditorEx-Td");
		STYLE_DATA[i][0].style.paddingRight = "3em";

		STYLE_DATA[i][4].appendChild(STYLE_DATA[i][0]);	
	}
	
	for (let i = 0; i < STYLE_DATA.length; i++) {

		STYLE_DATA[i][2].type = "color";
		STYLE_DATA[i][2].style.right = "1em";
		STYLE_DATA[i][2].value = STYLE_DATA[i][3]
		STYLE_DATA[i][2].classList.add("VDCEditorEx-DropDown-Colorpicker");

		STYLE_DATA[i][4].appendChild(STYLE_DATA[i][2]);
	}

	for (let i = 0; i < STYLE_DATA.length; i++) {
		Div_DropDownWin2.appendChild(STYLE_DATA[i][4]);
	}

	//================================================================
	// Dropdown : Preferences
	//================================================================

	Div_DropDown.innerHTML = getTranslation("Pref");
	Div_DropDown.id = "DropDownButton";
	Div_DropDown.classList.add("VDCEditorEx-DropDown");
	Div_SubMainToolBar.appendChild(Div_DropDown);

	Div_DropDownWin.innerHTML = "";
	Div_DropDownWin.id = "DropDownWindow";
	Div_DropDownWin.setAttribute("checked", "false");
	Div_DropDownWin.style.right = "1.3em";
	Div_DropDownWin.classList.add("VDCEditorEx-DropDownWin");
	Div_MainBottomToolBar.appendChild(Div_DropDownWin);

	//================================================================
	// Dropdown : Preferences = Settings
	//================================================================

	// Create preferences
	for (let i = 0; i < SETTINGS_DATA.length; i++) {

		// DIV
		SETTINGS_DATA[i][0].innerHTML = "";
		SETTINGS_DATA[i][0].classList.add("VDCEditorEx-Div");

		Div_DropDownWin.appendChild(SETTINGS_DATA[i][0]);
		
		// TR
		SETTINGS_DATA[i][1].innerHTML = "";
		SETTINGS_DATA[i][0].appendChild(SETTINGS_DATA[i][1]);

		//TD
		SETTINGS_DATA[i][2].innerHTML = SETTINGS_DATA[i][3];
		SETTINGS_DATA[i][2].classList.add("VDCEditorEx-Td");
		SETTINGS_DATA[i][2].style.paddingRight = "3em";
		SETTINGS_DATA[i][1].appendChild(SETTINGS_DATA[i][2]);

		//BUTTON
		if (SETTINGS_DATA[i][4] != null)
		{
			SETTINGS_DATA[i][4].innerHTML = `<img src="${chrome.runtime.getURL("images/settings/MwBtnUnchecked.png")}">`;
			SETTINGS_DATA[i][4].setAttribute("checked", "false");
			SETTINGS_DATA[i][4].style.right = "1em";
			SETTINGS_DATA[i][4].classList.add("VDCEditorEx-DropDown-Btn");
			SETTINGS_DATA[i][1].appendChild(SETTINGS_DATA[i][4]);
		}	
	}

	Div_Lang.innerHTML = "";
	Div_Lang.classList.add("VDCEditorEx-Div");
	
	Div_DropDownWin.appendChild(Div_Lang);

	Tr_Lang.innerHTML = "";
	Div_Lang.appendChild(Tr_Lang);

	Td_Lang.innerHTML = getTranslation("Language")
	Td_Lang.classList.add("VDCEditorEx-Td");
	Td_Lang.style.paddingRight = "3em";
	Tr_Lang.appendChild(Td_Lang);

	Input_Lang.type ="text";
	Input_Lang.value = "EN"
	Input_Lang.style.position = "absolute";
	Input_Lang.style.right = "0.9em";
	Input_Lang.classList.add("VDCEditorEx-Input");
	Tr_Lang.appendChild(Input_Lang);
}
