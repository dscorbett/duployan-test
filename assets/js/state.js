/*
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

export default serializeParameters;

const bold = document.querySelector('#bold');
const decoration = document.querySelector('#decoration');
const autotransliteration = document.querySelector('#autotransliteration');
const autosyllabification = document.querySelector('#autosyllabification');
const output = document.querySelector('#output');

window.addEventListener('load', deserializeParameters);

function deserializeParameters() {
    const url = new URL(window.location);
    const textContentParam = url.searchParams.get('t');
    const noAutotransliterationParam = url.searchParams.get('T');
    const noAutosyllabificationParam = url.searchParams.get('S');
    const boldParam = url.searchParams.get('b');
    const decorationParam = url.searchParams.get('d');
    if (textContentParam !== null) {
        output.textContent = protectWhiteSpace(textContentParam);
    }
    if (noAutotransliterationParam !== null) {
        autotransliteration.checked = !noAutotransliterationParam;
    }
    if (noAutosyllabificationParam !== null) {
        autosyllabification.checked = !noAutosyllabificationParam;
    }
    if (boldParam !== null) {
        bold.checked = boldParam;
    }
    if (decorationParam !== null) {
        decoration.selectedIndex = decorationParam;
        if (decoration.selectedIndex === -1) {
            decoration.selectedIndex = 0;
        }
    }
}

function serializeParameters() {
    const url = new URL(window.location);
    url.search = '';
    if (output.textContent) {
        url.searchParams.set('t', unprotectWhiteSpace(output.textContent));
    }
    if (!autotransliteration.checked) {
        url.searchParams.set('T', '1');
    }
    if (!autosyllabification.checked) {
        url.searchParams.set('S', '1');
    }
    if (bold.checked) {
        url.searchParams.set('b', '1');
    }
    if (decoration.selectedIndex) {
        url.searchParams.set('d', decoration.selectedIndex);
    }
    window.history.replaceState(null, '', url);
}

export function protectWhiteSpace(text) {
    return text.replaceAll(/[\t\n\r ]\u034F*/g, '$&\u034F\u034F\u034F');
}

export function unprotectWhiteSpace(text) {
    return text.replaceAll(/(^|[\t\n\r ])\u034F+/g, '$1');
}
