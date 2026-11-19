import type { KnipConfig } from "knip";

const config: KnipConfig = {
  tags: ["-lintignore"],
  // APM が配置するスキルとその取得キャッシュはこのリポジトリのソースではない。
  // `.pi/git` は pi が取得したパッケージの実体で、これも同じくソースではない。
  ignore: ["**/.agents/**", "**/apm_modules/**", "**/.pi/**"],
  // knip の TypeScript プラグインは `typescript` 依存を見つけると有効になるが、
  // このリポジトリは型チェックに tsrs を使うため無効のままになる。tsconfig の
  // extends / include を未使用依存として誤検出しないよう、ここで明示的に有効化する。
  typescript: true,
  workspaces: {
    // kiso.css は viewer.css の @import からしか参照しない。CSS の import は
    // knip の依存解決に乗らないので、未使用依存として挙がるのを避ける。
    "packages/preview": { ignoreDependencies: ["kiso.css"] },
    // `"pdf": "deck-pdf src/pdf.tsx"` のエントリは knip が追えない（deck-pdf は
    // 未知の bin）。PDF の入口として明示する。
    "slides/react-tokyo-2026-11-20": { entry: ["src/pdf.tsx"] },
  },
  rules: {
    exports: "warn",
    types: "warn",
    nsExports: "warn",
    nsTypes: "warn",
    enumMembers: "warn",
    namespaceMembers: "warn",
    duplicates: "warn",
    catalog: "warn",
  },
};

export default config;
