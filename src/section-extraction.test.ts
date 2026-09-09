import { getLinkedHeadingBodyLines, isBlankExcerpt, isMeaningfulContentLine } from './section-extraction';

function linesFor(content: string, linkedLineNumbers: number[]): string[] {
    const lines = content.split('\n');
    return [...getLinkedHeadingBodyLines(content, linkedLineNumbers)]
        .sort((a, b) => a - b)
        .map(line => lines[line]);
}

describe('linked heading section extraction', () => {
    test('excludes the linked H1 and stops at the next H1', () => {
        const content = '# Executive Dashboard\n\nOnly this body\n\n# Other project\n\nDo not include';

        expect(linesFor(content, [0])).toEqual(['', 'Only this body', '']);
    });

    test('includes nested headings and stops at the next peer heading', () => {
        const content = '# Daily note\n\n## Executive Dashboard\n\nBody\n\n### Detail\n\nNested body\n\n## Other section\n\nDo not include';

        expect(linesFor(content, [2])).toEqual(['', 'Body', '', '### Detail', '', 'Nested body', '']);
    });

    test('stops at a Markdown thematic break', () => {
        const content = '# Executive Dashboard\n\nBody\n\n---\n\nUnrelated content';

        expect(linesFor(content, [0])).toEqual(['', 'Body', '']);
    });

    test('combines multiple linked headings without duplicate lines', () => {
        const content = '# First\n\nFirst body\n\n## Nested\n\nNested body\n\n# Second\n\nSecond body';
        const result = linesFor(content, [0, 8]);

        expect(result).toEqual(['', 'First body', '', '## Nested', '', 'Nested body', '', '', 'Second body']);
        expect(result.filter(line => line === 'Nested body')).toHaveLength(1);
    });

    test('ignores ordinary backlink lines', () => {
        const content = 'A paragraph with a backlink\n\nMore context';

        expect(linesFor(content, [0])).toEqual([]);
    });
});

describe('isBlankExcerpt', () => {
    test('treats empty or whitespace strings as blank', () => {
        expect(isBlankExcerpt('')).toBe(true);
        expect(isBlankExcerpt('   ')).toBe(true);
        expect(isBlankExcerpt('\n\n\t  \n')).toBe(true);
        expect(isBlankExcerpt(null as any)).toBe(true);
        expect(isBlankExcerpt(undefined as any)).toBe(true);
    });

    test('treats Markdown dividers as blank', () => {
        expect(isBlankExcerpt('---')).toBe(true);
        expect(isBlankExcerpt('***\n___')).toBe(true);
    });

    test('treats empty list bullets and checkboxes as blank', () => {
        expect(isBlankExcerpt('- ')).toBe(true);
        expect(isBlankExcerpt('* ')).toBe(true);
        expect(isBlankExcerpt('+ ')).toBe(true);
        expect(isBlankExcerpt('1. ')).toBe(true);
        expect(isBlankExcerpt('- [ ]')).toBe(true);
        expect(isBlankExcerpt('- [ ] ')).toBe(true);
        expect(isBlankExcerpt('- [x] ')).toBe(true);
        expect(isBlankExcerpt('* [ ] \n- [ ] ')).toBe(true);
    });

    test('treats empty subheadings without body text as blank', () => {
        expect(isBlankExcerpt('#### Notes')).toBe(true);
        expect(isBlankExcerpt('### Meeting\n#### Agenda')).toBe(true);
        expect(isBlankExcerpt('#### Notes\n- [ ] \n- \n---')).toBe(true);
    });

    test('treats empty blockquotes, empty code blocks, and comments as blank', () => {
        expect(isBlankExcerpt('> ')).toBe(true);
        expect(isBlankExcerpt('> - [ ] ')).toBe(true);
        expect(isBlankExcerpt('```ts\n```')).toBe(true);
        expect(isBlankExcerpt('<!-- template comment -->')).toBe(true);
        expect(isBlankExcerpt('%% obsidian comment %%')).toBe(true);
        expect(isBlankExcerpt('- <!-- empty comment in list -->')).toBe(true);
    });

    test('recognizes tasks with text as non-blank', () => {
        expect(isBlankExcerpt('- [ ] exercise using kettleball 🛫 2026-09-09')).toBe(false);
        expect(isBlankExcerpt('* [x] completed task')).toBe(false);
        expect(isBlankExcerpt('1. First item with description')).toBe(false);
    });

    test('recognizes paragraphs, wikilinks, and media embeds as non-blank', () => {
        expect(isBlankExcerpt('Had 1:1 meeting.')).toBe(false);
        expect(isBlankExcerpt('[[Yo Manager]]')).toBe(false);
        expect(isBlankExcerpt('![[screenshot.png]]')).toBe(false);
    });

    test('recognizes headings with non-empty body text as non-blank', () => {
        const content = '#### Notes\n- [ ] exercise using kettleball 🛫 2026-09-09';
        expect(isBlankExcerpt(content)).toBe(false);

        const discussion = '#### Agenda\nDiscussed Q3 roadmap.';
        expect(isBlankExcerpt(discussion)).toBe(false);
    });

    test('recognizes table content as non-blank', () => {
        const table = '| Task | Status |\n| --- | --- |\n| Kettlebell | Done |';
        expect(isBlankExcerpt(table)).toBe(false);
    });
});
