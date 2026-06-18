import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

interface Scenario {
  name: string
  steps: string[]
}

interface Definition {
  term: string
  description: string
}

interface Header {
  storyId?: string
  asA: string
  iWant: string
  soThat: string
}

export interface FormatExistingUserStoryParams {
  id: string
  title?: string
  header: Header
  definitions: Definition[]
  acceptanceCriteria: string[]
  scenarios: Scenario[]
  examplesTable?: string
  edgeCases?: Scenario[]
  references?: string
  notes?: string
}

export async function handleFormatExistingUserStory(
  tp: TpClient,
  params: FormatExistingUserStoryParams,
) {
  const {
    id, title, header, definitions, acceptanceCriteria,
    scenarios, examplesTable, edgeCases, references, notes,
  } = params

  const gherkinBlock = (items: Scenario[]) =>
    items.map((s, indx) =>
      `<div><strong>Scenario ${indx + 1} - ${s.name}:</strong></div><div>${s.steps.map(step => `<div>\t${step}</div>`).join('\n')}</div>`
    ).join('\n')

  const parts: string[] = ['<div>']

  parts.push('<h3>Header</h3>')
  if (header.storyId) parts.push(`<p><strong>Story ID:</strong> ${header.storyId}</p>`)
  parts.push(`<p>As a ${header.asA} / I want ${header.iWant} / so that ${header.soThat}</p>`)

  if (definitions && definitions.length > 0) {
    parts.push('<h3>Definitions</h3>')
    parts.push(`<div>`)
    for (const def of definitions) {
      parts.push(`<p><strong>${def.term}</strong> — ${def.description}</p>`)
    }
    parts.push(`</div>`)
  }

  parts.push('<h3>Acceptance Criteria</h3>')
  parts.push('<ol>')
  for (const criterion of acceptanceCriteria) {
    parts.push(`<li>${criterion}</li>`)
  }
  parts.push('</ol>')

  parts.push('<h3>Scenarios</h3>')
  parts.push(gherkinBlock(scenarios))

  if (examplesTable) {
    parts.push('<h3>Examples</h3>')
    parts.push(`<pre>${examplesTable}</pre>`)
  }

  if (edgeCases && edgeCases.length > 0) {
    parts.push('<h3>Edge Cases</h3>')
    parts.push(gherkinBlock(edgeCases))
  }

  if (references) {
    parts.push('<h3>References</h3>')
    parts.push(`<p>${references}</p>`)
  }

  if (notes) {
    parts.push('<h3>Notes</h3>')
    parts.push(`<p>${notes}</p>`)
  }

  parts.push('</div>')

  const description = parts.join('\n')

  const response = await tp.updateUserStory<TP.UserStory>({ id, title, description })

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to format user story id: ${id}\n JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(response) }],
  }
}
