<template>
  <div class="layout">
    <SideNav />
    <div class="layout__main">
      <TopBar @refresh="onRefresh" />
      <main class="layout__content">
        <router-view v-slot="{ Component, route }">
          <transition name="fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import SideNav from './components/SideNav.vue'
import TopBar from './components/TopBar.vue'
import { useAppStore } from '@/stores/app'
import { getNotices } from '@/api/modules/overview'

const store = useAppStore()

function onRefresh() {
  store.refreshKey++
  loadNotices()
}

async function loadNotices() {
  try {
    const res = await getNotices()
    store.setNotices(res)
  } catch (e) {
    /* 忽略：通知为非关键数据 */
  }
}

onMounted(loadNotices)
</script>

<style lang="scss" scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.layout__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.layout__content {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background:
    radial-gradient(1100px 380px at 88% -10%, rgba(58, 111, 240, .07), transparent 62%),
    radial-gradient(760px 300px at 4% 0%, rgba(18, 176, 164, .06), transparent 60%),
    $bg;
}
</style>
