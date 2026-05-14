<script setup lang="ts">
import { categories, hotKeywords, latestResources, serviceHighlights } from '../data/home';
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

        <form class="search-bar" action="#">
          <span class="search-icon" aria-hidden="true"></span>
          <input type="search" placeholder="搜索教辅、考研、雅思、AI 资料、办公模板..." />
          <button type="submit">搜索</button>
        </form>

        <div class="hot-searches" aria-label="热门搜索">
          <span>热门搜索：</span>
          <a v-for="keyword in hotKeywords" :key="keyword" href="#">{{ keyword }}</a>
        </div>
      </div>
    </section>

    <section id="categories" class="category-grid" aria-label="资源分类">
      <article
        v-for="category in categories"
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
        <h2 id="latest-title">最近更新 <span aria-hidden="true">✦</span></h2>
        <a href="#">查看全部</a>
      </div>

      <div class="resource-grid">
        <RouterLink
          v-for="resource in latestResources"
          :key="resource.title"
          class="resource-card"
          :to="`/resource/${resource.slug}`"
        >
          <div class="resource-cover" :class="resource.coverClass">
            <span>{{ resource.category.slice(0, 2) }}</span>
          </div>
          <div class="resource-body">
            <h3>{{ resource.title }}</h3>
            <span class="tag">{{ resource.category }}</span>
            <p>{{ resource.type }} · {{ resource.size }}</p>
          </div>
          <div class="resource-meta">
            <span>{{ resource.author }}</span>
            <span>{{ resource.time }}</span>
            <span>{{ resource.views }}</span>
          </div>
        </RouterLink>
      </div>
    </section>

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
