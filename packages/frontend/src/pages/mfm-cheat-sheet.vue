<!--
SPDX-FileCopyrightText: syuilo and misskey-project & noridev and cherrypick-project
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader v-if="!popup" :actions="headerActions" :tabs="headerTabs"/></template>
	<MkSpacer :contentMax="800">
		<div :class="$style.root">
			<div style="margin-bottom: 30px; padding-bottom: 16px; border-bottom: solid 1px var(--divider);">{{ i18n.ts._mfm.intro }}</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.mention }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.mentionDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_mention"/>
						<MkTextarea v-model="preview_mention" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.hashtag }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.hashtagDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_hashtag"/>
						<MkTextarea v-model="preview_hashtag" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.url }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.urlDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_url"/>
						<MkTextarea v-model="preview_url" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.link }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.linkDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_link"/>
						<MkTextarea v-model="preview_link" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.emoji }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.emojiDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_emoji"/>
						<MkTextarea v-model="preview_emoji" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.bold }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.boldDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_bold"/>
						<MkTextarea v-model="preview_bold" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.small }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.smallDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_small"/>
						<MkTextarea v-model="preview_small" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.quote }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.quoteDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_quote"/>
						<MkTextarea v-model="preview_quote" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.center }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.centerDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_center"/>
						<MkTextarea v-model="preview_center" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.inlineCode }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.inlineCodeDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_inlineCode"/>
						<MkTextarea v-model="preview_inlineCode" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.blockCode }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.blockCodeDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_blockCode"/>
						<MkTextarea v-model="preview_blockCode" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.inlineMath }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.inlineMathDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_inlineMath"/>
						<MkTextarea v-model="preview_inlineMath" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.blockMath }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.blockMathDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_blockMath"/>
						<MkTextarea v-model="preview_blockMath" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.search }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.searchDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_search"/>
						<MkTextarea v-model="preview_search" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.flip }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.flipDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_flip"/>
						<MkTextarea v-model="preview_flip" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.font }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.fontDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_font"/>
						<MkTextarea v-model="preview_font" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.x2 }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.x2Description }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_x2"/>
						<MkTextarea v-model="preview_x2" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.x3 }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.x3Description }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_x3"/>
						<MkTextarea v-model="preview_x3" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.x4 }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.x4Description }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_x4"/>
						<MkTextarea v-model="preview_x4" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.blur }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.blurDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_blur"/>
						<MkTextarea v-model="preview_blur" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.jelly }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.jellyDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_jelly"/>
						<MkTextarea v-model="preview_jelly" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.tada }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.tadaDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_tada"/>
						<MkTextarea v-model="preview_tada" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.jump }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.jumpDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_jump"/>
						<MkTextarea v-model="preview_jump" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.bounce }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.bounceDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_bounce"/>
						<MkTextarea v-model="preview_bounce" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.spin }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.spinDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_spin"/>
						<MkTextarea v-model="preview_spin" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.shake }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.shakeDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_shake"/>
						<MkTextarea v-model="preview_shake" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.twitch }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.twitchDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_twitch"/>
						<MkTextarea v-model="preview_twitch" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.rainbow }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.rainbowDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_rainbow"/>
						<MkTextarea v-model="preview_rainbow" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.sparkle }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.sparkleDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_sparkle"/>
						<MkTextarea v-model="preview_sparkle" :class="$style.text"><span>MFM {{ i18n.ts.sample }}</span></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.fade }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.fadeDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_fade"/>
						<MkTextarea v-model="preview_fade" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.rotate }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.rotateDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_rotate"/>
						<MkTextarea v-model="preview_rotate" :class="$style.text"><span>MFM {{ i18n.ts.sample }}</span></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.position }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.positionDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_position"/>
						<MkTextarea v-model="preview_position" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.scale }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.scaleDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_scale"/>
						<MkTextarea v-model="preview_scale" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.fg }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.fgDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_fg"/>
						<MkTextarea v-model="preview_fg" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.bg }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.bgDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_bg"/>
						<MkTextarea v-model="preview_bg" :class="$style.text"><template #label>MFM {{ i18n.ts.sample }}</template></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.plain }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.plainDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_plain"/>
						<MkTextarea v-model="preview_plain" :class="$style.text"><span>MFM {{ i18n.ts.sample }}</span></MkTextarea>
					</div>
				</div>
			</div>
			<div :class="$style.section">
				<div :class="$style.title">{{ i18n.ts._mfm.ruby }}</div>
				<div :class="$style.content">
					<p>{{ i18n.ts._mfm.rubyDescription }}</p>
					<div :class="$style.preview">
						<Mfm :text="preview_ruby"/>
						<MkTextarea v-model="preview_ruby" :class="$style.text"><span>MFM {{ i18n.ts.sample }}</span></MkTextarea>
					</div>
				</div>
			</div>
		</div>
		<div :class="$style.section">
			<div :class="$style.title">{{ i18n.ts._mfm.border }}</div>
			<div :class="$style.content">
				<p>{{ i18n.ts._mfm.borderDescription }}</p>
				<div :class="$style.preview">
					<Mfm :text="preview_border"/>
					<MkTextarea v-model="preview_border" :class="$style.text"><span>MFM {{ i18n.ts.sample }}</span></MkTextarea>
				</div>
			</div>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import MkTextarea from '@/components/MkTextarea.vue';
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';
import { customEmojis } from '@/custom-emojis.js';

