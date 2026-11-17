import { deckPreviewConfig } from "@koralle/preview/vite";

// root はこのパッケージの preview/ に固定される（cwd に依存しない）。
export default deckPreviewConfig(import.meta.dirname);
