import type { TpClient } from '../tp.js'
import type * as TP from '../types.js'

export async function handleGetTeams(tp: TpClient) {
  const response = await tp.getTeams<TP.TpResponse<TP.Team>>()

  if (!response) {
    return {
      content: [{
        type: 'text' as const,
        text: `Failed to get teams, JSON: ${JSON.stringify(response, null, 2)}`
      }],
    }
  }

  const items = response.Items || []
  if (items.length === 0) {
    return {
      content: [{ type: 'text' as const, text: 'No teams found' }],
    }
  }

  return {
    content: [{ type: 'text' as const, text: JSON.stringify(items.map((t) => ({ id: t.Id, name: t.Name }))) }],
  }
}
