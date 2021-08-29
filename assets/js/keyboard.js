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
}));

function transliterate() {
    return inputText.value.match(/<[^>]*|[^<]*/g).map(substring => {
        if (substring.startsWith('<')) {
            return substring;
        }
        substring = (substring
            .normalize()
            .replaceAll(/(?<=\p{L})\p{Upper}/gu, '\u{1BCA1}$&')
            .toLowerCase()
            .replaceAll(/[ae]~|ẽ/g, 'ã')
            .replaceAll('i~', 'ĩ')
            .replaceAll('o~', 'õ')
            .replaceAll(/u~|ũ/g, 'ə̃')
            .replaceAll(/(?<=\d)o/g, '\u00BA')
            .replaceAll(/e|y(?!u)/g, 'i')
            .replaceAll('q', 'k')
            .replaceAll(/(?<=\p{L})wh/gu, '.hw')
            .replaceAll('wh', 'hw')
            .replaceAll('z', 's')
            .replaceAll(/(?<=k)[ʼ’]/g, "'")
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
            .replaceAll('YU', '\u{1BC52}')
            .replaceAll('iu', '\u{1BC53}')
            .replaceAll(/aw(?![ao]|i(?![aio]))/g, '\u{1BC5A}')
            .replaceAll('wa', '\u{1BC5C}')
            .replaceAll('wo', '\u{1BC5D}')
            .replaceAll(/wi(?![aio])/g, '\u{1BC5E}')
            .replaceAll('xw', '\u{1BC53}')
            .replaceAll(/(?<=\p{L});+(?=\p{L})/gu, '\u{200C}')
            .replaceAll('-', '\u{2E40}')
            .replaceAll('h', '\u{1BC00}')
            .replaceAll('x', '\u{1BC01}')
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
            .replaceAll('i', '\u{1BC46}')
            .replaceAll('u', '\u{1BC5B}')
            .replaceAll('ə̃', '\u{1BC62}\u0316')
            .replaceAll('õ', '\u{1BC62}\u0317')
            .replaceAll('ĩ', '\u{1BC64}\u0300')
            .replaceAll('ã', '\u{1BC64}\u0301')
            .replaceAll('å', '\u{1BC9C}')
            .replaceAll('⊕', '\u{1BC9C}')
            .replaceAll('=', '\u{1BC9F}')
            .replaceAll(/(?<=[\p{L}\p{N}])\.(?=\p{L})/gu, '')
        );
        return substring.match(/\p{L}+|\P{L}*/gu).map(word => {
            if (!word.match(/\p{L}/u)) {
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
            const consonant = `(?:${pConsonant}|${tConsonant}|${fConsonant}|${kConsonant}|${lConsonant}|${curveConsonant}|\u{1BC4A})`;
            const circleVowel = '[\u{1BC41}\u{1BC42}\u{1BC44}\u{1BC5A}\u{1BC5B}]';
            const iVowel = '[\u{1BC46}\u{1BC47}]';
            const uVowel = '(?:[\u{1BC51}-\u{1BC53}\u{1BC61}-\u{1BC64}][\u0300\u0301\u0316\u0317]?)';
            const curveVowel = `(?:${iVowel}|${uVowel}|\u{1BC4B})`;
            const wVowel = '[\u{1BC5C}-\u{1BC60}]';
            const consonantNotInOnsetBeforeL = `(?:${lConsonant}|${curveConsonant})`;
            const noLip = `(?<![\u{1BC06}\u{1BC16}\u{1BC17}]${iVowel}(?=${pConsonant}|${fConsonant}))`;
            const vowel = `(?:${circleVowel}|${curveVowel}|${wVowel})`;
            const bigVowel = `(?:${wVowel}|[\u{1BC44}\u{1BC5A}\u{1BC5B}])`;
            const openSyllable = `(${consonant}|\\p{L}\u200C?${hConsonant})${vowel}+(?!(?!${consonantNotInOnsetBeforeL})${consonant}[\u{1BC06}\u{1BC0B}])`;
            return (word
                .replaceAll(RegExp(`(?<=${openSyllable}${consonant}?)${noLip}(?=(${hConsonant}|${consonant})${vowel})`, 'gu'), '\u200C')
                .replaceAll(RegExp(`(?<=${openSyllable}${consonant})${noLip}(?=(${hConsonant}|${consonant})+${vowel})`, 'gu'), '\u200C')
                .replaceAll(RegExp(`(?<=${consonant}${vowel}+)${noLip}(?=(?!${consonantNotInOnsetBeforeL})${consonant}[\u{1BC06}\u{1BC0B}]${vowel})`, 'gu'), '\u200C')
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
                .replaceAll(RegExp(`(?<=(^|\\P{L})\u{1BC06})(?=${consonant})`, 'gu'), '\u200C')
                .replaceAll(RegExp(`(?<=${vowel})(?!(?<=${circleVowel})${iVowel}${circleVowel})(?=${vowel}{2})`, 'gu'), '\u200C')
                .replaceAll(RegExp(`(?<=^|\\P{L})${iVowel}(?=${circleVowel})`, 'gu'), '\u{1BC4A}')
                .replaceAll(RegExp(`(?<=[\u{1BC1A}\u{1BC22}]${circleVowel})${iVowel}`, 'gu'), '\u{1BC4B}')
                .replaceAll(/(?<!\p{L})\u{1BC62}\u0316(?!\p{L})/gu, '\u{1BC61}')
                .replaceAll(/(?<!\p{L})\u{1BC62}\u0317(?!\p{L})/gu, '\u{1BC62}')
                .replaceAll(/(?<!\p{L})\u{1BC64}\u0300(?!\p{L})/gu, '\u{1BC63}')
                .replaceAll(/(?<!\p{L})\u{1BC64}\u0301(?!\p{L})/gu, '\u{1BC64}')
                .replaceAll(RegExp(`(?<=${pConsonant})\u{1BC41}(?=\u{1BC46}(?!${tConsonant}|${lConsonant}))`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<=${fConsonant})\u{1BC41}(?=\u{1BC46}(${tConsonant}|${kConsonant}))`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<=${kConsonant})\u{1BC41}(?=\u{1BC46}${fConsonant})`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC41}(?=\u{1BC46}${tConsonant})`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC41}(?=${pConsonant}|${kConsonant})`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<!${consonant}|(?!${iVowel})${vowel}${iVowel}*)\u{1BC46}(?=${iVowel}*(${tConsonant}|${lConsonant}|${curveConsonant}))`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${tConsonant})`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${lConsonant})`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<!${consonant}|${vowel})\u{1BC51}(?=${curveConsonant})`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<=${pConsonant})\u{1BC41}(?=${sConsonant})`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC41}(?=${hConsonant}|${tConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC46}(?![\u{1BC46}\u1BC47]*(${lConsonant}|${jConsonant}))`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${tConsonant})\u{1BC51}(?=${hConsonant}|${tConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC41}(?=${hConsonant}|${lConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC42}')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC46}(?!${circleVowel})`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${lConsonant})\u{1BC51}(?=${hConsonant}|${lConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<=${curveConsonant})\u{1BC46}`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${curveConsonant})\u{1BC51}`, 'gu'), '\u{1BC52}')
                .replaceAll(RegExp(`(?<!\\p{L})\u{1BC46}(?=\u200C?(${hConsonant}|${iVowel}))`, 'gu'), '\u{1BC47}')
                .replaceAll(RegExp(`(?<=${hConsonant})\u{1BC46}(?=${hConsonant}|\\P{L}|$)`, 'gu'), '\u{1BC47}')
                .replaceAll(/^𛰃𛱂‌𛰃𛱇‌𛰆𛱁𛰙/g, '𛰃𛱂‌𛰃𛱆‌𛰆𛱁𛰙')
                .replaceAll(/^𛰃𛱇‌𛱚‌𛱇𛰃/g, '𛰃𛱆‌𛱚‌𛱇𛰃')
                .replaceAll(/^𛰃𛱇𛱁‌𛱞𛰃/g, '𛰃𛱆‌𛱚‌𛱇𛰃')
                .replaceAll(/^𛰖𛱄𛱆‌𛰙𛱁/g, '𛰀𛰆𛱄𛱆‌𛰙𛱁')
                .replaceAll(/^𛰙𛱇‌𛰃𛰆𛱂𛱆𛰃/g, '𛰙𛱆𛰃‌𛰆𛱂𛱆𛰃')
                .replaceAll(/^𛰙𛱇𛰃‌𛰆𛱂𛱆𛰃/g, '𛰙𛱆𛰃‌𛰆𛱂𛱆𛰃')
                .replaceAll(/^𛰚𛱁‌𛱞𛰃‌𛰅𛱁/g, '𛰚𛱁‌𛱞‌𛰃𛰅𛱁')
                .replaceAll(/^𛱇𛰀𛰃/g, '𛱆𛰀𛰃')
            );
        }).join('');
    }).join('');
}

let previousOutputSelectionStart = 0;
let previousOutputSelectionEnd = 0;

document.getElementById('output').addEventListener('beforeinput', e => {
    if (e.inputType === 'insertFromDrop'
        || e.inputType === 'insertFromPaste'
        || e.inputType === 'insertFromPasteAsQuotation'
        || e.inputType === 'insertFromYank'
        || e.inputType === 'insertText'
    ) {
        e.preventDefault();
        let lengthAfterCursor = inputText.value.substr(inputText.selectionEnd).length;
        if (outputText.selectionStart !== previousOutputSelectionStart
            || outputText.selectionEnd !== previousOutputSelectionEnd
        ) {
            inputText.value = '';
        }
        const emptyInput = inputText.value === '';
        if (emptyInput) {
            const valueBefore = outputText.value.substr(0, outputText.selectionStart);
            const valueAfter = outputText.value.substr(outputText.selectionEnd);
            lengthAfterCursor = valueAfter.length;
            inputText.value = valueBefore + valueAfter;
            inputText.setSelectionRange(valueBefore.length, inputText.value.length - lengthAfterCursor);
        }
        type(inputText, e.data);
        outputText.value = transliterate();
        let newPosition = outputText.value.length - lengthAfterCursor;
        outputText.setSelectionRange(newPosition, newPosition);
        newPosition = inputText.value.length - lengthAfterCursor;
        inputText.setSelectionRange(newPosition, newPosition);
    } else {
        inputText.value = '';
    }
    previousOutputSelectionStart = outputText.selectionStart;
    previousOutputSelectionEnd = outputText.selectionEnd;
});
