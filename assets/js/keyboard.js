/*
Copyright 2021 Google LLC

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

function extract(node) {
    function extract(node) {
        return [...node.childNodes].reduce(
            (text, child) => {
                if (child.nodeType === Node.TEXT_NODE) {
                    const trimmedContent = child.textContent.trim();
                    text += trimmedContent || child.textContent;
                }
                return text + extract(child);
            },
            '');
    }

    return node.dataset.string ?? extract(node);
}

function type(textarea, text) {
    const valueBefore = textarea.value.substr(0, textarea.selectionStart) + text;
    const valueAfter = textarea.value.substr(textarea.selectionEnd);
    textarea.value = valueBefore + valueAfter;
    const newPosition = valueBefore.length;
    textarea.setSelectionRange(newPosition, newPosition);
}

document.querySelectorAll('#keyboard span').forEach(key => key.addEventListener('click', e => {
    e.preventDefault();
    type(outputText, extract(key));
    resetInput();
    outputText.focus();
}));

function resetInput() {
    inputText.value = '';
    textBefore = outputText.value.substr(0, outputText.selectionStart);
    textAfter = outputText.value.substr(outputText.selectionEnd);
}

autotransliteration.addEventListener('change', resetInput);
autosyllabification.addEventListener('change', resetInput);

let textBefore = '';
let textAfter = '';

function transliterate() {
    if (!autotransliteration.checked) {
        return inputText.value;
    }
    let disabled = textBefore.lastIndexOf('>') < textBefore.lastIndexOf('<');
    return inputText.value.match(RegExp((disabled ? '^[^>]+|' : '') + '<[^>]*|[^<]+', 'g')).map(substring => {
        if (disabled || substring.startsWith('<')) {
            disabled = false;
            return substring;
        }
        disabled = false;
        substring = (substring
            .normalize()
            .replaceAll(/(?<=\p{L})\p{Upper}/gu, '\u{1BCA1}$&')
            .toLowerCase()
            .replaceAll(/(?<=[0-9]+)(?<!\/[0-9]+)\/(?=[0-9])(?![0-9]+\/)/g, '\u2044')
            .replaceAll(/[ae]~|???/g, '??')
            .replaceAll('i~', '??')
            .replaceAll('o~', '??')
            .replaceAll(/u~|??/g, '????')
            .replaceAll(/(?<=\d)o/g, '\u00BA')
            .replaceAll(/e|y(?!u)/g, 'i')
            .replaceAll('qu', 'kw')
            .replaceAll('q', 'k')
            .replaceAll(/(?<=\p{L})wh/gu, '.hw')
            .replaceAll('wh', 'hw')
            .replaceAll('z', 's')
            .replaceAll(/(?<=k)[?????]/g, "'")
            .replaceAll(/wii(?![aio])/g, '\u{1BC5F}')
            .replaceAll(/waw(?![aio])/g, '\u{1BC60}')
            .replaceAll(/th(?!w)/g, '\u{1BC11}')
            .replaceAll('lh', '\u{1BC17}')
            .replaceAll('rh', '\u{1BC18}')
            .replaceAll('sh', '\u{1BC1B}')
            .replaceAll('ch', '\u{1BC23}')
            .replaceAll("k'", '\u{1BC14}')
            .replaceAll('hl', '\u{1BC16}')
            .replaceAll('ng', '\u{1BC22}')
            .replaceAll('ts', '\u{1BC25}')
            .replaceAll('yu', '\u{1BC51}')
            .replaceAll(/(?<!a)iu/g, '\u{1BC53}')
            .replaceAll(/aw(?![ao]|i(?![aio]))/g, '\u{1BC5A}')
            .replaceAll('wa', '\u{1BC5C}')
            .replaceAll('wo', '\u{1BC5D}')
            .replaceAll(/wi(?![aio])/g, '\u{1BC5E}')
            .replaceAll(/w??(?![aio])/g, '\u{1BC5E}\u0304')
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
            .replaceAll('??', '\u{1BC16}')
            .replaceAll('m', '\u{1BC19}')
            .replaceAll('n', '\u{1BC1A}')
            .replaceAll('j', '\u{1BC1B}')
            .replaceAll('s', '\u{1BC1C}')
            .replaceAll('c', '\u{1BC25}')
            .replaceAll('a', '\u{1BC41}')
            .replaceAll(/o|w/g, '\u{1BC44}')
            .replaceAll(/??|??/g, '\u{1BC44}\u0306')
            .replaceAll('i', '\u{1BC46}')
            .replaceAll('??', '\u{1BC46}\u0323')
            .replaceAll('u', '\u{1BC5B}')
            .replaceAll('????', '\u{1BC62}\u0316')
            .replaceAll('??', '\u{1BC62}\u0317')
            .replaceAll('??', '\u{1BC64}\u0300')
            .replaceAll('??', '\u{1BC64}\u0301')
            .replaceAll('??', '\u{1BC9C}')
            .replaceAll('???', '\u{1BC9C}')
            .replaceAll('???', '\u{1BC9C}')
            .replaceAll('=', '\u{1BC9F}')
            .replaceAll(/(?<=[\p{L}\p{N}])\.(?=\p{L})/gu, '')
        );
        const wordCharacter = '\\p{L}\\p{M}\u200C\u{1BCA0}-\u{1BCA3}';
        return substring.match(RegExp(`[${wordCharacter}]+|[^${wordCharacter}]*`, 'gu')).map(word => {
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
            const reversibleCircleVowel = `(?:${normalCircleVowel}|[\u{1BC5C}\u{1BC5D}\u{1BC60}])`;
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
                .replaceAll(/^??????????????????????????????????/g, '??????????????????????????????????')
                .replaceAll(/^????????$/g, '????????')
                .replaceAll(/^??????????????????????????/g, '??????????????????????????')
                .replaceAll(/^???????????????????????/g, '??????????????????????????')
                .replaceAll(/^????????R??????????????????????R/g, '???????????????????????????R')
                .replaceAll(/^????????R???????????????????R/g, '???????????????????????????R')
                .replaceAll(/^????(?!\u200C|$)/g, '????????')
                .replaceAll(/^???????????????????????????????/g, '???????????????????????????????')
                .replaceAll(/^???????????????????????????????/g, '???????????????????????????????')
                .replaceAll(/^????????????????????????????/g, '????????????????????????????')
                .replaceAll(/^??????????????????????????????/g, '??????????????????????????????')
                .replaceAll(/^????????????????????$/g, '????????????????????')
                .replaceAll(/^???????????????????????????/g, '????????????????????????????????????')
                .replaceAll(/^???????????????????????????/g, '????????????????????????????????????')
                .replaceAll(/^????????????????????$/g, '????????????????')
                .replaceAll(/^????????????/g, '????????????')
                .replaceAll(RegExp(`${reversibleCircleVowel}R`, 'gu'), '$&\u034F\u034F\u034F')
                .replaceAll('R', '')
            );
            return word;
        }).join('');
    }).join('');
}

let previousOutputSelectionStart;
let previousOutputSelectionEnd;

document.getElementById('output').addEventListener('beforeinput', e => {
    if (
        (e.inputType === 'insertFromDrop'
            || e.inputType === 'insertFromPaste'
            || e.inputType === 'insertFromPasteAsQuotation'
            || e.inputType === 'insertFromYank'
            || e.inputType === 'insertText'
        ) && !e.data.match(/[\u{1BC00}-\u{1BCA3}]/u)
    ) {
        e.preventDefault();
        if (outputText.selectionStart !== previousOutputSelectionStart
            || outputText.selectionEnd !== previousOutputSelectionEnd
        ) {
            resetInput();
        }
        type(inputText, e.data);
        outputText.value = textBefore + transliterate() + textAfter;
        let newPosition = outputText.value.length - textAfter.length;
        outputText.setSelectionRange(newPosition, newPosition);
        newPosition = inputText.value.length - textAfter.length;
        inputText.setSelectionRange(newPosition, newPosition);
        previousOutputSelectionStart = outputText.selectionStart;
        previousOutputSelectionEnd = outputText.selectionEnd;
    } else {
        inputText.value = '';
        previousOutputSelectionStart = undefined;
        previousOutputSelectionEnd = undefined;
    }
});
