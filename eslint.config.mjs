const globals = {
    __DEV__: "readonly",
    console: "readonly",
    clearInterval: "readonly",
    clearTimeout: "readonly",
    requestAnimationFrame: "readonly",
    require: "readonly",
    setInterval: "readonly",
    setTimeout: "readonly",
    module: "readonly",
};

export default [
    {
        ignores: ["node_modules/**", "assets/**", "src/assets/**"],
    },
    {
        files: ["**/*.{js,jsx}"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals,
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            "no-dupe-keys": "error",
            "no-undef": "error",
            "no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^(React$|_)",
                },
            ],
        },
    },
];
