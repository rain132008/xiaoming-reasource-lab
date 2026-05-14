import { Env, error, intParam, json, publicResource, requestFingerprint, ResourceRow } from '../_shared/api';

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const url = new URL(request.url);
  const keyword = (url.searchParams.get('q') || '').trim();
  if (!keyword) return json({ list: [], page: 1, pageSize: 20, total: 0 });
  if (keyword.length > 30) return error('Keyword is too long', 400);

  const page = intParam(url.searchParams.get('page'), 1, 1, 500);
  const pageSize = intParam(url.searchParams.get('pageSize'), 20, 1, 20);
  const offset = (page - 1) * pageSize;
  const like = `%${keyword}%`;

  const where = `status = ? AND (title LIKE ? OR description LIKE ? OR category LIKE ? OR tags LIKE ?)`;
  const binds = ['published', like, like, like, like];

  const totalRow = await env.DB.prepare(`SELECT COUNT(*) AS total FROM resources WHERE ${where}`)
    .bind(...binds)
    .first<{ total: number }>();

  const { results } = await env.DB.prepare(
    `SELECT * FROM resources
     WHERE ${where}
     ORDER BY sort_order DESC, updated_at DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(...binds, pageSize, offset)
    .all<ResourceRow>();

  const fingerprint = await requestFingerprint(request);
  await env.DB.prepare(
    `INSERT INTO search_logs (keyword, result_count, ip_hash, user_agent_hash) VALUES (?, ?, ?, ?)`,
  )
    .bind(keyword, totalRow?.total || 0, fingerprint.ipHash, fingerprint.userAgentHash)
    .run();

  return json({
    list: (results || []).map(publicResource),
    page,
    pageSize,
    total: totalRow?.total || 0,
  });
};
