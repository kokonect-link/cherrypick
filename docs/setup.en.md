CherryPick Setup and Installation Guide
================================================================

We thank you for your interest in setting up your CherryPick server!
This guide describes how to install and setup CherryPick.

- [Japanese version also available - 日本語版もあります](./setup.ja.md)
- [Simplified Chinese version also available - 简体中文版同样可用](./setup.zh.md)
- [Korean version also available - 한국어판도 있어요!](./setup.ko.md)

----------------------------------------------------------------

*1.* Create CherryPick user
----------------------------------------------------------------
Running cherrypick as root is not a good idea so we create a user for that.
In debian for exemple :

```
adduser --disabled-password --disabled-login cherrypick
```

*2.* Install dependencies
----------------------------------------------------------------
Please install and setup these softwares:

#### Dependencies :package:
* **[Node.js](https://nodejs.org/en/)** (12.x, 14.x)
* **[PostgreSQL](https://www.postgresql.org/)** (12.x / 13.x is preferred)
* **[Redis](https://redis.io/)**

##### Optional
* [Yarn](https://yarnpkg.com/) *Optional but recommended for security reason. If you won't install it, use `npx yarn` instead of `yarn`.*
* [Elasticsearch](https://www.elastic.co/) - required to enable the search feature
* [FFmpeg](https://www.ffmpeg.org/)

*3.* Install CherryPick
----------------------------------------------------------------
1. Connect to cherrypick user.

	`su - cherrypick`

2. Clone the cherrypick repo from master branch.

	`git clone -b master git://github.com/kokonect-link/cherrypick.git`

3. Navigate to cherrypick directory

	`cd cherrypick`

4. Checkout to the [latest release](https://github.com/kokonect-link/cherrypick/releases/latest)

	`git checkout master`

5. Install CherryPick dependencies.

	`yarn`

*4.* Configure CherryPick
----------------------------------------------------------------
1. Copy the `.config/example.yml` and rename it to `default.yml`.

	`cp .config/example.yml .config/default.yml`

2. Edit `default.yml`

*5.* Build CherryPick
----------------------------------------------------------------

Build CherryPick with the following:

`NODE_ENV=production yarn build`

If you're on Debian, you will need to install the `build-essential`, `python` package.

If you're still encountering errors about some modules, use node-gyp:

1. `npx node-gyp configure`
2. `npx node-gyp build`
3. `NODE_ENV=production yarn build`

*6.* Init DB
----------------------------------------------------------------
``` shell
yarn run init
```

*7.* That is it.
----------------------------------------------------------------
Well done! Now, you have an environment that run to CherryPick.

### Launch normally
Just `NODE_ENV=production npm start`. GLHF!

### Launch with systemd

1. Create a systemd service here

	`/etc/systemd/system/cherrypick.service`

2. Edit it, and paste this and save:

	```
	[Unit]
	Description=CherryPick daemon

	[Service]
	Type=simple
	User=cherrypick
	ExecStart=/usr/bin/npm start
	WorkingDirectory=/home/cherrypick/cherrypick
	Environment="NODE_ENV=production"
	TimeoutSec=60
	StandardOutput=syslog
	StandardError=syslog
	SyslogIdentifier=cherrypick
	Restart=always

	[Install]
	WantedBy=multi-user.target
	```

3. Reload systemd and enable the cherrypick service.

	`systemctl daemon-reload ; systemctl enable cherrypick`

4. Start the cherrypick service.

	`systemctl start cherrypick`

You can check if the service is running with `systemctl status cherrypick`.

### How to update your CherryPick server to the latest version
1. `git checkout master`
2. `git pull`
3. `git submodule update --init`
4. `yarn install`
5. `NODE_ENV=production yarn build`
6. `yarn migrate`
7. Restart your CherryPick process to apply changes
8. Enjoy

If you encounter any problems with updating, please try the following:
1. `yarn clean` or `yarn cleanall`
2. Retry update (Don't forget `yarn install`

----------------------------------------------------------------

If you have any questions or troubles, feel free to contact us!
