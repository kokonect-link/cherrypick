<template>
<div class="npcljfve" :class="{ iconOnly }">
	<transition name="nav-back">
		<div class="nav-back _modalBg"
			v-if="showing"
			@click="showing = isAccountMenuMode = false"
			@touchstart.passive="showing = isAccountMenuMode = false"
		></div>
	</transition>

	<transition name="nav">
		<nav class="nav">
			<div class="profile">
				<button v-if="!iconOnly" class="item _button account" @click="openProfile">
					<MkAvatar :user="$i" class="avatar"/><MkUserName class="name" :user="$i"/>
				</button>
				<button v-if="iconOnly" class="item _button account" @click="openAccountMenu">
					<MkAvatar :user="$i" class="avatar"/><MkUserName class="name" :user="$i"/>
				</button>
				<button v-else class="_button toggler" @click="toggleMenuMode">
					<i v-if="isAccountMenuMode" class="fas fa-chevron-up"/>
					<i v-else class="fas fa-chevron-down"/>
				</button>
			</div>
			<template v-if="!isAccountMenuMode">
				<div class="post" @click="post">
					<MkButton class="button" gradate full rounded>
						<i class="fas fa-pencil-alt fa-fw"></i><span class="text" v-if="!iconOnly">{{ $ts.note }}</span>
					</MkButton>
				</div>
				<div class="divider"></div>
				<MkA class="item index" active-class="active" to="/" exact v-click-anime>
					<i class="fas fa-home fa-fw"></i><span class="text">{{ $ts.timeline }}</span>
				</MkA>
				<template v-for="item in menu">
					<div v-if="item === '-'" class="divider"></div>
					<component v-else-if="menuDef[item] && (menuDef[item].show !== false)" :is="menuDef[item].to ? 'MkA' : 'button'" class="item _button" :class="item" active-class="active" v-on="menuDef[item].action ? { click: menuDef[item].action } : {}" :to="menuDef[item].to" v-click-anime>
						<i class="fa-fw" :class="menuDef[item].icon"></i><span class="text">{{ $ts[menuDef[item].title] }}</span>
						<span v-if="menuDef[item].indicated" class="indicator"><i class="fas fa-circle"></i></span>
					</component>
				</template>
				<div class="divider"></div>
				<MkA v-if="$i.isAdmin || $i.isModerator" class="item" active-class="active" to="/admin" :behavior="settingsWindowed ? 'modalWindow' : null" v-click-anime>
					<i class="fas fa-server fa-fw"></i><span class="text">{{ $ts.instance }}</span>
				</MkA>
				<button class="item _button" @click="more" v-click-anime>
					<i class="fas fa-ellipsis-h fa-fw"></i><span class="text">{{ $ts.more }}</span>
					<span v-if="otherNavItemIndicated" class="indicator"><i class="fas fa-circle"></i></span>
				</button>
				<MkA class="item" active-class="active" to="/settings" :behavior="settingsWindowed ? 'modalWindow' : null" v-click-anime>
					<i class="fas fa-cog fa-fw"></i><span class="text">{{ $ts.settings }}</span>
				</MkA>
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
							<p v-if="iconOnly" style="font-size:10px;"><b><span style="color: var(--cherry);">KOKO</span><br/><span style="color: var(--pick);">NECT</span></b></p>
							<p v-else style="font-size:10px;"><b><span style="color: var(--cherry);">KOKO</span><span style="color: var(--pick);">NECT</span></b></p>
						</template>
						<template v-else>
							<img :src="$instance.iconUrl || $instance.faviconUrl || '/favicon.ico'" class="_ghost"/>
						</template>
					</MkA>
				</div>
				<!--<MisskeyLogo class="misskey"/>-->
			</template>
			<template v-else>
				<button v-for="acct in accounts" :key="acct.id" @click="switchAccount(acct)" class="item-switch-acct _button account" v-click-anime>
					<MkAvatar :user="acct" class="avatar"/><MkUserName class="name" :user="acct"/>
				</button>
				<MkEllipsis v-if="loadingAccounts" class="item-switch-acct" />
				<div class="divider"></div>
				<button class="item-switch-acct _button" @click="openDrawerAccountMenu"><i class="fas fa-plus"></i>{{ $ts.addAccount }}</button>
				<button class="item-switch-acct danger _button" @click="openSignoutMenu"><i class="fas fa-sign-out-alt"></i>{{ $ts.logout }}</button>
			</template>
		</nav>
	</transition>
