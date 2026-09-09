const HEADING_PATTERN = /^\s{0,3}(#{1,6})(?:\s|$)/;
const DIVIDER_PATTERN = /^\s{0,3}(?:-{3,}|\*{3,}|_{3,})\s*$/;
const EMPTY_TABLE_ROW_PATTERN = /^\s*\|(?:\s*\|)+\s*$/;
const CODE_FENCE_PATTERN = /^\s*(?:`{3,}|~{3,})[a-zA-Z0-9_-]*\s*$/;
const COMMENT_PATTERN = /^\s*(?:<!--.*?-->|%%.*?%%)\s*$/;
const TASK_OR_LIST_PREFIX_PATTERN = /^\s*(?:[-*+]|\d+[.)])(?:\s+\[[ xX]?\])?(?:\s+|$)/;

export type Heading = {
    level: number;
    line: number;
};

export function parseHeading(line: string): Heading | undefined {
    const match = line.match(HEADING_PATTERN);
    return match ? { level: match[1].length, line: -1 } : undefined;
}

export function isMeaningfulContentLine(line: string): boolean {
    if (!line || !line.trim()) {
        return false;
    }

    // Strip leading blockquotes
    const cleaned = line.replace(/^\s*(?:>\s*)+/, '').trim();
    if (!cleaned) {
        return false;
    }

    if (DIVIDER_PATTERN.test(cleaned)) {
        return false;
    }

    if (CODE_FENCE_PATTERN.test(cleaned)) {
        return false;
    }

    if (EMPTY_TABLE_ROW_PATTERN.test(cleaned)) {
        return false;
    }

    if (COMMENT_PATTERN.test(cleaned)) {
        return false;
    }

    if (parseHeading(cleaned)) {
        return false;
    }

    if (TASK_OR_LIST_PREFIX_PATTERN.test(cleaned)) {
        const remainder = cleaned.replace(TASK_OR_LIST_PREFIX_PATTERN, '').trim();
        if (!remainder || COMMENT_PATTERN.test(remainder)) {
            return false;
        }
        return true;
    }

    return true;
}

export function isBlankExcerpt(text: string | null | undefined): boolean {
    if (!text || !text.trim()) {
        return true;
    }

    const lines = text.split('\n');
    return !lines.some(isMeaningfulContentLine);
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

