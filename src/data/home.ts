export type CategoryCard = {
  title: string;
  subtitle: string;
  theme: 'blue' | 'mint' | 'violet' | 'amber' | 'sky' | 'rose';
  icon: string;
  items: Array<{
    title: string;
    slug: string;
  }>;
};

export type ResourceItem = {
  slug: string;
  title: string;
  category: string;
  type: string;
  size: string;
  author: string;
  time: string;
  views: number;
  coverClass: string;
};

export const hotKeywords = ['考研数学', '雅思口语', 'AI 工具', 'PPT 模板', '小学奥数'];

export const categories: CategoryCard[] = [
  {
    title: '中小学教辅',
    subtitle: '同步练习、专项训练、作文素材应有尽有',
    theme: 'blue',
    icon: '/assets/icon-book-clean.svg',
    items: [
      { title: '小学奥数高频题整理', slug: 'primary-math-olympiad' },
      { title: '初中英语作文模板', slug: 'middle-school-english-writing' },
      { title: '同步练习资料包', slug: 'school-sync-practice' },
    ],
  },
  {
    title: 'AI 学习资料',
    subtitle: '从入门到进阶，掌握 AI 工具与应用',
    theme: 'mint',
    icon: '/assets/icon-ai-clean.svg',
    items: [
      { title: 'Midjourney 实战入门指南', slug: 'midjourney-starter-guide' },
      { title: 'Prompt 入门手册', slug: 'prompt-starter-handbook' },
      { title: 'AI 工具导航清单', slug: 'ai-tools-directory' },
    ],
  },
  {
    title: '雅思备考',
    subtitle: '听说读写全覆盖，助你高分通关',
    theme: 'violet',
    icon: '/assets/icon-headset-clean.svg',
    items: [
      { title: '雅思口语高频题库', slug: 'ielts-speaking-bank' },
      { title: '雅思写作高分范文', slug: 'ielts-writing-samples' },
      { title: '雅思听力场景词汇', slug: 'ielts-listening-words' },
    ],
  },
  {
    title: '考研资料',
    subtitle: '公共课 + 专业课，一站式备考资料',
    theme: 'amber',
    icon: '/assets/icon-cap-clean.svg',
    items: [
      { title: '2024 考研英语（二）真题及解析', slug: 'kaoyan-english-2024' },
      { title: '考研政治核心考点', slug: 'kaoyan-politics-points' },
      { title: '考研数学公式清单', slug: 'kaoyan-math-formulas' },
    ],
  },
  {
    title: '办公模板',
    subtitle: '高效办公必备，模板开箱即用',
    theme: 'sky',
    icon: '/assets/icon-report-clean.svg',
    items: [
      { title: '简约商务风 PPT 模板合集', slug: 'office-ppt-templates' },
      { title: 'Excel 常用函数清单', slug: 'excel-functions-cheatsheet' },
      { title: '工作复盘模板', slug: 'work-review-template' },
    ],
  },
  {
    title: '资源心愿单',
    subtitle: '你想要的资料，我们帮你找',
    theme: 'rose',
    icon: '/assets/icon-wish-clean.svg',
    items: [
      { title: '小红书标题模板 100 条', slug: 'xiaohongshu-title-templates' },
      { title: 'AI 短视频脚本模板', slug: 'ai-video-script-template' },
      { title: '副业项目记录表', slug: 'side-project-record-sheet' },
    ],
  },
];

export const latestResources: ResourceItem[] = [
  {
    slug: 'kaoyan-english-2024',
    title: '2024 考研英语（二）真题及解析',
    category: '考研资料',
    type: 'PDF',
    size: '12.4 MB',
    author: '小明资料铺',
    time: '2小时前',
    views: 368,
    coverClass: 'cover-green',
  },
  {
    slug: 'ielts-speaking-bank',
    title: '雅思口语高频题库（Part1-3）',
    category: '雅思备考',
    type: 'PDF',
    size: '8.7 MB',
    author: '小明资料铺',
    time: '5小时前',
    views: 534,
    coverClass: 'cover-blue',
  },
  {
    slug: 'midjourney-starter-guide',
    title: 'Midjourney 实战入门指南',
    category: 'AI 学习资料',
    type: 'PDF',
    size: '15.6 MB',
    author: '小明资料铺',
    time: '昨天',
    views: 862,
    coverClass: 'cover-dark',
  },
  {
    slug: 'office-ppt-templates',
    title: '简约商务风 PPT 模板合集',
    category: '办公模板',
    type: 'PPTX',
    size: '21.3 MB',
    author: '小明资料铺',
    time: '昨天',
    views: 452,
    coverClass: 'cover-orange',
  },
];

export const serviceHighlights = [
  { title: '精心整理', text: '人工筛选，优质可靠', icon: 'box' },
  { title: '持续更新', text: '紧跟热点，定期上新', icon: 'refresh' },
  { title: '免费下载', text: '大部分资源可免费下载', icon: 'download' },
  { title: '用心服务', text: '你的需求，我们在意', icon: 'heart' },
];