defineProps<{
  popup?: boolean;
}>();

const preview_mention = ref('@example');
const preview_hashtag = ref('#test');
const preview_url = ref('https://example.com');
const preview_link = ref(`[${i18n.ts._mfm.dummy}](https://example.com)`);
const preview_emoji = ref(customEmojis.value.length ? `:${customEmojis.value[0].name}:` : ':emojiname:');
const preview_bold = ref(`**${i18n.ts._mfm.dummy}**`);
const preview_small = ref(`<small>${i18n.ts._mfm.dummy}</small>`);
const preview_center = ref(`<center>${i18n.ts._mfm.dummy}</center>`);
const preview_inlineCode = ref('`<: "Hello, world!"`');
const preview_blockCode = ref('```\n~ (#i, 100) {\n\t<: ? ((i % 15) = 0) "FizzBuzz"\n\t\t.? ((i % 3) = 0) "Fizz"\n\t\t.? ((i % 5) = 0) "Buzz"\n\t\t. i\n}\n```');
const preview_inlineMath = ref('\\(x= \\frac{-b\' \\pm \\sqrt{(b\')^2-ac}}{a}\\)');
const preview_blockMath = ref('\\(x=0\\\\ y=1\\\\ z=2\\)');
const preview_quote = ref(`> ${i18n.ts._mfm.dummy}`);
const preview_search = ref(`${i18n.ts._mfm.dummy} 検索\n${i18n.ts._mfm.dummy} 검색\n${i18n.ts._mfm.dummy} search`);
const preview_jelly = ref('$[jelly 🍮] $[jelly.speed=5s 🍮]');
const preview_tada = ref('$[tada 🍮] $[tada.speed=5s 🍮]');
const preview_jump = ref('$[jump 🍮] $[jump.speed=5s 🍮]');
const preview_bounce = ref('$[bounce 🍮] $[bounce.speed=5s 🍮]');
const preview_shake = ref('$[shake 🍮] $[shake.speed=5s 🍮]');
const preview_twitch = ref('$[twitch 🍮] $[twitch.speed=5s 🍮]');
const preview_spin = ref('$[spin 🍮] $[spin.left 🍮] $[spin.alternate 🍮]\n$[spin.x 🍮] $[spin.x,left 🍮] $[spin.x,alternate 🍮]\n$[spin.y 🍮] $[spin.y,left 🍮] $[spin.y,alternate 🍮]\n\n$[spin.speed=5s 🍮]');
const preview_flip = ref(`$[flip ${i18n.ts._mfm.dummy}]\n$[flip.v ${i18n.ts._mfm.dummy}]\n$[flip.h,v ${i18n.ts._mfm.dummy}]`);
const preview_font = ref(`$[font.serif ${i18n.ts._mfm.dummy}]\n$[font.monospace ${i18n.ts._mfm.dummy}]\n$[font.cursive ${i18n.ts._mfm.dummy}]\n$[font.fantasy ${i18n.ts._mfm.dummy}]`);
const preview_x2 = ref('$[x2 🍮]');
const preview_x3 = ref('$[x3 🍮]');
const preview_x4 = ref('$[x4 🍮]');
const preview_blur = ref(`$[blur ${i18n.ts._mfm.dummy}]`);
const preview_rainbow = ref('$[rainbow 🍮] $[rainbow.speed=5s 🍮]');
const preview_sparkle = ref('$[sparkle 🍮]');
const preview_fade = ref('$[fade 🍮] $[fade.speed=1.5s 🍮]');
const preview_rotate = ref('$[rotate.deg=90 🍮]');
const preview_position = ref('$[position.x=1 🍮]\n$[position.y=-1 🍮]\n\n$[position.x=3,y=-3 🍮]');
const preview_scale = ref('$[scale.x=2 🍮]\n$[scale.y=2 🍮]\n\n$[scale.x=2.5,y=2 🍮]');
const preview_fg = ref('$[fg.color=ffbcdc Cherry]$[fg.color=b1d3ff Pick]');
const preview_bg = ref('$[bg.color=ffbcdc Cherry]$[bg.color=b1d3ff Pick]');
const preview_plain = ref('<plain>**bold** @mention #hashtag `code` $[x2 🍮]</plain>');
const preview_ruby = ref('$[ruby CherryPick Misskey]');
const preview_border = ref('$[border Example]\n$[border.color=ffbcdc Cherry]$[border.color=b1d3ff Pick]\n\n$[border $[position.x=1.5 MFM]\n$[position.x=1.5 なんもわからん]]\n$[border.noclip $[position.x=1.5 MFM]\n$[position.x=1.5 完全に理解した]]\n\n$[border.radius=4 角丸の半径] $[border.width=4 枠線の太さ]\n$[border.style=solid これが普通]\n$[border.style=hidden 枠線を隠せる]\n$[border.style=dotted ドット]\n$[border.style=dashed 点線]\n$[border.style=double 二重枠]\n\n$[border.style=groove 額縁1]\n$[border.style=ridge 額縁2]\n\n$[border.style=inset インセット]\n$[border.style=outset アウトセット]\n\n$[border.radius=8,width=4,color=b1d3ff,style=dotted,noclip $[position.x=1.5 ボーダーMFM]\n$[position.x=1.5 完全に理解した]]');

const headerActions = computed(() => []);

const headerTabs = computed(() => []);

definePageMetadata(() => ({
	title: i18n.ts._mfm.cheatSheet,
	icon: 'ti ti-help-circle',
}));
</script>

<style lang="scss" module>
.root {
	background: var(--bg);
}

.section {
	&:not(:last-child) {
		margin-bottom: 30px;
	}
}

.title {
	position: sticky;
	z-index: 1;
	top: var(--stickyTop, 0px);
	padding: 16px;
	font-weight: bold;
	-webkit-backdrop-filter: var(--blur, blur(10px));
	backdrop-filter: var(--blur, blur(10px));
	background-color: var(--X16);
}

.content {
	> p {
		margin: 0;
		padding: 16px;
	}
}

.preview {
	border-top: solid 0.5px var(--divider);
	padding: 16px;
}

.text {
	padding: 12px 0 8px;
}
</style>
