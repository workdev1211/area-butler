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
            'light'
        ]
    },
    plugins: [
        require('daisyui'),
    ],
}
