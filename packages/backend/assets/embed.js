/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: MIT
 */
//@ts-check
(() => {
	/** @type {NodeListOf<HTMLIFrameElement>} */
	const els = document.querySelectorAll('iframe[data-misskey-embed-id]');

	window.addEventListener('message', (event) => {
		els.forEach((el) => {
			if (event.source !== el.contentWindow) {
				return;
			}

			const id = el.dataset.cherrypickEmbedId;

			if (event.data.type === 'cherrypick:embed:ready') {
				el.contentWindow?.postMessage({
					type: 'cherrypick:embedParent:registerIframeId',
					payload: {
						iframeId: id,
					},
				}, '*');
			}
			if (event.data.type === 'cherrypick:embed:changeHeight' && event.data.iframeId === id) {
				el.style.height = event.data.payload.height + 'px';
			}
		});
	});
})();
