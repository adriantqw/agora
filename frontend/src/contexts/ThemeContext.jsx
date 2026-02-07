import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const getInitialTheme = () => {
  // Light theme is the only option - ignore saved preferences
  return 'light';
};

const applyThemeClass = (theme) => {
  // Remove both possible theme classes first
  document.documentElement.classList.remove('light-theme', 'dark-theme');
  // Add the current theme class
  document.documentElement.classList.add(`${theme}-theme`);
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const initialTheme = getInitialTheme();
    // Ensure theme class is applied synchronously (inline script should have already done this)
    applyThemeClass(initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    // Sync theme class with state changes
    applyThemeClass(theme);
  }, [theme]);

  const toggleTheme = () => {
    // Theme toggle is disabled - light theme only
    // This function is intentionally left as a no-op
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
