import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderDeck } from "@koralle/deck/pdf";

import { deck } from "./index";
import { slides } from "./slides";

const out = "dist/react-tokyo-2026-11-20.pdf";

// takumi は画像を fetch しないので、`/mwg-hero.png` と `/koralle.png` のバイト列を渡す。
// `src` はスライド側の img と同じ（Vite の root は preview/）。
const pdf = await renderDeck({
  deck,
  slides,
  images: [
    {
      src: "/mwg-hero.png",
      data: async () => await readFile("preview/mwg-hero.png"),
    },
    {
      src: "/koralle.png",
      data: async () => await readFile("preview/koralle.png"),
    },
  ],
});

await mkdir(path.dirname(out), { recursive: true });

await writeFile(out, pdf);

console.log(`wrote ${out} (${slides.length} slides)`);
