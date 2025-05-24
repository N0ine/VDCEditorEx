/*
    This is a custom "json" file to support templates, magic words, etc.
    If you want to add other templates, then add it here, everything updates dynamically
    If you do not want to have stylized templates, then set it empty (or comment the (specific) data; not "TEMPLATES"!)
    If you do not want to color a specific template, use "inherit", 
        also i realized that it just appends the data, so you can freely add something else like a "background: #000000;"
    ############ IMPORTANT: USE LOWERCASE NAMES  ############
    ## USAGE:
    {
        "NAME": "<name>",
        "COLOR": "<color>"
    },
    ## OR:
    {
        "NAME": ["<name1>", "<name2>"],
         "COLOR": "<color>"
    },
*/
const data = {
    "TEMPLATES": [
        // These are the default values that you see any page using notice templates
        // DO NOT COMMENT THIS ONE OUT!
        {
            "NAME": "__DEFAULT__",
            "USEDEFAULT": true, // This means if it doesn't find the template name in here, then color it to this default template color.
        },
        {
            "NAME": ["bug", "bugnotice"],
            "COLOR": "rgb(245, 80, 50)"
        },
        {
            "NAME": ["clarify", "confirm", "elaborate", "todo", "when", "where", "which", "why"],
            "COLOR": "#8BC53F"
        },
        {
            "NAME": "code fix",
            "COLOR": "rgb(91, 165, 235)"
        },
        {
            "NAME": "deprecated",
            "COLOR": "rgb(255, 232, 79)"
        },
        {
            "NAME": "fix",
            "COLOR": "rgb(113, 227, 84)"
        },
        {
            "NAME": "important",
            "COLOR": "rgb(240, 211, 0)"
        },
        {
            "NAME": "note",
            "COLOR": "#ffff60"
        },
        {
            "NAME": "placement tip",
            "COLOR": "rgb(106, 114, 255)"
        },
        {
            "NAME": "question",
            "COLOR": "#6187B2"
        },
        {
            "NAME": "tip",
            "COLOR": "#ffff80"
        },
        {
            "NAME": "warning",
            "COLOR": "rgb(245, 47, 47)"
        },
        {
            "NAME": "workaround",
            "COLOR": "rgb(184, 113, 66)"
        },
        {
            "NAME": ["translate", "translating", "finish translation", "update translation", "machine translation"],
            "COLOR": "goldenrod"
        }
    ],

    // Any templates that are a category
    "CATEGORIES": [
        "acategory"
    ],

    // Ditto.
    "LINKS": [
        "l",
        "lx",
        "lcategory",
        "lhelp",
        "lproject",
        "lmainpage",
        "lspecial"
    ],

    // If a function works on a wiki, add them
    "FUNCTIONS": [
        "#if",
        "#ifeq",
        "#iferror",
        "#ifexist",
        "#ifexpr",
        "#switch",
        "#expr",
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
        "#explode",
        "#urldecode"
    ],

    // If any magic words that works on a wiki, add them
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
            "EXPECTUNUSEDCATEGORY"
        ]
    },

    // if a time stamp works on a wiki, add them
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
    }
}
