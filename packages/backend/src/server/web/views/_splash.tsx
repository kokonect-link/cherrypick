/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export function Splash(props: {
	icon?: string | null;
	customSplashText?: string[] | null;
}) {
	const customSplashText = getRandomSplashText(props.customSplashText);

	return (
		<div id="splash">
			<img id="splashIcon" src={props.icon || '/static-assets/splash.png'} />
			<span id="splashText">{customSplashText}</span>
			<div id="splashSpinner">
				<svg className="spinner" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
					<circle className="path" cx="25" cy="25" r="20" fill="none" stroke-width="6px" style="fill: none; stroke: currentColor; stroke-width: 6px;"></circle>
				</svg>
			</div>
		</div>
	);
}

function getRandomSplashText(splashText: string[] | null | undefined): string | null {
	if (!splashText || splashText.length === 0) {
		return null;
	}
	const randomIndex = Math.floor(Math.random() * splashText.length);
	return splashText[randomIndex];
}
