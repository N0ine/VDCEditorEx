//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

var Lang_Editor = "EN";

// Set the language first, then the value
chrome.storage.local.get('LANGUAGE', function (data) {

  if (data.LANGUAGE == undefined) {
    chrome.storage.local.set({ LANGUAGE: "EN" });
    Lang_Editor = "EN";
  }
  else {
    Lang_Editor = data.LANGUAGE;
    chrome.storage.local.set({ LANGUAGE: data.LANGUAGE });
  }

});

let translations = {};

function loadTranslationsSync() {
  const url = chrome.runtime.getURL('Localization.json');

  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, false);
  xhr.send();

  if (xhr.status === 200) {
    translations = JSON.parse(xhr.responseText);
  } else {
    console.error('Failed to load translations');
  }
}

function getTranslation(textId, ...params) {
  if (Object.keys(translations).length === 0) {
    console.error('Translations not loaded');
    return `Error: "${textId}" missing!`;
  }

  let str = translations[Lang_Editor]?.[textId];
  if (!str && Lang_Editor !== "EN") {
    str = translations["EN"]?.[textId];
    console.warn(`Translation for "${textId}" missing in "${Lang_Editor}"`);
  }
  if (!str) {
    console.warn(`Translation for "${textId}" missing in "${Lang_Editor}" and "EN"`);
    return `Error: "${textId}" missing!`;
  }

  str = str.replace(/\$(\d+)|%(\d+)|%s/g, (match, p1, p2, offset, string) => {
    if (match === '%s') {
      return params.shift() ?? match;
    }
    const idx = parseInt(p1 || p2, 10) - 1;
    return params[idx] !== undefined ? params[idx] : match;
  });

  return str;
}

loadTranslationsSync();