import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { renderDeck } from "@koralle/deck/pdf";

import { deck } from "./index";
import { slides } from "./slides";

const out = "dist/react-tokyo-2026-11-20.pdf";

const pdf = await renderDeck({ deck, slides });

await mkdir(path.dirname(out), { recursive: true });

await writeFile(out, pdf);

console.log(`wrote ${out} (${slides.length} slides)`);
