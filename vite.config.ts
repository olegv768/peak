import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base "./" — сайт работает и в корне домена, и по адресу github.io/peak/
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
