Guide d'installation et de configuration de CherryPick
================================================================

Nous vous remerçions de l'intrêt que vous manifestez pour l'installation de votre propre instance CherryPick !
Ce guide décrit les étapes à suivre afin d'installer et de configurer une instance CherryPick.

- [La version en japonnais est également disponible sur - 日本語版もあります](./setup.ja.md)
- [Version anglaise également disponible - English version also available - 英語版もあります](./setup.en.md)
- [Version Chinois simplifié également disponible - Simplified Chinese version also available - 简体中文版同样可用](./setup.zh.md)
- [Il existe également une version coréenne - Korean version also available - 한국어판도 있어요!](./setup.ko.md)

----------------------------------------------------------------

*1.* Création de l'utilisateur CherryPick
----------------------------------------------------------------
Executer misskey en tant que super-utilisateur étant une mauvaise idée, nous allons créer un utilisateur dédié.
Sous Debian, par exemple :

```
adduser --disabled-password --disabled-login cherrypick
```

*2.* Installation des dépendances
----------------------------------------------------------------
Installez les paquets suivants :

#### Dépendences :package:
* **[Node.js](https://nodejs.org/en/)** (12.x, 14.x, 15.x)
* **[PostgreSQL](https://www.postgresql.org/)** (>= 10)
* **[Redis](https://redis.io/)**

##### Optionnels
* [Yarn](https://yarnpkg.com/) - *recommander pour des raisons de sécurité. Si vous ne l'installez pas, utilisez `npx yarn` au lieu de` yarn`.*
* [Elasticsearch](https://www.elastic.co/) - *requis pour pouvoir activer la fonctionnalité de recherche.*
* [FFmpeg](https://www.ffmpeg.org/)

*3.* Installation de CherryPick
----------------------------------------------------------------
1. Basculez vers l'utilisateur cherrypick.

	`su - cherrypick`

2. Clonez la branche master du dépôt cherrypick.

	`git clone -b master git://github.com/kokonect-link/cherrypick.git`

3. Accédez au dossier cherrypick.

	`cd cherrypick`

4. Checkout sur le tag de la [version la plus récente](https://github.com/kokonect-link/cherrypick/releases/latest)

	`git checkout master`
 
5. Installez les dépendances de CherryPick.

	`yarn install`

*4.* Création du fichier de configuration
----------------------------------------------------------------
1. Copiez le fichier `.config/example.yml` et renommez-le`default.yml`.

	`cp .config/example.yml .config/default.yml`

2. Editez le fichier `default.yml`

*5.* Construction de CherryPick
----------------------------------------------------------------

Construisez CherryPick comme ceci :

`NODE_ENV=production yarn build`

Si vous êtes sous Debian, vous serez amené à installer les paquets `build-essential` et `python`.

Si vous rencontrez des erreurs concernant certains modules, utilisez node-gyp:

1. `npx node-gyp configure`
2. `npx node-gyp build`
3. `NODE_ENV=production yarn build`

*6.* C'est tout.
----------------------------------------------------------------
Excellent ! Maintenant, vous avez un environnement prêt pour lancer CherryPick

### Lancement conventionnel
Lancez tout simplement `NODE_ENV=production yarn start`. Bonne chance et amusez-vous bien !

### Démarrage avec systemd

1. Créez un service systemd sur

	`/etc/systemd/system/cherrypick.service`

2. Editez-le puis copiez et coller ceci dans le fichier :

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

3. Redémarre systemd et active le service cherrypick.

	`systemctl daemon-reload ; systemctl enable cherrypick`

4. Démarre le service cherrypick.

	`systemctl start cherrypick`

Vous pouvez vérifier si le service a démarré en utilisant la commande `systemctl status cherrypick`.

### Méthode de mise à jour vers la plus récente version de CherryPick
1. `git checkout master`
2. `git pull`
3. `git submodule update --init`
4. `yarn install`
5. `NODE_ENV=production yarn build`
6. `yarn migrate`

----------------------------------------------------------------

Si vous rencontrez des difficultés ou avez d'autres questions, n'hésitez pas à nous contacter !
