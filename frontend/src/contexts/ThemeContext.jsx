import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem('agora-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
  } catch (e) {
    // localStorage might be blocked
  }

  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }

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
    setTheme((prevTheme) => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem('agora-theme', newTheme);
      } catch (e) {
        // localStorage might be blocked
      }
      return newTheme;
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
