# Newsroom記事の追加・公開手順

Newsroomの記事は `newsroom-data.js` の `window.AXRAL_ARTICLES` 配列で管理します。記事ページを個別に作る必要はありません。

## おすすめ：GitHubフォームから追加する

1. リポジトリの **Issues → New issue** を開きます。
2. **Newsroom記事追加** のフォームを選びます。
3. タイトル・掲載日・カテゴリ・概要・本文などを入力して送信します。
4. 自動で `newsroom-data.js` を更新するPull Requestが作成されます。
5. Pull Requestで本文・表示・日付を確認し、問題がなければマージします。

フォームから選べる公開設定は次のとおりです。

- **下書き**：`published: false`。Newsroomの一覧には表示されません。
- **公開（レビュー後に反映）**：`published: true`。Pull Requestをマージすると一覧に表示されます。

Pull Requestがマージされるまではサイトに反映されません。記事追加フォームの自動処理は、リポジトリの所有者・メンバー・コラボレーターが作成したIssueだけを対象にします。

## 本文の入力形式

本文欄はMarkdown形式です。次の形式を使えます。

- 通常の文章：段落
- `## 見出し`：見出し
- `- 項目`：箇条書き（連続した行をひとつのリストにします）
- `> 引用`：引用ブロック

## 手動で追加する場合

従来どおり `newsroom-data.js` を直接編集しても構いません。記事オブジェクトの形式は次のとおりです。

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

- `id` は英小文字・数字・ハイフンで一意にします。記事URLは `article.html?id=<id>` です。
- `date` は実在する `YYYY-MM-DD`、`category` は `Company / Product / Update / Event / Media` のいずれかにします。
- `products` は絞り込みUIの名称と一致させます（例：`VO-SE vocal`、`Axral`）。
- 下書きデータも公開JavaScriptとして配信されるため、機密情報は含めないでください。

## データ検証（Node.js）

公開前にリポジトリのルートで次を実行します。依存パッケージは不要です。

```bash
node tools/validate-newsroom.cjs
```

ID重複、日付、必須項目、カテゴリ、本文ブロック形式を検査します。Pull RequestでもCIが自動実行します。

## 公開前チェック

- [ ] ID重複なし、日付が正しい
- [ ] タイトル・概要・本文の誤字を確認
- [ ] 製品名・カテゴリ・タグを統一
- [ ] 外部リンクの遷移先と内容を確認
- [ ] 公開する記事だけ `published: true`
- [ ] 記事ページで表示確認（スマートフォン幅も確認）

## SNSシェア時のOGPについて

記事ページのタイトル・概要はブラウザー上で記事データから更新されます。ただしSNSのリンクプレビュー取得BotはJavaScriptを実行しない場合が多く、動的OGPはプレビューに反映されない可能性があります。SNSプレビューを記事ごとに確実に出すには、静的HTMLの生成（プリレンダリング）または記事ごとのHTMLが必要です。
