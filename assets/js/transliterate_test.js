/*
Copyright 2024 David Corbett

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

import transliterate from "./transliterate.js";

if (window.location.pathname === '/') {
    function assertEquals(input, expected, f = x => x) {
        const actual = f(input);
        console.assert(actual === expected, '%s -> %s; expected: %s', input, actual, expected);
    }

    function assertTransliterates(input, expected) {
        assertEquals(input, expected, transliterate);
    }

    // Characters
    assertTransliterates('h', '𛰀');
    assertTransliterates('ẋ', '𛰀');
    assertTransliterates('x̌', '𛰀');
    assertTransliterates('x̣', '𛰀');
    assertTransliterates('x̥', '𛰀');
    assertTransliterates('x̱', '𛰀');
    assertTransliterates('ի', '𛰀');
    assertTransliterates('χ', '𛰀');
    assertTransliterates('ꭓ', '𛰀');
    assertTransliterates('xa', '𛰁𛱁');
    assertTransliterates('p', '𛰂');
    assertTransliterates('ʙ', '𛰂');
    assertTransliterates('t', '𛰃');
    assertTransliterates('ᴅ', '𛰃');
    assertTransliterates('ᴅh', '𛰃𛰀');
    assertTransliterates('f', '𛰄');
    assertTransliterates('k', '𛰅');
    assertTransliterates('kw', '𛰅');
    assertTransliterates('ɢ', '𛰅');
    assertTransliterates('ɢh', '𛰅𛰀');
    assertTransliterates('l', '𛰆');
    assertTransliterates('m', '𛰙');
    assertTransliterates('n', '𛰚');
    assertTransliterates('sh', '𛰛');
    assertTransliterates('sի', '𛰜𛰀');
    assertTransliterates('j', '𛰛');
    assertTransliterates('š', '𛰛');
    assertTransliterates('ʃ', '𛰛');
    assertTransliterates('ᴊ', '𛰛');
    assertTransliterates('s', '𛰜');
    assertTransliterates('z', '𛰜');
    assertTransliterates('ᴢ', '𛰜');
    assertTransliterates('ᴢh', '𛰜𛰀');
    assertTransliterates('b', '𛰇');
    assertTransliterates('d', '𛰈');
    assertTransliterates('v', '𛰉');
    assertTransliterates('g', '𛰊');
    assertTransliterates('r', '𛰋');
    assertTransliterates('th', '𛰑');
    assertTransliterates('tի', '𛰃𛰀');
    assertTransliterates('thwi', '𛰃𛰀𛱞');
    assertTransliterates("k'", '𛰔');
    assertTransliterates('kh', '𛰅𛰀');
    assertTransliterates('kի', '𛰅𛰀');
    assertTransliterates('hl', '𛰖');
    assertTransliterates('ɬ', '𛰖');
    assertTransliterates('ƚ', '𛰖');
    assertTransliterates('ł', '𛰖');
    assertTransliterates('lh', '𛰗');
    assertTransliterates('aɬ', '𛱁𛰗');
    assertTransliterates('aƚ', '𛱁𛰗');
    assertTransliterates('ał', '𛱁𛰗');
    assertTransliterates('ch', '𛰣');
    assertTransliterates("c'h", '𛰣');
    assertTransliterates('č', '𛰣');
    assertTransliterates('dj', '𛰣');
    assertTransliterates('tʃ', '𛰣');
    assertTransliterates('t͡ʃ', '𛰣');
    assertTransliterates('ǰ', '𛰣');
    assertTransliterates('ᴅᴊ', '𛰣');
    assertTransliterates('c', '𛰥');
    assertTransliterates('ts', '𛰥');
    assertTransliterates('ng', '𛰢');
    assertTransliterates('ngk', '𛰚𛰅');
    assertTransliterates('rh', '𛰘');
    assertTransliterates('a', '𛱁');
    assertTransliterates('æ', '𛱁');
    assertTransliterates('ɑ', '𛱁');
    assertTransliterates('o', '𛱄');
    assertTransliterates('w', '𛱄');
    assertTransliterates('ω', '𛱄');
    assertTransliterates('ꞷ', '𛱄');
    assertTransliterates('ŏ', '𛱄̆');
    assertTransliterates('ŭ', '𛱄̆');
    assertTransliterates('u', '𛱛');
    assertTransliterates('oo', '𛱛');
    assertTransliterates('ou', '𛱛');
    assertTransliterates('υ', '𛱛');
    assertTransliterates('ꞷu', '𛱄‌𛱛');
    assertTransliterates('aw', '𛱚');
    assertTransliterates('ow', '𛱚');
    assertTransliterates('awi', '𛱁‌𛱞');
    assertTransliterates('awia', '𛱚‌𛱊𛱁');
    assertTransliterates('wa', '𛱜');
    assertTransliterates('i', '𛱆');
    assertTransliterates('e', '𛱆');
    assertTransliterates('y', '𛱆');
    assertTransliterates('ɛ', '𛱆');
    assertTransliterates('ɨ', '𛱆');
    assertTransliterates('ɩ', '𛱆');
    assertTransliterates('ε', '𛱆');
    assertTransliterates('ι', '𛱆');
    assertTransliterates('ī', '𛱆̣');
    assertTransliterates('i\\6', '𛱈');
    assertTransliterates('i\\7', '𛱉');
    assertTransliterates('i\\8', '𛱊');
    assertTransliterates('i\\9', '𛱋');
    assertTransliterates('yu', '𛱑');
    assertTransliterates('yoo', '𛱑');
    assertTransliterates('you', '𛱑');
    assertTransliterates('j͡u', '𛱑');
    assertTransliterates('ü', '𛱑');
    assertTransliterates('eu', '𛱓');
    assertTransliterates('yū', '𛱓');
    assertTransliterates('ã', '𛱤');
    assertTransliterates('a~', '𛱤');
    assertTransliterates('ẽ', '𛱤');
    assertTransliterates('e~', '𛱤');
    assertTransliterates('ĩ', '𛱣');
    assertTransliterates('i~', '𛱣');
    assertTransliterates('õ', '𛱢');
    assertTransliterates('o~', '𛱢');
    assertTransliterates('ũ', '𛱡');
    assertTransliterates('u~', '𛱡');
    assertTransliterates('ə̃', '𛱡');
    assertTransliterates('wo', '𛱝');
    assertTransliterates('wi', '𛱞');
    assertTransliterates('wii', '𛱟');
    assertTransliterates('wei', '𛱟');
    assertTransliterates('waw', '𛱠');
    assertTransliterates('wow', '𛱠');
    assertTransliterates('wawa', '𛱜‌𛱜');
    assertTransliterates('Å', '𛲜');
    assertTransliterates('', '𛲜');
    assertTransliterates('=', '𛲟');
    assertTransliterates('--', '–');
    assertTransliterates('-', '⹀');
    assertTransliterates('x', '⸼');
    assertTransliterates('xx', '⸼⸼');
    assertTransliterates('<xxx>', '⸼⸼⸼');
    assertTransliterates('axxx', '𛱁𛰁⸼⸼');
    assertTransliterates('xxxa', '𛰁𛰁𛰁𛱁');
    assertTransliterates('axxxa', '𛱁𛰁𛰁‌𛰁𛱁');
    assertTransliterates('ST', '𛰜𛲡𛰃');
    assertTransliterates('"a"', '“𛱁”');
    assertTransliterates(',,', '„');
    assertTransliterates("'9", '’9');
    assertTransliterates("''a''", '«𛱁»');
    assertTransliterates('≪', '«');
    assertTransliterates('≫', '»');
    assertTransliterates("'a'", '‹𛱁›');
    assertTransliterates("a'", '𛱁');
    assertTransliterates('‘a’', '‹𛱁›');
    assertTransliterates('‘k’', '‹𛰅›');
    assertTransliterates('£', '£');
    assertTransliterates('£a', '𛰖𛱂');
    assertTransliterates('£1', '£1');
    assertTransliterates('1o', '1º');
    assertTransliterates('a [Ø].', '𛱁.');
    assertTransliterates('a [Ø] a', '𛱁 𛱁');
    assertTransliterates('a[Ø]a', '𛱁 𛱁');
    assertTransliterates('kʹ', '𛰅');
    assertTransliterates('kʻ', '𛰔');
    assertTransliterates('kʼ', '𛰔');
    assertTransliterates('kʽ', '𛰔');
    assertTransliterates('kˈ', '𛰅');
    assertTransliterates('kˌ', '𛰅');
    assertTransliterates('k‘', '𛰔');
    assertTransliterates('k’', '𛰔');
    assertTransliterates('tʹs', '𛰥');
    assertTransliterates('tʻs', '𛰥');
    assertTransliterates('tʼs', '𛰥');
    assertTransliterates('tʽs', '𛰥');
    assertTransliterates('tˈs', '𛰥');
    assertTransliterates('tˌs', '𛰥');
    assertTransliterates('t‘s', '𛰥');
    assertTransliterates('t’s', '𛰥');
    assertTransliterates('kʷa', '𛰅𛱜');
    assertTransliterates('qua', '𛰅𛱜');
    assertTransliterates('ƛ', '𛰃𛰆');
    assertTransliterates('piia', '𛰂𛱆‌𛱊𛱁');
    assertTransliterates('piyu', '𛰂𛱑');
    assertTransliterates('iyu', '𛱆‌𛱑');
    assertTransliterates('iwi', '𛱑‌𛱆');
    assertTransliterates('wiiwi', '𛱟‌𛱞');
    assertTransliterates('təl', '𛰃𛱇𛰆');
    assertTransliterates('təlk', '𛰃𛱁𛰆𛰅');
    assertTransliterates('kwə', '𛰅𛱛');
    assertTransliterates('ə', '𛱁');
    assertTransliterates('wh', '𛰀𛱄');
    assertTransliterates('awh', '𛱚𛰀');
    assertTransliterates("a'i", '𛱂𛱆');
    assertTransliterates("a'a", '𛱁‌𛰀𛱁');
    assertTransliterates('tʔa', '𛰃‌𛱁');
    assertTransliterates('tʔs', '𛰃𛰜');
    assertTransliterates('ʔ', '');
    assertTransliterates('tʰ', '𛰃');

    // CV syllables
    assertTransliterates('pa', '𛰂𛱁');
    assertTransliterates('pai', '𛰂𛱂𛱆');
    assertTransliterates('po', '𛰂𛱄');
    assertTransliterates('pwa', '𛰂𛱜');
    assertTransliterates('pi', '𛰂𛱆');
    assertTransliterates('pia', '𛰂𛱆𛱂');
    assertTransliterates('pyu', '𛰂𛱑');
    assertTransliterates('ta', '𛰃𛱂');
    assertTransliterates('tai', '𛰃𛱁𛱆');
    assertTransliterates('to', '𛰃𛱄͏͏͏');
    assertTransliterates('twa', '𛰃𛱜͏͏͏');
    assertTransliterates('tih', '𛰃𛱇𛰀');
    assertTransliterates('tia', '𛰃𛱇𛱂');
    assertTransliterates('tyu', '𛰃𛱒');
    assertTransliterates('fa', '𛰄𛱁');
    assertTransliterates('fai', '𛰄𛱁𛱆');
    assertTransliterates('fo', '𛰄𛱄');
    assertTransliterates('fwa', '𛰄𛱜');
    assertTransliterates('fi', '𛰄𛱆');
    assertTransliterates('fia', '𛰄𛱆𛱂');
    assertTransliterates('fyu', '𛰄𛱑');
    assertTransliterates('ka', '𛰅𛱁');
    assertTransliterates('kai', '𛰅𛱂𛱆');
    assertTransliterates('ko', '𛰅𛱄');
    assertTransliterates('kwa', '𛰅𛱜');
    assertTransliterates('ki', '𛰅𛱆');
    assertTransliterates('kia', '𛰅𛱆𛱂');
    assertTransliterates('kyu', '𛰅𛱑');
    assertTransliterates('la', '𛰆𛱂');
    assertTransliterates('lai', '𛰆𛱁𛱆');
    assertTransliterates('lo', '𛰆𛱄͏͏͏');
    assertTransliterates('lwa', '𛰆𛱜͏͏͏');
    assertTransliterates('li', '𛰆𛱇');
    assertTransliterates('lia', '𛰆𛱇𛱂');
    assertTransliterates('lyu', '𛰆𛱒');
    assertTransliterates('sha', '𛰛𛱁');
    assertTransliterates('shai', '𛰛𛱁𛱆');
    assertTransliterates('sho', '𛰛𛱄');
    assertTransliterates('shwa', '𛰛𛱜');
    assertTransliterates('shi', '𛰛𛱇');
    assertTransliterates('shia', '𛰛𛱇𛱂');
    assertTransliterates('shyu', '𛰛𛱒');
    assertTransliterates('sa', '𛰜𛱁');
    assertTransliterates('sai', '𛰜𛱁𛱆');
    assertTransliterates('so', '𛰜𛱄');
    assertTransliterates('swa', '𛰜𛱜');
    assertTransliterates('si', '𛰜𛱇');
    assertTransliterates('sia', '𛰜𛱇𛱂');
    assertTransliterates('syu', '𛰜𛱒');
    assertTransliterates('na', '𛰚𛱁');
    assertTransliterates('nai', '𛰚𛱁𛱋');
    assertTransliterates('no', '𛰚𛱄');
    assertTransliterates('nwa', '𛰚𛱜');
    assertTransliterates('ni', '𛰚𛱇');
    assertTransliterates('nia', '𛰚𛱇𛱂');
    assertTransliterates('nyu', '𛰚𛱒');
    assertTransliterates('ma', '𛰙𛱁');
    assertTransliterates('mai', '𛰙𛱁𛱆');
    assertTransliterates('mo', '𛰙𛱄');
    assertTransliterates('mwa', '𛰙𛱜');
    assertTransliterates('mi', '𛰙𛱇');
    assertTransliterates('mia', '𛰙𛱇𛱂');
    assertTransliterates('myu', '𛰙𛱒');

    // VC syllables
    assertTransliterates('ap', '𛱂𛰂');
    assertTransliterates('at', '𛱁𛰃');
    assertTransliterates('af', '𛱂𛰄');
    assertTransliterates('ak', '𛱂𛰅');
    assertTransliterates('al', '𛱁𛰆');
    assertTransliterates('ash', '𛱁𛰛');
    assertTransliterates('as', '𛱁𛰜');
    assertTransliterates('an', '𛱁𛰚');
    assertTransliterates('am', '𛱁𛰙');
    assertTransliterates('aip', '𛱂𛱆𛰂');
    assertTransliterates('ait', '𛱂𛱇𛰃');
    assertTransliterates('aif', '𛱂𛱆𛰄');
    assertTransliterates('aik', '𛱂𛱆𛰅');
    assertTransliterates('ail', '𛱂𛱇𛰆');
    assertTransliterates('aish', '𛱂𛱇𛰛');
    assertTransliterates('ais', '𛱂𛱇𛰜');
    assertTransliterates('ain', '𛱂𛱇𛰚');
    assertTransliterates('aim', '𛱂𛱇𛰙');
    assertTransliterates('op', '𛱄͏͏͏𛰂');
    assertTransliterates('ot', '𛱄𛰃');
    assertTransliterates('of', '𛱄͏͏͏𛰄');
    assertTransliterates('ok', '𛱄͏͏͏𛰅');
    assertTransliterates('ol', '𛱄𛰆');
    assertTransliterates('osh', '𛱄𛰛');
    assertTransliterates('os', '𛱄𛰜');
    assertTransliterates('on', '𛱄𛰚');
    assertTransliterates('om', '𛱄𛰙');
    assertTransliterates('wap', '𛱜͏͏͏𛰂');
    assertTransliterates('wat', '𛱜͏͏͏𛰃');
    assertTransliterates('waf', '𛱜͏͏͏𛰄');
    assertTransliterates('wak', '𛱜͏͏͏𛰅');
    assertTransliterates('wal', '𛱜͏͏͏𛰆');
    assertTransliterates('wash', '𛱜͏͏͏𛰛');
    assertTransliterates('was', '𛱜͏͏͏𛰜');
    assertTransliterates('wan', '𛱜𛰚');
    assertTransliterates('wam', '𛱜͏͏͏𛰙');
    assertTransliterates('ip', '𛱆𛰂');
    assertTransliterates('it', '𛱇𛰃');
    assertTransliterates('if', '𛱆𛰄');
    assertTransliterates('ik', '𛱆𛰅');
    assertTransliterates('il', '𛱇𛰆');
    assertTransliterates('ish', '𛱇𛰛');
    assertTransliterates('is', '𛱇𛰜');
    assertTransliterates('in', '𛱇𛰚');
    assertTransliterates('im', '𛱇𛰙');
    assertTransliterates('iap', '𛱊𛱁𛰂');
    assertTransliterates('iat', '𛱆𛱁𛰃');
    assertTransliterates('iaf', '𛱊𛱁𛰄');
    assertTransliterates('iak', '𛱊𛱁𛰅');
    assertTransliterates('ial', '𛱆𛱁𛰆');
    assertTransliterates('iash', '𛱆𛱁𛰛');
    assertTransliterates('ias', '𛱊𛱁𛰜');
    assertTransliterates('ian', '𛱆𛱁𛰚');
    assertTransliterates('iam', '𛱊𛱁𛰙');
    assertTransliterates('yup', '𛱑𛰂');
    assertTransliterates('yut', '𛱒𛰃');
    assertTransliterates('yuf', '𛱑𛰄');
    assertTransliterates('yuk', '𛱑𛰅');
    assertTransliterates('yul', '𛱒𛰆');
    assertTransliterates('yush', '𛱒𛰛');
    assertTransliterates('yus', '𛱒𛰜');
    assertTransliterates('yun', '𛱒𛰚');
    assertTransliterates('yum', '𛱒𛰙');

    // Syllable break before consonantal “i”
    assertTransliterates('piii', '𛰂𛱆‌𛱇𛱇');
    assertTransliterates('taii', '𛰃𛱂‌𛱇𛱇');

    // Syllable break after coda before “l”
    assertTransliterates('ashla', '𛱁𛰛‌𛰆𛱂');
    assertTransliterates('lasli', '𛰆𛱁𛰜‌𛰆𛱇');
    assertTransliterates('anla', '𛱁𛰚‌𛰆𛱂');
    assertTransliterates('kamlups', '𛰅𛱁𛰙‌𛰆𛱛𛰂𛰜');

    // Specific words
    assertTransliterates('hloima', '𛰀𛰆𛱄𛱆‌𛰙𛱁');
    assertTransliterates('hahlip', '𛰀𛱁𛰀‌𛰆𛱇𛰂');
    assertTransliterates('pasaiuks', '𛰂𛱁‌𛰜𛱁𛱆‌𛱛͏͏͏𛰅𛰜');
    assertTransliterates('taird', '𛰃𛱁𛱆𛰋𛰈');
    assertTransliterates('til', '𛰃𛱇𛰆');
    assertTransliterates('fairman', '𛰄𛱁𛱆𛰋‌𛰙𛱁𛰚');
    assertTransliterates('kwash', '𛰅𛱜͏͏͏𛰛');
    assertTransliterates('liplit', '𛰆𛱇𛰂𛰆𛱇𛰃');
    assertTransliterates('lipap', '𛰆𛱇𛰂𛱂𛰂');
    assertTransliterates(';shanwari', '𛰛𛱁𛰚𛱜͏͏͏𛰋𛱇');
    assertTransliterates('nawitka', '𛰚𛱁‌𛱞‌𛰃𛰅𛱁');
    assertTransliterates('naif', '𛰚𛱁𛱇𛰄');
    assertTransliterates('nain', '𛰚𛱁𛱇𛰚');
    assertTransliterates('mithwit', '𛰙𛱇𛰃‌𛰀𛱞͏͏͏𛰃');
    assertTransliterates('mitlait', '𛰙𛱆𛰃‌𛰆𛱂𛱆𛰃');
    assertTransliterates('gitop', '𛰊𛱆𛰃‌𛱄͏͏͏𛰂');
    assertTransliterates('ala', '𛱁‌𛰆𛱂');
    assertTransliterates('è', '𛱊');
    assertTransliterates('itluil', '𛱆‌𛰃𛰆𛱛͏͏͏‌𛱇𛰆');
    assertTransliterates('ilaitin', '𛱇𛰆𛱂𛱆𛰃𛱇𛰚');
    assertTransliterates('ilihi', '𛱇𛰆𛱇‌𛰀𛱇');
    assertTransliterates('ilip', '𛱇𛰆𛱇𛰂');
    assertTransliterates('isik', '𛱇𛰜𛱇𛰅');
    assertTransliterates('ina', '𛱆‌𛰚𛱁');
    assertTransliterates('iiir', '𛱇𛱇𛱇𛰋');
    assertTransliterates('iiiir', '𛱇𛱇𛱇𛱇𛰋');
    assertTransliterates('yutlkat', '𛱒𛰃𛰆‌𛰅𛱁𛰃');

    // Fractions
    assertTransliterates('12/', '12/');
    assertTransliterates('/34', '/34');
    assertTransliterates('12/34', '12⁄34');
    assertTransliterates('12/34/', '12/34/');
    assertTransliterates('/34/56', '/34/56');
    assertTransliterates('12/34/56/78', '12/34/56/78');
}
