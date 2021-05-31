Misskey 설치 가이드
================================================================

Misskey 서버 구축에 관심을 가져주셔서 감사합니다!
이 가이드에서는 Misskey의 설치 및 설정 방법에 대해 안내합니다.

- [일본어 문서도 있어요 - 日本語版もあります](./setup.ja.md)
- [영어 버전도 있어요 - English version also available](./setup.en.md)
- [중국어 간체 버전도 제공돼요 - 简体中文版同样可用](./setup.zh.md)
- [프랑스어 버전도 있어요 - Version française aussi](./setup.fr.md)

----------------------------------------------------------------

*1.* Misskey 사용자 생성
----------------------------------------------------------------
Misskey는 root 사용자로 실행하지 않는 것이 권장되므로, 사용자를 새로 생성합니다.
Debian의 예시:

```
adduser --disabled-password --disabled-login misskey
```

*2.* 의존 패키지 설치
----------------------------------------------------------------
아래 패키지를 설치 및 설정해 주세요:

#### 종속성 :package:
* **[Node.js](https://nodejs.org/en/)** (12.x, 14.x, 15.x, 16.x)
* **[PostgreSQL](https://www.postgresql.org/)** (10以上)
* **[Redis](https://redis.io/)**

##### 선택적 추가 패키지
* [Yarn](https://yarnpkg.com/)
	* 선택 사항이지만 보안상의 이유로 권장됩니다. yarn을 설치하지 않는 경우, `yarn` 을 `npx yarn` 로 변경해 주세요.
* [Elasticsearch](https://www.elastic.co/)
	* 검색 기능을 사용하기 위해서 필요합니다.
* [FFmpeg](https://www.ffmpeg.org/)

*3.* Misskey 설치
----------------------------------------------------------------
1. 사용자를 misskey로 변경

	`su - misskey`

2. master 브랜치에서 Misskey 저장소 클론

	`git clone -b master git://github.com/kokonect-link/misskey.git`

3. misskey 디렉토리로 이동

	`cd misskey`

4. [최신 릴리즈](https://github.com/kokonect-link/misskey/releases/latest) 확인

	`git checkout master`

5. Misskey의 의존 패키지 설치

	`yarn install`

*4.* 설정 파일 작성
----------------------------------------------------------------
1. `.config/example.yml`를 복사하고, 이름을 `default.yml`로 변경.

	`cp .config/example.yml .config/default.yml`

2. `default.yml` 를 수정한다.

*5.* Misskey 빌드
----------------------------------------------------------------

다음 명령으로 Misskey를 빌드할 수 있습니다:

`NODE_ENV=production yarn build`

Debian을 사용하고 있다면, `build-essential` 패키지를 설치해야 합니다.

만약 모듈에서 에러가 발생했다면, node-gyp를 사용해 보세요:
1. `npx node-gyp configure`
2. `npx node-gyp build`
3. `NODE_ENV=production yarn build`

*6.* 데이터베이스 초기화
----------------------------------------------------------------
``` shell
yarn run init
```

*7.* 끝났어요!
----------------------------------------------------------------
수고 많으셨습니다. 이것으로 Misskey를 사용할 준비가 되었습니다.

### Misskey 실행
`NODE_ENV=production yarn start`만 입력하면 됩니다. GLHF!

### systemd를 이용하여 실행
1. systemd 서비스 파일 생성

	`/etc/systemd/system/misskey.service`

2. 에디터를 열고, 아래 코드를 붙여넣고 저장:

	```
	[Unit]
	Description=Misskey daemon

	[Service]
	Type=simple
	User=misskey
	ExecStart=/usr/bin/npm start
	WorkingDirectory=/home/misskey/misskey
	Environment="NODE_ENV=production"
	TimeoutSec=60
	StandardOutput=syslog
	StandardError=syslog
	SyslogIdentifier=misskey
	Restart=always

	[Install]
	WantedBy=multi-user.target
	```

	CentOS에서 1024 이하의 포트를 사용하여 Misskey를 실행하는 경우, `ExecStart=/usr/bin/sudo /usr/bin/npm start`로 변경해야 합니다.

3. systemd를 다시 불러와 misskey 서비스 활성화

	`systemctl daemon-reload; systemctl enable misskey`

4. misskey 서비스 실행

	`systemctl start misskey`

`systemctl status misskey`를 입력하면, 서비스 상태를 확인할 수 있습니다.

### Misskey를 최신 버전으로 업데이트 하는 방법:
1. `git checkout master`
2. `git pull`
3. `yarn install`
4. `NODE_ENV=production yarn build`
5. `yarn migrate`
6. Misskey 프로세스를 다시 시작하여 수정된 내용을 반영합니다.

업데이트에 문제가 발생한 경우, 아래 항목을 따라주십시오.
1. `yarn clean` 또는 `yarn cleanall` 입력
2. 업데이트 다시 시도하기 (`yarn install` 명령어를 잊지 마세요!)

----------------------------------------------------------------

해결하기 어려운 문제가 발생한 경우, 부담없이 연락 주세요 :D
