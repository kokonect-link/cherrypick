<template>
<div class="mvcprjjd">
	<transition name="nav-back">
		<div class="nav-back _modalBg"
			v-if="showing"
			@click="showing = false"
			@touchstart.passive="showing = false"
		></div>
	</transition>

	<transition name="nav">
		<nav class="nav" :class="{ iconOnly, hidden }" v-show="showing">
			<div>
				<button class="item _button account" @click="openAccountMenu" v-click-anime>
					<MkAvatar :user="$i" class="avatar"/><MkUserName class="name" :user="$i"/>
				</button>
				<MkA class="item index" active-class="active" to="/" exact v-click-anime>
					<i class="fas fa-home fa-fw"></i><span class="text">{{ $ts.timeline }}</span>
				</MkA>
				<template v-for="item in menu">
					<div v-if="item === '-'" class="divider"></div>
					<component v-else-if="menuDef[item] && (menuDef[item].show !== false)" :is="menuDef[item].to ? 'MkA' : 'button'" class="item _button" :class="[item, { active: menuDef[item].active }]" active-class="active" v-on="menuDef[item].action ? { click: menuDef[item].action } : {}" :to="menuDef[item].to">
						<i class="fa-fw" :class="menuDef[item].icon"></i><span class="text">{{ $ts[menuDef[item].title] }}</span>
						<span v-if="menuDef[item].indicated" class="indicator"><i class="fas fa-circle"></i></span>
					</component>
				</template>
				<div class="divider"></div>
				<MkA v-if="$i.isAdmin || $i.isModerator" class="item" active-class="active" to="/admin" v-click-anime>
					<i class="fas fa-server fa-fw"></i><span class="text">{{ $ts.instance }}</span>
				</MkA>
				<button class="item _button" @click="more" v-click-anime>
					<i class="fa fa-ellipsis-h fa-fw"></i><span class="text">{{ $ts.more }}</span>
					<span v-if="otherNavItemIndicated" class="indicator"><i class="fas fa-circle"></i></span>
				</button>
				<MkA class="item" active-class="active" to="/settings" v-click-anime>
					<i class="fas fa-cog fa-fw"></i><span class="text">{{ $ts.settings }}</span>
				</MkA>
				<!-- <button class="item _button post" @click="post">
					<i class="fas fa-pencil-alt fa-fw"></i><span class="text">{{ $ts.note }}</span>
				</button> -->
				<div class="divider"></div>
				<template v-if="$i.isPatron">
					<button v-if="$i.isVip" class="patron-button _button" @click="patron" v-click-anime>
						<span class="patron"><i class="fas fa-gem fa-fw"></i></span><span class="patron-text">{{ $ts.youAreVip }}</span>
					</button>
					<button v-else class="patron-button _button" @click="patron" v-click-anime>
						<span class="patron"><i class="fas fa-heart fa-fw" style="animation: 1s linear 0s infinite normal both running mfm-rubberBand;"></i></span><span class="patron-text">{{ $ts.youArePatron }}</span>
					</button>
				</template>
				<button v-else class="patron-button _button" @click="patron" v-click-anime>
					<span class="not-patron"><i class="fas fa-heart fa-fw"></i></span><span class="patron-text">{{ $ts.youAreNotPatron }}</span>
				</button>
				<div class="divider"></div>
				<div class="about">
					<MkA class="link" to="/about" v-click-anime>
						<template v-if="isKokonect">
							<MkEmoji :normal="true" :no-style="true" emoji="🍮"/>
							<p style="font-size:10px;"><b><span style="color: var(--cherry);">KOKO</span><span style="color: var(--pick);">NECT</span></b></p>
						</template>
						<template v-else>
							<img :src="$instance.iconUrl || $instance.faviconUrl || '/favicon.ico'" class="_ghost"/>
						</template>
					</MkA>
				</div>
			</div>
		</nav>
	</transition>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { host } from '@client/config';
import { search } from '@client/scripts/search';
import * as os from '@client/os';
import { menuDef } from '@client/friendly/menu-mobile';
import { getAccounts, addAccount, login } from '@client/account';

