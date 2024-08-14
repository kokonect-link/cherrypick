<!--
## x.x.x (unreleased)

### Release Date

### General
-

### Client
- 

### Server
-

### Misc

-->
## x.x.x (unreleased)

### Release Date

### General
- リバーシは削除されました
- センシティブなユーザーをHTL/LTL/STL上で表示しないようになりました
- 管理者側でユーザーがセンシティブかどうか設定できるようになりました
	- それに伴い、ユーザー側で設定できなくなりました

### Client
- 検索ウィジェットにオートフォーカスが当たらなくなりました
- 画像がAPNGの場合GIFではなくAPNGと表示するように
- 隠すボタンのスタイル調整
- ファイル名とALTを同時に表示するように
- ALTテキストが存在する場合投稿フォームのファイルにインジケータを表示するように
- ALTテキストがない場合警告を出すオプションを追加
- 画像のタイトルには必ずファイル名を使用するように
- fix: クロッパーで画像の全体が表示されないことがある問題

### Server
- 検索機能に新しいパラメータを追加( [1673beta/cherrypick#94](https://github.com/1673beta/cherrypick/issues/94) )

### Misc



## 0.4.6

### Release Date

### General
- チャット機能は非推奨になりました
	- 将来的に廃止する予定です

### Client
- モバイルUIにおいて、下部のナビゲーションバーに表示されるチャットページへの誘導を検索に置き換え
- feat: 検索ウィジェット

### Server
-

### Misc


## 0.4.5

### Release Date

### General
- `follow-me`は廃止されました
- CherryPick 4.10.0-beta.2に追従しました
- ユーザーにセンシティブフラグが付けられるようになりました
	- 有効にすると、投稿は自動的にCWがつくようになります
- `blocking/create`でブロックした際、同時にミュートするようになりました
	- `blocking/delete`をしてもミュートは解除されません。

### Client
- Botからのフォローを承認制にすることができるようになりました
		- Botフラグがついていない人からのフォローは自動承認となります

### Server
- isIndexableがfalseなユーザーはアンテナに載らないように

### Misc

## 0.4.4

### Release Date

### General
- CherryPick 4.10.0-beta.1に追従

### Client
- Deck UIのサーバーアイコンのスタイルを調整

### Server
-

### Misc


## 0.4.3

### Release Date

### General
- パスワードのハッシュでArgon2idをサポート
	- bcryptによるハッシュは再ログイン時にArgon2idに置き換えられます
- `notes/advanced-search`を廃止
- `notes/search`でmeilisearchを利用するのを廃止
	- リソースを多く消費してしまうことと、日本語全文検索に向いていないため
- 新しい公開範囲「プライベート」を追加
	- 投稿者しか見れません

### Client
- fix: URLスキーマのチェックが不完全だった問題

### Server
- feat: isIndexableプロパティ
	- 「設定＞プライバシー＞「公開ノートをインデックス化」」をオフにすると、あなたのノートが検索に引っ掛からなくなります

### Misc

## 0.4.2

### Release Date

### General
- Vueのバージョンをアップデート
  - 画面に何も表示されなくなるバグが修正

### Client
- Botの投稿をタイムラインから除外できるように
- Pageの可読性を向上

### Server
-

### Misc



## 0.4.1

### Release Date

### General
- ノートの自動削除機能を追加

### Client
- ダイスウィジェットを追加
- 通知を全て削除できるボタンを追加
- 非ログイン時にブロック/配送停止/サイレンスしているサーバーが見れないように

### Server
- 管理者アカウントを別サーバーに移行できるように
- APIドキュメントをRedocからscalarにして軽量化
- fix: OAuthにレートリミットがかかっていない問題
- fix: SQLエスケープが不完全な問題
- feat: 通知を個別削除するAPI

### Misc


## 0.4.0

### Release Date

### General
- yojo-artフォークで実装された機能の取り込み

### Client
- Catppuccin Themeをビルトインテーマとして利用可能に (https://github.com/catppuccin/misskey?tab=readme-ov-file)
- ユーザー、ノート、ギャラリー、ページをQRCodeで共有可能に
- オフライン画面のデザインを変更
- ダークモードを切り替えるショートカットキーの変更
- 検索boxを統一

### Server
- 

### Misc


## 0.3.1

### Release Date

### General
- feat: 高度な検索機能の追加
  - PGroongaやOpenSearchを利用できるようになります

### Client
- fix: 投稿にされたリアクションが正常に表示されない問題

### Server

## 0.3.0

### Release Date
2024-03-14

### General
- aboutにステータスページを表示できるように
  - コントロールパネル>設定>全般から設定できます

### Client
- ノートの最大字数が5120文字に
- ロケール変更
- 時限消滅ノートの追加

### Server
- 

### Misc
- devcontainerが起動しない問題を修正

## 0.2.0

### Release Date
2024-03-11

### General
- メディアタイムラインの実装
  - グローバルタイムラインを閲覧できる場合に閲覧できます

### Misc
- CHANGELOG_engawaを昇順に修正
- OthersをMiscに変更

## 0.1.1

### Release Date
2024-03-09

### Client
- ロケール変更

## 0.1.0

### Release Date
2024-03-09

### General
- アバターデコレーションの最大数を変更
- ギャラリーページに載せられる画像の最大数を変更
- ワードミュートの制限が文字数から個数に

### Server
- リモートユーザーが凍結されている場合、ジョブをリトライしないように

### Others
- フォークへの切り替え




