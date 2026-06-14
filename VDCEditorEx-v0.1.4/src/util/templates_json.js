//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
// This data is seperated from the UDT, as these are used for different things in the extension.
//
//================================================================
const TEMPLATES_DATA = {

    "CATEGORIES": [
        "ACategory"
    ],

    "LINKS": [
        "L",
        "Lx",
        "LCategory",
        "LHelp",
        "LProject",
        "LMainpage",
        "LSpecial"
    ],

    "FUNCTIONS": [
        "#if",
        "#ifeq",
        "#iferror",
        "#ifexist",
        "#ifexpr",
        "#switch",
        "#expr"
    ],

    "OTHER_FUNCS": [
        "#time",
        "#timel",
        "#titleparts",
        "#rel2abs",
        "#len",
        "#pos",
        "#rpos",
        "#sub",
        "#count",
        "#replace",
        "#urlencode",
        "#urldecode"
    ],

    "MAGICWORDS": {
        "magicwords": [
            "SITENAME",
            "SERVER",
            "SERVERNAME",
            "DIRMARK",
            "DIRECTIONMARK",
            "ARTICLEPATH",
            "SCRIPTPATH",
            "STYLEPATH",
            "CURRENTVERSION",
            "CONTENTLANGUAGE",
            "CONTENTLANG",
            "PAGEID",
            "PAGELANGUAGE",
            "CASCADINGSOURCES",
            "REVISIONID",
            "REVISIONDAY",
            "REVISIONDAY2",
            "REVISIONMONTH",
            "REVISIONMONTH1",
            "REVISIONYEAR",
            "REVISIONTIMESTAMP",
            "REVISIONUSER",
            "REVISIONSIZE",
            "NUMBEROFPAGES",
            "NUMBEROFARTICLES",
            "NUMBEROFFILES",
            "NUMBEROFEDITS",
            "NUMBEROFUSERS",
            "NUMBEROFADMINS",
            "NUMBEROFACTIVEUSERS",
            "NAMESPACENUMBER"
        ],
        "tempmagicwords": [
            "FULLPAGE",
            "PAGE",
            "BASEPAGE",
            "ROOTPAGE",
            "SUBPAGE",
            "SUBJECTPAGE",
            "ARTICLEPAGE",
            "TALKPAGE"
        ],
        "spaces": [
            "NAME",
            "NAMEE",
            "SUBJECT",
            "ARTICLE",
            "TALK"
        ],
        "space_suffixes": [
            "SPACE",
            "SPACEE"
        ],
        "tempmagic_suffixes": [
            "NAME",
            "NAMEE"
        ],
        "magicwords_2": [
            "NOTOC",
            "FORCETOC",
            "TOC",
            "NOEDITSECTION",
            "NEWSECTIONLINK",
            "NONEWSECTIONLINK",
            "NOGALLERY",
            "HIDDENCAT",
            "NOCONTENTCONVERT",
            "NOCC",
            "NOTITLECONVERT",
            "NOTC",
            "INDEX",
            "NOINDEX",
            "STATICREDIRECT",
            "EXPECTUNUSEDCATEGORY",
        ],
        // Allowed values means if this magic word is allowed to have params, e.g. {{DISPLAYTITLE:Other name}}
        "AllowedValues": [
            "DISPLAYTITLE",
            "fullurl",
            "FULLURL",
            "PROTECTIONEXPIRY",
            "int",
            "INT",
            "lc",
            "LC",
            "lcfirst",
            "LCFIRST",
            "uc",
            "UC",
            "ucfirst",
            "UCFIRST",
            "urlencode",
            "URLENCODE",
        ]
    },

    "TIMESTAMP": {
        "location": [
            "CURRENT",
            "LOCAL"
        ],
        "date": [
            "YEAR",
            "MONTH",
            "MONTH1",
            "MONTH2",
            "MONTHNAME",
            "MONTHNAMEGEN",
            "MONTHABBREV",
            "DAY",
            "DAY2",
            "DOW",
            "DAYNAME",
            "TIME",
            "HOUR",
            "WEEK",
            "TIMESTAMP"
        ]
    },

    "TAGS": [
        "blockquote", "center", "strong", "strike", "samp",
		"small", "span", "table",
		"caption", "section", "abbr", "cite", "code", 
        "data", "del", "dfn", "div", "dd", "dl", "dt",
		"em", "font", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "i", "ins",
		"kbd", "li", "mark", "ol", "p", "pre", "q", "rp", "rt", "ruby", "sub", "sup",
		"s", "td", "th", "time", "tr", "tt", "ul", "u", "var", "wbr", "bdi", "bdo",
		"big", "br", "b"
    ],

    "WIKITAGS": [
        "categorytree", "gallery", "indicator", "nowiki",
        "syntaxhighlight", "time", "includeonly", "onlyinclude", "noinclude"
    ]
}
