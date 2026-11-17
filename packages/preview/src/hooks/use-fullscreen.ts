import { useCallback, useEffect, useState } from "react";

/**
 * 全画面の状態と切り替え。Esc や OS の操作でも終わるので、`fullscreenchange` を
 * 購読して状態は API 側から取る（自前で持たない）。
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    const request =
      document.fullscreenElement === null
        ? document.documentElement.requestFullscreen()
        : document.exitFullscreen();

    request.catch(() => {
      // 断られた場合は fullscreenchange が来ないだけで、表示は今のまま。
    });
  }, []);

  useEffect(() => {
    const onChange = () => {
      setIsFullscreen(document.fullscreenElement !== null);
    };

    document.addEventListener("fullscreenchange", onChange);

    return () => {
      document.removeEventListener("fullscreenchange", onChange);
    };
  }, []);

  return { isFullscreen, toggleFullscreen };
};
