import { createOxlintConfig } from "@koralle/forge/oxlint";

// deck は JSX を持つが、フックも配列の子要素も無いので react プリセットは入れない。
// 今のところルートとの差分は無い。
// 注意: ネスト設定は親とマージされないため、全パッケージに効かせたい設定は forge 側に置くこと。
export default createOxlintConfig();
