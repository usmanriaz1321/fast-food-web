import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';

const ThemeToggle = () => {
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Check saved theme on mount
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
            setIsDark(true);
        } else {
            // Default to light mode
            document.documentElement.removeAttribute('data-theme');
            setIsDark(false);
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    return (
        <Button 
            variant={isDark ? 'warning' : 'dark'} 
            onClick={toggleTheme}
            className="rounded-pill px-3 py-2 d-flex align-items-center gap-2 theme-toggle-btn"
            style={{
                transition: 'all 0.3s ease',
                border: 'none',
                fontWeight: '600',
                minWidth: '85px',
                justifyContent: 'center',
                fontSize: '14px'
            }}
        >
            {isDark ? (
                <>
                    <span style={{ fontSize: '16px' }}>☀️</span>
                    <span>Light</span>
                </>
            ) : (
                <>
                    <span style={{ fontSize: '16px' }}>🌙</span>
                    <span>Dark</span>
                </>
            )}
        </Button>
    );
};

export default ThemeToggle;