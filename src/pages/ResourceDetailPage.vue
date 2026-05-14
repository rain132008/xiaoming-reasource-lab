<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { getRelatedResources, getResourceBySlug } from '../data/resources';

const route = useRoute();
const RESOURCE_SHARE_URL = 'https://pan.quark.cn/s/5cbe470eb035';

const resource = computed(() => getResourceBySlug(String(route.params.slug)));
const relatedResources = computed(() => (resource.value ? getRelatedResources(resource.value) : []));

function openResource() {
  if (!resource.value) return;
  window.open(RESOURCE_SHARE_URL, '_blank', 'noopener,noreferrer');
}
</script>

<template>
  <main v-if="resource" class="simple-detail-page">
    <RouterLink class="back-link" to="/">返回首页</RouterLink>

    <section class="simple-detail-card">
      <div class="simple-detail-copy">
        <div class="detail-tags">
          <span>{{ resource.category }}</span>
          <span>{{ resource.type }} · {{ resource.size }}</span>
        </div>
        <h1>{{ resource.title }}</h1>
        <p>{{ resource.description }}</p>
        <div class="detail-actions">
          <button class="primary-action" type="button" @click="openResource">免费获取资料</button>
        </div>
      </div>

      <div class="simple-preview">
        <img :src="resource.coverIcon" :alt="resource.title" />
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
    <p>资源可能已下架，或者链接地址不完整。</p>
    <RouterLink to="/">回到首页</RouterLink>
  </main>
</template>
