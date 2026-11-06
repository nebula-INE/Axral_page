# Newsroom記事の追加・公開手順

Newsroomの記事は `newsroom-data.js` の `window.AXRAL_ARTICLES` 配列で管理します。記事ページを個別に作る必要はありません。

## 追加手順

1. `newsroom-data.js` の配列内に、既存記事を参考に新しいオブジェクトを追加します（記事間のカンマに注意）。
2. `id` は英小文字・数字・ハイフンで一意にします。記事URLは `article.html?id=<id>` です。
3. `date` は `YYYY-MM-DD`、`category` は `Company / Product / Update / Event / Media` のいずれか。
4. `products` は絞り込みUIの名称と一致させます（例：`VO-SE vocal`、`Axral`）。
5. `published: false` のまま下書き保存し、内容確認後に `true` に変更して公開します。
6. PRで差分・リンク・日付・表記を確認し、レビュー後に公開ブランチへ反映します。

## 記事テンプレート

以下をコピーし、本文の `body` に必要なブロックを追加してください。

```js
{
  id: "unique-slug",
  date: "2026-11-06",
  category: "Update",
  title: "記事タイトル",
  summary: "一覧に表示する短い概要。",
  products: ["VO-SE vocal"],
  tags: ["アップデート"],
  published: false,
  body: [
    { type: "paragraph", text: "本文の段落。" },
    { type: "heading", text: "見出し" },
    { type: "list", items: ["項目A", "項目B"] },
    { type: "quote", text: "引用・補足。" }
  ]
}
```

## データ検証（Node.js）\n\n公開前にリポジトリのルートで次を実行します。依存パッケージは不要です。\n\n```bash\nnode tools/validate-newsroom.cjs\n```\n\nID重複、日付（実在日付かも確認）、必須項目、カテゴリ、本文ブロック形式を検査します。エラーがあれば終了コード1で停止するため、CIにも組み込めます。\n\n## 公開前チェック

- [ ] ID重複なし、日付が正しい
- [ ] タイトル・概要・本文の誤字を確認
- [ ] 製品名・カテゴリ・タグを統一
- [ ] 外部リンクの遷移先と内容を確認
- [ ] 公開する記事だけ `published: true`
- [ ] 記事ページで表示確認（スマートフォン幅も確認）

**注意:** `published: false` は一覧から非表示にするための運用フラグです。機密情報を下書きデータに含めないでください。データは公開JavaScriptとして配信されます。
\n\n## SNSシェア時のOGPについて\n\n記事ページのタイトル・概要はブラウザー上で記事データから更新されます。ただしSNSのリンクプレビュー取得BotはJavaScriptを実行しない場合が多く、動的OGPはプレビューに反映されない可能性があります。SNSプレビューを記事ごとに確実に出すには、静的HTMLの生成（プリレンダリング）または記事ごとのHTMLが必要です。\n