/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { comment } from '@/server/web/views/_.js';
import type { CommonProps } from '@/server/web/views/_.js';
import { Splash } from '@/server/web/views/_splash.js';
import type { PropsWithChildren, Children } from '@kitajs/html';

export function BaseEmbed(props: PropsWithChildren<CommonProps<{
	title?: string;
	noindex?: boolean;
	desc?: string;
	img?: string;
	serverErrorImageUrl?: string;
	infoImageUrl?: string;
	notFoundImageUrl?: string;
	metaJson?: string;
	embedCtxJson?: string;

	titleSlot?: Children;
	metaSlot?: Children;
}>>) {
	const now = Date.now();

	// 変数名をsafeで始めることでエラーをスキップ
	const safeMetaJson = props.metaJson;
	const safeEmbedCtxJson = props.embedCtxJson;

	return (
		<>
			{'<!DOCTYPE html>'}
			{comment}
			<html>
				<head>
					<meta charset="UTF-8" />
					<meta name="application-name" content="CherryPick" />
					<meta name="referer" content="origin" />
					<meta name="theme-color" content={props.themeColor ?? '#ffbcdc'} />
					<meta name="theme-color-orig" content={props.themeColor ?? '#ffbcdc'} />
					<meta property="og:site_name" content={props.instanceName || 'CherryPick'} />
					<meta property="instance_url" content={props.instanceUrl} />
					<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
					<meta name="format-detection" content="telephone=no,date=no,address=no,email=no,url=no" />
					<link rel="icon" href={props.icon ?? '/favicon.ico'} />
					<link rel="apple-touch-icon" href={props.appleTouchIcon ?? '/apple-touch-icon.png'} />

					{!props.config.frontendEmbedManifestExists ? <script type="module" src="/embed_vite/@vite/client"></script> : null}

					{props.config.frontendEmbedEntry.css != null ? props.config.frontendEmbedEntry.css.map((href) => (
						<link rel="stylesheet" href={`/embed_vite/${href}`} />
					)) : null}

					{props.titleSlot ?? <title safe>{props.title || 'CherryPick'}</title>}

					{props.metaSlot}

					<meta name="robots" content="noindex" />

					{props.frontendEmbedBootloaderCss != null ? <style safe>{props.frontendEmbedBootloaderCss}</style> : <link rel="stylesheet" href="/embed_vite/loader/style.css" />}

					<script>
						const VERSION = '{props.version}';
						const BASED_MISSKEY_VERSION = '{props.basedMisskeyVersion}';
						const CLIENT_ENTRY = {JSON.stringify(props.config.frontendEmbedEntry.file)};
						const LANGS = {JSON.stringify(props.langs)};
					</script>

					{safeMetaJson != null ? <script type="application/json" id="cherrypick_meta" data-generated-at={now}>{safeMetaJson}</script> : null}
					{safeEmbedCtxJson != null ? <script type="application/json" id="cherrypick_clientCtx" data-generated-at={now}>{safeEmbedCtxJson}</script> : null}

					{props.frontendEmbedBootloaderJs != null ? <script>{props.frontendEmbedBootloaderJs}</script> : <script src="/embed_vite/loader/boot.js"></script>}
				</head>
				<body>
					<noscript>
						<p>
							JavaScriptを有効にしてください<br />
							Please turn on your JavaScript<br />
							JavaScript를 사용으로 설정해 주세요
						</p>
					</noscript>
					<Splash icon={props.icon} />
					{props.children}
				</body>
			</html>
		</>
	);
}
