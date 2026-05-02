/*
Copyright 2026 David Corbett

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

import { unprotectWhiteSpace } from './state.js';

let hb = null;
const fontCache = {};

function readDecorationMetrics(buffer) {
    const view = new DataView(buffer);
    const numTables = view.getUint16(4);
    const metrics = {};
    for (let i = 0; i < numTables; i++) {
        const tableRecord = 12 + i * 16;
        const tag = String.fromCharCode(
            view.getUint8(tableRecord),
            view.getUint8(tableRecord + 1),
            view.getUint8(tableRecord + 2),
            view.getUint8(tableRecord + 3),
        );
        if (tag === 'post') {
            const offset = view.getUint32(tableRecord + 8);
            metrics.underlinePosition = view.getInt16(offset + 8);
            metrics.underlineThickness = view.getInt16(offset + 10);
        } else if (tag === 'OS/2') {
            const offset = view.getUint32(tableRecord + 8);
            metrics.strikeoutThickness = view.getInt16(offset + 26);
            metrics.strikeoutPosition = view.getInt16(offset + 28);
        }
    }
    if (metrics.underlinePosition === undefined) {
        throw new Error("Font is missing 'post' table");
    }
    if (metrics.strikeoutPosition === undefined) {
        throw new Error('Font is missing OS/2 table');
    }
    return metrics;
}

async function loadFont(bold) {
    if (fontCache[bold]) {
        return fontCache[bold];
    }

    const filename = bold ? 'RawndMusmusDuployan-Bold.otf' : 'RawndMusmusDuployan-Regular.otf';
    const fontUrl = new URL(`assets/fonts/${filename}`, document.baseURI);
    const response = await fetch(fontUrl);
    if (!response.ok) {
        throw new Error(`Could not load font: ${response.status} ${response.statusText}`);
    }
    const fontBuffer = await response.arrayBuffer();

    if (!hb) {
        if (!('createHarfBuzz' in window) || !('hbjs' in window)) {
            throw new Error('harfbuzzjs has not loaded');
        }
        const instance = await window.createHarfBuzz();
        hb = window.hbjs(instance);
    }

    const blob = hb.createBlob(fontBuffer);
    const face = hb.createFace(blob, 0);
    const font = hb.createFont(face);
    const { underlinePosition, underlineThickness, strikeoutPosition, strikeoutThickness } = readDecorationMetrics(fontBuffer);

    fontCache[bold] = { font, face, underlinePosition, underlineThickness, strikeoutPosition, strikeoutThickness };
    return fontCache[bold];
}

function createSVGFromShapedText(text, fontSize, decoration, { font, face, underlinePosition, underlineThickness, strikeoutPosition, strikeoutThickness }) {
    const lines = unprotectWhiteSpace(text).split('\n');

    const padding = 16;
    const scale = fontSize / face.upem;
    const hExtents = font.hExtents();
    if (!hExtents) {
        throw new Error('Font is missing horizontal extents');
    }
    const lineHeight = (hExtents.ascender - hExtents.descender + hExtents.lineGap) * scale;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', 'white');
    svg.appendChild(background);

    let maxWidth = 0;
    let currentY = padding;

    lines.forEach(line => {
        const baselineY = currentY + fontSize;
        const buffer = hb.createBuffer();
        buffer.addText(line);
        buffer.guessSegmentProperties();
        hb.shape(font, buffer);

        let currentX = padding;

        buffer.getGlyphInfosAndPositions().forEach(glyph => {
            const glyphPath = font.glyphToPath(glyph.codepoint);
            if (glyphPath) {
                const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                path.setAttribute('d', glyphPath);
                path.setAttribute('transform', `translate(${currentX + glyph.x_offset * scale}, ${baselineY - glyph.y_offset * scale}) scale(${scale}, ${-scale})`);
                path.setAttribute('fill', 'black');
                svg.appendChild(path);
            }
            currentX += glyph.x_advance * scale;
        });

        const addLine = (position, thickness, dashed) => {
            const strokeWidth = Math.max(1, thickness * scale);
            const y = baselineY - position * scale + strokeWidth / 2;
            const decorationLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            decorationLine.setAttribute('x1', padding);
            decorationLine.setAttribute('y1', y);
            decorationLine.setAttribute('x2', currentX);
            decorationLine.setAttribute('y2', y);
            decorationLine.setAttribute('stroke', 'black');
            decorationLine.setAttribute('stroke-width', strokeWidth);
            if (dashed) {
                decorationLine.setAttribute('stroke-dasharray', `${strokeWidth * 4} ${strokeWidth * 4}`);
            }
            svg.appendChild(decorationLine);
        };
        if (decoration === 'underline') {
            addLine(underlinePosition, underlineThickness, false);
        } else if (decoration === 'dashed underline') {
            addLine(underlinePosition, underlineThickness, true);
        } else if (decoration === 'line-through') {
            addLine(strikeoutPosition, strikeoutThickness, false);
        }

        maxWidth = Math.max(maxWidth, currentX + padding);
        currentY += lineHeight;
    });

    const svgHeight = currentY + padding;
    svg.setAttribute('width', maxWidth);
    svg.setAttribute('height', svgHeight);
    svg.setAttribute('viewBox', `0 0 ${maxWidth} ${svgHeight}`);

    return svg;
}

function downloadSVG(svgElement, filename) {
    const serializer = new XMLSerializer();
    const blob = new Blob([serializer.serializeToString(svgElement)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

const saveButton = document.querySelector('#save-svg');
const outputText = document.querySelector('#output');
const boldCheckbox = document.querySelector('#bold');
const decoration = document.querySelector('#decoration');

saveButton.addEventListener('click', async () => {
    const text = outputText.textContent;
    saveButton.disabled = true;
    try {
        const fontData = await loadFont(boldCheckbox.checked);
        const fontSize = parseFloat(window.getComputedStyle(outputText).fontSize);
        const svg = createSVGFromShapedText(text, fontSize, decoration.value, fontData);
        const timestamp = new Date().toISOString().slice(0, 19).replaceAll(':', '-');
        downloadSVG(svg, `duployan-${timestamp}.svg`);
    } catch (error) {
        console.error('Failed to create SVG:', error);
        alert(`Failed to create SVG file: ${error.message}`);
    }
    saveButton.disabled = false;
});
