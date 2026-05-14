import {
  Env,
  error,
  intParam,
  json,
  normalizeList,
  numberParam,
  publicResource,
  requireAdmin,
  ResourceRow,
  textParam,
} from '../../_shared/api';

export const onRequestGet = async ({ env, request }: { env: Env; request: Request }) => {
  const url = new URL(request.url);
  const page = intParam(url.searchParams.get('page'), 1, 1, 500);
  const pageSize = intParam(url.searchParams.get('pageSize'), 20, 1, 50);
  const category = url.searchParams.get('category')?.trim();
  const sort = url.searchParams.get('sort') || 'latest';
  const offset = (page - 1) * pageSize;

  const where = ['status = ?'];
  const binds: unknown[] = ['published'];
  if (category) {
    where.push('category = ?');
    binds.push(category);
  }

  const orderBy =
    sort === 'popular'
      ? 'click_count DESC, view_count DESC, updated_at DESC'
      : 'sort_order DESC, updated_at DESC, id DESC';

  const totalRow = await env.DB.prepare(`SELECT COUNT(*) AS total FROM resources WHERE ${where.join(' AND ')}`)
    .bind(...binds)
    .first<{ total: number }>();

  const { results } = await env.DB.prepare(
    `SELECT * FROM resources WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
  )
    .bind(...binds, pageSize, offset)
    .all<ResourceRow>();

  return json({
    list: (results || []).map(publicResource),
    page,
    pageSize,
    total: totalRow?.total || 0,
  });
};

type CreateResourceBody = {
  slug?: string;
  title?: string;
  category?: string;
  description?: string;
  contentSummary?: string[];
  suitableUsers?: string[];
  tags?: string[];
  type?: string;
  size?: string;
  author?: string;
  coverIcon?: string;
  previewImages?: string[];
  relatedSlugs?: string[];
  quarkUrl?: string;
  status?: string;
  sortOrder?: number;
};

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  const adminError = requireAdmin(request, env);
  if (adminError) return adminError;

  let body: CreateResourceBody;
  try {
    body = await request.json();
  } catch {
    return error('Invalid JSON body', 400);
  }

  const slug = textParam(body.slug, 120);
  const title = textParam(body.title, 120);
  const category = textParam(body.category, 40);
  const description = textParam(body.description, 500);
  const quarkUrl = textParam(body.quarkUrl, 500);
  const status = textParam(body.status, 20) || 'published';

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return error('Slug must use lowercase letters, numbers, and hyphens', 400);
  }
  if (title.length < 2) return error('Title is required', 400);
  if (category.length < 2) return error('Category is required', 400);
  if (description.length < 5) return error('Description is required', 400);
  if (!/^https:\/\/pan\.quark\.cn\/s\/[A-Za-z0-9]+/.test(quarkUrl)) {
    return error('A valid Quark share URL is required', 400);
  }
  if (!['published', 'hidden'].includes(status)) return error('Invalid status', 400);

  const contentSummary = normalizeList(body.contentSummary, 30, 160);
  const suitableUsers = normalizeList(body.suitableUsers, 20, 120);
  const tags = normalizeList(body.tags, 20, 40);
  const previewImages = normalizeList(body.previewImages, 10, 300);
  const relatedSlugs = normalizeList(body.relatedSlugs, 10, 120);
  const now = new Date().toISOString().slice(0, 10);

  try {
    const result = await env.DB.prepare(
      `INSERT INTO resources (
        slug, title, category, description, content_summary, suitable_users, tags,
        file_type, file_size, author, cover_image, preview_images, related_slugs,
        quark_url, status, sort_order, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        slug,
        title,
        category,
        description,
        JSON.stringify(contentSummary),
        JSON.stringify(suitableUsers),
        JSON.stringify(tags),
        textParam(body.type, 20) || 'PDF',
        textParam(body.size, 40),
        textParam(body.author, 80) || '小明资料铺',
        textParam(body.coverIcon, 300) || '/assets/icon-wish-clean.svg',
        JSON.stringify(previewImages),
        JSON.stringify(relatedSlugs),
        quarkUrl,
        status,
        numberParam(body.sortOrder, 0, -9999, 9999),
        now,
        now,
      )
      .run();

    const resource = await env.DB.prepare('SELECT * FROM resources WHERE id = ?')
      .bind(result.meta.last_row_id)
      .first<ResourceRow>();

    return json({ resource: resource ? publicResource(resource) : null }, { status: 201 });
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : 'Create resource failed';
    if (message.toLowerCase().includes('unique')) return error('Slug already exists', 409);
    return error(message, 500);
  }
};
