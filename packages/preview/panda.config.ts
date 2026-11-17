import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  presets: ["@pandacss/preset-base", "@pandacss/preset-panda"],
  // リセットは kiso.css（viewer.css で `layer(reset)` として読む）。二重に入れない。
  preflight: false,
  include: ["./src/**/*.{ts,tsx}"],
  outdir: "styled-system",
  theme: {
    tokens: {
      // プレビューの外枠（ツールバー・一覧）の色。スライドの中身は
      // `@koralle/deck` の `SLIDE_THEME`（白背景）のまま。
      colors: {
        accent: { value: "#8aa4ff" },
        border: { value: "#262d38" },
        // 地と文字。viewer.css の `body` も同じものを見る（`var(--colors-canvas)`）。
        canvas: { value: "#0c0f14" },
        fg: { value: "#e8ecf2" },
        hover: { value: "#1e2430" },
        muted: { value: "#9aa5b4" },
        surface: { value: "#151a22" },
      },
    },
  },
});
