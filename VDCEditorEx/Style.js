//========== Valve Developer Community Editor Extended ===========
//
// Original Author: Max34
// Extended version : N0one
//
//===============================================================

// Default colors
var COLOR_multilinecomments = "#228B22";
var COLOR_magicwords 		= "#40E0D0";
var COLOR_tempmagicwords 	= "#40E0D0";
var COLOR_htmlents 			= "#00FCFF";
var COLOR_htmlmnemonics 	= "#00FCFF";
var COLOR_mwtags 			= "#5F9EA0";
var COLOR_mwheaders			= "#D2B48C";
var COLOR_mwapost 			= "#369FFF";
var COLOR_mwtemplates 		= "#EE69B1";
var COLOR_mwcategories 		= "#01B700";
var COLOR_mwlinks 			= "#87CEEB";
var COLOR_mwfiles 			= "#FFE599";
var COLOR_timestamp 		= "#40E0D0";
var COLOR_numbers			= "#FFB300";
var COLOR_Highlight			= "#5d5d2c";	

var Ed_Color_Border 		= "#666666";
var Ed_Color_Background 	= "#202020";
var Ed_Color_ToolbarText 	= "#ffb317";
var Ed_Color_Button_Border 	= "#7f5400";
var Ed_Color_Button_BG 		= "#422c00";
var Ed_Color_SummaryBG 		= "#3A3A3A";
var Ed_Color_ScrBar1 		= "#666666";
var Ed_Color_ScrBar2 		= "#2A2A2A";
var Ed_Color_TEXT 			= "#D8D7D6";

var FontFamily = "monospace";

var FontSize = "14";
var Style_Extension = document.createElement('style');
Style_Extension.id = "VDCEditorEx-Style";
document.head.appendChild(Style_Extension);

function lightenColor(hex, percent) {
    // Check if hex is a valid string and has the '#' symbol at the start
    if (typeof hex !== 'string' || !/^#[0-9A-F]{6}$/i.test(hex)) {
        console.error("Invalid hex color:", hex);
        return hex; // Return the original value if it's invalid
    }

    // Remove the '#' symbol
    hex = hex.replace('#', '');

    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
    g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
    b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

    // Return the lightened color as a hex string
    return '#' + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1).toUpperCase();
}


