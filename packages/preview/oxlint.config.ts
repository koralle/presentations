import { createOxlintConfig } from "@koralle/forge/oxlint";
import playwright from "ultracite/oxlint/playwright";
import react from "ultracite/oxlint/react";

// React のコンポーネントと Playwright の e2e を持つパッケージなので、
// その 2 つのプリセットだけを forge の共通設定に足す。
// 注意: ネスト設定は親とマージされないため、全パッケージに効かせたい設定は forge 側に置くこと。
export default createOxlintConfig({ extends: [react, playwright] });
