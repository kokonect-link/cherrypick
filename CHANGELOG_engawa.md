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

## 0.4.3 (unreleased)

### Release Date

### General
- パスワードのハッシュでArgon2idをサポート
	- bcryptによるハッシュは再ログイン時にArgon2idに置き換えられます

### Client
- fix: URLスキーマのチェックが不完全だった問題

### Server
-

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



