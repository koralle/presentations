import { DeckViewer } from "@koralle/preview";
import { createRoot } from "react-dom/client";

import { deck } from "../src/index";
import { slides } from "../src/slides";

const container = document.querySelector("#root");

if (container === null) {
  throw new Error("preview/index.html に #root が無い");
}

createRoot(container).render(<DeckViewer deck={deck} slides={slides} />);
