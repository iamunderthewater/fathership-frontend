import { createThemes } from 'tw-colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {

        fontSize: {
            'sm': '12px',
            'base': '14px',
            'xl': '16px',
            '2xl': '20px',
            '3xl': '28px',
            '4xl': '38px',
            '5xl': '50px',
        },

        extend: {
            fontFamily: {
              inter: ["'Inter'", "sans-serif"],
              gelasio: ["'Gelasio'", "serif"]
            }, 
            zIndex: {
                '60': '60'
            }
        },

    },
    plugins: [
        createThemes({
            light: {
                'white': '#FFFFFF',
                'black': '#242424',
                'grey': '#F3F3F3',
                'dark-grey': '#6B6B6B',
                'red': '#FF4E4E',
                'transparent': 'transparent',
                'twitter': '#1DA1F2',
                'purple': '#8B46FF',
                'disabled': '#7a7a7a',
                'yellow': '#ffed68'
            },
            dark: {
                'white': '#242424',
                'black': '#F3F3F3',
                'grey': '#444444',
                'dark-grey': '#E7E7E7',
                'red': '#f45656',
                'transparent': 'transparent',
                'twitter': '#0E71A8',
                'purple': '#a569f0',
                'disabled': '#2f2f2f',
                'yellow': '#f0d42f'
            }
        })
    ],
};