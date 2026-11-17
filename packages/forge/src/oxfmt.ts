import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export const oxfmtConfig = defineConfig({
  ...ultracite,
  ignorePatterns: [
    ...(ultracite.ignorePatterns ?? []),
    // APM が配置するスキルとその取得キャッシュ
    "**/.agents/**",
    "**/apm_modules/**",
    // エージェントの実行時状態。リポジトリの整形対象ではない
    "**/.pi/**",
  ],
});
