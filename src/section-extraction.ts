const HEADING_PATTERN = /^\s{0,3}(#{1,6})(?:\s|$)/;
const DIVIDER_PATTERN = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;

export type Heading = {
    level: number;
    line: number;
};

export function parseHeading(line: string): Heading | undefined {
    const match = line.match(HEADING_PATTERN);
    return match ? { level: match[1].length, line: -1 } : undefined;
}

/**
 * Return the line numbers belonging to the bodies of headings that contain
 * backlinks. The heading line itself is intentionally excluded.
 */
export function getLinkedHeadingBodyLines(content: string, linkedLineNumbers: number[]): Set<number> {
    const lines = content.split('\n');
    const included = new Set<number>();

    for (const lineNumber of linkedLineNumbers) {
        const heading = parseHeading(lines[lineNumber] ?? '');
        if (!heading) {
            continue;
        }

        let sectionEnd = lines.length;
        for (let line = lineNumber + 1; line < lines.length; line++) {
            const nextHeading = parseHeading(lines[line]);
            if (DIVIDER_PATTERN.test(lines[line]) || nextHeading && nextHeading.level <= heading.level) {
                sectionEnd = line;
                break;
            }
        }

        for (let line = lineNumber + 1; line < sectionEnd; line++) {
            included.add(line);
        }
    }

    return included;
}

