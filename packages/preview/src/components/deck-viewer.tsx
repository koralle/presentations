import { useRef } from "react";
import type { ReactNode } from "react";

// PDF と同じ書体（`packages/deck/fonts`）をブラウザにも読ませる。
import "@koralle/deck/fonts.css";

import { css } from "../../styled-system/css";
import { useFullscreen } from "../hooks/use-fullscreen";
import { useKeyboardShortcuts } from "../hooks/use-keyboard-shortcuts";
import { useSlideNavigation } from "../hooks/use-slide-navigation";
import { SlideGrid } from "./slide-grid";
import { SlideStage } from "./slide-stage";
import { ViewerToolbar } from "./viewer-toolbar";

import "./viewer.css";

const styles = {
  // 100vh ではなく 100dvh。モバイルのアドレスバーでレイアウトが動かないようにする。
  root: css({
    height: "100dvh",
    display: "grid",
    gridTemplateRows: "auto 1fr",
    overflow: "hidden",
  }),
  // 一覧でも同じランドマーク（main）を使う。版面は中身の側が持つ。
  main: css({
    display: "grid",
    minHeight: 0,
  }),
  empty: css({
    color: "muted",
    margin: 0,
  }),
};

export interface DeckViewerProps {
  /** PDF と同じメタデータ。ツールバーにはタイトルだけ出す。 */
  deck?: { title?: string };
  /** `slides.tsx` が並べたスライド。1要素 = 1ページ。 */
  slides: readonly ReactNode[];
}

const emptyState = (
  <p className={styles.empty}>
    スライドが 1 枚も無い。slides.tsx に <code>Slide</code> を並べる。
  </p>
);

/** 1 枚ずつ表示するスライドショーと、全ページを並べる一覧。 */
export const DeckViewer = ({ deck, slides }: DeckViewerProps) => {
  const total = slides.length;
  const gridRef = useRef<HTMLDivElement | null>(null);

  const { index, mode, go, step, toggleMode } = useSlideNavigation(
    total,
    gridRef
  );

  const { isFullscreen, toggleFullscreen } = useFullscreen();

  useKeyboardShortcuts({
    go,
    inGrid: mode === "grid",
    step,
    toggleFullscreen,
    toggleMode,
    total,
  });

  const current = slides[index];

  let body: ReactNode;

  if (mode === "grid") {
    body = (
      <SlideGrid
        emptyState={emptyState}
        gridRef={gridRef}
        index={index}
        onOpen={(target) => {
          go(target, "slide");
        }}
        slides={slides}
      />
    );
  } else {
    body =
      current === undefined ? (
        emptyState
      ) : (
        <SlideStage index={index} slide={current} step={step} total={total} />
      );
  }

  return (
    <div className={styles.root}>
      <ViewerToolbar
        index={index}
        isFullscreen={isFullscreen}
        mode={mode}
        step={step}
        title={deck?.title}
        toggleFullscreen={toggleFullscreen}
        toggleMode={toggleMode}
        total={total}
      />
      {/* 一覧でも同じランドマークを通す。切り替えるたびに main が消えると、
          ランドマークで移動する読み上げが行き先を失う。 */}
      <main aria-label="スライド" className={styles.main}>
        {body}
      </main>
    </div>
  );
};
