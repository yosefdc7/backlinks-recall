import { getLinkedHeadingBodyLines } from './section-extraction';

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
