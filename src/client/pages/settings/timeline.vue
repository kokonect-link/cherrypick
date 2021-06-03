<template>
<FormBase>
	<FormGroup>
		<FormSwitch v-model:value="$i.injectFeaturedNote" @update:value="onChangeInjectFeaturedNote">
			{{ $ts.showFeaturedNotesInTimeline }}
		</FormSwitch>
		<FormSwitch v-model:value="injectUnlistedNoteInLTL">
			{{ $ts.showUnlistedNotesInLTL }}
			<template #desc>{{ $ts.showUnlistedNotesInLTLDesc }}</template>
		</FormSwitch>
	</FormGroup>
	<FormGroup>
		<div class="_formItem _formPanel" style="padding: 16px;">
			<h2>{{ $ts.pinnedTimeline }}</h2>
			<div class="_caption" v-if="items.length > 0" style="padding-bottom: 8px;">{{ $ts.pinnedTimelineDescription }}</div>
			<XDraggable class="vmievna2" v-model="items" :item-key="item => item" animation="150" delay="100" delay-on-touch-only="true">
				<template #item="{element: item}">
					<div class="item">
						<i class="fa-fw" :class="timelineMenuMap[item].icon" />
						{{ timelineMenuMap[item].name }}
						<div class="del" @click="del(item)"><i class="fas fa-times" /></div>
					</div>
				</template>
			</XDraggable>
			<div class="_caption" style="padding: 8px 0;">{{ $t(otherItems.length > 0 ? 'pinnedTimelineDescription2' : 'pinnedTimelineEverything') }}</div>
			<div class="otherItem" v-for="item in otherItems" :key="item" @click="add(item)">
				<i class="fa-fw" :class="timelineMenuMap[item].icon" />
				{{ timelineMenuMap[item].name }}
			</div>
		</div>
	</FormGroup>
	<FormButton @click="reset" danger><i class="fas fa-redo"/>{{ $ts.default }}</FormButton>
</FormBase>
</template>

<script lang="ts">
import { defineAsyncComponent, defineComponent } from 'vue';
import FormGroup from '@client/components/form/group.vue';
import FormSwitch from '@client/components/form/switch.vue';
import FormBase from '@client/components/form/base.vue';
import FormButton from '@client/components/form/button.vue';
import { timelineMenuMap, timelineMenuSources } from '@client/friendly/timeline';
import { defaultStore } from '@client/store';
import * as os from '@client/os';
import { unisonReload } from '@client/scripts/unison-reload';
import * as symbols from '@client/symbols';

export default defineComponent({
	components: {
		FormBase,
		FormSwitch,
		FormGroup,
		FormButton,
		XDraggable: defineAsyncComponent(() => import('vuedraggable').then(x => x.default)),
	},

	data() {
		return {
			[symbols.PAGE_INFO]: {
				title: this.$ts.timeline,
				icon: 'fas fa-stream'
			},
			items: this.$store.state.timelineTabItems.filter(it => it != null),
			changed: false,
			timelineMenuMap
		}
	},

	computed: {
		otherItems() {
			return timelineMenuSources.filter(m => !this.items.includes(m));
		},

		injectUnlistedNoteInLTL: defaultStore.makeGetterSetter('injectUnlistedNoteInLTL'),
	},

	watch: {
		items: {
			handler() {
				this.$store.set('timelineTabItems', [...this.items]);
			},
			deep: true,
		},
		injectUnlistedNoteInLTL() {
			this.reloadAsk();
		},
	},

	mounted() {
		this.$emit('info', this[symbols.PAGE_INFO]);
	},

	methods: {
		async reloadAsk() {
			const { canceled } = await os.dialog({
				type: 'info',
				text: this.$ts.reloadToApplySetting,
				showCancelButton: true
			});
			if (canceled) return;

			unisonReload();
		},
		onChangeInjectFeaturedNote(v) {
			os.api('i/update', {
				injectFeaturedNote: v
			});
		},
		add(item: string) {
			if (this.items.includes(item)) return;
			this.items = [...this.items, item];
		},
		del(item: string) {
			this.items = this.items.filter(it => it !== item);
		},
		reset() {
			this.$store.reset('timelineTabItems');
			this.items = this.$store.state.timelineTabItems.filter(it => it != null);
		},
	}
});
</script>

<style lang="scss" scoped>
.vmievna2 {
	display: flex;
	flex-direction: column;
}

.item, .otherItem {
	display: flex;
	align-items: center;
	border: solid 1px var(--divider);
	border-bottom: none;
	cursor: move;

	> .icon {
		margin: 0 8px;
	}

	> .del {
		display: flex;
		align-items: center;
		color: var(--error);
		justify-content: center;
		margin-left: auto;
		cursor: pointer;
		width: 36px;
		height: 36px;
	}

	&:last-child {
		border-bottom: solid 1px var(--divider);
	}
}

.otherItem {
	cursor: pointer;
	height: 36px;
}
</style>
