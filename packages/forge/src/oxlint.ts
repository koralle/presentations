import { defineConfig } from "oxlint";
import type { OxlintConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import playwright from "ultracite/oxlint/playwright";

/**
 * Oxlint は `extends` した設定の `ignorePatterns` を継承しない。
 * そのため `createOxlintConfig` がこの配列を必ず設定に含める。
 *
 * パターンは設定ファイルの位置に依存しない glob で定義する。
 */
const ignorePatterns = [
  ...(core.ignorePatterns ?? []),
  // APM が配置するスキルとその取得キャッシュ
  "**/.agents/**",
  "**/apm_modules/**",
];

const oxlintConfig = defineConfig({
  extends: [core, playwright, antiSlop],
});

type CreateOxlintConfigOptions = Omit<
  OxlintConfig,
  "extends" | "ignorePatterns"
> & {
  /** パッケージ固有で追加したい ignore。共通の ignore の後ろに連結される。 */
  ignorePatterns?: string[];
};

/**
 * パッケージごとの設定を作る。`extends` と共通 `ignorePatterns` を必ず含むため、
 * 呼び出し側は差分だけを渡せばよい（`ignorePatterns` の再宣言漏れを防ぐ）。
 */
export const createOxlintConfig = ({
  ignorePatterns: additionalIgnorePatterns = [],
  ...rest
}: CreateOxlintConfigOptions = {}) =>
  defineConfig({
    extends: [oxlintConfig],
    ignorePatterns: [...ignorePatterns, ...additionalIgnorePatterns],
    ...rest,
  });
