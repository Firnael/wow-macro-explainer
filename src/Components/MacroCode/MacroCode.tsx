import * as React from "react"
import {
  VStack,
  Textarea,
} from "@chakra-ui/react"
import CodeMirror from '@uiw/react-codemirror'
import { atomone } from '@uiw/codemirror-theme-atomone'
import { syntaxHighlighting } from '@codemirror/language'
import { WowMacro, WowMacroHighlightStyle } from 'codemirror-lang-wow-macro'
import './MacroCode.css';

export const MacroCode = () => {

  const [explanations, setExplanations] = React.useState<string[]>(['wait what'])
  const [code, setCode] = React.useState(
    `#showtooltip
/cast [dead] Resurrection; Heal
/cast [@focus] Fireball
/use 13
/cast [harm,mod:ctrl]Holy Fire;[harm]Smite;[mod:ctrl]Heal;Flash Heal
/cast [form:1/2] !Travel Form
/cast [stance:3] Ignore Pain
/cast [mod:shift] Dispel Magic; [modifier:alt] Purify
/cast [mod:ctrl] Resurrection; Mass Resurrection`
  )

  function onCodeChange(newCode: string) {
    const codeExplained = explainCode(newCode)
    setCode(newCode)
    setExplanations(codeExplained)
  }

  function explainCode(codeToParse: string): string[] {
    const lines = codeToParse.split('\n')
    console.log(lines)

    const explanationLines: string[] = []
    lines.forEach(l => {
      const explanationsForLine = explainLine(l)
      explanationLines.push(explanationsForLine)
    })

    return explanationLines
  }

  // ---Explainer
  const metaCommandPattern = /#\b(showtooltip|show)\b/i
  const commandPattern = /\/\w+/

  function explainLine(line: string): string {
    if (!line) {
      return '-nothing to explain, line empty-'
    }

    const splittedLine = line.split(' ')

    const metaCommandOrCommand = splittedLine[0]
    if (metaCommandPattern.test(metaCommandOrCommand)) {
      return 'this is a meta-command'
    } else if(commandPattern.test(metaCommandOrCommand)) {
      return 'this is a command'
    } else {
      return 'i do not know yet'
    }
  }
  //---

  return (
    <VStack spacing={8}>
      <CodeMirror
        value={code}
        onChange={onCodeChange}
        width="800px"
        height="300px"
        theme={atomone}
        extensions={[
          WowMacro(),
          syntaxHighlighting(WowMacroHighlightStyle)
        ]}
        basicSetup={{
          foldGutter: false,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
        }}
      />
      <Textarea placeholder='Here is a sample placeholder' value={explanations.join('\n')} readOnly />
    </VStack>
  )
}
