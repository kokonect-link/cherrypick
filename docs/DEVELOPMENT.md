# 開発ガイド
開発をする上で役にたつメモ

## devcontainerの利用
開発をする上でdevcontainerを利用すると、コンテナ上に開発環境を構築することができます。

> **Note**
> Windowsを利用している場合、リポジトリをローカルにクローンする必要があります。
  
実行する前に下記のコマンドを打つ必要があります。
```bash
git clone https://github.com/1673beta/cherrypick.git
chmod 777 cherrypick
cp .devcontainer/devcontainer.yml .config/default.yml
```
その後、VSCodeのコマンドパレットからコンテナをビルドして立ち上げ、下記のコマンドを実行することで開発サーバーが立ち上がります。

```bash
pnpm build
pnpm migrate
pnpm dev
```

## DBマイグレーションを作成する
Misskey/CherrypickではTypeORMを利用してDBマイグレーションを実行します。下記の手順で作成することができます。

```bash
cd packages/backend
pnpm dlx typeorm migration:generate -d ormconfig.js -o MigrationName
```

## フォーマット
Biomeを使ってコードフォーマットを統一することができます。
下記ディレクトリで実行することができます。
* packages/backend
* packages/frontend
* packages/cherrypick-js
* packages/sw

下記コマンドを実行すると、フォーマットを修正することができます。

```bash
pnpm run format:write
```

