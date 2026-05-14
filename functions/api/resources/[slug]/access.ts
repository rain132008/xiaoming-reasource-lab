import { Env, error, firstParam, json, logAction, ResourceRow } from '../../../_shared/api';

export const onRequestPost = async ({
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

  await logAction(env, request, resource, 'access');
  await env.DB.prepare('UPDATE resources SET click_count = click_count + 1 WHERE id = ?').bind(resource.id).run();

  return json({
    url: resource.quark_url,
    message: '已为你打开资料链接',
  });
};
