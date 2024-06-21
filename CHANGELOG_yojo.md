<!--
## engawa-x.x.x (unreleased)

### Release Date

### General
-

### Client
-

### Server
-

### Misc

-->
## 0.1.0 (unreleased)

### Release Date
2024-03-09

### General
- メディアプロキシurlと拡大画像urlを分割
- 1ファイルの容量をロールでも制限できるように

### Client
- enhance: ノートとユーザーの検索時に照会を行うかが選択できるようになりました
	- @foo&#8203;@example.com 形式でユーザ検索した場合に照会ができるようになりました
- add: 通知音を追加 [@mujin-nohuman (無人)](https://github.com/mujin-nohuman)
- fix: "キャッシュをクリア"してもインスタンス情報が更新されない不具合を修正 [#101](https://github.com/yojo-art/cherrypick/issues/101)

### Server
- remoteProxyエンドポイント設定を追加
- webpublic生成時にドライブの縮小設定を見るように

### Others
- engawaをマージ
- cherrypickからフォーク
