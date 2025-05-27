function updateDocumentTheme(isDarkMode: boolean) {
    if (!isDarkMode) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }