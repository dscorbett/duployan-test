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

export default transliterate;

function transliterate(inputValue, autosyllabify = true, textBefore = '') {
    let disabled = textBefore.lastIndexOf('>') < textBefore.lastIndexOf('<');
    return inputValue.match(RegExp((disabled ? '^[^>]+|' : '') + '<[^>]*>?|[^<]+', 'g')).map(substring => {
        if (disabled || substring.match(/^<(?!([ $,.\d\u034F]+|x+)>$)/iu)) {
            disabled = false;
            return substring;
        }
        disabled = false;
        substring = (substring
            // Initial normalization
            .normalize('NFD')
            .replaceAll('A\u030A', '\u{1BC9C}')
            .replace(/^<([ $,.\d\u034F]+)>$/u, '$1')
            .replace(/^<x+>$/i, m => '\u2E3C'.repeat(m.length - 2))
            .replaceAll(/£(?=£*\p{L})|(?<=\p{L}£*)£(?!£*\d)/gu, 'Ɬ')
            .replaceAll(/(?<=\p{L}\p{M}*)(?!Ø)\p{Upper}/gu, '\u{1BCA1}$&')
            .toLowerCase()
            .replaceAll('\\1', 'P')
            .replaceAll('\\2', 'R')
            .replaceAll(/[PR]+(?=[PR])/g, '')
            .replaceAll('[likalisti]', '\u{1BC9C}')
            .replaceAll('[sic]', '[ø]')
            .replaceAll(/(?<=\d+)(?<!\/\d+)\/(?=\d)(?!\d+\/)/g, '\u2044')
            .replaceAll(/(?<=\d)o/g, '\u00BA')
            // Quotation marks
            .replaceAll(/(?<![\p{L}\p{N}\p{P}\p{S}]\p{M}*)"/gu, '“')
            .replaceAll('"', '”')
            .replaceAll(',,', '„')
            .replaceAll(/(?<!\p{L}\p{M}*)'(?=\p{N})/gu, '’')
            .replaceAll(/(?<![\p{L}\p{N}\p{P}\p{S}]\p{M}*)['‘]+/gu, m => '‹'.repeat(m.length))
            .replaceAll(/(?<!‹[^›']*)(?<!')['’](?![\p{L}\p{N}])/gu, 'ʼ')
            .replaceAll(/'(?=\p{N})/gu, '’')
            .replaceAll(/['’](?![\p{L}\p{N}])/gu, '›')
            .replaceAll('‹‹', '«')
            .replaceAll('››', '»')
            // Homoglyphs, confusables, glyph variants, etc.
            .replaceAll('η', 'ŋ')
            .replaceAll(/[łƚ]/g, 'ɬ')
            .replaceAll('r̾', 'ř')
            .replaceAll(/[ǝә]/g, 'ə')
            .replaceAll('ʷ', 'w')
            .replaceAll(/(?<=[aeiouə])~/g, '\u0303')
            .replaceAll('ɂ', 'ʔ')
            .replaceAll(/[ʻʽ\u0313‘]|’(?!\p{N})/gu, 'ʼ')
            .replaceAll('≪', '«')
            .replaceAll('≫', '»')
            .replaceAll('⸽', '⁝')
            // NFC
            .replaceAll('a\u0303', 'ã')
            .replaceAll('e\u0300', 'è')
            .replaceAll('c\u030C', 'č')
            .replaceAll('i\u0303', 'ĩ')
            .replaceAll('i\u0304', 'ī')
            .replaceAll('k\u0331', 'ḵ')
            .replaceAll('o\u0303', 'õ')
            .replaceAll('o\u0306', 'ŏ')
            .replaceAll('r\u030C', 'ř')
            .replaceAll('s\u030C', 'š')
            .replaceAll('u\u0303', 'ũ')
            .replaceAll('u\u0308\u0304', 'ǖ')
            .replaceAll('u\u0308', 'ü')
            .replaceAll('x\u0307', 'ẋ')
            // Digraphs
            .replaceAll(/qu(?=[aeiou])/g, 'kw')
            .replaceAll(/th(?!w)/g, 'θ')
            .replaceAll('kʼ', 'ḵ')
            .replaceAll('sh', 'š')
            .replaceAll('lh', 'ƚ')
            .replaceAll(/c['ʼ]?h|j\u030C|tch?/g, 'č')
            .replaceAll('ng', 'ŋ')
            .replaceAll('rh', 'ř')
            .replaceAll(/(?<=[\p{L}\p{M}])hl|(?<![\p{L}\p{M}])hl(?![\p{L}\p{M}])/gu, 'ł')
            .replaceAll('j\u0361', 'y')
            .replaceAll(/eu|yu\u0304/g, 'ǖ')
            .replaceAll(/o[ou]/g, 'u')
            // Alternative spellings
            .replaceAll(/x[\u030C\u0323\u0325\u0331]|[իχꭓ]/g, 'ẋ')
            .replaceAll('ʙ', 'p')
            .replaceAll('ᴅ', 't')
            .replaceAll('ƛ', 'tɬ')
            .replaceAll('ɢ', 'k')
            .replaceAll(/[jʃᴊ]/g, 'š')
            .replaceAll('ᴢ', 's')
            .replaceAll(/[ĸк]/g, 'ḵ')
            .replaceAll('i\u0330', 'ī')
            .replaceAll('u\u0306', 'ŏ')
            .replaceAll('ow', 'aw')
            .replaceAll('e\u0303', 'ã')
            .replaceAll('ə̃', 'ũ')
            // Affirmative interjection “è”
            .replaceAll(/(?<!\p{L}|(?!(?<=[\t\n\r ]\u034F*)\u034F)\p{M}|'|;)è(?!\p{L}|\p{M}|'|;)/gu, 'i\\8')
            // Pronunciations that are not distinguished
            .replaceAll('q', 'k')
            .replaceAll('z', 's')
            .replaceAll(/ŋ(?=[kgḵ])/g, 'n')
            .replaceAll('υ', 'u')
            .replaceAll(/[æɑα]/g, 'a')
            .replaceAll(/[ωꞷ]/g, 'o')
            .replaceAll(/[eèɛɨɩει]|y(?!u)/g, 'i')
            .replaceAll(/(?<![ptkcḵ])ʼ/g, 'ʔ')
            .replaceAll(/[\u0300-\u0304\u0306\u0308\u030A\u030F\u0313\u0323\u0325\u0327\u032C\u0331\u0361ʰʹʼˈˌ·ˑ•]/g, '')
            .replaceAll('tɬ', 'tl')
            .replaceAll(/(?<=[kḵ])w(?![aioə])/g, '')
            // More special cases
            .replaceAll(/ɬ(?=[aiouwãõüĩīŏũǖə])/g, 'ł')
            .replaceAll(/(?<=\p{L})ɬ/gu, 'ƚ')
            .replaceAll('ɬ', 'ł')
            .replaceAll(/(?<=\p{L})(?<!x)x/gu, 'ẋ')
            .replaceAll(/x(?!x)(?=\p{L})/gu, 'ẋ')
            // Single characters for sequences
            .replaceAll(/[dt]š/g, 'č')
            .replaceAll('ts', 'c')
            .replaceAll('yu', 'ü')
            // Anti-digraph dot
            .replaceAll(/(?<=[\p{L}\p{N}])\.(?=\p{L})/gu, '')
            // Elision
            .replaceAll(/(?<=\p{L})i(?=[yü])/gu, '')
            // Schwa
            .replaceAll(/ə(?=[lɬr]\p{M}*(?!\p{L}))/gu, 'i')
            .replaceAll(/(?<=(?!(?<![cklrstw]'?)h|x)\p{L}\p{M}*'?)wə/gu, 'u')
            .replaceAll('ə', 'a')
            // “w”
            .replaceAll(/(?<!a)wh/g, 'hw')
            .replaceAll(/(?<!wi?)iw(?=i)/g, 'ü')
            .replaceAll(/aw(?![ao]|i(?![aio]))/g, 'á')
            .replaceAll('wá', 'ά')
            .replaceAll('wa', 'α')
            .replaceAll('wo', 'ω')
            .replaceAll('wii', 'η')
            .replaceAll('wi', 'ι')
            .replaceAll('w', 'o')
            // Glottal stop and ambiguous apostrophe
            .replaceAll(/([aiouãõüĩīŏũǖə])['ʔ]\1(?![aiouãõüĩīŏũǖə])(?=\p{L})/gu, '$1')
            .replaceAll(/([aiouãõüĩīŏũǖə])['ʔ](?=\1)/g, '$1h')
            .replaceAll("'", '')
            .replaceAll(/(?<=\p{L})ʔ(?=[aiouwãõüĩīŏũǖə])/gu, ';')
            .replaceAll('ʔ', '')
            // Non-breaking space inside quotation marks
            .replaceAll(/(?<=[«‹]) /g, '\u00A0')
            .replaceAll(/ (?=[!:;?»›])/g, '\u00A0')
            // ZWNJ
            .replaceAll(/;+(?=\p{L})/gu, '\u200C')
            // Three-character replacements
            .replaceAll('i\\6', '\u{1BC48}')
            .replaceAll('i\\7', '\u{1BC49}')
            .replaceAll('i\\8', '\u{1BC4A}')
            .replaceAll('i\\9', '\u{1BC4B}')
            // Two-character replacements
            .replaceAll('--', '–')
            // One-character replacements
            .replaceAll('x', '\u2E3C')
            .replaceAll('-', '\u2E40')
            .replaceAll('h', '\u{1BC00}')
            .replaceAll('ẋ', '\u{1BC01}')
            .replaceAll('p', '\u{1BC02}')
            .replaceAll('t', '\u{1BC03}')
            .replaceAll('f', '\u{1BC04}')
            .replaceAll('k', '\u{1BC05}')
            .replaceAll('l', '\u{1BC06}')
            .replaceAll('š', '\u{1BC1B}')
            .replaceAll('s', '\u{1BC1C}')
            .replaceAll('n', '\u{1BC1A}')
            .replaceAll('m', '\u{1BC19}')
            .replaceAll('b', '\u{1BC07}')
            .replaceAll('d', '\u{1BC08}')
            .replaceAll('v', '\u{1BC09}')
            .replaceAll('g', '\u{1BC0A}')
            .replaceAll('r', '\u{1BC0B}')
            .replaceAll('θ', '\u{1BC11}')
            .replaceAll('ḵ', '\u{1BC14}')
            .replaceAll('ł', '\u{1BC16}')
            .replaceAll('ƚ', '\u{1BC17}')
            .replaceAll('č', '\u{1BC23}')
            .replaceAll('c', '\u{1BC25}')
            .replaceAll('ŋ', '\u{1BC22}')
            .replaceAll('ř', '\u{1BC18}')
            .replaceAll('a', '\u{1BC41}')
            .replaceAll(/o|w/g, '\u{1BC44}')
            .replaceAll('ŏ', '\u{1BC44}\u0306')
            .replaceAll('u', '\u{1BC5B}')
            .replaceAll('á', '\u{1BC5A}')
            .replaceAll('α', '\u{1BC5C}')
            .replaceAll('i', '\u{1BC46}')
            .replaceAll('ī', '\u{1BC46}\u0323')
            .replaceAll('ü', '\u{1BC51}')
            .replaceAll('ǖ', '\u{1BC53}')
            .replaceAll('ã', '\u{1BC64}\u0301')
            .replaceAll('ĩ', '\u{1BC64}\u0300')
            .replaceAll('õ', '\u{1BC62}\u0317')
            .replaceAll('ũ', '\u{1BC62}\u0316')
            .replaceAll('ω', '\u{1BC5D}')
            .replaceAll('ι', '\u{1BC5E}')
            .replaceAll('η', '\u{1BC5F}')
            .replaceAll('ά', '\u{1BC60}')
            .replaceAll('=', '\u{1BC9F}')
            .replaceAll(/|⊕/g, '\u{1BC9C}')
            // Null marker
            .replaceAll('[ø]', 'ø')
            .replaceAll(/(?<= \u034F*)ø(?=[\p{L}\p{N}\p{S}])/gu, '')
            .replaceAll(/ \u034F*ø/g, '')
            .replaceAll(/(?<=[\p{L}\p{N}\p{S}]\p{M}*)ø(?= )/gu, '')
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
            const noSmallInitialVowel = `(?<!(?:^|\\P{L})\\p{M}*(?:[\u{1BC61}-\u{1BC64}][PR]?\\p{M}*|${iVowel})(?=${lConsonant}|${jConsonant}|${sConsonant}))`;
            const noConsonantLiquidOnset = `(?!(?:${pConsonant}|\u{1BC03}|${fConsonant}|${kConsonant})\\p{M}*[\u{1BC06}\u{1BC0B}])`;
            const onset = `(?:${consonantOrH}|\u{1BC1C}\\p{M}*(?:${lConsonant}|${mConsonant}|${nConsonant})\\p{M}*|(?:\u{1BC1C}\\p{M}*)?${lineObstruent}\\p{M}*(?:${lConsonant}\\p{M}*)?)`;
            if (autosyllabify && !word.startsWith('\u200C')) {
                word = (word
                    .replaceAll(RegExp(`(?<=${vowel}${noConsonantLiquidOnset}${consonantOrH})${consonantOrH}${vowel}`, 'gu'), '\u200C$&')
                    .replaceAll(RegExp(`(?<=${vowel}${noSmallInitialVowel}${noLaitin}${noLip}${consonantOrH}*)(?=${onset}${vowel})${consonantOrH}+${vowel}`, 'gu'), '\u200C$&')
                    .replaceAll(RegExp(`(?<=(^|\\P{L})(?<!\u200C)\u{1BC06}\\p{M}*)(?=${consonantOrH})`, 'gu'), '\u200C')
                    .replaceAll(RegExp(`(?<=(?!([\u{1BC41}\u{1BC42}\u{1BC44}\u{1BC5B}\u{1BC5C}\u{1BC5D}][PR]?\\p{M}*|${iVowel})${iVowel}|\u{1BC44}[PR]?\\p{M}*[\u{1BC51}-\u{1BC53}]|${iVowel}[\u{1BC41}\u{1BC42}\u{1BC44}]|\u{1BC5B}[PR]?\\p{M}*[\u{1BC51}-\u{1BC53}]|[\u{1BC5E}\u{1BC5F}][PR]?\\p{M}*[\u{1BC41}\u{1BC42}])${vowel})${vowel}`, 'gu'), '\u200C$&')
                    .replaceAll(RegExp(`(?<=${vowel})(?!(?<=^${iVowel}*)${iVowel}+(?!${vowel}))(?=(${vowel}{2})+(?!${vowel}))`, 'gu'), '\u200C')
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
