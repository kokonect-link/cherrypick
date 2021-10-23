<template>
<div>
	<MkHeader v-if="!isFriendlyUI && !isFriendlyUILegacy" :info="header"/>
	<!-- <MkHeaderCP v-else :info="header"/> -->
	<div class="clupoqwt" v-size="{ min: [800] }">
		<XNotifications class="notifications" @before="before" @after="after" :include-types="includeTypes" :unread-only="tab === 'unread'"/>
	</div>
</div>
</template>

<script lang="ts">
import {computed, ComputedRef, defineComponent} from 'vue';
import Progress from '@client/scripts/loading';
import XNotifications from '@client/components/notifications.vue';
import * as os from '@client/os';
import * as symbols from '@client/symbols';
import { notificationTypes } from '@/types';

export default defineComponent({
	components: {
		XNotifications
	},

	data() {
		return {
			[symbols.PAGE_INFO]: computed(() => {
				type Tab = {
					title?: string | null,
					onClick?: () => void,
					selected?: ComputedRef<boolean> | boolean,
					indicate?: ComputedRef<boolean> | boolean,
				};
				const tabs: Tab[] = [];
				tabs.push({
					active: this.tab === 'all',
					title: this.$ts.all,
					onClick: () => { this.tab = 'all'; },
				});
				tabs.push({
					active: this.tab === 'unread',
					title: this.$ts.unread,
					onClick: () => { this.tab = 'unread'; },
				});
				if (this.isFriendlyUI || this.isFriendlyUILegacy) {
					return {
						title: this.$ts.notifications,
						icon: 'fas fa-bell',
						bg: 'var(--bg)',
						actions: [{
							text: this.$ts.filter,
							icon: 'fas fa-filter',
							highlighted: this.includeTypes != null,
							handler: this.setFilter,
						}, {
							text: this.$ts.markAllAsRead,
							icon: 'fas fa-check',
							handler: () => {
								os.apiWithDialog('notifications/mark-all-as-read');
							},
						}],
						tabs,
					};
				} else {
					return {
						title: this.$ts.notifications,
						icon: 'fas fa-bell',
						bg: 'var(--bg)',
					}
				}
			}),
			tab: 'all',
			includeTypes: null,
			header: computed(() => ({
				title: this.$ts.notifications,
				icon: 'fas fa-bell',
				bg: 'var(--bg)',
				actions: [{
					text: this.$ts.filter,
					icon: 'fas fa-filter',
					highlighted: this.includeTypes != null,
					handler: this.setFilter,
				}, {
					text: this.$ts.markAllAsRead,
					icon: 'fas fa-check',
					handler: () => {
						os.apiWithDialog('notifications/mark-all-as-read');
					},
				}],
				tabs: [{
					active: this.tab === 'all',
					title: this.$ts.all,
					onClick: () => { this.tab = 'all'; },
				}, {
					active: this.tab === 'unread',
					title: this.$ts.unread,
					onClick: () => { this.tab = 'unread'; },
				}]
			})),
			isFriendlyUI: localStorage.getItem('ui') == "friendly",
			isFriendlyUILegacy: localStorage.getItem('ui') == "friendly-legacy",
		};
	},

	methods: {
		before() {
			Progress.start();
		},

		after() {
			Progress.done();
		},

		setFilter(ev) {
			const typeItems = notificationTypes.map(t => ({
				text: this.$t(`_notification._types.${t}`),
				active: this.includeTypes && this.includeTypes.includes(t),
				action: () => {
					this.includeTypes = [t];
				}
			}));
			const items = this.includeTypes != null ? [{
				icon: 'fas fa-times',
				text: this.$ts.clear,
				action: () => {
					this.includeTypes = null;
				}
			}, null, ...typeItems] : typeItems;
			os.popupMenu(items, ev.currentTarget || ev.target);
		}
	}
});
</script>

<style lang="scss" scoped>
.clupoqwt {
	&.min-width_800px {
		background: var(--bg);
		padding: 32px 0;

		> .notifications {
			max-width: 800px;
			margin: 0 auto;
		}
	}
}
</style>
