import { oxfmtConfig } from "@koralle/forge/oxfmt";
import { defineConfig } from "oxfmt";

// 共通設定は @koralle/forge/oxfmt が持つ。ここにはルート固有の差分だけを置く。
export default defineConfig({
  ...oxfmtConfig,
  ignorePatterns: [
    ...(oxfmtConfig.ignorePatterns ?? []),
    // apm が生成するロックファイル（手で整形しない）
    "apm.lock.yaml",
  ],
});
