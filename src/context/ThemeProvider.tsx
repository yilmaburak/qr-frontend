import React, { createContext, ReactNode, useEffect } from 'react'

const ThemeContext = createContext({})

const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = React.useState('system');

    // On initial load, set the theme based from localStorage or system preference
    // if theme is dark, add the dark class to the html element
    // else remove the dark class from the html element
    useEffect(() => {
        const localTheme = localStorage.getItem('theme');
        if (localTheme) {
            setTheme(localTheme);
        }else {
            const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setTheme(systemPrefersDark ? 'dark' : 'light');
        }
    }, []);

    // Whenever theme changes, update localStorage and the html element class
    // if theme is dark, add the dark class to the html element
    // else remove the dark class from the html element
    useEffect(() => {
        if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme]);


    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeProvider