import { createOxlintConfig } from "@koralle/forge/oxlint";

// deck は JSX を使わず `createElement` で要素を組む（tsx の cwd 解決のため）ので、
// react プリセットは入れない。今のところルートとの差分は無い。
// 注意: ネスト設定は親とマージされないため、全パッケージに効かせたい設定は forge 側に置くこと。
export default createOxlintConfig();
