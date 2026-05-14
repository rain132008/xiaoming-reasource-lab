export type PublicResource = {
  id: number;
  slug: string;
  title: string;
  category: string;
  description: string;
  contentSummary: string[];
  suitableUsers: string[];
  tags: string[];
  type: string | null;
  size: string | null;
  author: string | null;
  coverIcon: string | null;
  previewImages: string[];
  relatedSlugs: string[];
  views: number;
  downloads: number;
  updatedAt: string;
};

export type ResourceListResponse = {
  list: PublicResource[];
  page: number;
  pageSize: number;
  total: number;
};

export type ResourceDetailResponse = {
  resource: PublicResource;
  related: PublicResource[];
};

export type ResourceAccessResponse = {
  url: string;
  message: string;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data && typeof data.error === 'string' ? data.error : '请求失败';
    throw new Error(message);
  }
  return data as T;
}

export function getResources(params: { pageSize?: number; category?: string; sort?: 'latest' | 'popular' } = {}) {
  const searchParams = new URLSearchParams({
    page: '1',
    pageSize: String(params.pageSize || 20),
    sort: params.sort || 'latest',
  });
  if (params.category) searchParams.set('category', params.category);
  return requestJson<ResourceListResponse>(`/api/resources?${searchParams.toString()}`);
}

export function searchResources(keyword: string, pageSize = 20) {
  const searchParams = new URLSearchParams({
    q: keyword,
    page: '1',
    pageSize: String(pageSize),
  });
  return requestJson<ResourceListResponse>(`/api/search?${searchParams.toString()}`);
}

export function getResourceDetail(slug: string) {
  return requestJson<ResourceDetailResponse>(`/api/resources/${encodeURIComponent(slug)}`);
}

export function accessResource(slug: string) {
  return requestJson<ResourceAccessResponse>(`/api/resources/${encodeURIComponent(slug)}/access`, {
    method: 'POST',
  });
}
