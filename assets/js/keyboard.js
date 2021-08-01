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

const textarea = document.querySelector('#output');

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

document.querySelectorAll('#keyboard span').forEach(key => key.addEventListener('click', () => {
    const text = extract(key);
    const valueBefore = textarea.value.substr(0, textarea.selectionStart) + text;
    const valueAfter = textarea.value.substr(textarea.selectionEnd);
    textarea.value = valueBefore + valueAfter;
    const newPosition = valueBefore.length;
    textarea.setSelectionRange(newPosition, newPosition);
}));