export default defineComponent({
	props: {
		defaultHidden: {
			type: Boolean,
			required: false,
			default: false,
		}
	},

	data() {
		return {
			host: host,
			showing: false,
			accounts: [],
			connection: null,
			menuDef: menuDef,
			iconOnly: false,
			hidden: this.defaultHidden,
			isKokonect: null
		};
	},

	computed: {
		menu(): string[] {
			return this.$store.state.menu;
		},

		otherNavItemIndicated(): boolean {
			for (const def in this.menuDef) {
				if (this.menu.includes(def)) continue;
				if (this.menuDef[def].indicated) return true;
			}
			return false;
		},
	},

	watch: {
		$route(to, from) {
			this.showing = false;
		},

		'$store.reactiveState.menuDisplay.value'() {
			this.calcViewState();
		},

		iconOnly() {
			this.$nextTick(() => {
				this.$emit('change-view-mode');
			});
		},

		hidden() {
			this.$nextTick(() => {
				this.$emit('change-view-mode');
			});
		}
	},

	created() {
		window.addEventListener('resize', this.calcViewState);
		this.calcViewState();
	},

	mounted() {
		this.init();
	},

	methods: {
		calcViewState() {
			this.iconOnly = (window.innerWidth <= 1279) || (this.$store.state.menuDisplay === 'sideIcon');
			if (!this.defaultHidden) {
				this.hidden = (window.innerWidth <= 650);
			}
		},

		show() {
			this.showing = true;
		},

		post() {
			os.post_form();
		},

		search() {
			search();
		},

		async openAccountMenu(ev) {
			const storedAccounts = getAccounts().filter(x => x.id !== this.$i.id);
			const accountsPromise = os.api('users/show', { userIds: storedAccounts.map(x => x.id) });

			const accountItemPromises = storedAccounts.map(a => new Promise(res => {
				accountsPromise.then(accounts => {
					const account = accounts.find(x => x.id === a.id);
					if (account == null) return res(null);
					res({
						type: 'user',
						user: account,
						action: () => { this.switchAccount(account); }
					});
				});
			}));

			os.popupMenu([...[{
				type: 'link',
				text: this.$ts.profile,
				to: `/@${ this.$i.username }`,
				avatar: this.$i,
			}, null, ...accountItemPromises, {
				icon: 'fas fa-plus',
				text: this.$ts.addAccount,
				action: () => {
					os.popupMenu([{
						text: this.$ts.existingAccount,
						action: () => { this.addAccount(); },
					}, {
						text: this.$ts.createAccount,
						action: () => { this.createAccount(); },
					}], ev.currentTarget || ev.target);
				},
			}]], ev.currentTarget || ev.target, {
				align: 'left'
			});
		},

		more(ev) {
			os.popup(import('@client/components/launch-pad.vue'), {}, {
			}, 'closed');
		},

		addAccount() {
			os.popup(import('@client/components/signin-dialog.vue'), {}, {
				done: res => {
					addAccount(res.id, res.i);
					os.success();
				},
			}, 'closed');
		},

		createAccount() {
			os.popup(import('@client/components/signup-dialog.vue'), {}, {
				done: res => {
					addAccount(res.id, res.i);
					this.switchAccountWithToken(res.i);
				},
			}, 'closed');
		},

		switchAccount(account: any) {
			const storedAccounts = getAccounts();
			const token = storedAccounts.find(x => x.id === account.id).token;
			this.switchAccountWithToken(token);
		},

		switchAccountWithToken(token: string) {
			login(token);
		},

		patron() {
			window.open("https://www.patreon.com/noridev", "_blank");
		},

		async init() {
			const meta = await os.api('meta', { detail: true });
			this.isKokonect = meta.uri == 'https://kokonect.link' || 'http://localhost:3000';
		}
	}
});
</script>

