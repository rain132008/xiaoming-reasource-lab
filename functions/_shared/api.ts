export type Env = {
  DB: any;
  ADMIN_TOKEN?: string;
  TURNSTILE_SECRET_KEY?: string;
};

export type ResourceRow = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  content_summary: string | null;
  suitable_users: string | null;
  tags: string | null;
  file_type: string | null;
  file_size: string | null;
  author: string | null;
  cover_image: string | null;
  preview_images: string | null;
  related_slugs: string | null;
  quark_url: string;
  status: string;
  sort_order: number;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
};

export function json(data: unknown, init: ResponseInit = {}) {
  const headers = new Headers(init.headers);
  headers.set('content-type', 'application/json; charset=utf-8');
  return new Response(JSON.stringify(data), { ...init, headers });
}

export function error(message: string, status = 400) {
  return json({ error: message }, { status });
}

export function requireAdmin(request: Request, env: Env) {
  if (!env.ADMIN_TOKEN) return error('ADMIN_TOKEN is not configured', 500);

  const bearer = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim();
  const token = request.headers.get('x-admin-token') || bearer;
  if (token !== env.ADMIN_TOKEN) return error('Unauthorized', 401);

  return null;
}

export function intParam(value: string | null, fallback: number, min: number, max: number) {
  const parsed = Number.parseInt(value || '', 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function textParam(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function numberParam(value: unknown, fallback: number, min: number, max: number) {
  const parsed = typeof value === 'number' ? value : Number.parseInt(String(value || ''), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value || '';
}

export function parseJsonList(value: string | null) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function normalizeList(value: unknown, maxItems = 20, maxItemLength = 120) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim().slice(0, maxItemLength) : ''))
    .filter(Boolean)
    .slice(0, maxItems);
}

export function publicResource(row: ResourceRow) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    contentSummary: parseJsonList(row.content_summary),
    suitableUsers: parseJsonList(row.suitable_users),
    tags: parseJsonList(row.tags),
    type: row.file_type,
    size: row.file_size,
    author: row.author,
    coverIcon: row.cover_image,
    previewImages: parseJsonList(row.preview_images),
    relatedSlugs: parseJsonList(row.related_slugs),
    views: row.view_count,
    downloads: row.click_count,
    updatedAt: row.updated_at,
  };
}

export function getUtmSource(request: Request) {
  return new URL(request.url).searchParams.get('utm_source')?.slice(0, 80) || null;
}

export async function sha256(input: string) {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export async function requestFingerprint(request: Request) {
  const ip =
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for') ||
    request.headers.get('x-real-ip') ||
    '';
  const userAgent = request.headers.get('user-agent') || '';

  return {
    ipHash: ip ? await sha256(ip) : null,
    userAgentHash: userAgent ? await sha256(userAgent) : null,
    referer: request.headers.get('referer')?.slice(0, 500) || null,
  };
}

export async function logAction(env: Env, request: Request, resource: Pick<ResourceRow, 'id' | 'slug'>, action: string) {
  const fingerprint = await requestFingerprint(request);
  await env.DB.prepare(
    `INSERT INTO click_logs (resource_id, resource_slug, action, ip_hash, user_agent_hash, referer, utm_source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      resource.id,
      resource.slug,
      action,
      fingerprint.ipHash,
      fingerprint.userAgentHash,
      fingerprint.referer,
      getUtmSource(request),
    )
    .run();
}
