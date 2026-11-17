import { useEffect, useEffectEvent, useRef } from "react";

import type { Mode } from "./use-slide-navigation";

/** `gg` の 2 文字目を待つ時間。vim の timeoutlen と同じ。 */
const GG_TIMEOUT_MS = 1000;

/**
 * キー → 進む枚数。Vim 風の hjkl でも動く。一覧では矢印キーと Home/End を
 * `GridList`（React Aria）が持つので、ここはスライド表示だけで使う。
 */
const STEP_BY_KEY = new Map([
  [" ", 1],
  ["ArrowLeft", -1],
  ["ArrowRight", 1],
  ["H", -1],
  ["L", 1],
  ["h", -1],
  ["l", 1],
  ["ArrowDown", 1],
  ["ArrowUp", -1],
  ["J", 1],
  ["K", -1],
  ["PageDown", 1],
  ["PageUp", -1],
  ["j", 1],
  ["k", -1],
]);

/**
 * その要素が持っていくキーか。入力欄と選択肢（select・checkbox・radio など、
 * `:read-write` に一致しないフォーム部品も含む）はすべてのキーを、ボタンと
 * リンクは Space/Enter を自分のものにする。ボタンにフォーカスが残っていても
 * `O` や `j` は効かせる。
 */
const isControlKey = (event: KeyboardEvent): boolean => {
  const { target } = event;

  if (!(target instanceof Element)) {
    return false;
  }

  if (target.closest(":read-write, input, select, textarea") !== null) {
    return true;
  }

  return (
    target.closest("button, a[href]") !== null &&
    (event.key === " " || event.key === "Enter")
  );
};

/** 一覧で `GridList` が持つキー。矢印と同じくフォーカスだけを動かし、選択は動かさない。 */
const isGridKey = (inGrid: boolean, key: string): boolean =>
  inGrid && (key === "Home" || key === "End");

/** 一覧でフォーカス中の項目のキー。Enter でそのスライドを開くために使う。 */
const focusedItemKey = (): number | undefined => {
  const active = document.activeElement;
  const key = active instanceof HTMLElement ? active.dataset["key"] : undefined;

  return key === undefined ? undefined : Number(key);
};

export interface KeyboardShortcutsOptions {
  total: number;
  /** 一覧を開いているか。一覧の矢印キーは GridList が持つので、ここでは扱わない。 */
  inGrid: boolean;
  go: (next: number, nextMode?: Mode) => void;
  step: (delta: number) => void;
  toggleMode: () => void;
  toggleFullscreen: () => void;
}

/**
 * スライド送りと切り替えのキーボード操作を window に張る。
 *
 * `useEffectEvent` で中身を持つので、リスナーの張り直しはマウント時の 1 回だけ。
 * `defaultPrevented` は GridList などが既に扱ったキーで、重ねて動かさない。
 */
export const useKeyboardShortcuts = ({
  total,
  inGrid,
  go,
  step,
  toggleMode,
  toggleFullscreen,
}: KeyboardShortcutsOptions) => {
  /**
   * `gg` の 1 文字目を押した時刻（0 なら押していない）。タイマーではなく時刻を
   * 持つので、後片付けの effect が要らない。2 文字目が来たときに GG_TIMEOUT_MS 以内
   * かで判定する。
   */
  const pendingGAt = useRef(0);

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.defaultPrevented ||
      isControlKey(event)
    ) {
      return;
    }

    const { key } = event;

    // `gg` で先頭へ。Shift+g (`G`) は別のキーなのでここには来ない。
    if (key === "g") {
      const now = Date.now();

      if (now - pendingGAt.current < GG_TIMEOUT_MS) {
        go(0);
        pendingGAt.current = 0;
      } else {
        pendingGAt.current = now;
      }

      event.preventDefault();

      return;
    }

    pendingGAt.current = 0;

    // 一覧ではここで降りる（矢印と同じ扱いにする）。
    if (isGridKey(inGrid, key)) {
      return;
    }

    const move = inGrid ? undefined : STEP_BY_KEY.get(key);

    if (move === undefined) {
      switch (key) {
        case "Home": {
          go(0);
          break;
        }

        case "End":
        case "G": {
          go(total - 1);
          break;
        }

        case "Enter": {
          // GridList は Enter を onAction に回さないので、フォーカス中の項目を開く。
          const focused = focusedItemKey();

          if (focused !== undefined) {
            go(focused, "slide");
          }

          break;
        }

        case "o":
        case "O": {
          toggleMode();
          break;
        }

        case "f":
        case "F": {
          toggleFullscreen();
          break;
        }

        default: {
          return;
        }
      }
    } else {
      step(move);
    }

    event.preventDefault();
  });

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      onKeyDown(event);
    };

    window.addEventListener("keydown", listener);

    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);
};
