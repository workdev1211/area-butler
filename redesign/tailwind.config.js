module.exports = {
    mode: 'jit',
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        zIndex: {
            '0': 0,
            '10': 10,
            '20': 20,
            '30': 30,
            '40': 40,
            '50': 50,
            '25': 25,
            '50': 50,
            '75': 75,
            '2000': 2000,
            'auto': 'auto',
        },
        extend: {
            screens: {
                'print': {'raw': 'print'},
                }
        },
        fontFamily: {
            'serif': ['archia']
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
