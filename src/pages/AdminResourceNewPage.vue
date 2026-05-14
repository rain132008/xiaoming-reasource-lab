<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

const token = ref(sessionStorage.getItem('resource-admin-token') || '');
const saving = ref(false);
const message = ref('');
const createdSlug = ref('');

const form = reactive({
  title: '',
  slug: '',
  category: '自媒体运营',
  description: '',
  contentSummaryText: '',
  suitableUsersText: '',
  tagsText: '',
  type: 'PDF',
  size: '',
  author: '小明资料铺',
  coverIcon: '/assets/icon-wish-clean.svg',
  relatedSlugsText: '',
  quarkUrl: 'https://pan.quark.cn/s/5cbe470eb035',
  status: 'published',
  sortOrder: 0,
});

const canSubmit = computed(() => {
  return Boolean(token.value && form.slug && form.title && form.category && form.description && form.quarkUrl);
});

function lines(value: string) {
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function csv(value: string) {
  return value
    .split(/[,，]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function submitResource() {
  if (!canSubmit.value || saving.value) return;
  saving.value = true;
  message.value = '';
  createdSlug.value = '';
  sessionStorage.setItem('resource-admin-token', token.value);

  try {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-admin-token': token.value,
      },
      body: JSON.stringify({
        slug: form.slug,
        title: form.title,
        category: form.category,
        description: form.description,
        contentSummary: lines(form.contentSummaryText),
        suitableUsers: lines(form.suitableUsersText),
        tags: csv(form.tagsText),
        type: form.type,
        size: form.size,
        author: form.author,
        coverIcon: form.coverIcon,
        relatedSlugs: lines(form.relatedSlugsText),
        quarkUrl: form.quarkUrl,
        status: form.status,
        sortOrder: Number(form.sortOrder) || 0,
      }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || '保存失败');

    message.value = '资料已保存';
    createdSlug.value = data.resource?.slug || form.slug;
    form.title = '';
    form.slug = '';
    form.description = '';
    form.contentSummaryText = '';
    form.suitableUsersText = '';
    form.tagsText = '';
    form.size = '';
    form.relatedSlugsText = '';
  } catch (error) {
    message.value = error instanceof Error ? error.message : '保存失败';
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <main class="admin-page">
    <div class="admin-header">
      <RouterLink class="back-link" to="/">返回首页</RouterLink>
      <div>
        <p>资源管理</p>
        <h1>录入新资料</h1>
      </div>
    </div>

    <form class="admin-form" @submit.prevent="submitResource">
      <section class="admin-panel">
        <h2>基础信息</h2>
        <label>
          管理员口令
          <input v-model="token" type="password" autocomplete="current-password" placeholder="ADMIN_TOKEN" />
        </label>
        <div class="admin-grid">
          <label>
            资料标题
            <input v-model="form.title" type="text" placeholder="小红书标题模板 100 条" />
          </label>
          <label>
            Slug
            <input v-model="form.slug" type="text" placeholder="xiaohongshu-title-templates" />
          </label>
          <label>
            分类
            <input v-model="form.category" type="text" placeholder="自媒体运营" />
          </label>
          <label>
            文件类型
            <input v-model="form.type" type="text" placeholder="PDF" />
          </label>
          <label>
            文件大小
            <input v-model="form.size" type="text" placeholder="3.5 MB" />
          </label>
          <label>
            排序权重
            <input v-model.number="form.sortOrder" type="number" />
          </label>
        </div>
        <label>
          一句话简介
          <textarea v-model="form.description" rows="3" placeholder="适合谁使用，资料解决什么问题。"></textarea>
        </label>
      </section>

      <section class="admin-panel">
        <h2>内容配置</h2>
        <div class="admin-grid">
          <label>
            标签，逗号分隔
            <input v-model="form.tagsText" type="text" placeholder="小红书, 标题, 自媒体" />
          </label>
          <label>
            整理者
            <input v-model="form.author" type="text" />
          </label>
          <label>
            图标路径
            <input v-model="form.coverIcon" type="text" />
          </label>
          <label>
            状态
            <select v-model="form.status">
              <option value="published">published</option>
              <option value="hidden">hidden</option>
            </select>
          </label>
        </div>
        <label>
          资料内容，每行一条
          <textarea v-model="form.contentSummaryText" rows="5" placeholder="爆款标题结构&#10;常用开头模板"></textarea>
        </label>
        <label>
          适合人群，每行一条
          <textarea v-model="form.suitableUsersText" rows="4" placeholder="小红书新手&#10;图文创作者"></textarea>
        </label>
        <label>
          相关资料 slug，每行一条
          <textarea v-model="form.relatedSlugsText" rows="4" placeholder="ai-video-script-template&#10;prompt-starter-handbook"></textarea>
        </label>
      </section>

      <section class="admin-panel">
        <h2>资源链接</h2>
        <label>
          夸克分享链接
          <input v-model="form.quarkUrl" type="url" placeholder="https://pan.quark.cn/s/..." />
        </label>
        <div class="admin-actions">
          <button type="submit" :disabled="!canSubmit || saving">
            {{ saving ? '保存中...' : '保存资料' }}
          </button>
          <RouterLink v-if="createdSlug" :to="`/resource/${createdSlug}`">查看详情页</RouterLink>
          <span v-if="message">{{ message }}</span>
        </div>
      </section>
    </form>
  </main>
</template>
