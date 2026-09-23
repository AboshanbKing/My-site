import { kv } from '@vercel/kv'

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Origin', '*')
  response.setHeader('Cache-Control', 'no-store, no-cache, max-age=0, must-revalidate')
  response.setHeader('Content-Type', 'application/json; charset=utf-8')

  if (request.method === 'OPTIONS') {
    response.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return response.status(204).end()
  }

  try {
    const count = await kv.incr('site_visits')
    return response.status(200).json({ count })
  } catch (error) {
    console.error('Visits counter error:', error)
    return response.status(200).json({ count: null })
  }
}
