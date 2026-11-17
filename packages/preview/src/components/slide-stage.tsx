import { SLIDE_SIZE } from "@koralle/deck";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useCallback, useRef, useState, ViewTransition } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Button } from "react-aria-components";

import { css, cx } from "../../styled-system/css";

/**
 * スライドの切り替え（{@link ViewTransition}）のクラス名。CSS 側は viewer.css。
 * 進む/戻るで流れる向きを変え、それ以外（一覧への切り替えなど）は動かさない。
 */
const enterClass = {
  back: "slide-from-start",
  default: "none",
  forward: "slide-from-end",
};

const exitClass = {
  back: "slide-to-end",
  default: "none",
  forward: "slide-to-start",
};

/**
 * スライドの寸法と倍率を CSS 変数で渡す。寸法を JS の {@link SLIDE_SIZE} と
 * 一箇所にしておき、スタイルに 1280x720 を書き写さない。
 */
type StageStyle = CSSProperties & Record<`--${string}`, number | string>;

const stageVars = (scale: number): StageStyle => ({
  "--preview-scale": scale,
  "--slide-width": `${SLIDE_SIZE.width}px`,
  "--slide-height": `${SLIDE_SIZE.height}px`,
});

/**
 * 左右に重ねるボタンを出してよい最小の倍率。スライドの内側の余白（等倍で 80px）が
 * ボタンの幅（40px）より狭くなると、ボタンが本文の上に乗ってしまう。`Slide` の
 * `padding` はデッキごとに変えられるので、既定の 80px を基準にした目安。
 *
 * 出さなくても機能は落ちない（ツールバーに同じボタンがある）。
 */
const MIN_SCALE_FOR_SIDE_BUTTONS = 0.5;

