module.exports = {
    root: true,
    env: {
        node: true,
    },
    extends: [
        "plugin:vue/essential",
        "plugin:prettier/recommended",
        "prettier/vue",
    ],
    parserOptions: {
        parser: "babel-eslint",
    },
    rules: {
        // allow debugger during development
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
        "vue/no-use-v-if-with-v-for": [
            "error",
            {
                allowUsingIterationVar: true,
            },
        ],
    },
};
