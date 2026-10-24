<template>
  <div class="page">
    <!-- ===== 指标卡 ===== -->
    <section class="grid-12">
      <div class="col-3" v-for="k in cards" :key="k.label">
        <StatCard :label="k.label" :value="k.value" :unit="k.unit" :icon="k.icon" :tone="k.tone" :tip-text="k.tip">
          <template #foot>
            <span :style="{ color: k.footColor }">{{ k.foot }}</span>
          </template>
        </StatCard>
      </div>
    </section>

    <!-- ===== 需求趋势 + 类型构成 ===== -->
    <section class="grid-12">
      <div class="col-8">
        <PanelBox title="服务需求量与满足缺口" :sub="`近 ${store.days} 天`">
          <template #extra>
            <div class="legend-inline">
              <span><i style="background:#3a6ff0"></i>服务需求</span>
              <span><i style="background:#12b0a4"></i>已满足</span>
              <span><i style="background:#f2a63b"></i>未满足</span>
            </div>
          </template>
          <ChartBox :option="demandOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="服务类型构成" sub="累计工单占比">
          <ChartBox :option="typeDonutOption" height="300px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 排行 / 缺口 / 热力 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="各服务类型需求量排行" sub="含满足率">
          <ChartBox :option="rankOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="社区供需缺口分析" sub="供给能力 - 服务需求">
          <ChartBox :option="gapOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="服务需求时段热力图" sub="星期 × 时段">
          <ChartBox :option="heatmapOption" height="300px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 满意度 + 工单 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="服务质量满意度雷达" :sub="`综合得分 ${satisfaction.overall || '-'} 分`">
          <ChartBox :option="radarOption" height="310px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="满意度评价分布" sub="累计评价数">
          <ChartBox :option="distOption" height="310px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="最新服务评价" sub="家属与老人反馈" flush>
          <ul class="comments">
            <li v-for="c in satisfaction.comments || []" :key="c.time + c.user" class="comment">
              <div class="comment__head">
                <span class="comment__user">{{ c.user }}</span>
                <span class="comment__rate">
                  <i v-for="n in 5" :key="n" :class="{ 'is-on': n <= c.rating }">★</i>
                </span>
                <span class="comment__time">{{ c.time }}</span>
              </div>
              <p class="comment__text">{{ c.content }}</p>
              <span class="comment__community">{{ c.community }}</span>
            </li>
          </ul>
        </PanelBox>
      </div>
    </section>

    <!-- ===== 工单列表 ===== -->
    <section class="grid-12">
      <div class="col-12">
        <PanelBox title="服务工单明细" :sub="`累计 ${orderList.total || 0} 单`" flush>
          <template #extra>
            <el-select v-model="statusFilter" size="small" placeholder="状态" clearable style="width: 130px">
              <el-option label="已完成" value="已完成" />
              <el-option label="服务中" value="服务中" />
              <el-option label="待派单" value="待派单" />
              <el-option label="已取消" value="已取消" />
            </el-select>
          </template>
          <el-table :data="filteredOrders" size="small" height="320" class="order-table">
            <el-table-column prop="id" label="工单号" width="120" />
            <el-table-column prop="elder" label="服务对象" width="100" />
            <el-table-column prop="type" label="服务类型" width="110" />
            <el-table-column prop="community" label="社区" width="102" />
            <el-table-column prop="staff" label="服务人员" width="100" />
            <el-table-column label="状态" width="92">
              <template #default="{ row }">
                <span class="status" :style="{ background: row.statusColor + '1a', color: row.statusColor }">{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="duration" label="时长(分钟)" width="104" />
            <el-table-column prop="time" label="服务时间" min-width="130" />
          </el-table>
        </PanelBox>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import StatCard from '@/components/StatCard.vue'
import PanelBox from '@/components/PanelBox.vue'
import ChartBox from '@/components/ChartBox.vue'
import {
  getServiceSummary,
  getDemandTrend,
  getTypeRank,
  getHeatmap,
  getSupplyGap,
  getSatisfaction,
  getOrderList
} from '@/api/modules/service'
import { useAppStore } from '@/stores/app'
import { grad, hexToRgba, grid, tip, donutBase, centerTitle } from '@/utils/chartOptions'

const store = useAppStore()

const summary = ref({})
const demand = ref({})
const rank = ref({})
const heatmap = ref({})
const gap = ref({})
const satisfaction = ref({})
const orderList = ref({ total: 0, list: [] })
const statusFilter = ref('')

async function loadData() {
  const [s, d, r, h, g, sa, o] = await Promise.all([
    getServiceSummary(),
    getDemandTrend({ days: store.days }),
    getTypeRank(),
    getHeatmap(),
    getSupplyGap(),
    getSatisfaction(),
    getOrderList({ size: 60 })
  ])
  summary.value = s
  demand.value = d
  rank.value = r
  heatmap.value = h
  gap.value = g
  satisfaction.value = sa
  orderList.value = o
}

onMounted(loadData)
watch(() => store.refreshKey, loadData)

/* ---------- 指标卡 ---------- */
const cards = computed(() => {
  const s = summary.value
  if (!s.total) return []
  const totalGap = (gap.value.communities || []).reduce((a, b) => a + Math.max(0, b.gap), 0)
  return [
    { label: '今日服务人次', value: s.today, unit: '人次', icon: 'service', tone: 'primary', tip: '含上门、康复、助餐等', foot: '较昨日 +12.4%', footColor: '#28a86b' },
    { label: '本月服务量', value: s.monthTotal, unit: '单', icon: 'chart', tone: 'cyan', tip: '累计服务工单', foot: '累计 18642 单', footColor: '#2fb6e0' },
    { label: '服务满足率', value: s.satisfiedRate, unit: '%', icon: 'heart', tone: 'green', tip: '按期完成且老人满意', foot: '待派单 37 单', footColor: '#28a86b' },
    { label: '供给缺口', value: totalGap, unit: '单', icon: 'alert', tone: 'amber', tip: '各社区供给能力合计不足', foot: `平均时长 ${s.avgDuration} 分钟`, footColor: '#f2a63b' }
  ]
})

/* ---------- 需求趋势 ---------- */
const demandOption = computed(() => {
  const d = demand.value
  if (!d.dates) return null
  return {
    tooltip: tip({
      formatter: (p) => {
        const i = p[0].dataIndex
        return `${d.dates[i]}<br/>需求 <b>${d.demand[i]}</b> 单<br/>已满足 <b>${d.supply[i]}</b> 单<br/>未满足 <b>${d.unsatisfied[i]}</b> 单`
      }
    }),
    legend: { show: false },
    grid: grid({ top: 26, right: 14, bottom: 2, left: 4 }),
    xAxis: {
      type: 'category',
      data: d.dates,
      axisLabel: { color: '#96a2b6', fontSize: 11, interval: Math.ceil(d.dates.length / 12) },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', name: '单', nameTextStyle: { color: '#96a2b6', fontSize: 11 } },
    series: [
      {
        name: '未满足',
        type: 'bar',
        stack: 'g',
        data: d.supply,
        barWidth: '52%',
        itemStyle: { color: grad('#12b0a4', .95, .55), borderRadius: [0, 0, 0, 0] }
      },
      {
        name: '缺口',
        type: 'bar',
        stack: 'g',
        data: d.unsatisfied,
        barWidth: '52%',
        itemStyle: { color: grad('#f2a63b', .95, .6), borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '需求',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: d.demand,
        lineStyle: { width: 2.4, color: '#3a6ff0' },
        areaStyle: { color: grad('#3a6ff0', .14, .01) }
      }
    ]
  }
})

/* ---------- 类型构成环形 ---------- */
const typeDonutOption = computed(() => {
  const types = summary.value.types || []
  if (!types.length) return null
  return {
    ...donutBase(['50%', '45%']),
    ...centerTitle(summary.value.total, '累计服务单', { top: '34%', size: 22 }),
    series: [
      {
        ...donutBase()['series'][0],
        center: ['50%', '45%'],
        radius: ['48%', '70%'],
        data: types.map((t) => ({ name: t.name, value: t.base, itemStyle: { color: t.color } }))
      }
    ],
    legend: {
      bottom: 0,
      left: 'center',
      itemGap: 8,
      textStyle: { fontSize: 10.5 },
      icon: 'roundRect',
      itemWidth: 9,
      itemHeight: 9,
      formatter: (name) => {
        const d = types.find((t) => t.name === name)
        return `${name} ${d.percent}%`
      }
    }
  }
})

/* ---------- 类型排行 ---------- */
const rankOption = computed(() => {
  const list = (rank.value.list || []).slice().reverse()
  if (!list.length) return null
  return {
    grid: grid({ left: 8, right: 58, top: 6, bottom: 2 }),
    tooltip: tip({
      formatter: (p) => {
        const d = list[p[0].dataIndex]
        return `${d.name}<br/>需求量 <b>${d.value}</b> 单<br/>满足率 <b>${d.satisfied}%</b><br/>平均等待 <b>${d.avgWait}</b> 小时`
      }
    }),
    xAxis: { type: 'value', show: false, max: Math.max(...list.map((i) => i.value)) * 1.32 },
    yAxis: {
      type: 'category',
      data: list.map((i) => i.name),
      axisLabel: { color: '#5b6880', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        barWidth: 11,
        data: list.map((i) => ({
          value: i.value,
          itemStyle: { borderRadius: [0, 6, 6, 0], color: grad(i.color, .95, .4) }
        })),
        label: {
          show: true,
          position: 'right',
          color: '#5b6880',
          fontSize: 10.5,
          formatter: (p) => `${p.value}  ${list[p.dataIndex].satisfied}%`
        }
      }
    ]
  }
})

/* ---------- 供需缺口 ---------- */
const gapOption = computed(() => {
  const list = (gap.value.communities || []).slice().sort((a, b) => a.gap - b.gap)
  if (!list.length) return null
  return {
    grid: grid({ left: 8, right: 44, top: 6, bottom: 2 }),
    tooltip: tip({
      formatter: (p) => {
        const d = list[p[0].dataIndex]
        return `${d.name}<br/>需求 <b>${d.demand}</b> 单<br/>供给 <b>${d.capacity}</b> 单<br/>缺口 <b>${d.gap}</b> 单`
      }
    }),
    xAxis: { type: 'value', show: false, max: Math.max(...list.map((i) => Math.abs(i.gap))) * 1.4 },
    yAxis: {
      type: 'category',
      data: list.map((i) => i.name),
      axisLabel: { color: '#5b6880', fontSize: 10.5 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        barWidth: 11,
        data: list.map((i) => ({
          value: i.gap,
          itemStyle: {
            borderRadius: i.gap > 0 ? [0, 6, 6, 0] : i.gap < 0 ? [6, 0, 0, 6] : 3,
            color:
              i.gap > 0
                ? grad('#e5544b', .95, .45)
                : i.gap < 0
                  ? grad('#28a86b', .95, .45)
                  : '#b6c0d3'
          }
        })),
        label: {
          show: true,
          position: 'right',
          color: '#5b6880',
          fontSize: 10.5,
          formatter: (p) => (p.value > 0 ? `缺 ${p.value}` : p.value < 0 ? `富 ${Math.abs(p.value)}` : '供需持平')
        }
      }
    ]
  }
})

/* ---------- 热力图 ---------- */
const heatmapOption = computed(() => {
  const h = heatmap.value
  if (!h.hours) return null
  const max = Math.max(...h.data.map((i) => i[2]))
  return {
    tooltip: {
      position: 'top',
      formatter: (p) => `${h.weekdays[p.value[1]]} ${h.hours[p.value[0]]}:00<br/>服务量 <b>${p.value[2]}</b> 单`
    },
    grid: { left: 46, right: 16, top: 12, bottom: 46 },
    xAxis: {
      type: 'category',
      data: h.hours.map((x) => x + ':00'),
      axisLabel: { color: '#96a2b6', fontSize: 10.5 },
      splitArea: { show: true, areaStyle: { color: ['#fff', '#fbfcfe'] } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: h.weekdays,
      axisLabel: { color: '#5b6880', fontSize: 11 },
      splitArea: { show: true, areaStyle: { color: ['#fff', '#fbfcfe'] } },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    visualMap: {
      min: 0,
      max,
      calculable: false,
      seriesIndex: 0,
      orient: 'horizontal',
      left: 'center',
      bottom: 4,
      itemWidth: 12,
      itemHeight: 90,
      textStyle: { color: '#96a2b6', fontSize: 10 },
      inRange: { color: ['#eef3ff', '#b9cdfb', '#7d9ef6', '#4a75ec', '#2b50b8'] }
    },
    series: [
      {
        type: 'heatmap',
        data: h.data,
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 3 },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: 'rgba(23,34,58,.25)' } }
      }
    ]
  }
})

/* ---------- 满意度雷达 ---------- */
const radarOption = computed(() => {
  const s = satisfaction.value
  if (!s.dims) return null
  return {
    tooltip: { trigger: 'item' },
    radar: {
      center: ['50%', '50%'],
      radius: '64%',
      indicator: s.dims.map((d) => ({ name: d, max: 5 })),
      splitNumber: 5,
      axisName: { color: '#5b6880', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e4e9f2' } },
      splitLine: { lineStyle: { color: '#eef1f7' } },
      splitArea: { areaStyle: { color: ['#fbfcfe', '#f7f9fd'] } }
    },
    series: [
      {
        type: 'radar',
        symbolSize: 5,
        data: [
          {
            value: s.scores,
            name: `综合满意度 ${s.overall} 分`,
            itemStyle: { color: '#3a6ff0' },
            areaStyle: { color: hexToRgba('#3a6ff0', .22) },
            lineStyle: { width: 2.2 }
          }
        ]
      }
    ]
  }
})

/* ---------- 满意度分布 ---------- */
const distOption = computed(() => {
  const d = satisfaction.value.distribution || []
  if (!d.length) return null
  const colors = ['#28a86b', '#3a6ff0', '#f2a63b', '#e07b3c', '#e5544b']
  const total = d.reduce((s, i) => s + i.value, 0)
  return {
    ...centerTitle(total, '累计评价', { top: '34%', size: 22 }),
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 条 · {d}%' },
    legend: { bottom: 0, itemGap: 10, textStyle: { fontSize: 10.5 }, icon: 'roundRect', itemWidth: 9, itemHeight: 9 },
    series: [
      {
        type: 'pie',
        radius: ['38%', '60%'],
        center: ['50%', '45%'],
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        label: { show: false },
        labelLine: { show: false },
        data: d.map((i, idx) => ({ ...i, itemStyle: { color: colors[idx] } }))
      }
    ]
  }
})

/* ---------- 工单过滤 ---------- */
const filteredOrders = computed(() => {
  const list = orderList.value.list || []
  if (!statusFilter.value) return list
  return list.filter((i) => i.status === statusFilter.value)
})
</script>

<style lang="scss" scoped>
.legend-inline {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: $text-2;

  span { display: inline-flex; align-items: center; gap: 5px; }
  i { width: 9px; height: 9px; border-radius: 2px; display: inline-block; }
}

.status {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.comments {
  padding: 6px 16px 14px;
  max-height: 310px;
  overflow-y: auto;
}

.comment {
  padding: 11px 0;
  border-bottom: 1px dashed $border-soft;

  &:last-child { border-bottom: none; }
}

.comment__head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment__user {
  font-size: 12.5px;
  font-weight: 600;
  color: $text-1;
}

.comment__rate {
  display: inline-flex;
  gap: 1px;

  i {
    font-style: normal;
    font-size: 11px;
    color: $border;
    &.is-on { color: $amber; }
  }
}

.comment__time {
  margin-left: auto;
  font-size: 11px;
  color: $text-3;
}

.comment__text {
  margin-top: 5px;
  font-size: 12.5px;
  color: $text-2;
  line-height: 1.6;
}

.comment__community {
  display: inline-block;
  margin-top: 6px;
  padding: 1px 7px;
  border-radius: 4px;
  background: $primary-soft;
  color: $primary-dark;
  font-size: 11px;
}
</style>

<style lang="scss">
.order-table {
  :deep(th.el-table__cell) {
    background: $panel-sub;
    color: $text-2;
    font-weight: 600;
  }
  :deep(.el-table__row td) { border-bottom-color: $border-soft; }
  :deep(.el-table__inner-wrapper::before) { background-color: $border-soft; }
}
</style>