const styles = {
  viewport: css({
    display: "grid",
    minHeight: 0,
    overflow: "hidden",
    padding: "16px",
    placeItems: "center",
    // 左右に重ねる前後ボタンの基準。
    position: "relative",
  }),
  /**
   * カルーセル風にスライドの左右へ重ねる前後ボタン。スライド（白）の上に載るので、
   * ツールバーのボタンとは色を別に持つ。
   */
  side: css({
    alignItems: "center",
    backgroundColor: "surface",
    borderColor: "border",
    borderRadius: "999px",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "fg",
    cursor: "pointer",
    // 中央揃えは flex で取る（テキストのまま `placeItems` を使うと、匿名の
    // グリッド項目が伸びて左寄せになる）。
    display: "flex",
    height: { base: "40px", _pointerCoarse: "44px" },
    justifyContent: "center",
    padding: 0,
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    width: { base: "40px", _pointerCoarse: "44px" },
    // 無効なボタンは hover しない（ツールバーのボタンと同じ）。
    "&:hover:not(:disabled)": { backgroundColor: "hover" },
    "&:disabled": { cursor: "default", opacity: 0.35 },
    "&:focus-visible": {
      outlineColor: "accent",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  }),
  // スライドの内側に載せる（枠の余白 16px + 8px）。スライドの既定の padding は
  // 80px なので、中身には被らない。
  sideStart: css({ insetInlineStart: "24px" }),
  sideEnd: css({ insetInlineEnd: "24px" }),
  frame: css({
    height: "calc(var(--slide-height) * var(--preview-scale))",
    width: "calc(var(--slide-width) * var(--preview-scale))",
    position: "relative",
  }),
  thumb: css({
    boxShadow: "0 1px 3px rgb(0 0 0 / 45%)",
  }),
  stage: css({
    height: "var(--slide-height)",
    insetBlockStart: 0,
    insetInlineStart: 0,
    width: "var(--slide-width)",
    overflow: "hidden",
    //
    // kiso.css の和文向けの折り返し設定はスライドには持ち込まない。PDF 側
    // (takumi-pdf) はこれらを見ないので、プレビューだけ改行位置が変わってしまう。
    overflowWrap: "normal",
    lineBreak: "auto",
    textSpacingTrim: "normal",
    transform: "scale(var(--preview-scale))",
    transformOrigin: "0 0",
    // 縮小時の文字をなめらかにする（等倍に戻すと PDF と同じ見え方になる）。
    fontSmoothing: "antialiased",
    // `Slide` は PDF の改ページに `height: 100vh` をインラインで持つ。ブラウザでは
    // ビューポートの高さになり 720px の枠からはみ出すので、枠いっぱいに固定する
    // （`packages/deck` 側は PDF の都合を優先して変えない）。
    "& > section": {
      height: "100% !",
      breakAfter: "auto",
    },
  }),
};

export interface StageFrameProps {
  children: ReactNode;
  /** 1280x720 に掛ける倍率。等倍で組んでから縮小する。 */
  scale: number;
  /** 一覧のサムネイル。 */
  thumb?: boolean;
  /**
   * スライドの位置（`2 / 5`）。読み上げが文脈を持てるように `group` で包む。
   * 一覧のサムネイルは外側で `inert` にしているので渡さない。
   */
  label?: string;
}

/**
 * スライドを等倍で組んで `transform: scale()` で縮小する枠。
 *
 * 文字サイズを画面幅に合わせて伸縮させると PDF と行長が変わり、改行位置がずれて
 * 「プレビューでは収まっているのに PDF でははみ出す」になるため、倍率だけを掛ける。
 */
export const StageFrame = ({
  children,
  scale,
  thumb = false,
  label,
}: StageFrameProps) => (
  <div
    className={thumb ? cx(styles.frame, styles.thumb) : styles.frame}
    style={stageVars(scale)}
  >
    <div
      aria-label={label}
      aria-roledescription={label === undefined ? undefined : "スライド"}
      className={styles.stage}
      role={label === undefined ? undefined : "group"}
    >
      {children}
    </div>
  </div>
);

export interface SlideStageProps {
  /** 表示するスライド。切り替えの View Transition のキーにも使う。 */
  index: number;
  /** 読み上げに「何枚目 / 全部で何枚」を伝えるため。 */
  total: number;
  slide: ReactNode;
  /** 左右に重ねるボタンで前後へ送る。 */
  step: (delta: number) => void;
}

/** 1 枚だけを枠いっぱいに出し、前後に切り替えたときは向きつきで流す。 */
export const SlideStage = ({ index, total, slide, step }: SlideStageProps) => {
  const [scale, setScale] = useState(0);
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  /**
   * 押した結果そのボタンが無効になると、ブラウザはフォーカスを `body` に落とす
   * （ツールバーのボタンと同じ扱い）。反対側へ渡す。
   */
  const stepAndKeepFocus = (delta: number) => {
    step(delta);
    const becomesDisabled = delta > 0 ? index >= total - 2 : index <= 1;

    if (becomesDisabled) {
      (delta > 0 ? prevRef : nextRef).current?.focus();
    }
  };

  /**
   * 枠が入る倍率を測る。ref コールバックにしているのは、一覧に切り替えると
   * `viewport` が作り直されるため。effect で 1 度だけ observe すると、外れた
   * 古い要素を測り続けて倍率が 0 のままになる。
   */
  const observeViewport = useCallback((node: HTMLElement | null) => {
    const observer = new ResizeObserver((entries) => {
      const [entry] = entries;

      if (entry === undefined) {
        return;
      }

      const { width, height } = entry.contentRect;
      setScale(Math.min(width / SLIDE_SIZE.width, height / SLIDE_SIZE.height));
    });

    if (node !== null) {
      observer.observe(node);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className={styles.viewport} ref={observeViewport}>
      <ViewTransition
        default="none"
        enter={enterClass}
        exit={exitClass}
        key={index}
      >
        <StageFrame label={`${index + 1} / ${total}`} scale={scale}>
          {slide}
        </StageFrame>
      </ViewTransition>
      {/* カルーセル風の前後ボタン。マウス用の重ね物で、キーボードと読み上げは
          ツールバーのボタンが担う（名前を変えて 2 組が区別できるようにしてある）。
          スライドが小さいときは内側の余白に収まらず本文に被るので出さない。
          機能は落ちない（ツールバーに同じものがある）。 */}
      {scale < MIN_SCALE_FOR_SIDE_BUTTONS ? null : (
        <>
          <Button
            aria-label="前へ"
            className={cx(styles.side, styles.sideStart)}
            isDisabled={index <= 0}
            onPress={() => {
              stepAndKeepFocus(-1);
            }}
            ref={prevRef}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </Button>
          <Button
            aria-label="次へ"
            className={cx(styles.side, styles.sideEnd)}
            isDisabled={index >= total - 1}
            onPress={() => {
              stepAndKeepFocus(1);
            }}
            ref={nextRef}
          >
            <ArrowRight aria-hidden="true" size={20} />
          </Button>
        </>
      )}
    </div>
  );
};
