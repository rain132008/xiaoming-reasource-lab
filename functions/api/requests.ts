import { Env, error, json, requestFingerprint, textParam } from '../_shared/api';

type RequestBody = {
  title?: string;
  category?: string;
  description?: string;
  expected_content?: string;
  contact?: string;
  turnstileToken?: string;
};

async function verifyTurnstile(secret: string | undefined, token: string | undefined, request: Request) {
  if (!secret) return true;
  if (!token) return false;

  const formData = new FormData();
  formData.append('secret', secret);
  formData.append('response', token);
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) formData.append('remoteip', ip);

  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: formData,
  });
  const result = (await response.json()) as { success?: boolean };
  return Boolean(result.success);
}

export const onRequestPost = async ({ env, request }: { env: Env; request: Request }) => {
  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return error('Invalid JSON body', 400);
  }

  const title = textParam(body.title, 80);
  const category = textParam(body.category, 40);
  const description = textParam(body.description, 500);
  const expectedContent = textParam(body.expected_content, 500);
  const contact = textParam(body.contact, 120);

  if (title.length < 2) return error('Title is required', 400);
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, request))) {
    return error('Turnstile verification failed', 403);
  }

  const fingerprint = await requestFingerprint(request);
  const result = await env.DB.prepare(
    `INSERT INTO resource_requests (
       title, category, description, expected_content, contact, ip_hash, user_agent_hash
     ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(title, category || null, description || null, expectedContent || null, contact || null, fingerprint.ipHash, fingerprint.userAgentHash)
    .run();

  return json(
    {
      id: result.meta.last_row_id,
      status: 'pending',
      message: '已收到你的资源需求',
    },
    { status: 201 },
  );
};
