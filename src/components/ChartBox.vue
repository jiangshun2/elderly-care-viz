<template>
  <div class="chart" :style="{ height: height }">
    <div ref="el" class="chart__canvas"></div>
    <div v-if="loading" class="chart__mask">
      <span class="chart__spinner"></span>
    </div>
    <div v-else-if="empty" class="chart__empty">
      <svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="#c6cfdd" stroke-width="2">
        <rect x="7" y="12" width="34" height="26" rx="3" />
        <path d="M14 30l7-8 6 5 4-4 5 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      <span>暂无数据</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useChart } from '@/utils/useChart'

const props = defineProps({
  option: { type: Object, default: null },
  height: { type: String, default: '280px' },
  loading: { type: Boolean, default: false },
  empty: { type: Boolean, default: false }
})

const el = ref(null)
useChart(el, () => props.option)
</script>

<style lang="scss" scoped>
.chart {
  position: relative;
  width: 100%;
}

.chart__canvas {
  width: 100%;
  height: 100%;
}

.chart__mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, .55);
}

.chart__spinner {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  border: 2.5px solid $border;
  border-top-color: $primary;
  animation: chart-spin .8s linear infinite;
}

@keyframes chart-spin {
  to { transform: rotate(360deg); }
}

.chart__empty {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 12px;
  color: $text-3;
}
</style>
