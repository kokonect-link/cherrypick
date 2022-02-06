# Contribution guide
We're glad you're interested in contributing Misskey! In this document you will find the information you need to contribute to the project.

**ℹ️ Important:** This project uses Japanese as its major language, **but you do not need to translate and write the Issues/PRs in Japanese.**
Also, you might receive comments on your Issue/PR in Japanese, but you do not need to reply to them in Japanese as well.\
The accuracy of translation into Japanese is not high, so it will be easier for us to understand if you write it in the original language.
It will also allow the reader to use the translation tool of their preference if necessary.

## Issues
Before creating an issue, please check the following:
- To avoid duplication, please search for similar issues before creating a new issue.
- Do not use Issues to ask questions or troubleshooting.
	- Issues should only be used to feature requests, suggestions, and bug tracking.
	- Please ask questions or troubleshooting in the [Misskey Forum](https://forum.misskey.io/) or [Discord](https://discord.gg/V8qghB28Aj).

## Before implementation
When you want to add a feature or fix a bug, **first have the design and policy reviewed in an Issue** (if it is not there, please make one). Without this step, there is a high possibility that the PR will not be merged even if it is implemented.

Also, when you start implementation, assign yourself to the Issue (if you cannot do it yourself, ask another member to assign you). By expressing your intention to work the Issue, you can prevent conflicts in the work.

## Well-known branches
- **`master`** branch is tracking the latest release and used for production purposes.
- **`develop`** branch is where we work for the next release.
	- When you create a PR, basically target it to this branch.
- **`l10n_develop`** branch is reserved for localization management.

## Creating a PR
Thank you for your PR! Before creating a PR, please check the following:
- If possible, prefix the title with a keyword that identifies the type of this PR, as shown below.
  - `fix` / `refactor` / `feat` / `enhance` / `perf` / `chore` etc
  - Also, make sure that the granularity of this PR is appropriate. Please do not include more than one type of change or interest in a single PR.
- If there is an Issue which will be resolved by this PR, please include a reference to the Issue in the text.
- Please add the summary of the changes to [`CHANGELOG.md`](/CHANGELOG.md). However, this is not necessary for changes that do not affect the users, such as refactoring.
- Check if there are any documents that need to be created or updated due to this change.
- If you have added a feature or fixed a bug, please add a test case if possible.
- Please make sure that tests and Lint are passed in advance.
  - You can run it with `npm run test` and `npm run lint`. [See more info](#testing)
- If this PR includes UI changes, please attach a screenshot in the text.

Thanks for your cooperation 🤗

## Localization (l10n)
CherryPick uses [GitLocalize](https://gitlocalize.com/repo/6464) for localization management.
You can improve our translations by signing in to GitLocalize using your GitHub account.
Your translations added on GitLocalize are **not** submitted automatically as a PR. When finished translating, please make sure you create a Review Request on GitLocalize so that we can see your submission. Your translation will then be reviewed and if all looks good, we will create a Pull Request (with the title "Translate <locale>.json via GitLocalize") to the repository. Your added translations will be displayed as commits authored by you in the Pull Request.
The owner [@noridev](https://github.com/noridev) merges the PR into the develop branch before the next release.

If your language is not listed in GitLocalize, please open an issue.

![GitLocalize](https://gitlocalize.com/repo/6464/whole_project/badge.svg)

## Documentation
* Documents for instance admins are located in [`/docs`](/docs).
* Documents for end users are located in [`/src/docs`](/src/docs).

## Testing
- Test codes are located in [`/test`](/test).

### Run test
Create a config file.
```
cp test/test.yml .config/
```
Prepare DB/Redis for testing.
```
docker-compose -f test/docker-compose.yml up
```
Alternatively, prepare an empty (data can be erased) DB and edit `.config/test.yml`. 

Run all test.
```
npm run test
```

#### Run specify test
```
npx cross-env TS_NODE_FILES=true TS_NODE_TRANSPILE_ONLY=true TS_NODE_PROJECT="./test/tsconfig.json" npx mocha test/foo.ts --require ts-node/register
```

### e2e tests
TODO

## Continuous integration
CherryPick uses GitHub Actions for executing automated tests.
Configuration files are located in [`/.github/workflows`](/.github/workflows).

## Adding CherryPickRoom items
* Use English for material, object and texture names.
* Use meter for unit of length.
* Your PR should include all source files (e.g. `.png`, `.blend`) of your models (for later editing).
* Your PR must include the glTF binary files (`.glb`) of your models.
* Add a locale key `room.furnitures.YOUR_ITEM` at [`/locales/ja-JP.yml`](/locales/ja-JP.yml).
* Add a furniture definition at [`src/client/scripts/room/furnitures.json5`](src/client/scripts/room/furnitures.json5).

If you have no experience on 3D modeling, we suggest to use the free 3DCG software [Blender](https://www.blender.org/).
You can find information on glTF 2.0 at [glTF 2.0 — Blender Manual]( https://docs.blender.org/manual/en/dev/addons/io_scene_gltf2.html).

## Notes
### How to resolve conflictions occurred at yarn.lock?

Just execute `yarn` to fix it.

### placeholder
SQLをクエリビルダで組み立てる際、使用するプレースホルダは重複してはならない
例えば
``` ts
query.andWhere(new Brackets(qb => {
	for (const type of ps.fileType) {
		qb.orWhere(`:type = ANY(note.attachedFileTypes)`, { type: type });
	}
}));
```
と書くと、ループ中で`type`というプレースホルダが複数回使われてしまいおかしくなる
だから次のようにする必要がある
```ts
query.andWhere(new Brackets(qb => {
	for (const type of ps.fileType) {
		const i = ps.fileType.indexOf(type);
		qb.orWhere(`:type${i} = ANY(note.attachedFileTypes)`, { [`type${i}`]: type });
	}
}));
```

### Not `null` in TypeORM
```ts
const foo = await Foos.findOne({
	bar: Not(null)
});
```
のようなクエリ(`bar`が`null`ではない)は期待通りに動作しない。
次のようにします:
```ts
const foo = await Foos.findOne({
	bar: Not(IsNull())
});
```

### `null` in SQL
SQLを発行する際、パラメータが`null`になる可能性のある場合はSQL文を出し分けなければならない
例えば
``` ts
query.where('file.folderId = :folderId', { folderId: ps.folderId });
```
という処理で、`ps.folderId`が`null`だと結果的に`file.folderId = null`のようなクエリが発行されてしまい、これは正しいSQLではないので期待した結果が得られない
だから次のようにする必要がある
``` ts
if (ps.folderId) {
	query.where('file.folderId = :folderId', { folderId: ps.folderId });
} else {
	query.where('file.folderId IS NULL');
}
```

### `[]` in SQL
SQLを発行する際、`IN`のパラメータが`[]`(空の配列)になる可能性のある場合はSQL文を出し分けなければならない
例えば
``` ts
const users = await Users.find({
	id: In(userIds)
});
```
という処理で、`userIds`が`[]`だと結果的に`user.id IN ()`のようなクエリが発行されてしまい、これは正しいSQLではないので期待した結果が得られない
だから次のようにする必要がある
``` ts
const users = userIds.length > 0 ? await Users.find({
	id: In(userIds)
}) : [];
```

### 配列のインデックス in SQL
SQLでは配列のインデックスは**1始まり**。
`[a, b, c]`の `a`にアクセスしたいなら`[0]`ではなく`[1]`と書く

### null IN
nullが含まれる可能性のあるカラムにINするときは、そのままだとおかしくなるのでORなどでnullのハンドリングをしよう。

### `undefined`にご用心
MongoDBの時とは違い、findOneでレコードを取得する時に対象レコードが存在しない場合 **`undefined`** が返ってくるので注意。
MongoDBは`null`で返してきてたので、その感覚で`if (x === null)`とか書くとバグる。代わりに`if (x == null)`と書いてください

### Migration作成方法
```
npx ts-node ./node_modules/typeorm/cli.js migration:generate -n 変更の名前
```

作成されたスクリプトは不必要な変更を含むため除去してください。

### コネクションには`markRaw`せよ
**Vueのコンポーネントのdataオプションとして**misskey.jsのコネクションを設定するとき、必ず`markRaw`でラップしてください。インスタンスが不必要にリアクティブ化されることで、misskey.js内の処理で不具合が発生するとともに、パフォーマンス上の問題にも繋がる。なお、Composition APIを使う場合はこの限りではない(リアクティブ化はマニュアルなため)。

### JSONのimportに気を付けよう
TypeScriptでjsonをimportすると、tscでコンパイルするときにそのjsonファイルも一緒にdistディレクトリに吐き出されてしまう。この挙動により、意図せずファイルの書き換えが発生することがあるので、jsonをimportするときは書き換えられても良いものかどうか確認すること。書き換えされて欲しくない場合は、importで読み込むのではなく、`fs.readFileSync`などの関数を使って読み込むようにすればよい。

### コンポーネントのスタイル定義でmarginを持たせない
コンポーネント自身がmarginを設定するのは問題の元となることはよく知られている
marginはそのコンポーネントを使う側が設定する

## その他
### HTMLのクラス名で follow という単語は使わない
広告ブロッカーで誤ってブロックされる
