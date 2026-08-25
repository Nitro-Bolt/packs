import { render } from "preact";
import { useEffect, useReducer } from "preact/hooks";
import SiteHeader from "../components/site-header/site-header";
import PackSection from "../components/pack-section/pack-section";
import packs from "../generated/packs.json";
import themeReducer, {
  setTheme,
  themeInitialState,
  toggleTheme,
} from "../reducers/theme";
import {
  hasPersistedTheme,
  onSystemPreferenceChange,
  persistTheme,
} from "../lib/themes/themePersistence";
import { applyTheme } from "../lib/themes/themeHelpers";
import "../css/main.css";

const Site = () => {
  const [themeState, dispatchTheme] = useReducer(
    themeReducer,
    themeInitialState
  );
  const { theme } = themeState;
  useEffect(() => applyTheme(theme), [theme]);
  useEffect(
    () =>
      onSystemPreferenceChange((systemTheme) => {
        if (!hasPersistedTheme()) dispatchTheme(setTheme(systemTheme));
      }),
    []
  );
  const toggleThemeValue = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    dispatchTheme(toggleTheme());
    persistTheme(nextTheme);
  };
  return (
    <main className="page">
      <SiteHeader />
      <p className="intro">
        Copy a creator's pack link and add it from the extension picker in
        NitroBolt.
      </p>
      {packs.length ? (
        packs.map((pack) => <PackSection key={pack.slug} {...pack} />)
      ) : (
        <div className="empty-state">No extension packs are available.</div>
      )}
      <button className="theme-toggle" onClick={toggleThemeValue} type="button">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </button>
    </main>
  );
};

render(<Site />, document.getElementById("root"));
