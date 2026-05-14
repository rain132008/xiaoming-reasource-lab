<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { accessResource, getResourceDetail, PublicResource } from '../services/resources';

const route = useRoute();
const resource = ref<PublicResource | null>(null);
const relatedResources = ref<PublicResource[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const opening = ref(false);

async function loadResource() {
  const slug = String(route.params.slug || '');
  if (!slug) return;

  loading.value = true;
  errorMessage.value = '';
  resource.value = null;
  relatedResources.value = [];

  try {
    const data = await getResourceDetail(slug);
    resource.value = data.resource;
    relatedResources.value = data.related;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '资源加载失败';
  } finally {
    loading.value = false;
  }
}

async function openResource() {
  if (!resource.value || opening.value) return;
  opening.value = true;
  errorMessage.value = '';

  try {
    const data = await accessResource(resource.value.slug);
    window.open(data.url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '获取资料链接失败';
  } finally {
    opening.value = false;
  }
}

onMounted(loadResource);
watch(() => route.params.slug, loadResource);
</script>

<template>
  <main v-if="loading" class="empty-page">
    <h1>资料加载中</h1>
    <p>正在从数据库读取资源详情。</p>
  </main>

  <main v-else-if="resource" class="simple-detail-page">
    <RouterLink class="back-link" to="/">返回首页</RouterLink>

    <section class="simple-detail-card">
      <div class="simple-detail-copy">
        <div class="detail-tags">
          <span>{{ resource.category }}</span>
          <span>{{ resource.type || '资料' }} · {{ resource.size || '持续更新' }}</span>
        </div>
        <h1>{{ resource.title }}</h1>
        <p>{{ resource.description }}</p>
        <div v-if="resource.contentSummary.length" class="detail-mini-list">
          <span v-for="item in resource.contentSummary.slice(0, 4)" :key="item">{{ item }}</span>
        </div>
        <div class="detail-actions">
          <button class="primary-action" type="button" :disabled="opening" @click="openResource">
            {{ opening ? '正在打开...' : '免费获取资料' }}
          </button>
        </div>
        <p v-if="errorMessage" class="inline-error">{{ errorMessage }}</p>
      </div>

      <div class="simple-preview">
        <img :src="resource.coverIcon || '/assets/icon-wish-clean.svg'" :alt="resource.title" />
        <div>
          <span>资料预览</span>
          <strong>{{ resource.title }}</strong>
          <small>{{ resource.updatedAt }} 更新 · {{ resource.views }} 次浏览</small>
        </div>
      </div>
    </section>

    <section v-if="relatedResources.length" class="simple-related">
      <h2>相关资料</h2>
      <div class="simple-related-list">
        <RouterLink v-for="item in relatedResources" :key="item.slug" :to="`/resource/${item.slug}`">
          {{ item.title }}
        </RouterLink>
      </div>
    </section>

    <p class="simple-notice">资源仅供学习交流使用。如链接失效，后续会补一个反馈入口。</p>
  </main>

  <main v-else class="empty-page">
    <h1>没有找到这份资料</h1>
    <p>{{ errorMessage || '资源可能已下架，或者链接地址不完整。' }}</p>
    <RouterLink to="/">回到首页</RouterLink>
  </main>
</template>
