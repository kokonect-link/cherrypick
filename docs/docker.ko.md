Docker를 사용해서 Misskey 구축
================================================================

이 가이드는 Docker를 사용해서 Misskey를 설정하는 방법에 대해 설명합니다.

- [일본어 버전도 있어요 - Japanese version also available - 日本語版もあります](./docker.ja.md)
- [영어 버전도 있어요 - English version also available - 英語版もあります](./docker.en.md)
- [중국어 버전도 있어요 - Simplified Chinese version also available - 简体中文版同样可用](./docker.zh.md)

----------------------------------------------------------------

*1.* Misskey 다운로드
----------------------------------------------------------------
1. master 브랜치에서 Misskey 저장소 클론

	`git clone -b master git://github.com/kokonect-link/misskey.git`

2. misskey 디렉토리로 이동

	`cd misskey`

3. [최신 릴리즈](https://github.com/kokonect-link/misskey/releases/latest) 확인

	`git checkout master`

*2.* 설정 파일 작성
----------------------------------------------------------------

아래 명령으로 설정 파일을 작성합니다.

```bash
cd .config
cp example.yml default.yml
cp docker_example.env docker.env
```

### `default.yml` 편집

비 Docker 환경과 동일하게 편집합니다.  
단, Postgresql, Redis와 Elasticsearch의 호스트는 `localhost`가 아니고, `docker-compose.yml`로 설정된 서비스명으로 되어 있습니다.  
표준 설정에서는 다음과 같습니다.

| 서비스          | 호스트명  |
|---------------|---------|
| Postgresql    |`db`     |
| Redis         |`redis`  |
| Elasticsearch |`es`     |

### `docker.env` 편집

이 파일은 Postgresql 설정을 정의합니다.  
반드시 정의해야 하는 설정은 다음과 같습니다.

| 설정                 | 내용          |
|---------------------|--------------|
| `POSTGRES_PASSWORD` | 비밀번호       |
| `POSTGRES_USER`     | 유저명         |
| `POSTGRES_DB`       | 데이터베이스명   |

*3.* Docker 설정
----------------------------------------------------------------
`docker-compose.yml`를 편집합니다.

*4.* Misskey 빌드
----------------------------------------------------------------
다음 명령으로 Misskey를 빌드할 수 있습니다:

`docker-compose build`

*5.* 데이터베이스 초기화
----------------------------------------------------------------
``` shell
docker-compose run --rm web yarn run init
```

*6.* 끝났어요!
----------------------------------------------------------------
수고 많으셨습니다. 이것으로 Misskey를 사용할 준비가 되었습니다.

### 실행
`docker-compose up -d`만 입력하면 됩니다. GLHF!

### Misskey를 최신 버전으로 업데이트 하는 방법:
1. `git stash`
2. `git checkout master`
3. `git pull`
4. `git stash pop`
5. `docker-compose build`
6. [ChangeLog](../CHANGELOG.md)에서 마이그레이션 정보 확인
7. `docker-compose stop && docker-compose up -d`

### [cli 명령](manage.ko.md)을 실행하는 방법:
`docker-compose run --rm web node built/tools/mark-admin @example`

----------------------------------------------------------------

해결하기 어려운 문제가 발생한 경우, 부담없이 연락 주세요 :D
