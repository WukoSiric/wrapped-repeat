import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const isGithubPages = process.env.GITHUB_ACTIONS === "true";

// https://vite.dev/config/
export default defineConfig({
  base: isGithubPages ? "/wrapped-repeat/" : "/",
  plugins: [tailwindcss(), react()],
});
