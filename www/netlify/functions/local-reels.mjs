import { getStore } from '@netlify/blobs'

const store = getStore({ name: 'local-reels', consistency: 'strong' })
const MAX_CAPTION_LENGTH = 220
const MAX_AREA_LENGTH = 64

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
  })

const normalizeArea = (value = '') =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_AREA_LENGTH)

const tidyAreaLabel = (value = '') => value.trim().replace(/\s+/g, ' ').slice(0, MAX_AREA_LENGTH)

const isHttpUrl = (value = '') => {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const getGeoAreaFallback = (context) => {
  const parts = [context?.geo?.city, context?.geo?.subdivision?.name].filter(Boolean)
  return parts.join(', ')
}

export default async (req, context) => {
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const areaLabel = tidyAreaLabel(url.searchParams.get('area') || getGeoAreaFallback(context))
    const areaKey = normalizeArea(areaLabel)

    if (!areaKey) {
      return json({ error: 'Area is required.' }, 400)
    }

    const { blobs } = await store.list({ prefix: `reels/${areaKey}/` })
    const reels = await Promise.all(blobs.map(({ key }) => store.get(key, { type: 'json' })))

    const sorted = reels
      .filter(Boolean)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 30)

    return json({ area: areaLabel, reels: sorted })
  }

  if (req.method === 'POST') {
    let payload
    try {
      payload = await req.json()
    } catch {
      return json({ error: 'Invalid JSON payload.' }, 400)
    }

    const areaLabel = tidyAreaLabel(payload?.area || getGeoAreaFallback(context))
    const areaKey = normalizeArea(areaLabel)
    const caption = String(payload?.caption || '').trim().slice(0, MAX_CAPTION_LENGTH)
    const videoUrl = String(payload?.videoUrl || '').trim()
    const author = String(payload?.author || 'Neighbor').trim().slice(0, 60) || 'Neighbor'

    if (!areaKey) {
      return json({ error: 'Area is required for local reels.' }, 400)
    }

    if (!isHttpUrl(videoUrl)) {
      return json({ error: 'A valid http/https reel URL is required.' }, 400)
    }

    const reel = {
      id: crypto.randomUUID(),
      areaKey,
      areaLabel,
      author,
      caption,
      videoUrl,
      createdAt: new Date().toISOString(),
    }

    const key = `reels/${areaKey}/${Date.now()}-${reel.id}.json`
    await store.setJSON(key, reel)

    return json({ reel }, 201)
  }

  return json({ error: 'Method not allowed.' }, 405)
}
