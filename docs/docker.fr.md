Guide Docker
================================================================

Ce guide explique comment installer et configurer CherryPick avec Docker.

- [Version japonaise également disponible - Japanese version also available - 日本語版もあります](./docker.ja.md)  
- [Version anglaise également disponible - English version also available - 英語版もあります](./docker.en.md)
- [Version Chinois simplifié également disponible - Simplified Chinese version also available - 简体中文版同样可用](./docker.zh.md)
- [Il existe également une version coréenne - Korean version also available - 한국어판도 있어요!](./docker.ko.md)

----------------------------------------------------------------

*1.* Télécharger CherryPick
----------------------------------------------------------------
1. Clone le dépôt de CherryPick sur la branche master.

	`git clone -b master git://github.com/kokonect-link/cherrypick.git`

2. Naviguez dans le dossier du dépôt.

	`cd cherrypick`

3. Checkout sur le tag de la [dernière version](https://github.com/kokonect-link/cherrypick/releases/latest).

	`git checkout master`

*2.* Configuration de CherryPick
----------------------------------------------------------------
1. `cp .config/example.yml .config/default.yml` Copiez le fichier `.config/example.yml` et renommez-le `default.yml`.
2. `cp .config/mongo_initdb_example.js .config/mongo_initdb.js` Copie le fichier `.config/mongo_initdb_example.js` et le renomme en `mongo_initdb.js`.
3. Editez `default.yml` et `mongo_initdb.js`.

*3.* Configurer Docker
----------------------------------------------------------------
Editez `docker-compose.yml`.

*4.* Contruire CherryPick
----------------------------------------------------------------
Contruire l'image Docker avec:

`docker-compose build`

*5.* C'est tout !
----------------------------------------------------------------
Parfait, Vous avez un environnement prêt pour démarrer CherryPick.

### Lancer normalement
Utilisez la commande `docker-compose up -d`. GLHF!

### How to update your CherryPick server to the latest version
1. `git stash`
2. `git checkout master`
3. `git pull`
4. `git submodule update --init`
5. `git stash pop`
6. `docker-compose build`
7. Consultez le [ChangeLog](../CHANGELOG_CHERRYPICK.md) pour avoir les éventuelles informations de migration
8. `docker-compose stop && docker-compose up -d`

### Comment exécuter des [commandes](manage.fr.md)
`docker-compose run --rm web node built/tools/mark-admin @example`

### Configuration d'ElasticSearch (pour la fonction de recherche)
*1.* Préparation de l'environnement
----------------------------------------------------------------
1. Permet de créer le dossier d'accueil de la base ElasticSearch aves les bons droits

	`mkdir elasticsearch && chown 1000:1000 elasticsearch`

2. Augmente la valeur max du paramètre map_count du système (valeur minimum pour pouvoir lancer ES)

	`sysctl -w vm.max_map_count=262144`

*2.* Après lancement du docker-compose, initialisation de la base ElasticSearch
----------------------------------------------------------------
1. Connexion dans le conteneur web

	`docker-compose -it web /bin/sh`

2. Ajout du paquet curl

	`apk add curl`

3. Création de la base ES

	`curl -X PUT "es:9200/cherrypick" -H 'Content-Type: application/json' -d'{ "settings" : { "index" : { } }}'`

4. `exit`

----------------------------------------------------------------

Si vous avez des questions ou des problèmes, n'hésitez pas à nous contacter !
