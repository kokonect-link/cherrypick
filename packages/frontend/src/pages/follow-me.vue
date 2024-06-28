<template>
	<div class="follow-me"></div>
</template>

<script lang="ts" setup>
import * as os from '@/os';
import { host as hostRaw } from '@/config';
import { $i } from '@/account.js';
import { acct } from '@/filters/user.js';
import { misskeyApi } from '@/scripts/misskey-api.js';
import { i18n } from '@/i18n.js';
import * as Misskey from 'cherrypick-js';

const accountUri = new URL(location.href).searchParams.get("acct");
if (accountUri == null) {
	throw new Error("Account URI is not specified");
}

if ($i != null) {
	const { canceled } = await os.confirm({
		type: "question",
		text: i18n.ts.followRequests,
	});

	if (!canceled) {
		os.waiting();
		window.location.href = `/authorize-follow?acct=${accountUri}`;
	}
}

const remoteAccountId = await os.inputText({
	title: i18n.ts.remote,
});

if (!remoteAccountId.result) {
	os.waiting();
	window.location.href = `/authorize-follow?acct=${accountUri}`;
} else {
	const remoteAccountInfo = Misskey.acct.parse(remoteAccountId.result);

	if (remoteAccountInfo.host === hostRaw || remoteAccountInfo.host === null) {
		os.waiting();
		window.location.href = `/authorize-follow?acct=${remoteAccountInfo.acct}`;
	} else {
		os.waiting();
		fetch(
			`https://${remoteAccountInfo.host}/.well-known/webfinger?resource=${remoteAccountInfo.username}@${remoteAccountInfo.host}`,
			{
				method: "GET",
			},
		)
		.then((responce) => responce.json())
		.then((data) => {
			const subscribeUri = data.links.find(
				(link: { rel: string }) => link.rel === "http://ostatus.org/schema/1.0/subscribe",
		).template;
		window.location.href = subscribeUri.replace("{uri}", accountUri.includes("@") ? accountUri: `${accountUri}@${hostRaw}`,);
		})
		.catch((_) => {
			window.location.href = `/@${accountUri}`;
		});
	}
}

</script>