function StyleMain()
{
	Style_Extension.textContent = `

	.VDCEditorEx-ControlChars
	{
		color: #808080;
	}

	.mw-editform #editpage-copywarn
	{
		font-size: 11px;
	}

	.mw-editform #wpTextbox1
	{
		display: none;
	}

	form#editform
	{
		margin-top: 2em;
	}

	.VDCEditorEx-SettingsSeparator
	{
		border-left: 1px solid ${Ed_Color_Border};
		margin: 0 4px;
	}

	.editButtons
	{
		display: flex;
		gap: .6em;
	}

	.oo-ui-inputWidget
	{
		margin-right: 0;
	}
	
	input#wpSummary.oo-ui-inputWidget-input
	{
		border-color = ${Ed_Color_Border}
	}

	.wikiEditor-ui-view.wikiEditor-ui-view-wikitext
	{
		border: 0;
	}

	#wikiEditor-ui-toolbar
	{
		background: transparent;
		padding: 4px 6px;
		display: flex;
		gap: 3px;
		-webkit-filter: invert(0) !important; 
		filter: invert(0) !important;
	}

	.wikiEditor-ui-bottom
	{
		display: flex;
		background: ${Ed_Color_Background};
	}

	.wikiEditor-ui .wikiEditor-ui-top
	{
		border-bottom: 1px solid ${Ed_Color_Border} !important;
	}

	.mw-editform .editOptions
	{
		border-radius: 0;
		border: 0;
		border-top: 1px solid ${Ed_Color_Border};
		padding: .9em;
		margin-bottom: 0;
		background: transparent;
		color: #B9B7B5;
	}

	#VDCEditorEx-SameSelection, #VDCEditorEx-CodeLines, #VDCEditorEx-StylizedCode, #VDCEditorEx-AllChars
	{
		position: absolute;
		left: 0;
		top: 0;
		user-select: none;
		pointer-events: none;
		padding: 2px 5px;
		color: transparent;
		width: calc(100% - 10px);
	}

	#VDCEditorEx-StatusBar
	{
		border-top: 1px solid ${Ed_Color_Border};
		padding: 4px 6px;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		color: ${Ed_Color_TEXT};
	}

	#VDCEditorEx-MainWrapper
	{
		box-shadow: 0 10px 20px rgb(0,0,0,.6);
		border-radius: 4px;
		border: 1px solid ${Ed_Color_Border};
		background: ${Ed_Color_Background};
		margin-bottom: 2em;
	}

	.wikiEditor-ui-text
	{
		position: relative;
		overflow-y: scroll;
		resize: vertical;
		height: 500px;
		width: 100%;
		min-width: 256px;
		background: ${Ed_Color_SummaryBG};
		scrollbar-color: ${Ed_Color_ScrBar1} ${Ed_Color_ScrBar2};
		min-height: ${(FontSize * 1.5 + 4)}px;
		tab-size: 4;
		font-size: ${FontSize}px;
		font-family: ${FontFamily};
		white-space: pre-wrap;
		line-height: 1.5em;
	}

	#VDCEditorEx-Editor
	{
		position: relative;
		z-index: 1;
		padding: 2px 5px;
		color: transparent;
		caret-color: white;
		line-height: 1.5em;
	}

	#VDCEditorEx-Editor:focus
	{
		outline: 0px solid transparent;
	}

	#VDCEditorEx-Editor::selection
	{
		color: white;
		background: #0C41AA;
	}

	#VDCEditorEx-LineNumbers
	{
		position: absolute;
		z-index: 2;
		/* left: 0; */
		top: 0;
		padding: 2px 5px;
		/* text-align: right; */
		background: ${Ed_Color_Background};
		font-family: monospace, monospace;
		line-height: 1.5em;
		white-space: pre-wrap;
		user-select: none;
		pointer-events: none;
		/* border-right: 1px solid ${Ed_Color_Border}; */
		display: inline-flex;
		flex-direction: column;
		color: ${Ed_Color_TEXT};
	}

	editor-color
	{
		color: chartreuse;
	}

	.wikiEditor-ui-text::-webkit-resizer
	{
		border: 0;
		background: url(${chrome.runtime.getURL('images/toolbar/Resizer.png')});
	}

	#wpSummary
	{
		border: 1px solid ${Ed_Color_Border} !important;
		box-shadow: #0000003A 0 0 5px 3px;
		border-radius: 3px;
		color: ${Ed_Color_TEXT};
		background-color: #3A3A3A !important
	}

	#wpSummary:focus
	{
		border: 1px solid #808080;
	}

	.oo-ui-fieldLayout-header
	{
		padding-right: 6px;	
	}

	.oo-ui-textInputWidget.oo-ui-labelElement > .oo-ui-labelElement-label
	{
		display: flex;
		align-items: center;
		height: 100%;
		margin: 0;
		padding: 0.5em 0.8em 0.5em 0.5em;
		user-select: none;
	}


	#wpPreview, #wpDiff
	{
		transition: color 200ms cubic-bezier(0.4,0.55,0.55,1), background 200ms cubic-bezier(0.4,0.55,0.55,1);
		background: linear-gradient(135deg, rgba(255 255 255 / 10%), rgba(255 255 255 / 2%));
		border: 1px solid ${Ed_Color_Border};
		border-radius: 4px;
		padding: 0.6em 0.8em;
		color: #D8D7D6;
		box-shadow: none;
	}

	#wpPreview:hover, #wpDiff:hover
	{
		color: white;
		background: linear-gradient(135deg, rgba(255 255 255 / 20%), rgba(255 255 255 / 4%));
	}

	#wpSave
	{
		transition: color 200ms cubic-bezier(0.4,0.55,0.55,1);
		background: rgba(0 255 0 / 20%);
		border: 1px solid #3c783c;
		border-radius: 4px;
		padding: 0.6em 0.8em;
		color: #D8D7D6;
		box-shadow: none;
	}

	#mw-editform-cancel
	{
		transition: color 200ms cubic-bezier(0.4,0.55,0.55,1);
		background: rgb(255 0 0 / 20%);
		border: 1px solid #783c3c;
		border-radius: 4px;
		padding: 0.6em 0.8em;
		font-weight: bold;
		box-shadow: none;
		margin: 0.5em 0 0 0;
	}

	#wpSave:hover
	{
		color: white;
		background: rgba(0 255 0 / 30%);
	}

	.oo-ui-checkboxInputWidget [type='checkbox'] + span
	{
		background-color: #3A3A3A;
		border: 1px solid ${Ed_Color_Border};
	}

	#wpMinoredit, .oo-ui-checkboxInputWidget-checkIcon.oo-ui-widget.oo-ui-widget-enabled.oo-ui-iconElement-icon.oo-ui-icon-check.oo-ui-iconElement.oo-ui-iconWidget.oo-ui-image-invert, #wpWatchthis, oo-ui-checkboxInputWidget-checkIcon.oo-ui-widget.oo-ui-widget-enabled.oo-ui-iconElement-icon.oo-ui-icon-check.oo-ui-iconElement.oo-ui-iconWidget.oo-ui-image-invert
	{
		width: 20px;
		height: 20px;
		border-color: ${Ed_Color_Border};
		box-shadow: none;
	}

	.oo-ui-checkboxInputWidget [type='checkbox']:hover + span
	{
		background-color: #366FDF3B;
	}

	.oo-ui-checkboxInputWidget.oo-ui-widget-enabled [type='checkbox']:checked + span.oo-ui-iconWidget.oo-ui-iconElement.oo-ui-iconElement-icon
	{
		background-color: #143A85;
	}

	.oo-ui-checkboxInputWidget.oo-ui-widget-enabled [type='checkbox']:checked:hover + span.oo-ui-iconWidget.oo-ui-iconElement.oo-ui-iconElement-icon
	{
		background-color: #1B479F;
	}


	.oo-ui-checkboxInputWidget.oo-ui-widget-enabled [type='checkbox']:checked:focus + span.oo-ui-iconWidget.oo-ui-iconElement.oo-ui-iconElement-icon
	{
		background-color: #143A85;
	}


	.oo-ui-checkboxInputWidget.oo-ui-widget-enabled [type='checkbox']:checked:focus:hover + span.oo-ui-iconWidget.oo-ui-iconElement.oo-ui-iconElement-icon
	{
		background-color: #1B479F;
	}


	label[for="wpMinoredit"], label[for="wpWatchthis"]
	{
		cursor: pointer;
		user-select: none;
	}

	editor-multilinecomments,
	editor-multilinecomments editor-magicwords,
	editor-multilinecomments editor-htmlmnemonics,
	editor-multilinecomments editor-htmltags,
	editor-multilinecomments editor-htmltagattribs,
	editor-multilinecomments editor-htmlattribvalues,
	editor-multilinecomments editor-mwtags,
	editor-multilinecomments editor-mwheaders,
	editor-multilinecomments editor-mwcategories,
	editor-multilinecomments editor-mwapost,
	editor-multilinecomments editor-mwfiles,
	editor-multilinecomments editor-mwlinks,
	editor-multilinecomments editor-mwparams,
	editor-multilinecomments editor-mwtemplates,
	editor-multilinecomments editor-tempmagicwords,
	editor-multilinecomments editor-mwfunctions
	{
		color: ${COLOR_multilinecomments};
	}

	editor-multilinecomments editor-number
	{
		color: ${COLOR_multilinecomments} !important;
	}

	editor-magicwords
	{
		color: ${COLOR_magicwords};
	}

	editor-tempmagicwords
	{
		color: ${COLOR_tempmagicwords};
	}

	editor-htmlents
	{
		color: ${COLOR_htmlents};
	}

	editor-htmlmnemonics
	{
		color: ${COLOR_htmlmnemonics};
	}

	editor-htmltags
	{
		color: #6495ED;
	}

	editor-htmltagattribs
	{
		color: #B0C4DE;
	}

	editor-htmlattribvalues
	{
		color: #FF7F50;
	}

	editor-mwtags
	{
		color: ${COLOR_mwtags};
	}

	editor-mwheaders
	{
		color: ${COLOR_mwheaders};
	}

	editor-number, editor-unit
	{
		color: ${COLOR_numbers} !important;
	}

	editor-mwapost
	{
		color: ${COLOR_mwapost};
	}

	editor-mwtemplates
	{
		color: ${COLOR_mwtemplates};
	}

	editor-mwfunctions,
	editor-mwfunctions editor-mwtemplates
	{
		color: #CD69EE;
	}

	editor-mwcategories,
	editor-mwcategories editor-number
	{
		color: ${COLOR_mwcategories};
	}

	editor-mwlinks,
	editor-mwlinks editor-number
	{
		color:${COLOR_mwlinks};
	}

	editor-mwfiles,
	editor-mwfiles editor-number
	{
		color: ${COLOR_mwfiles};
	}

	editor-mwparams,
	editor-mwparams editor-mwtemplates
	{
		color: #8E69FF !important;
	}

	editor-timestamp
	{
		color: ${COLOR_timestamp};
	}

	.VDCEditorEx-SameAsSelected
	{
		background: ${COLOR_Highlight};
	}

	.VDCEditorEx-Version {
		text-decoration: none;
	}

	.VDCEditorEx-Version:hover {
		text-decoration: underline;
	}

	.VDCEditorEx-Setting
	{
		width: 18px;
		height: 18px;
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 200ms cubic-bezier(0.4,0.55,0.55,1), border 200ms cubic-bezier(0.4,0.55,0.55,1);
	}

	.VDCEditorEx-Setting[checked="false"]
	{
		border: 1px solid transparent;
		background: transparent;
	}

	.VDCEditorEx-Setting[checked="false"]:hover
	{
		border: 1px solid ${Ed_Color_Button_Border};
		box-shadow: inset 0 0 4px ${lightenColor(Ed_Color_Button_Border, 20)};
	}

	.VDCEditorEx-Setting[checked="true"]
	{
		border: 1px solid ${Ed_Color_Button_Border};
		background: ${Ed_Color_Button_BG};
	}

	.VDCEditorEx-Setting[checked="true"]:hover
	{
		box-shadow: inset 0 0 4px ${lightenColor(Ed_Color_Button_Border, 20)};
	}

	.VDCEditorEx-DropDown
	{
		background: transparent;
		border: 1px solid ${Ed_Color_Button_Border};
		color: ${Ed_Color_ToolbarText}; 
		user-select: none; 
		display: flex; 
		gap: 4px; 
		font-weight: bold;
		padding-left: 5px;
		padding-right: 5px;
		width: fit-content;
		height: fit-content;
		border-radius: 3px;
		justify-content: center;
		transition: box-shadow 200ms cubic-bezier(0.4,0.55,0.55,1), border 200ms cubic-bezier(0.4,0.55,0.55,1);
	}
		
	.VDCEditorEx-DropDown:hover
	{
		border: 1px solid ${Ed_Color_Button_Border};
		box-shadow: inset 0 0 4px ${Ed_Color_Button_Border};
	}

	.VDCEditorEx-ResetBtn
	{
		background: transparent;
		border: 1px solid ${Ed_Color_Button_Border};
		color: ${Ed_Color_ToolbarText};
		user-select: none; 
		display: flex; 
		gap: 4px; 
		font-weight: bold;
		padding-left: 5px;
		padding-right: 5px;
		width: fit-content;
		height: fit-content;
		border-radius: 3px;
		justify-content: center;
		transition: box-shadow 200ms cubic-bezier(0.4,0.55,0.55,1), border 200ms cubic-bezier(0.4,0.55,0.55,1);
	}

	.VDCEditorEx-ResetBtn:hover
	{
		border: 1px solid ${Ed_Color_Button_Border};
		box-shadow: inset 0 0 4px ${lightenColor(Ed_Color_Button_Border, 20)};
	}

	.VDCEditorEx-Div-Left
	{
		margin-left: auto;
	}

	.VDCEditorEx-Div-Right
	{
		margin-right: 1em;
	}

	.VDCEditorEx-DropDownWin
	{
		position: absolute;
		padding: 3px;
		z-index: 2;
    	top: 30px;
		background: #262626;
		border-left: 1px solid ${Ed_Color_Border};
		border-right: 1px solid ${Ed_Color_Border};
		border-bottom: 1px solid ${Ed_Color_Border};
		min-width: 12em;
		/* height: 20em; */ 
		visibility: hidden;
	}

	.VDCEditorEx-DropDownWin[checked="true"]
	{
		transition:visibility 0.1s linear, background 0.1s linear, opacity 0.1s linear;
		opacity: 100;
		background: ${lightenColor(Ed_Color_Background, 5)};
		visibility: visible;
	}

	.VDCEditorEx-DropDownWin[checked="false"]
	{
		transition:visibility 0.1s linear, background 0.1s linear, opacity 0.1s linear;
		opacity: 100;
		background: transparent;
		visibility: hidden;
	}

	.VDCEditorEx-Td
	{
		align-content: center;
		padding-bottom: 3px;
	}

	.VDCEditorEx-DropDown-Btn
	{
		position: absolute;
		border: 1px solid ${Ed_Color_Button_Border};
		border-radius: 3px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: box-shadow 200ms cubic-bezier(0.4,0.55,0.55,1), border 200ms cubic-bezier(0.4,0.55,0.55,1);
	}

	.VDCEditorEx-DropDown-Btn:hover
	{
		border: 1px solid ${Ed_Color_Button_Border};
		box-shadow: inset 0 0 4px ${Ed_Color_Button_Border};
	}

	.VDCEditorEx-DropDown-Colorpicker
	{
		position: absolute;
		border: 0px;
    	border-radius: 3px;
    	display: flex;
    	align-items: center;
    	justify-content: center;
    	padding: 0px;
    	box-sizing: border-box;
    	block-size: 22px;
    	inline-size: 19px;
    	background-color: transparent;
    	color: transparent;
	}

	.VDCEditorEx-Selection
	{
		border-color: ${Ed_Color_Button_Border};
    	border-radius: 3px;
    	position: absolute;
	}

	.VDCEditorEx-Input
	{
		position: absolute;
	}
	.VDCEditorEx-Input[type="text"]
	{
		border-color: ${Ed_Color_Button_Border};
		width: 40px;
		text-align: center;
	}
	`
}