<style lang="scss" scoped>
.nav-enter-active,
.nav-leave-active {
	opacity: 1;
	transform: translateX(0);
	transition: transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-enter-from,
.nav-leave-active {
	opacity: 0;
	transform: translateX(-240px);
}

.nav-back-enter-active,
.nav-back-leave-active {
	opacity: 1;
	transition: opacity 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
.nav-back-enter-from,
.nav-back-leave-active {
	opacity: 0;
}

.mvcprjjd {
	$ui-font-size: 1em; // TODO: どこかに集約したい
	$nav-width: 250px;
	$nav-icon-only-width: 86px;

	> .nav-back {
		z-index: 1001;
	}

	> .nav {
		$avatar-size: 38px;
		$avatar-margin: 8px;

		flex: 0 0 $nav-width;
		width: $nav-width;
		box-sizing: border-box;

		&.iconOnly {
			flex: 0 0 $nav-icon-only-width;
			width: $nav-icon-only-width;

			&:not(.hidden) {
				> div {
					width: $nav-icon-only-width;

					> .divider {
						margin: 8px auto;
						width: calc(100% - 32px);
					}

					> .item,
						.patron-button {
						padding: 18px 0;
						width: 100%;
						text-align: center;
						font-size: $ui-font-size * 1.1;
						line-height: initial;

						> i,
						> .avatar {
							display: block;
							margin: 0 auto;
						}

						> i {
							opacity: 0.7;
						}

						> .text,
							.patron-text {
							display: none;
						}

						> .patron,
							.not-patron {
							margin: 0;
						}

						&:hover, &.active {
							> i, > .text {
								opacity: 1;
							}
						}

						&:first-child {
							margin-bottom: 8px;
						}

						&:last-child {
							margin-top: 8px;
						}
					}
				}
			}
		}

		&.hidden {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 1001;
		}

		&:not(.hidden) {
			display: block !important;
		}

		> div {
			position: fixed;
			top: 0;
			left: 0;
			z-index: 1001;
			width: $nav-width;
			// ほんとは単に 100vh と書きたいところだが... https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
			height: calc(var(--vh, 1vh) * 100);
			box-sizing: border-box;
			overflow: auto;
			overflow-x: clip;
			background: var(--navBg);

			> .divider {
				margin: 16px 16px;
				border-top: solid 0.5px var(--divider);
			}

			> .about {
				fill: currentColor;
				padding: 8px 0 16px 0;
				text-align: center;
				
				> .link {
					display: block;
					//width: 32px;
					margin: 0 auto;
					
					img {
						display: block;
						width: 100%;
					}

					&:hover {
						text-decoration: none;
					}
				}
			}

			> .item,
				.patron-button {
				position: relative;
				display: block;
				padding: 0 24px;
				font-size: $ui-font-size;
				line-height: 2.85rem;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				width: 100%;
				text-align: left;
				box-sizing: border-box;
				color: var(--navFg);

				> i {
					position: relative;
					width: 32px;
				}

				> i,
				> .avatar {
					margin-right: $avatar-margin;
				}

				> .avatar {
					width: $avatar-size;
					height: $avatar-size;
					vertical-align: middle;
				}

				> .name {
					margin-left: 5px;
					font-weight: bold;
				}

				> .indicator {
					position: absolute;
					bottom: 8px;
					left: 20px;
					color: var(--navIndicator);
					font-size: 7px;
					animation: blink 1s infinite;
				}

				> .text {
					position: relative;
					font-size: 0.9em;
				}

				> .patron,
					.not-patron {
					margin-left: 6px;
					margin-right: 12px;
				}

				> .patron {
					color: var(--patron);
				}

				> .patron-text {
					font-size: 0.9em;
				}

				&:hover {
					text-decoration: none;
					color: var(--navHoverFg);
				}

				&.active {
					color: var(--navActive);
				}

				&:hover, &.active {
					&:before {
						content: "";
						display: block;
						width: calc(100% - 24px);
						height: 100%;
						margin: auto;
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						border-radius: 8px;
						background: var(--accentedBg);
					}
				}

				&:first-child, &:last-child {
					position: sticky;
					z-index: 1;
					padding-top: 8px;
					padding-bottom: 8px;
					background: var(--X14);
					-webkit-backdrop-filter: blur(8px);
					backdrop-filter: blur(8px);
				}

				&:first-child {
					top: 0;
					margin-bottom: 16px;
					border-bottom: solid 0.5px var(--divider);
				}

				&:last-child {
					bottom: 0;
					margin-top: 16px;
					border-top: solid 0.5px var(--divider);
					color: var(--fgOnAccent);

					&:before {
						content: "";
						display: block;
						width: calc(100% - 20px);
						height: calc(100% - 20px);
						margin: auto;
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
						border-radius: 999px;
						background: linear-gradient(90deg, var(--buttonGradateA), var(--buttonGradateB));
					}

					&:hover, &.active {
						&:before {
							background: var(--accentLighten);
						}
					}
				}
			}

			> .patron-button {
				background: unset;
				border: unset;
			}
		}
	}
}
</style>
