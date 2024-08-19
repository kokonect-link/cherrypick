# Docker Composeを使用したインストール
Docker Composeを使用したインストール方法について説明します。  
OSはUbuntuを想定しています。適宜読み替えてください。  

- [Docker Composeを使用したインストール](#docker-composeを使用したインストール)
	- [Docker Composeのインストール](#docker-composeのインストール)
	- [リポジトリの取得](#リポジトリの取得)
	- [設定](#設定)
		- [設定ファイルのコピー](#設定ファイルのコピー)
		- [設定ファイルの編集](#設定ファイルの編集)
	- [起動](#起動)
		- [ビルド](#ビルド)
		- [起動](#起動-1)
	- [Cloudflare Tunnelを使用する場合](#cloudflare-tunnelを使用する場合)

---
## Docker Composeのインストール
1. [Docker公式](https://docs.docker.com/engine/install/)のドキュメントに従ってインストールしてください。

## リポジトリの取得
kokonect(オリジナル)の場合
```bash
git clone -b master https://github.com/kokonect-link/cherrypick.git && \
cd cherrypick
```
縁側フォーク(このリポジトリ)の場合
```bash
git clone -b develop https://github.com/1673beta/cherrypick.git && \
cd cherrypick
```

## 設定
### 設定ファイルのコピー
下記コマンドを実行して設定ファイルをコピーします。
```bash
cp .config/docker_example.yml .config/default.yml && \
cp .config/docker_example.env .config/docker.env && \
cp ./compose_example.yml ./compose.yml
```
> [!Note]
> CherryPick v4.9.0以前ではcompose_example.ymlはdocker-compose_example.ymlという名前です。

### 設定ファイルの編集
`default.yml`と`docker.env`を編集します。
この時、両ファイルのPostgreSQLのユーザー名、パスワード、DB名は同一にしてください。

## 起動
編集が終わったら、下記コマンドを実行します。  
ビルドには通常時間がかかります。
### ビルド
```bash
sudo docker compose build
sudo docker compose run --rm web pnpm run init
```
### 起動
```bash
sudo docker compose up -d
```
お疲れ様でした。よきFediverseライフを。

## Cloudflare Tunnelを使用する場合
`compose.yml`のtunnelと書かれた部分のコメントアウトを外し、あなたのCloudflaredのトークンをenvironment/TUNNEL_TOKENに貼り付けることで起動します。