</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { host } from '@client/config';
import { search } from '@client/scripts/search';
import * as os from '@client/os';
import { menuDef } from '@client/menu';
import { getAccounts, addAccount, login, signout, signoutAll } from '@client/account';
import MkButton from '@client/components/ui/button.vue';
import { StickySidebar } from '@client/scripts/sticky-sidebar';
import MisskeyLogo from '@/../assets/client/misskey.svg';

export default defineComponent({
	components: {
		MkButton,
		MisskeyLogo,
	},

	data() {
		return {
			host: host,
			accounts: [],
			connection: null,
			menuDef: menuDef,
			iconOnly: false,
			settingsWindowed: false,
			isAccountMenuMode: false,
			loadingAccounts: false,
			showing: false,
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
			this.isAccountMenuMode = false;
			this.$nextTick(() => {
				this.$emit('change-view-mode');
			});
		},
	},

	created() {
		window.addEventListener('resize', this.calcViewState);
		this.calcViewState();
	},

	mounted() {
		const sticky = new StickySidebar(this.$el.parentElement, 16);
		window.addEventListener('scroll', () => {
			sticky.calc(window.scrollY);
		}, { passive: true });

		this.init();
	},

	methods: {
		calcViewState() {
			this.iconOnly = (window.innerWidth <= 1400) || (this.$store.state.menuDisplay === 'sideIcon');
			this.settingsWindowed = (window.innerWidth > 1400);
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

		openProfile() {
			this.$router.push({ path: `/@${ this.$i.username }` })
		},

		async fetchAccounts() {
			this.loadingAccounts = true;
			this.accounts = await os.getAccounts();
			this.loadingAccounts = false;
		},

		toggleMenuMode() {
			this.isAccountMenuMode = !this.isAccountMenuMode;
			if (this.isAccountMenuMode) {
				this.fetchAccounts();
			}
		},

		async openAccountMenu(ev) {
			const storedAccounts = await getAccounts().then(accounts => accounts.filter(x => x.id !== this.$i.id));
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
				text: this.$ts.addAccount,
				icon: 'fas fa-plus',
				action: () => {
					os.popupMenu([{
						text: this.$ts.existingAccount,
						action: () => { this.addAccount(); },
					}, {
						text: this.$ts.createAccount,
						action: () => { this.createAccount(); },
					}], ev.currentTarget || ev.target);
				},
			}, {
				text: this.$ts.logout,
				icon: 'fas fa-sign-out-alt',
				action: () => {
					os.popupMenu([{
						text: this.$ts.logout,
						action: () => { this.signout(); },
						danger: true,
					}, {
						text: this.$ts.logoutAll,
						action: () => { this.signoutAll(); },
						danger: true,
					}], ev.currentTarget || ev.target);
				},
				danger: true,
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

		async switchAccount(account: any) {
			const storedAccounts = await getAccounts();
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
		},

		async openDrawerAccountMenu(ev) {
			os.popupMenu([...[{
				text: this.$ts.existingAccount,
				action: () => { this.addAccount(); },
			}, {
				text: this.$ts.createAccount,
				action: () => { this.createAccount(); },
			}]], ev.currentTarget || ev.target, {
				align: 'left'
			});
		},

		async openSignoutMenu(ev) {
			os.popupMenu([...[{
				text: this.$ts.logout,
				action: () => { this.signout(); },
				danger: true,
			}, {
				text: this.$ts.logoutAll,
				action: () => { this.signoutAll(); },
				danger: true,
			}]], ev.currentTarget || ev.target, {
				align: 'left'
			});
		},

		signout,
		signoutAll,
	}
});
</script>

<style lang="scss" scoped>
.npcljfve {
	$ui-font-size: 1em; // TODO: どこかに集約したい
	$nav-icon-only-width: 78px; // TODO: どこかに集約したい
	$avatar-size: 46px;
	$avatar-margin: 8px;

	padding: 0 16px;
	box-sizing: border-box;
	width: 260px;

	&.iconOnly {
		flex: 0 0 $nav-icon-only-width;
		width: $nav-icon-only-width !important;

		> .nav {
			> .divider {
				margin: 8px auto;
				width: calc(100% - 32px);
			}

			> .post {
				> .button {
					width: 46px;
					height: 46px;
					padding: 0;
				}

				@media (max-width: (850px)) {
					display: none;
				}
			}

			> .item,
				.patron-button {
				padding-left: 0;
				width: 100%;
				text-align: center;
				font-size: $ui-font-size * 1.1;
				line-height: 3.7rem;
				overflow: unset;

				> i,
				> .avatar {
					margin-right: 0;
				}

				> i {
					left: 10px;
				}

				> .text,
					.name,
					.patron-text {
					display: none;
				}

				> .indicator {
					position: absolute;
					top: unset;
					bottom: 11px;
					left: 33px;
					color: var(--navIndicator);
					font-size: 7px;
					animation: blink 1s infinite;
				}

				> .patron,
				.not-patron {
					margin: 0;
				}
			}
		}
	}

	> .nav {
		> .divider {
			margin: 10px 0;
			border-top: solid 0.5px var(--divider);
		}

		> .post {
			position: sticky;
			top: 65px;
			z-index: 1;
			padding: 16px 0;
			background: var(--bg);

			> .button {
				min-width: 0;
			}
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
					color: var(--navHoverFg);
				}
			}
		}

		> .item,
			.patron-button {
			position: relative;
			display: block;
			font-size: $ui-font-size;
			line-height: 2.6rem;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			width: 100%;
			text-align: left;
			box-sizing: border-box;

			> i {
				width: 32px;
				margin-left: 3px;
				margin-right: $avatar-margin;
			}

			> .avatar {
				margin-left: unset;
				margin-right: $avatar-margin;
				width: $avatar-size;
				height: $avatar-size;
				vertical-align: middle;
			}

			> .name {
				margin-left: 10px;
				font-weight: bold;
			}

			> .indicator {
				position: absolute;
				bottom: 10px;
				left: 0;
				color: var(--navIndicator);
				font-size: 7px;
				animation: blink 1s infinite;
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
		}

		> .item-switch-acct {
			position: relative;
			display: block;
			font-size: $ui-font-size;
			line-height: 3rem;
			text-overflow: ellipsis;
			overflow: hidden;
			white-space: nowrap;
			width: 100%;
			text-align: left;
			box-sizing: border-box;
			padding-left: 12px;

			> i {
				width: 32px;
				margin-left: 3px;
				margin-right: $avatar-margin;
			}

			> .avatar {
				margin-left: unset;
				margin-right: $avatar-margin;
				width: $avatar-size;
				height: $avatar-size;
				vertical-align: middle;
			}

			> .name {
				margin-left: 10px;
				font-weight: bold;
			}

			&:hover {
				text-decoration: none;
				color: var(--navHoverFg);
			}

			&.active {
				color: var(--navActive);
			}

			&.danger {
				color: red;
			}
		}

		> .patron-button {
			background: unset;
			border: unset;
		}

		> .profile {
			position: sticky;
			top: 0;
			z-index: 2;
			background: var(--bg);
			padding: 10px 0 0 0;

			> .item {
				position: relative;
				display: block;
				font-size: $ui-font-size;
				line-height: 2.6rem;
				text-overflow: ellipsis;
				overflow: hidden;
				white-space: nowrap;
				width: 100%;
				text-align: left;
				box-sizing: border-box;

				> i {
					width: 32px;
					margin-left: 3px;
					margin-right: $avatar-margin;
				}

				> .avatar {
					margin-left: unset;
					margin-right: $avatar-margin;
					width: $avatar-size;
					height: $avatar-size;
					vertical-align: middle;
				}

				> .name {
					margin-left: 10px;
					font-weight: bold;
				}

				&.active {
					color: var(--navActive);
				}

				&:hover {
					text-decoration: none;
					color: var(--navHoverFg);
				}
			}

			> .account {
				padding: 10px 20px 0 0;
			}

			> .toggler {
				position: absolute;
				right: 0;
				top: 25px;
				width: 36px;
				height: 36px;
				z-index: 400;
			}
		}

		> .account {
			padding: 20px 0 0;
		}
	}
}
</style>
