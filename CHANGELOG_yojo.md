<!--
## yojo-x.x.x (unreleased)

### Release Date

### General
-

### Client
-

### Server
-

### Misc

-->
## 0.3.0 (unreleased)

### Release Date

### General
-

### Client
-

### Server
- Feat: OpenSearchを利用できるように
- Enhance: 高度な検索に新たな条件を追加(OpenSearchが必要です)
	- 添付ファイルのセンシティブ条件(なし/含む/除外)
	- 引用ノート除外
  - 検索方法の詳細はdoc/Advanced-Search.mdに 
- Change:APIのパラメータを変更
	-  notes/advanced-search の"excludeNsfw"を"excludeCW"に変更  
	-  notes/advanced-search の"channelId"を削除  
 
## 0.2.2
Cherrypick 4.9.0-beta.2

### General

### Client

### Server
- remove: チャンネル機能のAPIを削除
 
## 0.2.1
Cherrypick 4.9.0-beta.2

### Client
- feat: マスコット画像を表示するウィジェットを追加

## 0.2.0
Cherrypick 4.9.0-beta.2

### General
- enhance: ノートとユーザーの検索時に照会を行うかが選択できるようになりました
	- @foo@example.com 形式でユーザ検索した場合に照会ができるようになりました
### Server
- fix: リモートユーザーにはファイルサイズ制限を適用しない

## 0.1.0 (unreleased)

### General
- enhance: メディアプロキシurlと拡大画像urlを分割
- enhance: 1ファイルの容量をロールでも制限できるように

### Client
- enhance: ノートとユーザーの検索時に照会を行うかが選択できるようになりました
	- @foo&#8203;@example.com 形式でユーザ検索した場合に照会ができるようになりました
- add: 通知音を追加 [@mujin-nohuman (無人)](https://github.com/mujin-nohuman)
- fix: "キャッシュをクリア"してもインスタンス情報が更新されない不具合を修正 [#101](https://github.com/yojo-art/cherrypick/issues/101)

### Server
- enhance: remoteProxyエンドポイント設定を追加
- fix: webpublic生成時にドライブの縮小設定を見るように

### Others
- engawaをマージ
- cherrypickからフォーク
