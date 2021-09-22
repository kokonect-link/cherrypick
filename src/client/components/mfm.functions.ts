import { i18n } from '@client/i18n';

const ts = i18n.locale;

export type MfmFunctionProp = {
	label?: string,
	description?: string,
	hasValue?: boolean,
};

export type MfmFunctionProps = Record<string, MfmFunctionProp>;

export type MfmFunctionStyleProp = Record<string, string | undefined>;

function genProp(label?: string, description?: string): MfmFunctionProp {
	return {
		label, description,
		hasValue: true,
	};
}

function genFlagProp(label?: string, description?: string): MfmFunctionProp {
	return {
		label, description,
		hasValue: false,
	};
}

export type MfmFunctionDefinition = string | {
	props?: MfmFunctionProps,
	style?: (props: MfmFunctionStyleProp) => string,
	class?: string,
	noAnimatedMfmStyle?: true | ((props: MfmFunctionStyleProp) => string),
	isCherryPickExtension?: boolean,
};

export const mfmFunctions: Record<string, MfmFunctionDefinition> = {
	tada: {
		style: _ => 'font-size: 150%; animation: tada 1s linear infinite both;',
		noAnimatedMfmStyle: _ => 'font-size: 150%',
	},
	/*
	wobble: {
		style: _ => 'font-size: 300%; animation: mfm-wobble 1s ease-out infinite both;',
		noAnimatedMfmStyle: _ => 'font-size: 300%',
		isCherryPickExtension: true,
	},
	 */
	jelly: {
		props: {
			speed: genProp(ts._mfmpad._functions.speed),
		},
		style: args => `animation: mfm-rubberBand ${args.speed || '1s'} linear infinite both;`
	},
	twitch: {
		props: {
			speed: genProp(ts._mfmpad._functions.speed),
		},
		style: args => `animation: mfm-twitch ${args.speed || '0.5s'} ease infinite;`
	},
	shake: {
		props: {
			speed: genProp(ts._mfmpad._functions.speed),
		},
		style: args => `animation: mfm-shake ${args.speed || '0.5s'} ease infinite;`
	},
	spin: {
		props: {
			left: genFlagProp(ts._mfmpad._functions.spinLeft),
			alternate: genFlagProp(ts._mfmpad._functions.spinAlternate),
			x: genFlagProp(ts._mfmpad._functions.xspin),
			y: genFlagProp(ts._mfmpad._functions.yspin),
			speed: genProp(ts._mfmpad._functions.speed, ts._mfmpad._functions.spinSpeedDescription),
		},
		style: args => {
			const direction = args.left ? 'reverse' : args.alternate ? 'alternate' :
				'normal';
			const anime = args.x ? 'mfm-spinX' : args.y ? 'mfm-spinY' : 'mfm-spin';
			const speed = args.speed || '1.5s';
			return `animation: ${anime} ${speed} linear infinite; animation-direction: ${direction};`;
		}
	},
	jump: 'animation: mfm-jump 0.75s linear infinite',
	/*
	blink: {
		props: {
			speed: genProp(ts._mfmpad._functions.speed),
		},
		style: args => `animation: mfm-blink ${args.speed || '1s'} step-end infinite`,
		isCherryPickExtension: true,
	},
	 */
	bounce: {
		style: _ => 'animation: mfm-bounce 0.75s linear infinite; transform-origin: center bottom',
		noAnimatedMfmStyle: true,
	},
	flip: {
		props: {
			h: genFlagProp(ts._mfmpad._functions.hflip),
			v: genFlagProp(ts._mfmpad._functions.vflip),
		},
		style: args => 'transform:' + (args.h && args.v ? 'scale(-1, -1)' : args.v ? 'scaleY(-1)' : 'scaleX(-1)'),
		noAnimatedMfmStyle: true,
	},
	/*
	rotate: {
		props: {
			angle: genProp(ts._mfmpad._functions.angle, ts._mfmpad._functions.rotateAngleDescription),
			x: genFlagProp(ts._mfmpad._functions.xspin),
			y: genFlagProp(ts._mfmpad._functions.yspin),
		},
		style: args => {
			const f = args.x ? 'perspective(128px) rotateX' : args.y ? 'perspective(128px) rotateY' : 'rotate';
			return `transform: ${f}(${args.angle || '90'}deg); transform-origin: center center`;
		},
		noAnimatedMfmStyle: true,
		isCherryPickExtension: true,
	},
	 */
	font: {
		props: {
			serif: genFlagProp(ts._mfmpad._functions.serif),
			monospace: genFlagProp(ts._mfmpad._functions.monospace),
			cursive: genFlagProp(ts._mfmpad._functions.cursive),
			fantasy: genFlagProp(ts._mfmpad._functions.fantasy),
		},
		style: prop => {
			const family =
				prop.serif ? 'font-family: serif' :
					prop.monospace ? 'font-family: monospace' :
						prop.cursive ? 'font-family: cursive' :
							prop.fantasy ? 'font-family: fantasy' :
										null;
			return `${family};`;
		},
		noAnimatedMfmStyle: true,
	},
	x2: 'font-size: 200%',
	x3: 'font-size: 400%',
	x4: 'font-size: 600%',
	blur: {
		class: '_mfm_blur_',
	},
	rainbow: 'animation: mfm-rainbow 1s linear infinite',
	sparkle: {
		props: {
			count: genProp(ts._mfmpad._functions.particleCount, ts._mfmpad._functions.particleCountDescription),
			speed: genProp(ts._mfmpad._functions.speed),
		},
		style: args => `${args.count || '10'} ${args.speed || '1'};`
	},
};
