module.exports = {
    mode: 'jit',
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            screens: {
                'print': {'raw': 'print'},
                }
        },
    },
    variants: {
        extend: {},
    },
    daisyui: {
        themes: [
            {
                'mytheme': {
                    'primary': '#cc1e46',
                    'primary-focus': '#aa2257',
                    'primary-content': '#ffffff',
                    'secondary': '#3c3641',
                    'secondary-focus': '#6b696d',
                    'secondary-content': '#ffffff',
                    'accent': '#37cdbe',
                    'accent-focus': '#2aa79b',
                    'accent-content': '#ffffff',
                    'neutral': '#3d4451',
                    'neutral-focus': '#2a2e37',
                    'neutral-content': '#ffffff',
                    'base-100': '#ffffff',
                    'base-200': '#f9fafb',
                    'base-300': '#d1d5db',
                    'base-content': '#1f2937',
                    'info': '#2094f3',
                    'success': '#009485',
                    'warning': '#ff9900',
                    'error': '#ff5724',
                },
            },
        ],
    },
    plugins: [
        require('daisyui'),
    ],
}
