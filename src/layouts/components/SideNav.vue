<template>
  <aside class="side" :class="{ 'side--collapsed': collapsed }">
    <div class="side__logo">
      <div class="side__mark">
        <svg viewBox="0 0 32 32" width="20" height="20" fill="none">
          <path d="M6 22V12l10-6 10 6v10" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M11 22v-6h4v6M17 22v-4h4v4" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="side__brand" v-show="!collapsed">
        <div class="side__name">社区养老服务</div>
        <div class="side__desc">健康监测可视化系统</div>
      </div>
    </div>

    <nav class="side__nav">
      <template v-for="group in groups" :key="group.name">
        <div class="side__group" v-show="!collapsed">{{ group.name }}</div>
        <router-link
          v-for="route in group.items"
          :key="route.path"
          :to="route.path"
          class="side__item"
          :class="{ 'is-active': route.path === $route.path }"
        >
          <AppIcon :name="route.meta.icon" :size="18" />
          <span class="side__text" v-show="!collapsed">{{ route.meta.title }}</span>
          <span class="side__dot" v-if="route.meta.icon === 'emergency'"></span>
        </router-link>
      </template>
    </nav>

    <div class="side__footer" v-show="!collapsed">
      <div class="side__version">v1.0.0 · 前端演示版</div>
      <div class="side__status">
        <span class="side__pulse"></span>
        数据服务运行中
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import { useAppStore } from '@/stores/app'

const router = useRouter()
const store = useAppStore()
const collapsed = computed(() => store.collapsed)

const groups = computed(() => {
  const map = new Map()
  router.options.routes.forEach((r) => {
    const children = r.children && r.children.length ? r.children : r.meta ? [r] : []
    children.forEach((item) => {
      if (!item.meta) return
      const g = item.meta.group || '其他'
      if (!map.has(g)) map.set(g, [])
      // 生成完整路径（父级为 '/' 时不重复拼接）
      const parent = r.path === '/' ? '' : r.path
      map.get(g).push({ ...item, path: `${parent}/${item.path}`.replace(/\/+/g, '/') })
    })
  })
  return [...map.entries()].map(([name, items]) => ({ name, items }))
})
</script>

<style lang="scss" scoped>
.side {
  width: 218px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1e3a80 0%, #1b336e 55%, #172c5e 100%);
  color: #fff;
  transition: width .22s ease;
  overflow: hidden;
}

.side--collapsed {
  width: 66px;
}

.side__logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 17px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, .09);
  flex-shrink: 0;
}

.side__mark {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: linear-gradient(135deg, $primary, $teal);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 3px 10px rgba(0, 0, 0, .2);
}

.side__brand {
  min-width: 0;
}

.side__name {
  font-size: 14px;
  font-weight: 700;
  letter-spacing: .5px;
  white-space: nowrap;
}

.side__desc {
  font-size: 11px;
  color: rgba(255, 255, 255, .5);
  margin-top: 2px;
  white-space: nowrap;
}

.side__nav {
  flex: 1;
  padding: 12px 10px;
  overflow-y: auto;
  overflow-x: hidden;
}

.side__group {
  font-size: 11px;
  color: rgba(255, 255, 255, .38);
  padding: 12px 10px 6px;
  letter-spacing: 1px;
  white-space: nowrap;
}

.side__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 10px 11px;
  margin-bottom: 3px;
  border-radius: 9px;
  font-size: 13.5px;
  color: rgba(255, 255, 255, .72);
  transition: background .18s ease, color .18s ease;
  white-space: nowrap;

  &:hover {
    background: rgba(255, 255, 255, .08);
    color: #fff;
  }

  &.is-active {
    background: linear-gradient(90deg, rgba(58, 111, 240, .95), rgba(58, 111, 240, .55));
    color: #fff;
    font-weight: 600;
    box-shadow: 0 3px 12px rgba(58, 111, 240, .38);

    .side__text {
      text-shadow: 0 1px 2px rgba(0, 0, 0, .18);
    }
  }
}

.side--collapsed .side__item {
  justify-content: center;
  padding: 11px 0;
}

.side__dot {
  position: absolute;
  right: 10px;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: $red;
  box-shadow: 0 0 0 3px rgba(229, 84, 75, .22);
}

.side__footer {
  padding: 12px 16px 16px;
  border-top: 1px solid rgba(255, 255, 255, .09);
  flex-shrink: 0;
}

.side__version {
  font-size: 11px;
  color: rgba(255, 255, 255, .4);
}

.side__status {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 7px;
  font-size: 11.5px;
  color: rgba(255, 255, 255, .62);
}

.side__pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #35d6a4;
  box-shadow: 0 0 0 3px rgba(53, 214, 164, .2);
  animation: pulse 1.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .35; }
}
</style>
