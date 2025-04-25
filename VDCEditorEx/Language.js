//========== Valve Developer Community Editor Extended ===========
//
// Original author: Max34
// Extended version author: N0one
//
//================================================================

var Lang_Editor = "EN";

// Set the language first, then the value
chrome.storage.sync.get('LANGUAGE', function(data) {

	chrome.storage.sync.set({ LANGUAGE: data.LANGUAGE});
	Lang_Editor = data.LANGUAGE;
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

function getTranslation(textId) {
  if (Object.keys(translations).length === 0) {
    console.error('Translations not loaded');
    return `Error: "${textId}" missing!`;
  }

  return translations[Lang_Editor] ? translations[Lang_Editor][textId] : `Error: "${textId}" missing!`;
}

loadTranslationsSync();