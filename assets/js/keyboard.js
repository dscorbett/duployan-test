/*
Copyright 2021 Google LLC
Copyright 2023 David Corbett

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
const outputText = document.querySelector('#output');
const inputText = document.createElement('textarea');

window.addEventListener('load', () => {
    outputText.style.height = window.getComputedStyle(outputText).height;
    outputText.textContent = '';

    document.querySelectorAll('#keyboard span > div').forEach(hint => {
        const prefix = hint.dataset.prefix ?? '';
        const suffix = hint.dataset.suffix ?? '';
        const parentValue = transliterate(prefix) + extract(hint.parentNode) + transliterate(suffix);
        const hintValue = transliterate(prefix + extract(hint) + suffix);
        if (parentValue !== hintValue) {
            console.warn('Hint %s does not match keycap %s for %o', hintValue, parentValue, hint.parentNode);
            hint.remove();
        }
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
        outputText.innerHTML = outputText.textContent.substr(0, previousOutputSelectionStart) + '<br id="scrollTarget">' + outputText.textContent.substr(previousOutputSelectionEnd);
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
        valueBefore = element.value.substr(0, element.selectionStart) + text;
        valueAfter = element.value.substr(element.selectionEnd);
        element.value = valueBefore + valueAfter;
    } else {
        const range = getOutputTextRange();
        if (range !== null && outputText === element) {
            valueBefore = element.textContent.substr(0, range.startOffset) + text;
            valueAfter = element.textContent.substr(range.endOffset);
        } else {
            valueBefore = element.textContent + text;
            valueAfter = '';
        }
        element.textContent = valueBefore + valueAfter;
    }
    const newPosition = valueBefore.length;
    setSelectionRange(element, newPosition, newPosition);
}

document.querySelectorAll('#keyboard span').forEach(key => key.addEventListener('click', e => {
    e.preventDefault();
    type(outputText, extract(key));
    resetInput();
    outputText.focus();
    scrollToCursor(getOutputSelectionStart(), getOutputSelectionEnd());
}));

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
    textBefore = outputText.textContent.substr(0, getOutputSelectionStart());
    textAfter = outputText.textContent.substr(getOutputSelectionEnd());
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

function transliterate(inputValue, autotransliterate = true, textBefore = '') {
    if (!autotransliterate || !inputValue) {
        return inputValue;
    }
    console.log('transl: ' + inputValue);
    let disabled = textBefore.lastIndexOf('>') < textBefore.lastIndexOf('<');
    return protectWhiteSpace(inputValue.match(RegExp((disabled ? '^[^>]+|' : '') + '<[^>]*>?|[^<]+', 'g')).map(substring => {
        if (disabled || substring.match(/^<(?!([ $,.\d\u034F]+|x+)>$)/iu)) {
            disabled = false;
            return substring;
        }
        disabled = false;
        substring = (substring
            .normalize()
            .replace(/^<([ $,.\d\u034F]+)>$/u, '$1')
            .replace(/^<x+>$/i, m => '\u2E3C'.repeat(m.length - 2))
            .replaceAll(/(?<=\p{L})\p{Upper}/gu, '\u{1BCA1}$&')
            .toLowerCase()
            .replaceAll(/(?<=[0-9]+)(?<!\/[0-9]+)\/(?=[0-9])(?![0-9]+\/)/g, '\u2044')
            .replaceAll(/[ae]~|ẽ/g, 'ã')
            .replaceAll('i~', 'ĩ')
            .replaceAll('o~', 'õ')
            .replaceAll(/u~|ũ/g, 'ə̃')
            .replaceAll(/(?<=\d)o/g, '\u00BA')
            .replaceAll('qu', 'kw')
            .replaceAll('q', 'k')
            .replaceAll(/à|ă/g, 'a')
            .replaceAll(/o[ou]/g, 'u')
            .replaceAll('yu', 'ü')
            .replaceAll(/[eèéēĕëìĭïy]/g, 'i')
            .replaceAll(/ò|ō/g, 'o')
            .replaceAll('ū', 'u')
            .replaceAll(/(?<=\p{L})wh/gu, '.hw')
            .replaceAll('wh', 'hw')
            .replaceAll('z', 's')
            .replaceAll(/[ʼ‘’]/g, "'")
            .replaceAll(/(?<![\p{L}\p{N}\p{P}\p{S}]\p{M}*)"/gu, '“')
            .replaceAll('"', '”')
            .replaceAll(',,', '„')
            .replaceAll(/wii(?![aio])/g, '\u{1BC5F}')
            .replaceAll(/waw(?![aio])/g, '\u{1BC60}')
            .replaceAll(/th(?!w)/g, '\u{1BC11}')
            .replaceAll('lh', '\u{1BC17}')
            .replaceAll('rh', '\u{1BC18}')
            .replaceAll(/sh|š/g, '\u{1BC1B}')
            .replaceAll(/ch|č|tj/g, '\u{1BC23}')
            .replaceAll(/k[h']/g, '\u{1BC14}')
            .replaceAll(/(?<![\p{L}\p{N}\p{P}\p{S}]\p{M}*)'+/gu, m => '‹'.repeat(m.length))
            .replaceAll(/(?<=\p{L}\p{M}*)'(?=\p{L})/gu, '')
            .replaceAll(/(?<!‹[^›']*)(?<!')'(?!\p{L})/gu, '')
            .replaceAll("'", '›')
            .replaceAll('‹‹', '«')
            .replaceAll('››', '»')
            .replaceAll('hl', '\u{1BC16}')
            .replaceAll('ng', '\u{1BC22}')
            .replaceAll('ts', '\u{1BC25}')
            .replaceAll('ü', '\u{1BC51}')
            .replaceAll(/(?<!a)iu/g, '\u{1BC53}')
            .replaceAll(/aw(?![ao]|i(?![aio]))/g, '\u{1BC5A}')
            .replaceAll('wa', '\u{1BC5C}')
            .replaceAll('wo', '\u{1BC5D}')
            .replaceAll(/wi(?![aio])/g, '\u{1BC5E}')
            .replaceAll(/wī(?![aio])/g, '\u{1BC5E}\u0304')
            .replaceAll('xw', '\u{1BC53}')
            .replaceAll(/;+(?=\p{L})/gu, '\u200C')
            .replaceAll('-', '\u{2E40}')
            .replaceAll('h', '\u{1BC00}')
            .replaceAll(/(?<=\p{L})(?<!x)x/gu, '\u{1BC01}')
            .replaceAll(/x(?!x)(?=\p{L})/gu, '\u{1BC01}')
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
            .replaceAll('ɬ', '\u{1BC16}')
            .replaceAll('m', '\u{1BC19}')
            .replaceAll('n', '\u{1BC1A}')
            .replaceAll('j', '\u{1BC1B}')
            .replaceAll('s', '\u{1BC1C}')
            .replaceAll('c', '\u{1BC25}')
            .replaceAll('a', '\u{1BC41}')
            .replaceAll(/o|w/g, '\u{1BC44}')
            .replaceAll(/ŏ|ŭ/g, '\u{1BC44}\u0306')
            .replaceAll('i', '\u{1BC46}')
            .replaceAll('ī', '\u{1BC46}\u0323')
            .replaceAll('u', '\u{1BC5B}')
            .replaceAll('ə̃', '\u{1BC62}\u0316')
            .replaceAll('õ', '\u{1BC62}\u0317')
            .replaceAll('ĩ', '\u{1BC64}\u0300')
            .replaceAll('ã', '\u{1BC64}\u0301')
            .replaceAll('å', '\u{1BC9C}')
            .replaceAll('⊕', '\u{1BC9C}')
            .replaceAll('', '\u{1BC9C}')
            .replaceAll('=', '\u{1BC9F}')
            .replaceAll(/(?<=[\p{L}\p{N}])\.(?=\p{L})/gu, '')
            .replaceAll('[ø]', 'ø')
            .replaceAll(/(?<= \u034F*)ø(?=[\p{L}\p{N}\p{S}])/gu, '')
            .replaceAll(/ \u034F*ø/g, '')
            .replaceAll(/(?<=[\p{L}\p{N}\p{S}])ø(?= )/gu, '')
            .replaceAll(/ø \u034F*/g, '')
            .replace(/^ø+$/, '')
            .replaceAll(/ø+/g, ' ')
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
            const circleVowel = `(?:(?:\u{1BC42}|${normalCircleVowel}R?)\\p{M}*)`;
            const iVowel = '(?:[\u{1BC46}\u{1BC47}]\\p{M}*)';
            const uVowel = '(?:[\u{1BC51}-\u{1BC53}\u{1BC61}-\u{1BC64}]\\p{M}*)';
            const curveVowel = `(?:(?:${iVowel}|${uVowel}|\u{1BC4B})\\p{M}*)`;
            const wVowel = '(?:[\u{1BC5C}-\u{1BC60}]\\p{M}*)';
            const consonantNotInOnsetBeforeL = `(?:${lConsonant}|${curveConsonant})`;
            const noLip = `(?<![\u{1BC06}\u{1BC16}\u{1BC17}]${iVowel}(?=${pConsonant}|${fConsonant}))`;
            const consonantalI = `(?:(?<=^|\\P{L})${iVowel}(?=${circleVowel}(?!${tConsonant}|${lConsonant}|${nConsonant}|${jConsonant}))|\u{1BC4A})`;
            const lineObstruent = `(?:${pConsonant}|${tConsonant}|${fConsonant}|${kConsonant})`;
            const consonant = `(?:${lineObstruent}|${lConsonant}|${curveConsonant}|${consonantalI})`;
            const vowel = `(?:${circleVowel}|${curveVowel}|${wVowel})`;
            const bigVowel = `(?:${wVowel}|[\u{1BC44}\u{1BC5A}\u{1BC5B}])`;
            const openSyllable = `(${consonant}|\\p{L}\u200C?${hConsonant})?${vowel}+(?!(?!${consonantNotInOnsetBeforeL})${consonant}[\u{1BC06}\u{1BC0B}])`;
            const onset = `(?:${hConsonant}|${consonant}|\u{1BC1C}(?:${lConsonant}|${mConsonant}|${nConsonant})|\u{1BC1C}?${lineObstruent}${lConsonant}?)`;
            const complexCoda = `(?:(?:${lConsonant}?(?:${lineObstruent}|${mConsonant}|${nConsonant})\u{1BC1C})|(?:${lConsonant}(?:${lineObstruent}|${mConsonant}|${nConsonant})|(?:${pConsonant}|${fConsonant}|${kConsonant})(?:${tConsonant}|\u{1BC25}(?!\u{1BC1C}))|\u{1BC0B}\u{1BC06}|${mConsonant}${pConsonant}|\u{1BC1A}(?:${tConsonant}|${kConsonant})|\u{1BC22}${kConsonant}|\u{1BC1C}(?:${pConsonant}|${tConsonant}|${kConsonant}))\u{1BC1C}?|(?:${lConsonant}|${mConsonant}|${nConsonant})\u{1BC1C}|(?:${lConsonant}|\u{1BC1A})(?:${jConsonant}|\u{1BC25})|\u{1BC03}[\u{1BC1B}\u{1BC23}])`;
            if (autosyllabification.checked && !word.startsWith('\u200C')) {
                word = (word
                    .replaceAll(RegExp(`(?<=${openSyllable}${consonant}?)${noLip}(?=(${hConsonant}|${consonant})${vowel})`, 'gu'), 'Z')
                    .replaceAll(RegExp(`(?<=${openSyllable}(?!${consonant}${onset}${vowel})${complexCoda}(?<!${consonant}{3}))${noLip}(?=${onset}${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${openSyllable}(?!${consonant}${onset}${vowel})${complexCoda})${noLip}(?=${onset}${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${openSyllable}${consonant})${noLip}(?=(${hConsonant}|${consonant})+${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=(^|\\P{L})\\p{M}*${vowel}\\p{M}*)Z(?=${consonant})`, 'gu'), '')
                    .replaceAll('Z', '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel})${noLip}(?=(?!${consonantNotInOnsetBeforeL})${consonant}[\u{1BC06}\u{1BC0B}]${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel}${noLip}${consonant})(?=${consonant}${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel}${noLip}${consonant})(?=${consonant}[\u{1BC06}\u{1BC0B}]?${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel}${consonant}?)(?=${hConsonant}${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=(^|\\P{L}|${hConsonant})${bigVowel})(?=${consonant}+${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel}|\u{1BC4A})(?=${hConsonant}${vowel}|\u{1BC5B})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel}${hConsonant})(?=${consonant}+${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=\u{1BC5B})(?=${circleVowel}|${wVowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${wVowel})(?=${wVowel}|${circleVowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${wVowel}|${circleVowel})(?=${wVowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=(?!\u{1BC5B})${vowel})(?=${uVowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${uVowel})(?=${vowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel})(?=${wVowel}|\u{1BC4A})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=(^|\\P{L})(?<!\u200C)\u{1BC06})(?=${consonant})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=[\u{1BC41}\u{1BC42}]${iVowel})(?=\u{1BC44}|\u{1BC5A}|\u{1BC5B}|${wVowel})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${iVowel}${vowel}|${vowel}${iVowel})(?=${vowel}{2})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=${vowel})(?=${vowel}{2})`, 'gu'), '\u200C')
                );
            }
            word = (word
                .replaceAll(/^\u200C+/g, '')
                .replaceAll(RegExp(consonantalI, 'gu'), '\u{1BC4A}')
                .replaceAll(RegExp(`(?<=${nConsonant}${circleVowel})${iVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC4B}')
                .replaceAll(RegExp(`(?<=${nConsonant}${circleVowel})${iVowel}`, 'gu'), '\u{1BC47}')
                .replaceAll(/(?<!\p{L})\u{1BC62}\u0316(?!\p{L})/gu, '\u{1BC61}')
                .replaceAll(/(?<!\p{L})\u{1BC62}\u0317(?!\p{L})/gu, '\u{1BC62}')
                .replaceAll(/(?<!\p{L})\u{1BC64}\u0300(?!\p{L})/gu, '\u{1BC63}')
                .replaceAll(/(?<!\p{L})\u{1BC64}\u0301(?!\p{L})/gu, '\u{1BC64}')
                .replaceAll(RegExp(`(?<=^|\\P{L}|${hConsonant})\u{1BC41}(?=\u{1BC46}(${hConsonant}|\\P{L}|$))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=^|\\P{L}|${hConsonant})${reversibleCircleVowel}(?=\u{1BC46}(?!${hConsonant}|\\P{L}|$))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=(^|\\P{L}|${hConsonant})${normalCircleVowel})\u{1BC46}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${pConsonant})${reversibleCircleVowel}(?=\u{1BC46})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})${reversibleCircleVowel}(?=\u{1BC46}${jConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${fConsonant})${reversibleCircleVowel}(?=\u{1BC46}(${kConsonant}|${jConsonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${kConsonant})${reversibleCircleVowel}(?=\u{1BC46}(?!${pConsonant}))`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${lConsonant})${reversibleCircleVowel}(?=\u{1BC46}${tConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})${reversibleCircleVowel}(?=${pConsonant}|${fConsonant}|${kConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<!${consonant}${vowel}*)\u{1BC46}(?=${iVowel}*(${tConsonant}|${lConsonant}|${curveConsonant}))`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${tConsonant})`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${lConsonant})`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${curveConsonant})`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<=${pConsonant})${reversibleCircleVowel}(?=${pConsonant}|${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})${reversibleCircleVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC46}(?!${iVowel}*${jConsonant})`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC51}`, 'gu'), '\u{1BC52}')
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
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC46}`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC51}`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<=${curveConsonant})\u{1BC46}`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${curveConsonant})\u{1BC51}`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<!\\p{L})\u{1BC46}(?=\u200C?(${hConsonant}|${iVowel}))`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${hConsonant})\u{1BC46}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${consonant}${vowel}*${iVowel})\u{1BC46}`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${iVowel})\u{1BC46}(?!${vowel}*${consonant})`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<!${consonant}${vowel}*)\u{1BC46}(?=${iVowel}${vowel}*${consonant})`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=(${pConsonant}|${jConsonant})${iVowel})${normalCircleVowel}(?=${jConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=(${tConsonant}|${mConsonant})\u{1BC47})${normalCircleVowel}(?=${mConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${nConsonant}\u{1BC47})${normalCircleVowel}(?=${nConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${sConsonant}\u{1BC47})${normalCircleVowel}(?=${sConsonant})`, 'gu'), '$&R')
                .replaceAll(RegExp(`(?<=${iVowel})${normalCircleVowel}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '$&R')
                .replaceAll(/\u{1BC41}R/gu, '\u{1BC42}')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱂‌𛰃𛱇‌𛰆𛱁𛰙/g, '$1𛰃𛱂‌𛰃𛱆‌𛰆𛱁𛰙')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱇$/g, '$1𛰃𛱆')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱇‌𛱚‌𛱇𛰃/g, '$1𛰃𛱆‌𛱚‌𛱇𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱇𛱂‌𛱞𛰃/g, '$1𛰃𛱆‌𛱚‌𛱇𛰃')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱛R‌𛰙𛱄‌𛰆𛱄R/g, '$1𛰃𛱛‌𛰙𛱄𛰆𛱄R')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰃𛱛R‌𛰙𛱄𛰆𛱄R/g, '$1𛰃𛱛‌𛰙𛱄𛰆𛱄R')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰖(?!\u200C|$)/g, '$1𛰀𛰆')
                .replaceAll(/^((?:\u034F\u034F\u034F)?)𛰙𛱇‌𛰃𛰆𛱂𛱆𛰃/g, '$1𛰙𛱆𛰃‌𛰆𛱂𛱆𛰃')
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
    }).join(''));
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

document.getElementById('output').addEventListener('beforeinput', e => {
    const text = getTextData(e);
    if (text !== null) {
        e.preventDefault();
        if (getOutputSelectionStart() !== previousOutputSelectionStart
            || getOutputSelectionEnd() !== previousOutputSelectionEnd
        ) {
            resetInput();
        }
        type(inputText, text);
        outputText.textContent = textBefore + transliterate(inputText.value, autotransliteration.checked, textBefore) + textAfter;
        let newPosition = outputText.textContent.length - textAfter.length;
        setSelectionRange(outputText, newPosition, newPosition);
        newPosition = inputText.value.length;
        setSelectionRange(inputText, newPosition, newPosition);
        previousOutputSelectionStart = getOutputSelectionStart();
        previousOutputSelectionEnd = getOutputSelectionEnd();
        scrollToCursor(previousOutputSelectionStart, previousOutputSelectionEnd);
    } else {
        inputText.value = '';
        previousOutputSelectionStart = undefined;
        previousOutputSelectionEnd = undefined;
    }
});
