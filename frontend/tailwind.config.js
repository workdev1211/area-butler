module.exports = {
    mode: 'jit',
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        zIndex: {
            '0': 0,
            '10': 10,
            '20': 20,
            '25': 25,
            '30': 30,
            '40': 40,
            '50': 50,
            '75': 75,
            '900': 900,
            '1000': 1000,
            '2000': 2000,
            '2500': 2500,
            '9999': 9999,
            'auto': 'auto',
        },
        fontSize: {
            'xs': '8px',
            'sm': '10px',
            'tiny': '12px',
            'base': '1rem',
            'lg': '16px',
            'xl': '18px',
            '2xl': '20px',
            '3xl': '24px',
            '4xl': '32px',
            '5xl': '42px',
        },
        screens: {
            'sm': '640px',
            // => @media (min-width: 640px) { ... }

            'md': '768px',
            // => @media (min-width: 768px) { ... }

            'lg': '1080px',
            // => @media (min-width: 1024px) { ... }

            'xl': '1280px',
            // => @media (min-width: 1280px) { ... }

            '2xl': '1536px',
            // => @media (min-width: 1536px) { ... }
        },
        extend: {
            screens: {
                'print': {'raw': 'print'},
                },
            spacing: {
                '82': '20.5rem',
                '84': '21rem',
            },
        },
        fontFamily: {
            'serif': ['archia'],
            'mono': [ 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
        },
    },
    variants: {
        extend: {},
    },
    daisyui: {
        themes: [
            {
                'mytheme': {
                    'primary': '#c91444',
                    'primary-focus': '#d2325a',
                    'primary-content': '#ffffff',
                    'secondary': '#640d24',
                    'secondary-focus': '#a81a3e',
                    'secondary-content': '#ffffff',
                    'accent': '#8f72eb',
                    'accent-focus': '#9f8ce3',
                    'accent-content': '#ffffff',
                    'neutral': '#bec7ca',
                    'neutral-focus': '#e1e4e5',
                    'neutral-content': '#0e0e0e',
                    'base-100': '#ffffff',
                    'base-200': '#f9fafb',
                    'base-300': '#d1d5db',
                    'base-content': '#1f2937',
                    'info': '#2094f3',
                    'success': '#009485',
                    'warning': '#e4bc40',
                    'error': '#cb513b',
                },
            },
        ],
    },
    plugins: [
        require('daisyui'),
    ],
}
