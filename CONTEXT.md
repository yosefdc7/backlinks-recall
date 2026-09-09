# Influx Section Excerpts

Context for extracting and rendering contextual backlink excerpts under notes in Obsidian.

## Language

**Inlinking Note**:
A note in the vault containing one or more links referencing the current note.
_Avoid_: Source note, caller, backlink note

**Excerpt**:
The contextual markdown content extracted from an Inlinking Note surrounding a link or under a linked heading.
_Avoid_: Summary, preview, clipping

**Template Scaffolding**:
Structural boilerplate in a note (such as empty bullet points, empty task checkboxes, or sub-heading skeletons without body text) that contains no user content.
_Avoid_: Placeholder, empty frame

**Blank Excerpt**:
An extracted excerpt that contains no visible user content after stripping whitespace, empty list/task markers (such as `- `, `* `, or `- [ ] `), and empty sub-headings that have no body text.
_Avoid_: Empty note, hollow mention

**Composite Extraction**:
When an Inlinking Note contains multiple links to the target note, only non-blank section excerpts are concatenated into the final Excerpt; if all extracted sections are blank, the entire note is omitted.
_Avoid_: Partial backlink, multi-mention merger
