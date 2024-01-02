/*
 * SPDX-FileCopyrightText: syuilo and other misskey, cherrypick contributors
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Ref, nextTick } from 'vue';
import * as os from '@/os.js';
import { MFM_TAGS, HTML_TAGS } from '@/const.js';

/**
 * MFMの装飾のリストを表示する
 */
export function mfmFunctionPicker(src: any, textArea: HTMLInputElement | HTMLTextAreaElement, textRef: Ref<string>) {
	return new Promise((res, rej) => {
		os.popupMenu([{
			type: 'label',
		}, ...getHTMLFunctionList(textArea, textRef)
		, { type: 'divider' }
		, ...getMFMFunctionList(textArea, textRef)], src);
	});
}

function getHTMLFunctionList(textArea: HTMLInputElement | HTMLTextAreaElement, textRef: Ref<string>) : object[] {
	const ret: object[] = [];
	HTML_TAGS.forEach(tag => {
		ret.push({
			text: tag,
			icon: tag === 'bold' ? 'ti ti-bold' : tag === 'strike' ? 'ti ti-strikethrough' : tag === 'italic' ? 'ti ti-italic' : tag === 'small' ? 'ti ti-text-decrease' : tag === 'center' ? 'ti ti-align-center' : tag === 'plain' ? 'ti ti-clear-formatting' : tag === 'inlinecode' ? 'ti ti-code' : tag === 'blockcode' ? 'ti ti-script' : tag === 'mathinline' ? 'ti ti-math' : tag === 'mathblock' ? 'ti ti-math-function' : 'ti ti-icons',
			action: () => add(textArea, textRef, tag),
		});
	});
	return ret;
}

function getMFMFunctionList(textArea: HTMLInputElement | HTMLTextAreaElement, textRef: Ref<string>) : object[] {
	const ret: object[] = [];
	MFM_TAGS.forEach(tag => {
		ret.push({
			text: tag,
			icon: 'ti ti-icons',
			action: () => add(textArea, textRef, tag),
		});
	});
	return ret;
}

function add(textArea: HTMLInputElement | HTMLTextAreaElement, textRef: Ref<string>, type: string) {
	const caretStart: number = textArea.selectionStart as number;
	const caretEnd: number = textArea.selectionEnd as number;

	MFM_TAGS.forEach(tag => {
		if (type === tag) {
			if (caretStart === caretEnd) {
				// 単純にFunctionを追加
				textRef.value = `${textRef.value.substring(0, caretStart)}$[${type} ]${textRef.value.substring(caretEnd)}`;
			} else {
				// 選択範囲を囲むようにFunctionを追加
				textRef.value = `${textRef.value.substring(0, caretStart)}$[${type} ${textRef.value.substring(caretStart, caretEnd)}]${textRef.value.substring(caretEnd)}`;
			}
		}
	});

	HTML_TAGS.forEach(tag => {
		if (type === tag) {
			if (caretStart === caretEnd) {
				// 単純にFunctionを追加
				if (tag === 'bold') textRef.value = `${textRef.value.substring(0, caretStart)}<b></b>${textRef.value.substring(caretEnd)}`;
				if (tag === 'strike') textRef.value = `${textRef.value.substring(0, caretStart)}~~~~${textRef.value.substring(caretEnd)}`;
				if (tag === 'italic') textRef.value = `${textRef.value.substring(0, caretStart)}<i></i>${textRef.value.substring(caretEnd)}`;
				if (tag === 'small') textRef.value = `${textRef.value.substring(0, caretStart)}<small></small>${textRef.value.substring(caretEnd)}`;
				if (tag === 'center') textRef.value = `${textRef.value.substring(0, caretStart)}<center></center>${textRef.value.substring(caretEnd)}`;
				if (tag === 'plain') textRef.value = `${textRef.value.substring(0, caretStart)}<plain></plain>${textRef.value.substring(caretEnd)}`;
				if (tag === 'inlinecode') textRef.value = textRef.value.substring(0, caretStart) + '``' + textRef.value.substring(caretEnd);
				if (tag === 'inlineblock') textRef.value = textRef.value.substring(0, caretStart) + '```' + '\n' + '\n' + '```' + textRef.value.substring(caretEnd);
				if (tag === 'mathinline') textRef.value = textRef.value.substring(0, caretStart) + '\\(\\)' + textRef.value.substring(caretEnd);
				if (tag === 'mathblock') textRef.value = textRef.value.substring(0, caretStart) + '\\(\\\\ \\)' + textRef.value.substring(caretEnd);
			} else {
				// 選択範囲を囲むようにFunctionを追加
				if (tag === 'bold') textRef.value = `${textRef.value.substring(0, caretStart)}<b>${textRef.value.substring(caretStart, caretEnd)}</b>${textRef.value.substring(caretEnd)}`;
				if (tag === 'strike') textRef.value = `${textRef.value.substring(0, caretStart)}~~${textRef.value.substring(caretStart, caretEnd)}~~${textRef.value.substring(caretEnd)}`;
				if (tag === 'italic') textRef.value = `${textRef.value.substring(0, caretStart)}<i>${textRef.value.substring(caretStart, caretEnd)}</i>${textRef.value.substring(caretEnd)}`;
				if (tag === 'small') textRef.value = `${textRef.value.substring(0, caretStart)}<small>${textRef.value.substring(caretStart, caretEnd)}</small>${textRef.value.substring(caretEnd)}`;
				if (tag === 'center') textRef.value = `${textRef.value.substring(0, caretStart)}<center>${textRef.value.substring(caretStart, caretEnd)}</center>${textRef.value.substring(caretEnd)}`;
				if (tag === 'plain') textRef.value = `${textRef.value.substring(0, caretStart)}<plain>${textRef.value.substring(caretStart, caretEnd)}</plain>${textRef.value.substring(caretEnd)}`;
				if (tag === 'inlinecode') textRef.value = textRef.value.substring(0, caretStart) + '`' + textRef.value.substring(caretStart, caretEnd) + '`' + textRef.value.substring(caretEnd);
				if (tag === 'inlineblock') textRef.value = textRef.value.substring(0, caretStart) + '```' + '\n' + textRef.value.substring(caretStart, caretEnd) + '\n' + '```' + textRef.value.substring(caretEnd);
				if (tag === 'mathinline') textRef.value = textRef.value.substring(0, caretStart) + '\\(' + textRef.value.substring(caretStart, caretEnd) + '\\)' + textRef.value.substring(caretEnd);
				if (tag === 'mathblock') textRef.value = textRef.value.substring(0, caretStart) + '\\(' + textRef.value.substring(caretStart, caretEnd) + '\\\\ \\)' + textRef.value.substring(caretEnd);
			}
		}
	});

	const caretArray = (
		type.includes('bold')
			? -1
			: type.includes('strike')
				?	-4
				: type.includes('italic')
					? -3
					: type.includes('small') || type.includes('center') || type.includes('plain')
						? 2
						: type.includes('inlinecode')
							? -9
							: type.includes('inlineblock')
								? -5
								: type.includes('mathinline')
									? -8
									: type.includes('mathblock')
										? -7
										: 3
	);
	const nextCaretStart: number = caretStart + caretArray + type.length;
	const nextCaretEnd: number = caretEnd + caretArray + type.length;

	// キャレットを戻す
	nextTick(() => {
		textArea.focus();
		textArea.setSelectionRange(nextCaretStart, nextCaretEnd);
	});
}
