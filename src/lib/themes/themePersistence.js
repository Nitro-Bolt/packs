const STORAGE_KEY = "theme";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const hasPersistedTheme = () => {
  if (typeof window === "undefined") return false;

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "light" || stored === "dark";
  } catch {
    return false;
  }
};

const detectTheme = () => {
  if (typeof window === "undefined") return "light";

  const htmlTheme = document.documentElement.getAttribute("theme");
  if (htmlTheme === "light" || htmlTheme === "dark") {
    return htmlTheme;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // Ignore
  }

  return getSystemTheme();
};

const persistTheme = (theme) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore
  }
};

const onSystemPreferenceChange = (onChange) => {
  if (typeof window === "undefined") return () => {};

  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const listener = (event) => onChange(event.matches ? "dark" : "light");

  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
};

export {
  detectTheme,
  getSystemTheme,
  hasPersistedTheme,
  onSystemPreferenceChange,
  persistTheme,
};
