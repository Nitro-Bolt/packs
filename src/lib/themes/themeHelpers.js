const applyTheme = (theme) => {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("theme", theme);
};

export { applyTheme };
