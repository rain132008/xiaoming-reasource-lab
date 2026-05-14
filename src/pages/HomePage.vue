<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { getResources, PublicResource, searchResources } from '../services/resources';

type CategoryCard = {
  title: string;
  subtitle: string;
  theme: string;
  icon: string;
  items: PublicResource[];
};

const resources = ref<PublicResource[]>([]);
const loading = ref(true);
const errorMessage = ref('');
const searchQuery = ref('');
const activeKeyword = ref('');

const serviceHighlights = [
  { title: '精心整理', text: '人工筛选，优质可靠', icon: 'box' },
  { title: '持续更新', text: '紧跟热点，定期上新', icon: 'refresh' },
  { title: '免费下载', text: '大部分资源可免费下载', icon: 'download' },
  { title: '用心服务', text: '你的需求，我们在意', icon: 'heart' },
];

const themeList = ['blue', 'mint', 'violet', 'amber', 'sky', 'rose'];
const iconList = [
  '/assets/icon-book-clean.svg',
  '/assets/icon-ai-clean.svg',
  '/assets/icon-headset-clean.svg',
  '/assets/icon-cap-clean.svg',
  '/assets/icon-report-clean.svg',
  '/assets/icon-wish-clean.svg',
];
const coverClasses = ['cover-green', 'cover-blue', 'cover-dark', 'cover-orange'];

const categoryCards = computed<CategoryCard[]>(() => {
  const groups = new Map<string, PublicResource[]>();
  for (const resource of resources.value) {
    if (!groups.has(resource.category)) groups.set(resource.category, []);
    groups.get(resource.category)?.push(resource);
  }

  return Array.from(groups.entries()).map(([category, items], index) => ({
    title: category,
    subtitle: `${items.length} 份资料，持续整理更新`,
    theme: themeList[index % themeList.length],
    icon: iconList[index % iconList.length],
    items: items.slice(0, 3),
  }));
});

const latestResources = computed(() => resources.value.slice(0, 8));

const hotKeywords = computed(() => {
  const keywords = new Set<string>();
  for (const resource of resources.value) {
    resource.tags.slice(0, 2).forEach((tag) => keywords.add(tag));
    if (keywords.size < 5) keywords.add(resource.category);
  }
  return Array.from(keywords).slice(0, 5);
});

async function loadResources() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await getResources({ pageSize: 30, sort: 'latest' });
    resources.value = data.list;
    activeKeyword.value = '';
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '资源加载失败';
  } finally {
    loading.value = false;
  }
}

async function submitSearch(keyword = searchQuery.value) {
  const value = keyword.trim();
  if (!value) {
    await loadResources();
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  try {
    const data = await searchResources(value, 30);
    resources.value = data.list;
    activeKeyword.value = value;
    searchQuery.value = value;
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : '搜索失败';
  } finally {
    loading.value = false;
  }
}

function resourceCoverClass(index: number) {
  return coverClasses[index % coverClasses.length];
}

onMounted(loadResources);
</script>

<template>
  <main>
    <section class="hero-section">
      <img class="hero-bg" src="/assets/hero-files.png" alt="" />
      <div class="hero-content">
        <RouterLink class="brand hero-brand" to="/">
          <span class="brand-mark" aria-hidden="true">
            <span class="book-shape"></span>
            <span class="star-shape"></span>
          </span>
          <span>小明资料铺</span>
        </RouterLink>
        <p class="eyebrow">免费资料整理站</p>
        <h1>把<span>好用资料</span>，慢慢整理给你</h1>
        <p class="hero-subtitle">
          收集学习资料、备考资源、AI 资料和实用模板，让学习和工作更轻松。
        </p>

        <form class="search-bar" @submit.prevent="submitSearch()">
          <span class="search-icon" aria-hidden="true"></span>
          <input v-model="searchQuery" type="search" placeholder="搜索教辅、考研、雅思、AI 资料、办公模板..." />
          <button type="submit">搜索</button>
        </form>

        <div v-if="hotKeywords.length" class="hot-searches" aria-label="热门搜索">
          <span>{{ activeKeyword ? '当前搜索：' : '热门搜索：' }}</span>
          <a v-for="keyword in hotKeywords" :key="keyword" href="#" @click.prevent="submitSearch(keyword)">
            {{ keyword }}
          </a>
        </div>
      </div>
    </section>

    <section v-if="loading" class="empty-page">
      <h1>资料加载中</h1>
      <p>正在从数据库读取最新资源。</p>
    </section>

    <section v-else-if="errorMessage" class="empty-page">
      <h1>资源加载失败</h1>
      <p>{{ errorMessage }}</p>
      <button class="primary-action" type="button" @click="loadResources">重试</button>
    </section>

    <template v-else>
      <section v-if="categoryCards.length" id="categories" class="category-grid" aria-label="资源分类">
        <article
          v-for="category in categoryCards"
          :key="category.title"
          class="category-card"
          :class="`theme-${category.theme}`"
        >
          <div class="category-copy">
            <h2>{{ category.title }}</h2>
            <p>{{ category.subtitle }}</p>
          </div>
          <img class="category-icon" :src="category.icon" :alt="category.title" />
          <div class="category-list">
            <RouterLink v-for="item in category.items" :key="item.slug" :to="`/resource/${item.slug}`">
              <span>{{ item.title }}</span>
              <span class="chevron" aria-hidden="true"></span>
            </RouterLink>
          </div>
        </article>
      </section>

      <section class="latest-section" aria-labelledby="latest-title">
        <div class="section-heading">
          <h2 id="latest-title">{{ activeKeyword ? '搜索结果' : '最近更新' }}<span aria-hidden="true">★</span></h2>
          <a v-if="activeKeyword" href="#" @click.prevent="loadResources">查看全部</a>
        </div>

        <div v-if="latestResources.length" class="resource-grid">
          <RouterLink
            v-for="(resource, index) in latestResources"
            :key="resource.slug"
            class="resource-card"
            :to="`/resource/${resource.slug}`"
          >
            <div class="resource-cover" :class="resourceCoverClass(index)">
              <span>{{ resource.category.slice(0, 2) }}</span>
            </div>
            <div class="resource-body">
              <h3>{{ resource.title }}</h3>
              <span class="tag">{{ resource.category }}</span>
              <p>{{ resource.type || '资料' }} · {{ resource.size || '持续更新' }}</p>
            </div>
            <div class="resource-meta">
              <span>{{ resource.author || '小明资料铺' }}</span>
              <span>{{ resource.updatedAt }}</span>
              <span>{{ resource.views }} 次浏览</span>
            </div>
          </RouterLink>
        </div>

        <div v-else class="empty-page compact-empty">
          <h1>暂时没有匹配资料</h1>
          <p>换个关键词试试，或者后续提交资源心愿。</p>
        </div>
      </section>
    </template>

    <section id="about" class="service-strip" aria-label="服务说明">
      <article v-for="item in serviceHighlights" :key="item.title">
        <span class="service-icon" :class="`service-${item.icon}`" aria-hidden="true"></span>
        <div>
          <h3>{{ item.title }}</h3>
          <p>{{ item.text }}</p>
        </div>
      </article>
    </section>
  </main>
</template>
