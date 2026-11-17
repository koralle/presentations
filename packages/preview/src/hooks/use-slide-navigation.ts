import {
  addTransitionType,
  startTransition,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { RefObject } from "react";

export type Mode = "slide" | "grid";

const clampIndex = (index: number, total: number): number =>
  Math.min(Math.max(index, 0), Math.max(total - 1, 0));

const readHashIndex = (total: number): number => {
  const parsed = Math.trunc(Number(window.location.hash.slice(1)));

  return Number.isNaN(parsed) ? 0 : clampIndex(parsed - 1, total);
};

/**
 * 表示中のスライド（index）と一覧かどうか（mode）を持つ。
 *
 * 切り替えは React の View Transition で、進む/戻るの型を `addTransitionType` で
 * 渡す（クラス名は viewer.css）。一覧のままインデックスが飛んだとき（`gg` / `G`）は
 * `GridListItem` にもフォーカスを合わせる。矢印キーは GridList 自身が動かすので
 * ここは通らず、フォーカスと選択がずれない。
 */
export const useSlideNavigation = (
  total: number,
  gridRef: RefObject<HTMLDivElement | null>
) => {
  const [index, setIndex] = useState(() => readHashIndex(total));
  const [mode, setMode] = useState<Mode>("slide");

  // 表示位置を URL に残す。HMR やリロードで先頭に戻らないようにするため。
  useEffect(() => {
    window.history.replaceState(null, "", `#${index + 1}`);
  }, [index]);

  const go = useCallback(
    (next: number, nextMode?: Mode) => {
      const target = clampIndex(next, total);

      if (target === index && nextMode === undefined) {
        return;
      }

      const direction = target > index ? "forward" : "back";
      startTransition(() => {
        // スライド表示中だけ型を付ける。一覧では動かす対象が無い。
        if (mode === "slide") {
          addTransitionType(direction);
        }

        setIndex(target);

        if (nextMode !== undefined) {
          setMode(nextMode);
        }
      });
      const item = gridRef.current?.children[target];

      if (nextMode === undefined && item instanceof HTMLElement) {
        item.focus();
      }
    },
    [gridRef, index, mode, total]
  );

  /**
   * 前後に動かす。キーリピートで連続して呼ばれるので、今の index ではなく
   * 更新関数で積む（閉じ込めた index を使うと 1 回分しか進まない）。
   */
  const step = useCallback(
    (delta: number) => {
      if (delta === 0) {
        return;
      }

      startTransition(() => {
        if (mode === "slide") {
          addTransitionType(delta > 0 ? "forward" : "back");
        }

        setIndex((current) => clampIndex(current + delta, total));
      });
    },
    [mode, total]
  );

  const toggleMode = useCallback(() => {
    setMode((current) => (current === "slide" ? "grid" : "slide"));
  }, []);

  return { go, index, mode, step, toggleMode };
};
