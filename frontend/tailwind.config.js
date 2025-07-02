/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                mauritania: {
                    green: "#28a745",
                    yellow: "#ffc107",
                    red: "#dc3545",
                    primary: "#2563eb",
                    secondary: "#64748b",
                },
            },
            backgroundImage: {
                "mauritania-flag":
                    "linear-gradient(to bottom, #28a745 33%, #ffc107 33%, #ffc107 66%, #dc3545 66%)",
            },
        },
    },
    plugins: [],
};
