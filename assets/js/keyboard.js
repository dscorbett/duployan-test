/*
Copyright 2021 Google LLC
Copyright 2023-2024 David Corbett

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

'use strict';

const autotransliteration = document.querySelector('#autotransliteration');
const autosyllabification = document.querySelector('#autosyllabification');
const infoPlaceholder = document.querySelector('#info-placeholder');
const outputText = document.querySelector('#output');
const inputText = document.createElement('textarea');

window.addEventListener('load', () => {
    outputText.style.height = window.getComputedStyle(outputText).height;
    outputText.textContent = '';

    console.groupCollapsed('Validate keycap hints');
    document.querySelectorAll('#keyboard .hint').forEach(hint => {
        const prefix = hint.dataset.prefix ?? '';
        const suffix = hint.dataset.suffix ?? '';
        const keycap = hint.parentNode.firstChild;
        const parentValue = transliterate(prefix) + extract(keycap) + transliterate(suffix);
        const hintValue = transliterate(prefix + extract(hint) + suffix);
        if (parentValue !== hintValue) {
            console.warn('Hint %s does not match keycap %s for %o', hintValue, parentValue, keycap);
            hint.remove();
        }
    });
    console.groupEnd();

    console.groupCollapsed('Transliterate static strings');
    document.querySelectorAll('.to-transliterate').forEach(node => {
        node.classList.remove('to-transliterate');
        node.classList.add('Dupl');
        node.textContent = transliterate(extract(node));
    });
    console.groupEnd();

    document.querySelectorAll('#keyboard .info').forEach(info => {
        const infoIcon = document.createElement('span');
        infoIcon.classList.add('info-icon');
        info.parentNode.insertBefore(infoIcon, info.nextSibling);
    });
});

function protectWhiteSpace(text) {
    return text.replaceAll(/[\t\n\r ]/g, '$&\u034F\u034F\u034F');
}

function extract(node) {
    function extract(node) {
        return [...node.childNodes].reduce(
            (text, child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const trimmedContent = child.textContent.trim();
                    text += trimmedContent || child.textContent;
                }
                return text;
            },
            '');
    }

    return protectWhiteSpace(node.dataset.string ?? extract(node));
}

function setSelectionRange(element, start, end) {
    if (element.nodeName === 'TEXTAREA') {
        element.setSelectionRange(start, end);
    } else {
        const range = document.createRange();
        range.selectNodeContents(element);
        const textNode = element.firstChild;
        if (textNode !== null) {
            range.setStart(textNode, start);
            range.setEnd(textNode, end);
        }
        const selection = window.getSelection();
        selection.removeAllRanges()
        selection.addRange(range);
    }
}

function scrollToCursor(start, end) {
    if (window.getSelection().rangeCount !== 0) {
        const innerHTML = outputText.innerHTML;
        outputText.innerHTML = outputText.textContent.substring(0, previousOutputSelectionStart) + '<br id="scrollTarget">' + outputText.textContent.substring(previousOutputSelectionEnd);
        const scrollTarget = document.querySelector('#scrollTarget');
        scrollTarget.scrollIntoView({block: 'end'});
        scrollTarget.remove();
        outputText.innerHTML = innerHTML;
        setSelectionRange(outputText, start, end);
    }
}

function type(element, text) {
    let valueBefore;
    let valueAfter;
    if (element.nodeName === 'TEXTAREA') {
        valueBefore = element.value.substring(0, element.selectionStart) + text;
        valueAfter = element.value.substring(element.selectionEnd);
        element.value = valueBefore + valueAfter;
    } else {
        const range = getOutputTextRange();
        if (range !== null && outputText === element) {
            valueBefore = element.textContent.substring(0, range.startOffset) + text;
            valueAfter = element.textContent.substring(range.endOffset);
        } else {
            valueBefore = element.textContent + text;
            valueAfter = '';
        }
        element.textContent = valueBefore + valueAfter;
    }
    const newPosition = valueBefore.length;
    setSelectionRange(element, newPosition, newPosition);
}

document.querySelectorAll('#keyboard > *').forEach(key => key.addEventListener('click', e => {
    e.preventDefault();
    type(outputText, extract(key.firstChild));
    resetInput();
    outputText.focus();
    scrollToCursor(getOutputSelectionStart(), getOutputSelectionEnd());
}));

document.querySelectorAll('#keyboard .info').forEach(info => {
    info.parentNode.addEventListener('mouseenter', e => {
        const infoClone = info.cloneNode(true);
        infoClone.classList.remove('info');
        infoClone.id = 'current-info';
        infoPlaceholder.parentNode.insertBefore(infoClone, infoPlaceholder);
    });
    info.parentNode.addEventListener('mouseleave', e => {
        const currentInfo = document.querySelector('#current-info');
        if (currentInfo) {
            currentInfo.remove();
        }
    });
});

function getOutputTextRange() {
    const selection = window.getSelection();
    if (selection.rangeCount !== 0) {
        const range = selection.getRangeAt(0);
        const ancestor = range.commonAncestorContainer;
        if (ancestor === outputText && range.startOffset === 0 && range.endOffset === 1) {
            setSelectionRange(outputText, 0, outputText.textContent.length);
            return window.getSelection().getRangeAt(0);
        } else if (ancestor === outputText && range.startOffset === 0 && range.endOffset === 0) {
            setSelectionRange(outputText, 0, 0);
            return window.getSelection().getRangeAt(0);
        } else if (ancestor.parentNode === outputText) {
            return selection.getRangeAt(0);
        }
    }
    return null;
}

function getOutputSelectionStart() {
    const range = getOutputTextRange();
    return range !== null ? range.startOffset : outputText.textContent.length;
}

function getOutputSelectionEnd() {
    const range = getOutputTextRange();
    return range !== null ? range.endOffset : outputText.textContent.length;
}

function resetInput() {
    inputText.value = '';
    textBefore = outputText.textContent.substring(0, getOutputSelectionStart());
    textAfter = outputText.textContent.substring(getOutputSelectionEnd());
}

autotransliteration.addEventListener('change', resetInput);
autosyllabification.addEventListener('change', resetInput);

function copyOrCut(e) {
    e.preventDefault();
    const selection = window.getSelection();
    e.clipboardData.setData('text/plain', selection.toString().replaceAll(/(^|[\t\n\r ])\u034F\u034F\u034F/g, '$1'));
    if (e.type === 'cut') {
        selection.deleteFromDocument();
    }
}

outputText.addEventListener('copy', copyOrCut);
outputText.addEventListener('cut', copyOrCut);

let textBefore = '';
let textAfter = '';

function transliterate(inputValue, autotransliterate = true, autosyllabify = true, textBefore = '') {
    if (!autotransliterate || !inputValue) {
        return inputValue;
    }
    console.log('transliterate: %s', inputValue);
    let disabled = textBefore.lastIndexOf('>') < textBefore.lastIndexOf('<');
    return inputValue.match(RegExp((disabled ? '^[^>]+|' : '') + '<[^>]*>?|[^<]+', 'g')).map(substring => {
        if (disabled || substring.match(/^<(?!([ $,.\d\u034F]+|x+)>$)/iu)) {
            disabled = false;
            return substring;
        }
        disabled = false;
        substring = (substring
            .normalize('NFD')
            .replaceAll('A\u030A', '\u{1BC9C}')
            .replace(/^<([ $,.\d\u034F]+)>$/u, '$1')
            .replace(/^<x+>$/i, m => '\u2E3C'.repeat(m.length - 2))
            .replaceAll(/(?<=\p{L}\p{M}*)\p{Upper}/gu, '\u{1BCA1}$&')
            .toLowerCase()
            .replaceAll('\\1', 'P')
            .replaceAll('\\2', 'R')
            .replaceAll(/[PR]+(?=[PR])/g, '')
            .replaceAll('[likalisti]', '\u{1BC9C}')
            .replaceAll(/\[sic\]/g, '[ø]')
            .replaceAll(/(?<=\d+)(?<!\/\d+)\/(?=\d)(?!\d+\/)/g, '\u2044')
            .replaceAll(/(?<=\d)o/g, '\u00BA')
            .replaceAll(/(?<=[aeiou])~/g, '\u0303')
            .replaceAll('e\u0303', 'a\u0303')
            .replaceAll(/[ǝә]/g, 'ə')
            .replaceAll('ə̃', 'u\u0303')
            .replaceAll('a\u0303', 'ã')
            .replaceAll('i\u0303', 'ĩ')
            .replaceAll('o\u0303', 'õ')
            .replaceAll('u\u0303', 'ũ')
            .replaceAll(/(j\u0361|y)u|u\u0308/g, 'ü')
            .replaceAll(/t͡?ʃ|j\u030C/g, 'c\u030C')
            .replaceAll('i\u0304', 'ī')
            .replaceAll('o\u0306', 'ŏ')
            .replaceAll('u\u0306', 'ŭ')
            .replaceAll(/x[\u0307\u030C\u0323\u0325\u0331]|[χꭓ]/g, 'ẋ')
            .replaceAll(/(?<=\p{L}\p{M}*'?)(?<!x)x/gu, 'ẋ')
            .replaceAll(/x(?!x)(?='?\p{L})/gu, 'ẋ')
            .replaceAll(/[\u0300-\u0304\u0306\u0308\u030A\u030F\u0313\u0323\u0327\u032C\u0331\u0361ˈˌ·ˑ]/g, '')
            .replaceAll('ի', 'h')
            .replaceAll(/[ʹʻʼˈˌ‘’]/g, "'")
            .replaceAll('ʷ', 'w')
            .replaceAll('ɂ', 'ʔ')
            .replaceAll('qu', 'kw')
            .replaceAll('q', 'k')
            .replaceAll(/[ƚł]/g, 'ɬ')
            .replaceAll('z', 's')
            .replaceAll('ƛ', 'tɬ')
            .replaceAll(/[æɑ]/g, 'a')
            .replaceAll(/o[ou]/g, 'u')
            .replaceAll(/(?<=\p{L}\p{M}*)i(?=ya|ü)/gu, '')
            .replaceAll('eu', 'xwʔ')
            .replaceAll(/[eyɛɨ]/g, 'i')
            .replaceAll(/(?<!wi?)iwi/g, 'üi')
            .replaceAll(/ə(?=[lɬr]\p{M}*(?!\p{L}))/gu, 'i')
            .replaceAll(/(?<=(?!(?<![cklrstw]'?)h|x)\p{L}\p{M}*'?)wə/gu, 'u')
            .replaceAll('ə', 'a')
            .replaceAll(/(?<![axẋ])wh/g, 'ʔhw')
            .replaceAll(/([aiouīŏŭə])[ʔ']\1(?=[bcdfgjklɬmnprstvwxẋ])/g, '$1')
            .replaceAll(/([aiouīŏŭə])[ʔ'](?=\1)/g, '$1ʔh')
            .replaceAll(/(?<=\p{L}\p{M}*)ʔ(?=[aiouwīŏŭə])/gu, ';')
            .replaceAll(/(?<=\p{L}\p{M}*)ʔ(?=\p{L})/gu, '.')
            .replaceAll('ʔ', '')
            .replaceAll(/(?<=[aiouãõüĩŏũŭ])ɬ(?![aiouwīŏŭə])/g, 'lh')
            .replaceAll(/t'?ɬ/g, 'tl')
            .replaceAll(/(?<=k[h']?)w(?![aio])/g, '')
            .replaceAll(/(?<![\p{L}\p{N}\p{P}\p{S}]\p{M}*)"/gu, '“')
            .replaceAll('"', '”')
            .replaceAll(',,', '„')
            .replaceAll('wii', '\u{1BC5F}')
            .replaceAll(/w[ao]w(?![aio])/g, '\u{1BC60}')
            .replaceAll(/th(?!w)/g, '\u{1BC11}')
            .replaceAll('lh', '\u{1BC17}')
            .replaceAll('rh', '\u{1BC18}')
            .replaceAll(/sh|s\u030C|ʃ/g, '\u{1BC1B}')
            .replaceAll(/c'?h|c\u030C|[dt]j/g, '\u{1BC23}')
            .replaceAll(/k[h']/g, '\u{1BC14}')
            .replaceAll(/(?<![\p{L}\p{N}\p{P}\p{S}]\p{M}*)'+/gu, m => '‹'.repeat(m.length))
            .replaceAll(/(?<=\p{L}\p{M}*)'(?=\p{L})/gu, '')
            .replaceAll(/(?<!‹[^›']*)(?<!')'(?!\p{L})/gu, '')
            .replaceAll("'", '›')
            .replaceAll(/‹‹|≪/g, '«')
            .replaceAll(/››|≫/g, '»')
            .replaceAll('ʰ', '')
            .replaceAll(/hl(?!'?\.?\p{L})/gu,  '\u{1BC16}')
            .replaceAll(/(?<=\p{L}\p{M}*\.?)hl|ɬ/gu, '\u{1BC16}')
            .replaceAll('ng', '\u{1BC22}')
            .replaceAll('ts', '\u{1BC25}')
            .replaceAll('ü', '\u{1BC51}')
            .replaceAll(/[ao]w(?![ao]|i(?![aio]))/g, '\u{1BC5A}')
            .replaceAll('wa', '\u{1BC5C}')
            .replaceAll('wo', '\u{1BC5D}')
            .replaceAll('wi', '\u{1BC5E}')
            .replaceAll(/[xẋ]w/g, '\u{1BC53}')
            .replaceAll('ũ', '\u{1BC62}\u0316')
            .replaceAll('õ', '\u{1BC62}\u0317')
            .replaceAll('ĩ', '\u{1BC64}\u0300')
            .replaceAll('ã', '\u{1BC64}\u0301')
            .replaceAll(/;+(?=\p{L})/gu, '\u200C')
            .replaceAll('--', '–')
            .replaceAll('-', '\u{2E40}')
            .replaceAll('h', '\u{1BC00}')
            .replaceAll('ẋ', '\u{1BC01}')
            .replaceAll('x', '\u2E3C')
            .replaceAll('p', '\u{1BC02}')
            .replaceAll('t', '\u{1BC03}')
            .replaceAll('f', '\u{1BC04}')
            .replaceAll('k', '\u{1BC05}')
            .replaceAll('l', '\u{1BC06}')
            .replaceAll('b', '\u{1BC07}')
            .replaceAll('d', '\u{1BC08}')
            .replaceAll('v', '\u{1BC09}')
            .replaceAll('g', '\u{1BC0A}')
            .replaceAll('r', '\u{1BC0B}')
            .replaceAll('m', '\u{1BC19}')
            .replaceAll('n', '\u{1BC1A}')
            .replaceAll('j', '\u{1BC1B}')
            .replaceAll('s', '\u{1BC1C}')
            .replaceAll('c', '\u{1BC25}')
            .replaceAll('a', '\u{1BC41}')
            .replaceAll(/o|w/g, '\u{1BC44}')
            .replaceAll(/ŏ|ŭ/g, '\u{1BC44}\u0306')
            .replaceAll('i\\6', '\u{1BC48}')
            .replaceAll('i\\7', '\u{1BC49}')
            .replaceAll('i\\8', '\u{1BC4A}')
            .replaceAll('i\\9', '\u{1BC4B}')
            .replaceAll('i', '\u{1BC46}')
            .replaceAll('ī', '\u{1BC46}\u0323')
            .replaceAll('u', '\u{1BC5B}')
            .replaceAll('⊕', '\u{1BC9C}')
            .replaceAll('', '\u{1BC9C}')
            .replaceAll('=', '\u{1BC9F}')
            .replaceAll(/(?<=[\p{L}\p{N}]\p{M}*)\.(?=\p{L})/gu, '')
            .replaceAll('[ø]', 'ø')
            .replaceAll(/(?<= \u034F*)ø(?=[\p{L}\p{N}\p{S}])/gu, '')
            .replaceAll(/ \u034F*ø/g, '')
            .replaceAll(/(?<=[\p{L}\p{N}\p{S}]\p{M}*)ø(?= )/gu, '')
            .replaceAll(/ø \u034F*/g, '')
            .replace(/^ø+$/, '')
            .replaceAll(/ø+/g, ' ')
            .replaceAll(/(?<=[«‹]) /g, '\u00A0')
            .replaceAll(/ (?=[!:;?»›])/g, '\u00A0')
        );
        const wordCharacter = '\\p{L}\\p{M}\u200C\u{1BCA0}-\u{1BCA3}';
        return substring.match(RegExp(`(?!\u034F)[${wordCharacter}]+|\u034F+|[^${wordCharacter}]*`, 'gu')).map(word => {
            if (!word.match(RegExp(`[${wordCharacter}]`, 'u'))) {
                return word;
            }
            const hConsonant = '[\u{1BC00}\u{1BC01}]'
            const pConsonant = '[\u{1BC02}\u{1BC07}]';
            const tConsonant = '[\u{1BC03}\u{1BC08}\u{1BC11}]';
            const fConsonant = '[\u{1BC04}\u{1BC09}]';
            const kConsonant = '[\u{1BC05}\u{1BC0A}\u{1BC14}]';
            const lConsonant = '[\u{1BC06}\u{1BC0B}\u{1BC16}-\u{1BC18}]';
            const mConsonant = '\u{1BC19}';
            const nConsonant = '[\u{1BC1A}\u{1BC22}]';
            const jConsonant = '[\u{1BC1B}\u{1BC23}]';
            const sConsonant = '[\u{1BC1C}\u{1BC25}]';
            const curveConsonant = `(?:${mConsonant}|${nConsonant}|${jConsonant}|${sConsonant})`;
            const normalCircleVowel = '[\u{1BC41}\u{1BC44}\u{1BC5A}\u{1BC5B}]';
            const reversibleCircleVowel = `(?:${normalCircleVowel}|[\u{1BC5C}-\u{1BC60}])`;
            const circleVowel = `(?:(?:\u{1BC42}|${normalCircleVowel}[PR]?)\\p{M}*)`;
            const iVowel = '(?:[\u{1BC46}\u{1BC47}][PR]?\\p{M}*)';
            const uVowel = '(?:[\u{1BC51}-\u{1BC53}\u{1BC61}-\u{1BC64}][PR]?\\p{M}*)';
            const curveVowel = `(?:(?:${iVowel}|${uVowel}|\u{1BC4B}[PR]?)\\p{M}*)`;
            const wVowel = '(?:[\u{1BC5C}-\u{1BC60}][PR]?\\p{M}*)';
            const vowel = `(?:${circleVowel}|${curveVowel}|${wVowel})`;
            const noLaitin = `(?<![\u{1BC06}\u{1BC16}\u{1BC17}]\\p{M}*[\u{1BC41}\u{1BC42}]R?\\p{M}*${iVowel}(?=${tConsonant}\\p{M}*${iVowel}${nConsonant}\\p{M}*(?!${vowel})))`;
            const noLip = `(?<![\u{1BC06}\u{1BC16}\u{1BC17}]\\p{M}*${iVowel}(?=${pConsonant}|${fConsonant}))`;
            const consonantalI = `(?:(?<=^|\\P{L})${iVowel}(?=${circleVowel}(?!${tConsonant}|${lConsonant}|${nConsonant}|${jConsonant}))|\u{1BC4A})`;
            const lineObstruent = `(?:${pConsonant}|${tConsonant}|${fConsonant}|${kConsonant})`;
            const consonant = `(?:(?:${lineObstruent}|${lConsonant}|${curveConsonant}|${consonantalI})\\p{M}*)`;
            const consonantOrH = `(?:${consonant}|${hConsonant}\\p{M}*)`;
            const bigVowel = `(?:${wVowel}|[\u{1BC44}\u{1BC51}-\u{1BC53}\u{1BC5A}\u{1BC5B}][PR]?\\p{M}*)`;
            const noSmallInitialVowel = `(?<!(?:^|\\P{L})\\p{M}*(?:[\u{1BC41}\u{1BC42}\u{1BC61}-\u{1BC64}][PR]?\\p{M}*|${iVowel})(?!${hConsonant})(?!${consonantOrH}{2}))`;
            const noConsonantLiquidOnset = `(?!(?:${pConsonant}|\u{1BC03}|${fConsonant}|${kConsonant})\\p{M}*[\u{1BC06}\u{1BC0B}])`;
            const onset = `(?:${consonantOrH}|\u{1BC1C}\\p{M}*(?:${lConsonant}|${mConsonant}|${nConsonant})\\p{M}*|(?:\u{1BC1C}\\p{M}*)?${lineObstruent}\\p{M}*(?:${lConsonant}\\p{M}*)?)`;
            if (autosyllabify && !word.startsWith('\u200C')) {
                word = (word
                    .replaceAll(RegExp(`(?<=${vowel}${noConsonantLiquidOnset}${consonantOrH})${consonantOrH}${vowel}`, 'gu'), '\u200C$&')
                    .replaceAll(RegExp(`(?<=${vowel}${noSmallInitialVowel}${noLaitin}${noLip}${consonantOrH}*)(?=${onset}${vowel})${consonantOrH}+${vowel}`, 'gu'), '\u200C$&')
                    .replaceAll(RegExp(`(?<=(^|\\P{L})(?<!\u200C)\u{1BC06}\\p{M}*)(?=${consonantOrH})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=(?!([\u{1BC41}\u{1BC42}\u{1BC44}\u{1BC5B}\u{1BC5C}\u{1BC5D}][PR]?\\p{M}*|${iVowel})${iVowel}|\u{1BC44}[PR]?\\p{M}*[\u{1BC51}-\u{1BC53}]|${iVowel}[\u{1BC41}\u{1BC42}\u{1BC44}]|\u{1BC5B}[PR]?\\p{M}*[\u{1BC51}-\u{1BC53}]|[\u{1BC5E}\u{1BC5F}][PR]?\\p{M}*[\u{1BC41}\u{1BC42}])${vowel})${vowel}`, 'gu'), '\u200C$&')
                    .replaceAll(RegExp(`(?<=${vowel})(?=(${vowel}{2})+(?!${vowel}))`, 'gu'), '\u200C')
                );
            }
            word = (word
                .replaceAll(RegExp(`\u{1BCA1}(${hConsonant})`, 'gu'), '\u200C$1')
                .replaceAll(/^\u200C+/g, '')
                .replaceAll(RegExp(consonantalI, 'gu'), '\u{1BC4A}')
                .replaceAll(RegExp(`(?<=${nConsonant}${circleVowel})${iVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC4B}')
                .replaceAll(RegExp(`(?<=${nConsonant}${circleVowel})(?!.P)${iVowel}`, 'gu'), '$&R')
                .replaceAll(/(?<!\p{L})\u{1BC62}\u0316(?!\p{L})/gu, '\u{1BC61}')
                .replaceAll(/(?<!\p{L})\u{1BC62}\u0317(?!\p{L})/gu, '\u{1BC62}')
                .replaceAll(/(?<!\p{L})\u{1BC64}\u0300(?!\p{L})/gu, '\u{1BC63}')
                .replaceAll(/(?<!\p{L})\u{1BC64}\u0301(?!\p{L})/gu, '\u{1BC64}')
                .replaceAll(RegExp(`(?<=^|\\P{L}|${hConsonant})\u{1BC41}(?=\u{1BC46}(${hConsonant}|\\P{L}|$))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=^|\\P{L}|${hConsonant})${reversibleCircleVowel}(?=\u{1BC46}(?!${hConsonant}|\\P{L}|$))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=(^|\\P{L}|${hConsonant})${normalCircleVowel})\u{1BC46}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${pConsonant})${reversibleCircleVowel}(?=\u{1BC46})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})${reversibleCircleVowel}(?=\u{1BC46}${jConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${fConsonant})${reversibleCircleVowel}(?=\u{1BC46}(${kConsonant}|${jConsonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${kConsonant})${reversibleCircleVowel}(?=\u{1BC46}(?!${pConsonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${lConsonant})${reversibleCircleVowel}(?=\u{1BC46}${tConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})${reversibleCircleVowel}(?=${pConsonant}|${fConsonant}|${kConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}${vowel}*)\u{1BC46}(?=${iVowel}*(${tConsonant}|${lConsonant}|${curveConsonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${tConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${lConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${curveConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${pConsonant})${reversibleCircleVowel}(?=${pConsonant}|${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})${reversibleCircleVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC46}(?!\\p{M}*(P|${iVowel}*${jConsonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC51}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${kConsonant})(?!\u{1BC5B}|${wVowel})${normalCircleVowel}(?=${kConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${lConsonant})${reversibleCircleVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=^|\\P{L}|${hConsonant})${wVowel}(?=${tConsonant}|${lConsonant}|${mConsonant}|${jConsonant}|${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${pConsonant})${wVowel}(?=${tConsonant}|${lConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${kConsonant})${wVowel}(?=${tConsonant}|${lConsonant}|${jConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${lConsonant})${wVowel}(?=${fConsonant}|${kConsonant}|${mConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${mConsonant})${wVowel}(?=${pConsonant}|${tConsonant}|${kConsonant}|${mConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${nConsonant})${wVowel}(?=${pConsonant}|${tConsonant}|${fConsonant}|${lConsonant}|${nConsonant}|${jConsonant}|${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${jConsonant})${wVowel}(?=${tConsonant}|${lConsonant}|${jConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${sConsonant})${wVowel}(?=${pConsonant}|${tConsonant}|${fConsonant}|${kConsonant}|${mConsonant}|${nConsonant}|${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC46}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC51}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${curveConsonant})\u{1BC46}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${curveConsonant})\u{1BC51}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!\\p{L})\u{1BC46}(?=\u200C?(${hConsonant}|${iVowel}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${hConsonant})\u{1BC46}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${consonant}${vowel}*${iVowel})\u{1BC46}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${iVowel})\u{1BC46}(?!\\p{M}*(P|${vowel}*${consonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}${vowel}*)\u{1BC46}(?=\\p{M}*${iVowel}${vowel}*${consonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=(${pConsonant}|${jConsonant})${iVowel})${normalCircleVowel}(?=${jConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=(${tConsonant}|${mConsonant})\u{1BC47})${normalCircleVowel}(?=${mConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${nConsonant}\u{1BC47})${normalCircleVowel}(?=${nConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${sConsonant}\u{1BC47})${normalCircleVowel}(?=${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${iVowel})${normalCircleVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=[\u{1BC5E}\u{1BC5F}]\\p{M}*)${reversibleCircleVowel}(?!\\p{M}*P)`, 'gu'), '$&R')
                .replace(/(?<=[PR]\p{M}*)[PR]/gu, '')
                .replaceAll('P', '')
                .replaceAll(/\u{1BC41}(\p{M}*)R/gu, '\u{1BC42}$1')
                .replaceAll(/\u{1BC46}(\p{M}*)R/gu, '\u{1BC47}$1')
                .replaceAll(/\u{1BC51}(\p{M}*)R/gu, '\u{1BC52}$1')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰀𛱁‌𛰖𛱇𛰂/g, '$1𛰀𛱁𛰀‌𛰆𛱇𛰂')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱂‌𛰃𛱇‌𛰆𛱁𛰙/g, '$1𛰃𛱂‌𛰃𛱆‌𛰆𛱁𛰙')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱇$/g, '$1𛰃𛱆')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱇‌𛱚‌𛱇𛰃/g, '$1𛰃𛱆‌𛱚‌𛱇𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱇𛱂‌𛱞𛰃/g, '$1𛰃𛱆‌𛱚‌𛱇𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱛R‌𛰙𛱄‌𛰆𛱄R/g, '$1𛰃𛱛‌𛰙𛱄𛰆𛱄R')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱛R‌𛰙𛱄𛰆𛱄R/g, '$1𛰃𛱛‌𛰙𛱄𛰆𛱄R')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰆𛱇‌𛰅𛱁‌𛰆𛱇𛰜‌𛰃𛱇/g, '$1𛰆𛱇‌𛰅𛱁‌𛰆𛱇𛰜‌𛰃𛱆')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰙𛱇‌𛰃𛰆𛱂𛱆𛰃/g, '$1𛰙𛱆𛰃‌𛰆𛱂𛱆𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰙𛱇𛰃$/g, '$1𛰙𛱆𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰙𛱇𛰃‌𛰆𛱂𛱆𛰃/g, '$1𛰙𛱆𛰃‌𛰆𛱂𛱆𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰙𛱇𛰃𛰆𛱂𛱆𛰃/g, '$1𛰙𛱆𛰃𛰆𛱂𛱆𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰚𛱁‌𛱞R?𛰃‌𛰅𛱁/g, '$1𛰚𛱁‌𛱞‌𛰃𛰅𛱁')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰜𛲡𛰛𛲡𛰇$/g, '$1𛰜𛲡𛰇𛲡𛰛')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰊𛱆‌𛰃𛱄𛰂/g, '$1𛰊𛱆𛰃‌𛱄͏͏͏𛰂')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛱆‌𛰃𛰆𛱛𛱆𛰆/g, '$1𛱆‌𛰃𛰆𛱛͏͏͏‌𛱇𛰆')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛱆‌𛰃𛰆𛱛𛱆𛰗/g, '$1𛱆‌𛰃𛰆𛱛͏͏͏‌𛱇𛰗')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛱆𛲡𛰃𛲡𛰜$/g, '$1𛱇𛰃𛲡𛰜')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛱇𛰀𛰃/g, '$1𛱆𛰀𛰃')
                .replaceAll(RegExp(`${reversibleCircleVowel}R`, 'gu'), '$&\u034F\u034F\u034F')
                .replaceAll('R', '')
            );
            return word;
        }).join('');
    }).join('');
}

let previousOutputSelectionStart;
let previousOutputSelectionEnd;

const DOUBLE_CGJ = /[^\u034F]\u034F\u034F(?!\u034F)/u;

document.getElementById('output').addEventListener('input', e => {
    if (outputText.textContent.match(DOUBLE_CGJ)) {
        const newPosition = outputText.textContent.search(DOUBLE_CGJ);
        outputText.textContent = outputText.textContent.replace(DOUBLE_CGJ, '');
        setSelectionRange(outputText, newPosition, newPosition);
    }
});

const DUPLOYAN_PATTERN = /[\u{1BC00}-\u{1BCA3}]/u;

function getTextData(e) {
    let data;
    if (e.inputType === 'insertText'
        || e.inputType === 'insertCompositionText'
        || e.inputType === 'insertReplacementText'
    ) {
        data = e.data;
    } else if (e.inputType === 'insertParagraph') {
        data = '\n';
    } else if (e.inputType === 'insertFromDrop'
        || e.inputType === 'insertFromPaste'
        || e.inputType === 'insertFromPasteAsQuotation'
        || e.inputType === 'insertFromYank'
    ) {
        data = e.dataTransfer.getData('text/plain');
    } else {
        return null;
    }
    return data.match(DUPLOYAN_PATTERN) ? null : protectWhiteSpace(data);
}

function jsonStringify(s) {
    return JSON.stringify(s).replaceAll('\u034F', '\\u034F');
}

function debugTransliteration(label) {
    console.groupCollapsed(label);
    console.log('textBefore: %s', textBefore);
    console.log('inputText: [%d,%d) %s', inputText.selectionStart, inputText.selectionEnd, jsonStringify(inputText.value));
    console.log('textAfter: %s', textAfter);
    console.log('output: [%d,%d) %s', getOutputSelectionStart(), getOutputSelectionEnd(), jsonStringify(outputText.textContent));
    console.log('previousOutputSelectionStart: %s', previousOutputSelectionStart);
    console.log('previousOutputSelectionEnd: %s', previousOutputSelectionEnd);
    console.groupEnd();
}

document.getElementById('output').addEventListener('beforeinput', e => {
    console.group('beforeinput');
    console.log(e);
    debugTransliteration('start');
    const text = getTextData(e);
    if (text !== null) {
        e.preventDefault();
        if (getOutputSelectionStart() !== previousOutputSelectionStart
            || getOutputSelectionEnd() !== previousOutputSelectionEnd
        ) {
            resetInput();
            debugTransliteration('after resetInput');
        }
        type(inputText, text);
        outputText.textContent = textBefore + transliterate(inputText.value, autotransliteration.checked, autosyllabification.checked, textBefore) + textAfter;
        let newPosition = outputText.textContent.length - textAfter.length;
        setSelectionRange(outputText, newPosition, newPosition);
        newPosition = inputText.value.length;
        setSelectionRange(inputText, newPosition, newPosition);
        previousOutputSelectionStart = getOutputSelectionStart();
        previousOutputSelectionEnd = getOutputSelectionEnd();
        debugTransliteration('before scrollToCursor');
        scrollToCursor(previousOutputSelectionStart, previousOutputSelectionEnd);
        debugTransliteration('after scrollToCursor');
    } else {
        console.log('not an insertion event; clearing inputText');
        inputText.value = '';
        previousOutputSelectionStart = undefined;
        previousOutputSelectionEnd = undefined;
    }
    debugTransliteration('end');
    console.groupEnd();
});
