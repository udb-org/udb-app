import type { i18n } from "i18next";

const languageLocalStorageKey = "lang";

export function setAppLanguage(lang: string, t: i18n) {
  localStorage.setItem(languageLocalStorageKey, lang);
  t.changeLanguage(lang);
  document.documentElement.lang = lang;
}

export function updateAppLanguage(t: i18n) {
  const localLang = localStorage.getItem(languageLocalStorageKey);
  if (!localLang) {
    return;
  }

  t.changeLanguage(localLang);
  document.documentElement.lang = localLang;
}