import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({
  base:
    process.env.GITHUB_PAGES === "true"
      ? "/colloquium-calculus-2module-hseami/"
      : "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("katex")) return "math";
          if (id.includes("node_modules")) return "vendor";
          if (id.includes("/src/content/official-definitions"))
            return "definitions";
          if (id.includes("/src/content/")) return "content";
        },
      },
    },
  },
});
