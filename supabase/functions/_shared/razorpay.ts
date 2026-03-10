const encoder = new TextEncoder()

export function razorpayAuthHeader(keyId: string, keySecret: string): string {
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`
}

export async function hmacSha256Hex(secret: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return [...new Uint8Array(signature)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return mismatch === 0
}

export async function fetchRazorpay(
  path: string,
  keyId: string,
  keySecret: string,
  options?: { method?: string; body?: unknown }
): Promise<Response> {
  return fetch(`https://api.razorpay.com/v1/${path}`, {
    method: options?.method ?? 'GET',
    headers: {
      Authorization: razorpayAuthHeader(keyId, keySecret),
      'Content-Type': 'application/json'
    },
    body: options?.body ? JSON.stringify(options.body) : undefined
  })
}
