/* eslint-env node */
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const { taskText } = req.body
  if (!taskText) return res.status(400).json({ error: 'taskText required' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(503).json({ error: 'API key not configured' })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 256,
        messages: [{
          role: 'user',
          content: `Break this task into 3-5 concrete, actionable micro-tasks that take 10-20 minutes each. Return ONLY a JSON array of strings, no other text, no markdown. Task: "${taskText}"`,
        }],
      }),
    })

    const data = await response.json()
    const content = data.content?.[0]?.text?.trim()
    const microTasks = JSON.parse(content)

    if (!Array.isArray(microTasks)) throw new Error('Invalid response')

    res.json({ microTasks: microTasks.slice(0, 5) })
  } catch {
    res.status(500).json({ error: 'Failed to break down task' })
  }
}
