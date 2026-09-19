import jss, { StyleSheet } from 'jss'
import preset from 'jss-preset-default'
import { ObsidianInfluxSettings } from "./main";
import { ApiAdapter } from './apiAdapter';

interface StyleProps {
    theme: string;
    centered: boolean;
    margin: number;
    fontSize: number;
    lineHeight: number;
    largeFontSize: number;
    largeLineHeight: number;
    preview: boolean;
}

export type StyleSheetType = StyleSheet<
    "inlinkedEntries"
    | "inlinkedEntry"
    | "influxComponent"
>

export function createStyleSheet(api: ApiAdapter, preview=false) {

    const settings: Partial<ObsidianInfluxSettings> = api.getSettings()

    const sizing = settings.fontSize || 13
    const centered = settings.variant !== 'ROWS'

    const props: StyleProps = {
        theme: '',
        centered: centered,
        margin: sizing,
        fontSize: sizing,
        lineHeight: sizing + sizing / 2,
        largeFontSize: sizing, // sizing + 2,
        largeLineHeight: sizing + sizing / 2, // sizing + 4,
        preview: preview,
    }


    jss.setup(preset())

    const sheet = jss
        .createStyleSheet(
            {         

                influxComponent: {
                    marginTop: `0.75em`,
                    marginBottom: `1em`,
                },

                inlinkedEntries: {
                    fontSize: `${props.fontSize}px`,
                    lineHeight: `1.5`,
                    width: 'var(--file-line-width, 100%)',
                    maxWidth: '100%',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    paddingLeft: '0.25rem',
                    paddingRight: '0.25rem',
                    '& h1, & h2, & h3': {
                        marginTop: '0.4em',
                        marginBottom: '0.2em',
                        fontSize: '1.1em',
                        fontWeight: '600',
                    },
                    '& mark': {
                        backgroundColor: 'var(--text-highlight-bg)',
                    },
                },

                inlinkedEntry: {
                    '--checkbox-size': `${props.fontSize}px`,
                    paddingBottom: '0.35rem',
                    width: '100%',

                    '& input[type=checkbox]': {
                        verticalAlign: 'middle',
                        marginRight: '0.5em',
                    },

                    '& ul, & ol': {
                        marginTop: '0.25em',
                        marginBottom: '0.5em',
                        paddingInlineStart: '1.5em',
                    },

                    '& li': {
                        marginBlockStart: '0.2em',
                        marginBlockEnd: '0.2em',
                    },

                    '& p': {
                        marginTop: '0.25em',
                        marginBottom: '0.4em',
                    },

                    '& blockquote': {
                        borderLeft: 'var(--blockquote-border-thickness) solid',
                        borderLeftColor: 'var(--blockquote-border-color)',
                        marginBlockStart: '0.25em',
                        marginBlockEnd: '0.25em',
                        paddingInlineStart: '0.75em',
                        marginInlineStart: 0,
                        marginInlineEnd: 0,
                    },

                    '& .callout': {
                        marginTop: '6px !important',
                        marginLeft: '0px !important',
                        marginRight: '0px !important',
                        paddingTop: 'var(--size-4-1)',
                        paddingBottom: 'var(--size-4-1)',
                        paddingRight: 'var(--size-4-1)',
                        paddingLeft: 'var(--size-4-2)',
                    },

                    '& .callout-icon': {
                        width: 'auto',
                    },  

                    '& span[data-callout-title]': {
                        backgroundColor: 'rgba(var(--callout-color), 0.1)',
                        borderRadius: '4px',
                        paddingLeft: '3px',
                        paddingRight: '3px',
                        paddingTop: '1px',
                        paddingBottom: '1px',
                        borderLeftWidth: '3px',
                        borderTopLeftRadius: '2px',
                        borderBottomLeftRadius: '2px',
                        '& span[data-callout-title-text]': {
                            color: 'rgba(var(--callout-color), 0.9)',
                        },
                    },

                    '& a[class=tag]': {
                        verticalAlign: 'unset !important',
                    },
                }
            }
        )
        .attach()

    return sheet

}







