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

import transliterate0 from "./transliterate.js";

const autotransliteration = document.querySelector('#autotransliteration');
const autosyllabification = document.querySelector('#autosyllabification');
const infoPlaceholder = document.querySelector('#info-placeholder');
const outputText = document.querySelector('#output');
const scrollText = document.querySelector('#mock-output');
const inputText = document.createElement('textarea');

window.addEventListener('load', () => {
    scrollText.style.height =  outputText.style.height = window.getComputedStyle(outputText).height;
    scrollText.textContent = outputText.textContent = '';

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

let previousTextLength;
let previousScrollHeight;

outputText.addEventListener('scroll', e => previousScrollHeight = undefined);

window.addEventListener('load', () => {
    scrollText.style.height = window.getComputedStyle(outputText).height;
    scrollText.textContent = '';
});

window.setInterval(
    () => {
        if (document.activeElement !== outputText || previousTextLength === outputText.textContent.length) {
            return;
        }
        previousTextLength = outputText.textContent.length;
        const start = getOutputSelectionStart();
        const end = getOutputSelectionEnd();
        if (window.getSelection().rangeCount !== 0) {
            scrollText.textContent = outputText.textContent.substring(0, previousOutputSelectionStart);
            scrollText.style.display = 'block';
            let scrollHeight = scrollText.scrollHeight;
            scrollText.style.display = null;
            if (scrollHeight !== previousScrollHeight) {
                console.log('scrollHeight: %s -> %s', previousScrollHeight, scrollHeight);
                const innerHTML = outputText.innerHTML;
                outputText.innerHTML = outputText.textContent.substring(0, previousOutputSelectionStart) + '<br id="scrollTarget">' + outputText.textContent.substring(previousOutputSelectionEnd);
                const scrollTarget = document.querySelector('#scrollTarget');
                scrollTarget.scrollIntoView({block: 'end'});
                scrollTarget.remove();
                outputText.innerHTML = innerHTML;
                previousScrollHeight = scrollHeight;
            }
            setSelectionRange(outputText, start, end);
        }
    },
    20,
)

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
    return transliterate0(inputValue, autosyllabify, textBefore);
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
    } else {
        console.log('not an insertion event; clearing inputText');
        inputText.value = '';
        previousOutputSelectionStart = undefined;
        previousOutputSelectionEnd = undefined;
    }
    debugTransliteration('end');
    console.groupEnd();
});
