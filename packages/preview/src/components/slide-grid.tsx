import { SLIDE_SIZE } from "@koralle/deck";
import { isValidElement, useCallback, useState } from "react";
import type { Key, ReactElement, ReactNode, RefObject } from "react";
import { GridList, GridListItem } from "react-aria-components";

import { css } from "../../styled-system/css";
import { StageFrame } from "./slide-stage";

const styles = {
  /**
   * 列数はブラウザに決めさせる。渡すのは「最低 320px は確保してね。余ったら
   * 336px まで広げていいよ。入り切らなくなったら折り返してね」だけ。狭い画面では
   * 100% が下限になるので 1 列に縮む。
   *
   * `auto-fill` ではなく `auto-fit`。`auto-fill` は使わない列の場所も取り続ける
   * ので、枚数が少ないときに余白が右へ偏る（3 枚を広い画面で見ると分かる）。
   * `auto-fit` は空の列を畳むので `justifyContent: center` が効く。
   */
  list: css({
    alignContent: "start",
    display: "grid",
    gap: "16px",
    gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 336px))",
    justifyContent: "center",
    margin: 0,
    outline: "none",
    overflow: "auto",
    padding: "16px",
    // フォーカスしたサムネイルを画面際に寄せない（GridList が自動でスクロールする）。
    scrollPadding: "16px",
  }),
  // 状態は React Aria が付ける data-* 属性で選ぶ（render props を持ち回さない）。
  item: css({
    backgroundColor: "surface",
    borderColor: "border",
    borderRadius: "12px",
    borderStyle: "solid",
    borderWidth: "1px",
    cursor: "pointer",
    display: "grid",
    outline: "none",
    padding: "8px",
    placeItems: "center",
    "&[data-hovered]": {
      backgroundColor: "hover",
    },
    // 表示中のスライド。色だけで「表示中」を示さない（WCAG 1.4.1）。枠の太さでも区別する。
    "&[data-selected]": {
      borderColor: "accent",
      boxShadow: "inset 0 0 0 2px var(--colors-accent)",
    },
    "&[data-focus-visible]": {
      outlineColor: "accent",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  }),
  // サムネイルの上に重ねない（スライドの中身を隠してしまう）。カードの地（surface）
  // の上に置くので、muted でも 7:1 ある。
  number: css({
    color: "muted",
    fontVariantNumeric: "tabular-nums",
    marginBlockStart: "6px",
  }),
};

/**
 * サムネイルの倍率を列幅から測る（{@link SlideGrid} の `observeThumb`）。列の幅は
 * ブラウザが決めるので（`auto-fit` の）、決まった結果を読んで倍率に戻す。
 * `transform: scale()` は無次元の数値しか取れず、`calc(100cqw / 1280)` は長さに
 * なってしまうため CSS だけでは作れない。
 */
const keyOf = (slide: ReactNode, index: number): Key => {
  const key = isValidElement(slide) ? slide.key : null;

  return key ?? index;
};

export interface SlideGridProps {
  slides: readonly ReactNode[];
  index: number;
  /** サムネイルを開く（クリック・Space・選択の解除）。 */
  onOpen: (index: number) => void;
  emptyState: ReactElement;
  /** 選択が飛んだときにフォーカスを合わせるため、navigation からも触る。 */
  gridRef: RefObject<HTMLDivElement | null>;
}

/**
 * 全ページを並べる一覧。
 *
 * 矢印キーの 2 次元移動、roving tabindex、選択（`aria-selected`）、フォーカスした
 * 項目のスクロールは `GridList` に任せる。ここは並べ方と見た目だけを持つ。
 */
export const SlideGrid = ({
  slides,
  index,
  onOpen,
  emptyState,
  gridRef,
}: SlideGridProps) => {
  const [thumbScale, setThumbScale] = useState(0);

  /**
   * 列は `minmax` の等分なので全部同じ幅。1 枚目のカードだけを観測して全員で使う。
   * カードの幅は列が決める（倍率に依存しない）ので、測って倍率に入れても振動しない。
   * `contentRect` は content box なので、padding と border を引いた値がそのまま
   * サムネイルに使える幅になる。
   */
  const observeThumb = useCallback((node: HTMLDivElement | null) => {
    const observer = new ResizeObserver(([entry]) => {
      if (entry === undefined) {
        return;
      }

      setThumbScale(entry.contentRect.width / SLIDE_SIZE.width);
    });

    if (node !== null) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <GridList
      aria-label="スライド一覧"
      autoFocus
      className={styles.list}
      layout="grid"
      onSelectionChange={(keys) => {
        // 選択したスライドを開く。表示中のものを押して選択が外れたときも閉じる。
        const [key] = keys === "all" ? [] : keys;
        onOpen(key === undefined ? index : Number(key));
      }}
      ref={gridRef}
      renderEmptyState={() => emptyState}
      selectedKeys={[index]}
      selectionMode="single"
    >
      {slides.map((slide, slideIndex) => (
        <GridListItem
          className={styles.item}
          id={slideIndex}
          key={keyOf(slide, slideIndex)}
          ref={slideIndex === 0 ? observeThumb : null}
          textValue={`${slideIndex + 1} 枚目`}
        >
          <div inert>
            <StageFrame scale={thumbScale} thumb>
              {slide}
            </StageFrame>
          </div>
          <span aria-hidden="true" className={styles.number}>
            {slideIndex + 1}
          </span>
        </GridListItem>
      ))}
    </GridList>
  );
};
