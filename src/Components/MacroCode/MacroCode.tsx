import * as React from 'react';
import { VStack, Textarea } from '@chakra-ui/react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { atomone } from '@uiw/codemirror-theme-atomone';
import { syntaxHighlighting } from '@codemirror/language';
import { Tree } from '@lezer/common';
import { WowMacro, WowMacroLanguage, WowMacroHighlightStyle } from 'codemirror-lang-wow-macro';

import './MacroCode.css';
import { NodeExplanation } from '../../types/node-explanation';
import { StateEffect, StateField } from '@codemirror/state';
import { Decoration, DecorationSet, EditorView } from '@codemirror/view';

export const MacroCode = () => {
    const parser = WowMacroLanguage.parser;
    const editorRef = React.useRef<ReactCodeMirrorRef>(null);
    const [explanations, setExplanations] = React.useState<string[]>(['wait what']);
    const [code, setCode] = React.useState(
        `#showtooltip
/cast [dead] Resurrection; Heal
/cast [@focus] Fireball
/use 13
/cast [harm,mod:ctrl]Holy Fire;[harm]Smite;[mod:ctrl]Heal;Flash Heal
/cast [form:1/2] !Travel Form
/cast [stance:3] Ignore Pain
/cast [mod:shift] Dispel Magic; [modifier:alt] Purify
/cast [mod:ctrl] Resurrection; Mass Resurrection`,
    );

    function onCodeChange(newCode: string) {
        const codeExplained = explainCode(newCode);
        setCode(newCode);
        setExplanations(codeExplained);
        markText();
    }

    // -- TESTING THIS
    const addUnderline = StateEffect.define<{ from: number; to: number }>({
        map: ({ from, to }, change) => ({ from: change.mapPos(from), to: change.mapPos(to) }),
    });
    const underlineField = StateField.define<DecorationSet>({
        create() {
            return Decoration.none;
        },
        update(underlines, tr) {
            underlines = underlines.map(tr.changes);
            for (let e of tr.effects)
                if (e.is(addUnderline)) {
                    underlines = underlines.update({
                        add: [underlineMark.range(e.value.from, e.value.to)],
                    });
                }
            return underlines;
        },
        provide: (f) => EditorView.decorations.from(f),
    });
    const underlineMark = Decoration.mark({ class: 'cm-underline' });
    const underlineTheme = EditorView.baseTheme({
        '.cm-underline': { textDecoration: 'underline 3px red' },
    });
    function underlineSelection(view: EditorView, from: number, to: number) {
        const effects: StateEffect<unknown>[] = [addUnderline.of({ from, to })];
        if (!view.state.field(underlineField, false)) {
            effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]));
        }
        view.dispatch({ effects });
    }
    // -- TESTING OVER

    function markText() {
        if (!editorRef.current || !editorRef.current.view) {
            return;
        }
        const view = editorRef.current.view;
        underlineSelection(view, 100, 200);
    }

    function explainCode(codeToParse: string): string[] {
        const tree = parser.parse(codeToParse);
        const treeExplanations = explainTree(tree, codeToParse);
        return treeExplanations.map((explanation) => {
            return `${explanation.type}: ${explanation.text} (from ${explanation.from} to ${explanation.to})`;
        });
    }

    function explainTree(tree: Tree, input: string): NodeExplanation[] {
        const explanations: NodeExplanation[] = [];
        tree.iterate({
            enter(node) {
                const text = input.slice(node.from, node.to);
                if (node.type.name === '⚠') {
                    console.log(`'${node.type.name}'`);
                }
                explanations.push({
                    type: node.type.name.indexOf('⚠') >= 0 ? 'Error' : node.type.name,
                    text,
                    from: node.from,
                    to: node.to,
                });
            },
        });
        return explanations;
    }

    return (
        <VStack spacing={8}>
            <CodeMirror
                ref={editorRef}
                value={code}
                onChange={onCodeChange}
                width="800px"
                height="300px"
                theme={atomone}
                extensions={[WowMacro(), syntaxHighlighting(WowMacroHighlightStyle), underlineField, underlineTheme]}
                basicSetup={{
                    foldGutter: false,
                    dropCursor: false,
                    allowMultipleSelections: false,
                    indentOnInput: false,
                }}
            />
            <Textarea placeholder="Here is a sample placeholder" value={explanations.join('\n')} readOnly />
        </VStack>
    );
};
