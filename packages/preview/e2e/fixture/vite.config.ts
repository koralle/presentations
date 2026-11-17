import { deckPreviewConfig } from "@koralle/preview/vite";

// 本物のデッキと同じ入口を通す（`deckPreviewConfig` の配線もここで一緒に検証される）。
export default deckPreviewConfig(import.meta.dirname);
