import { useState, useEffect } from "react";
import { FaSun, FaMoon } from "react-icons/fa";

const ThemeToggle = () => {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "light"
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors dark:border-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
      aria-label="Toggle theme"
    >
      {theme === "light" ? <FaMoon className="w-4 h-4" /> : <FaSun className="w-4 h-4" />}
    </button>
  );
};

export default ThemeToggle;
