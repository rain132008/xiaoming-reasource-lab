import { Env, error, firstParam, json, logAction, parseJsonList, publicResource, ResourceRow } from '../../_shared/api';

export const onRequestGet = async ({
  env,
  params,
  request,
}: {
  env: Env;
  params: { slug?: string | string[] };
  request: Request;
}) => {
  const slug = firstParam(params.slug);
  if (!slug) return error('Missing resource slug', 400);

  const resource = await env.DB.prepare('SELECT * FROM resources WHERE slug = ? AND status = ?')
    .bind(slug, 'published')
    .first<ResourceRow>();

  if (!resource) return error('Resource not found', 404);

  await env.DB.prepare('UPDATE resources SET view_count = view_count + 1 WHERE id = ?').bind(resource.id).run();
  await logAction(env, request, resource, 'view');

  const relatedSlugs = parseJsonList(resource.related_slugs);
  const related: ResourceRow[] = [];
  if (relatedSlugs.length) {
    const placeholders = relatedSlugs.map(() => '?').join(', ');
    const { results } = await env.DB.prepare(
      `SELECT * FROM resources WHERE slug IN (${placeholders}) AND status = ?`,
    )
      .bind(...relatedSlugs, 'published')
      .all<ResourceRow>();
    related.push(...(results || []));
  }

  if (related.length < 3) {
    const { results } = await env.DB.prepare(
      `SELECT * FROM resources
       WHERE slug != ? AND category = ? AND status = ?
       ORDER BY sort_order DESC, updated_at DESC
       LIMIT ?`,
    )
      .bind(resource.slug, resource.category, 'published', 3)
      .all<ResourceRow>();
    for (const item of results || []) {
      if (!related.some((current) => current.slug === item.slug)) related.push(item);
    }
  }

  if (related.length < 3) {
    const { results } = await env.DB.prepare(
      `SELECT * FROM resources
       WHERE slug != ? AND status = ?
       ORDER BY sort_order DESC, click_count DESC, updated_at DESC
       LIMIT ?`,
    )
      .bind(resource.slug, 'published', 6)
      .all<ResourceRow>();
    for (const item of results || []) {
      if (!related.some((current) => current.slug === item.slug)) related.push(item);
    }
  }

  return json({
    resource: {
      ...publicResource(resource),
      views: resource.view_count + 1,
    },
    related: related.slice(0, 3).map(publicResource),
  });
};
