import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";
import { Button, ToggleButton } from "react-aria-components";

import { css, cx } from "../../styled-system/css";
import type { Mode } from "../hooks/use-slide-navigation";

const styles = {
  bar: css({
    alignItems: "center",
    backgroundColor: "surface",
    borderBlockEndColor: "border",
    borderBlockEndStyle: "solid",
    borderBlockEndWidth: "1px",
    display: "flex",
    flexWrap: "wrap",
    gap: "8px 16px",
    padding: "8px 16px",
  }),
  title: css({
    fontWeight: 600,
    margin: 0,
    overflowWrap: "anywhere",
  }),
  group: css({
    alignItems: "center",
    display: "flex",
    gap: "8px",
  }),
  groupEnd: css({
    marginInlineStart: "auto",
  }),
  button: css({
    alignItems: "center",
    backgroundColor: "transparent",
    borderColor: "border",
    borderRadius: "8px",
    borderStyle: "solid",
    borderWidth: "1px",
    color: "inherit",
    cursor: "pointer",
    display: "inline-flex",
    // スライドの中身は px で組むので、外枠の文字は body から引き継ぐ。
    fontFamily: "inherit",
    fontSize: "inherit",
    fontWeight: "inherit",
    justifyContent: "center",
    lineHeight: "inherit",
    // 24px を下回らない（WCAG 2.5.8）。タッチでは 44px にする（2.5.5）。
    minHeight: { base: "32px", _pointerCoarse: "44px" },
    minWidth: { base: "32px", _pointerCoarse: "44px" },
    paddingInline: "10px",
    // 無効なボタンは hover しない（RAC も無効時は hover を出さない）。
    "&:hover:not(:disabled)": { backgroundColor: "hover" },
    "&:disabled": { cursor: "default", opacity: 0.4 },
    "&:focus-visible": {
      outlineColor: "accent",
      outlineOffset: "2px",
      outlineStyle: "solid",
      outlineWidth: "2px",
    },
  }),
  pressed: css({
    borderColor: "accent",
    color: "accent",
  }),
  hint: css({
    color: "muted",
    fontSize: "0.875em",
    marginInlineStart: "6px",
  }),
  counter: css({
    fontVariantNumeric: "tabular-nums",
    margin: 0,
    minWidth: "5ch",
    textAlign: "center",
  }),
  /**
   * 読み上げだけに使う文字。live region（カウンタ）に前置きする語など。
   * ここに入れるものはフォーカスを受けないので、`:focus-within` の例外は要らない。
   */
  visuallyHidden: css({
    height: "1px",
    width: "1px",
    borderWidth: 0,
    clipPath: "inset(50%)",
    margin: "-1px",
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
  }),
};

/** ボタン共通の見た目（枠・当たり判定・フォーカスリング）。 */
const buttonStyles = (isPressed = false): string =>
  isPressed ? cx(styles.button, styles.pressed) : styles.button;

export interface ViewerToolbarProps {
  /** デッキのタイトル。空なら「無題のデッキ」。 */
  title?: string | undefined;
  index: number;
  total: number;
  mode: Mode;
  isFullscreen: boolean;
  step: (delta: number) => void;
  toggleMode: () => void;
  toggleFullscreen: () => void;
}

export const ViewerToolbar = ({
  title,
  index,
  total,
  mode,
  isFullscreen,
  step,
  toggleMode,
  toggleFullscreen,
}: ViewerToolbarProps) => {
  const label = title === undefined || title === "" ? "無題のデッキ" : title;
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);

  /**
   * 押した結果そのボタンが無効になると、ブラウザはフォーカスを `body` に落とす。
   * 次の Tab が先頭からやり直しになるので、無効になる一歩手前なら反対側へ渡す。
   */
  const stepAndKeepFocus = (delta: number) => {
    step(delta);
    const becomesDisabled = delta > 0 ? index >= total - 2 : index <= 1;

    if (becomesDisabled) {
      (delta > 0 ? prevRef : nextRef).current?.focus();
    }
  };

  return (
    <header className={styles.bar}>
      <p className={styles.title}>{label}</p>
      {total === 0 ? null : (
        <div className={styles.group}>
          <Button
            aria-label="前のスライド"
            className={buttonStyles()}
            isDisabled={index <= 0}
            onPress={() => {
              stepAndKeepFocus(-1);
            }}
            ref={prevRef}
          >
            <ArrowLeft aria-hidden="true" size={16} />
          </Button>
          <p aria-atomic="true" aria-live="polite" className={styles.counter}>
            <span className={styles.visuallyHidden}>{"スライド "}</span>
            {index + 1} / {total}
          </p>
          <Button
            aria-label="次のスライド"
            className={buttonStyles()}
            isDisabled={index >= total - 1}
            onPress={() => {
              stepAndKeepFocus(1);
            }}
            ref={nextRef}
          >
            <ArrowRight aria-hidden="true" size={16} />
          </Button>
        </div>
      )}
      <div className={cx(styles.group, styles.groupEnd)}>
        <ToggleButton
          className={buttonStyles(mode === "grid")}
          isSelected={mode === "grid"}
          onChange={toggleMode}
        >
          一覧
          <span aria-hidden="true" className={styles.hint}>
            O
          </span>
        </ToggleButton>
        <ToggleButton
          className={buttonStyles(isFullscreen)}
          isSelected={isFullscreen}
          onChange={toggleFullscreen}
        >
          全画面
          <span aria-hidden="true" className={styles.hint}>
            F
          </span>
        </ToggleButton>
      </div>
    </header>
  );
};
