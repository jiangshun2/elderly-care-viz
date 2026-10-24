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

    <!-- ===== 响应趋势 + 类型分布 ===== -->
    <section class="grid-12">
      <div class="col-8">
        <PanelBox title="事件响应时长与发生量趋势" :sub="`近 ${store.days} 天`">
          <template #extra>
            <div class="legend-inline">
              <span><i style="background:#3a6ff0"></i>响应时长(分)</span>
              <span><i style="background:#12b0a4"></i>处置时长(分)</span>
              <span><i style="background:#f2a63b"></i>事件数</span>
            </div>
          </template>
          <ChartBox :option="trendOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="紧急事件类型分布" sub="近 6 个月累计">
          <ChartBox :option="typeOption" height="300px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 时段 / 漏斗 / 月度堆叠 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="事件高发时段" sub="24 小时分布">
          <ChartBox :option="hourOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="应急处置流程转化" sub="各环节完成量">
          <ChartBox :option="funnelOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="月度事件类型堆叠" sub="近 6 个月">
          <ChartBox :option="stackOption" height="300px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 实时事件 ===== -->
    <section class="grid-12">
      <div class="col-12">
        <PanelBox title="紧急事件实时处置台账" :sub="`累计 ${eventList.total || 0} 件`" flush>
          <template #extra>
            <el-radio-group v-model="levelFilter" size="small">
              <el-radio-button label="">全部</el-radio-button>
              <el-radio-button label="紧急">紧急</el-radio-button>
              <el-radio-button label="重要">重要</el-radio-button>
              <el-radio-button label="一般">一般</el-radio-button>
            </el-radio-group>
          </template>
          <el-table :data="filteredEvents" size="small" height="340" class="event-table">
            <el-table-column prop="id" label="事件编号" width="118" />
            <el-table-column prop="type" label="事件类型" width="132" />
            <el-table-column label="级别" width="80">
              <template #default="{ row }">
                <span class="level" :style="{ background: row.levelColor + '1a', color: row.levelColor }">{{ row.level }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="community" label="社区" width="98" />
            <el-table-column prop="elder" label="老人" width="86" />
            <el-table-column prop="age" label="年龄" width="60" />
            <el-table-column prop="device" label="触发设备" width="108" />
            <el-table-column prop="trigger" label="触发方式" width="104" />
            <el-table-column prop="staff" label="处置人员" width="104" />
            <el-table-column prop="responseTime" label="响应(分)" width="94" />
            <el-table-column label="状态" width="88">
              <template #default="{ row }">
                <span class="level" :style="{ background: row.statusColor + '1a', color: row.statusColor }">{{ row.status }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="time" label="发生时间" width="132" />
            <el-table-column prop="result" label="处置结果" min-width="230" />
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
  getEmergencyOverview,
  getTypeDist,
  getHourDist,
  getHandleFunnel,
  getResponseTrend,
  getEventList
} from '@/api/modules/emergency'
import { useAppStore } from '@/stores/app'
import { grad, hexToRgba, grid, tip, donutBase, centerTitle } from '@/utils/chartOptions'

const store = useAppStore()

const overview = ref({})
const typeDist = ref({})
const hourDist = ref({})
const funnel = ref({})
const respTrend = ref({})
const eventList = ref({ total: 0, list: [] })
const levelFilter = ref('')

async function loadData() {
  const [o, t, h, f, r, e] = await Promise.all([
    getEmergencyOverview(),
    getTypeDist({ months: 6 }),
    getHourDist(),
    getHandleFunnel(),
    getResponseTrend({ days: store.days }),
    getEventList({ size: 60 })
  ])
  overview.value = o
  typeDist.value = t
  hourDist.value = h
  funnel.value = f
  respTrend.value = r
  eventList.value = e
}

onMounted(loadData)
watch(() => store.refreshKey, loadData)

/* ---------- 指标卡 ---------- */
const cards = computed(() => {
  const o = overview.value
  if (!o.month) return []
  return [
    { label: '今日紧急事件', value: o.today, unit: '件', icon: 'alert', tone: 'red', tip: '含跌倒、急救、设备告警', foot: '本月累计 386 件', footColor: '#e5544b' },
    { label: '待响应事件', value: o.pending, unit: '件', icon: 'clock', tone: 'amber', tip: '尚未完成派单的事件', foot: '需 3 分钟内响应', footColor: '#f2a63b' },
    { label: '平均响应时长', value: o.avgResponse, unit: '分钟', icon: 'chart', tone: 'primary', tip: '告警到救援人员到达', foot: '环比下降 0.6 分钟', footColor: '#28a86b' },
    { label: '处置成功率', value: o.successRate, unit: '%', icon: 'heart', tone: 'green', tip: '处置完成且老人转危为安', foot: `平均处置 ${o.avgHandle} 分钟`, footColor: '#28a86b' }
  ]
})

/* ---------- 响应趋势 ---------- */
const trendOption = computed(() => {
  const t = respTrend.value
  if (!t.dates) return null
  return {
    tooltip: tip({
      formatter: (p) => {
        const i = p[0].dataIndex
        return `${t.dates[i]}<br/>响应时长 <b>${t.responseTime[i]}</b> 分钟<br/>处置时长 <b>${t.handleTime[i]}</b> 分钟<br/>事件数 <b>${t.count[i]}</b> 件<br/>5 分钟达标率 <b>${t.meetRate[i]}%</b>`
      }
    }),
    legend: { show: false },
    grid: grid({ top: 26, right: 14, bottom: 2, left: 4 }),
    xAxis: {
      type: 'category',
      data: t.dates,
      axisLabel: { color: '#96a2b6', fontSize: 11, interval: Math.ceil(t.dates.length / 12) },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: [
      { type: 'value', name: '分钟', nameTextStyle: { color: '#96a2b6', fontSize: 11 } },
      { type: 'value', name: '件', nameTextStyle: { color: '#96a2b6', fontSize: 11 }, splitLine: { show: false } }
    ],
    series: [
      {
        name: '事件数',
        type: 'bar',
        yAxisIndex: 1,
        data: t.count,
        barWidth: '42%',
        itemStyle: { color: hexToRgba('#f2a63b', .42), borderRadius: [3, 3, 0, 0] }
      },
      {
        name: '响应时长',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: t.responseTime,
        lineStyle: { width: 2.4, color: '#3a6ff0' },
        areaStyle: { color: grad('#3a6ff0', .24, .01) },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#28a86b', type: 'dashed', width: 1.2 },
          label: { formatter: '目标 10 分钟', color: '#28a86b', fontSize: 10, position: 'insideEndTop' },
          data: [{ yAxis: 10 }]
        }
      },
      {
        name: '处置时长',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: t.handleTime,
        lineStyle: { width: 2.2, color: '#12b0a4', type: 'dashed' }
      }
    ]
  }
})

/* ---------- 类型分布 ---------- */
const typeOption = computed(() => {
  const list = typeDist.value.list || []
  if (!list.length) return null
  const total = list.reduce((s, i) => s + i.data.reduce((a, b) => a + b, 0), 0)
  return {
    ...donutBase(['50%', '45%']),
    ...centerTitle(total, '事件总数', { top: '34%', size: 22 }),
    series: [
      {
        ...donutBase()['series'][0],
        center: ['50%', '45%'],
        radius: ['48%', '70%'],
        data: list.map((i) => ({ name: i.name, value: i.data.reduce((a, b) => a + b, 0), itemStyle: { color: i.color } }))
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
        const d = list.find((i) => i.name === name)
        return `${name} ${d.current}`
      }
    }
  }
})

/* ---------- 高发时段 ---------- */
const hourOption = computed(() => {
  const h = hourDist.value
  if (!h.hours) return null
  return {
    tooltip: tip({ formatter: (p) => `${p[0].name}<br/>事件数 <b>${p[0].value}</b> 件` }),
    grid: grid({ top: 20, right: 8, bottom: 2, left: 2 }),
    xAxis: {
      type: 'category',
      data: h.hours.map((x) => x.slice(0, 2)),
      axisLabel: { color: '#96a2b6', fontSize: 10, interval: 2 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', axisLabel: { color: '#96a2b6', fontSize: 10 } },
    series: [
      {
        type: 'bar',
        data: h.data,
        barWidth: '56%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (p) => {
            const hh = p.dataIndex
            if (hh >= 18 && hh <= 22) return grad('#e5544b', .95, .5)
            if (hh >= 6 && hh <= 9) return grad('#f2a63b', .95, .5)
            return grad('#3a6ff0', .9, .45)
          }
        }
      }
    ]
  }
})

/* ---------- 漏斗 ---------- */
const funnelOption = computed(() => {
  const stages = funnel.value.stages || []
  if (!stages.length) return null
  const colors = ['#3a6ff0', '#2f7fe8', '#12b0a4', '#f2a63b', '#28a86b']
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const prev = stages[p.dataIndex - 1]
        const rate = prev ? ((p.value / prev.value) * 100).toFixed(1) : '100'
        return `${p.name}<br/>完成 <b>${p.value}</b> 件${prev ? `<br/>环节转化 <b>${rate}%</b>` : ''}`
      }
    },
    series: [
      {
        type: 'funnel',
        left: '6%',
        right: '6%',
        top: 14,
        bottom: 10,
        minSize: '32%',
        maxSize: '100%',
        sort: 'descending',
        gap: 3,
        label: {
          show: true,
          position: 'inside',
          color: '#fff',
          fontSize: 11.5,
          formatter: (p) => `${p.name}  ${p.value}`
        },
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        data: stages.map((s, i) => ({
          name: s.name,
          value: s.value,
          itemStyle: { color: grad(colors[i] || '#3a6ff0', .95, .6) }
        }))
      }
    ]
  }
})

/* ===== 月度堆叠 ===== */
const stackOption = computed(() => {
  const t = typeDist.value
  if (!t.months) return null
  return {
    tooltip: tip({
      axisPointer: { type: 'shadow' },
      formatter: (p) => {
        let s = `${p[0].name}<br/>`
        p.forEach((i) => (s += `${i.marker}${i.seriesName} <b>${i.value}</b> 件<br/>`))
        return s
      }
    }),
    legend: { show: false },
    grid: grid({ top: 14, right: 8, bottom: 2, left: 2 }),
    xAxis: {
      type: 'category',
      data: t.months.map((m) => m.slice(5) + '月'),
      axisLabel: { color: '#96a2b6', fontSize: 10.5 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', axisLabel: { color: '#96a2b6', fontSize: 10 } },
    series: t.list.map((i) => ({
      name: i.name,
      type: 'bar',
      stack: 'e',
      barWidth: '46%',
      data: i.data,
      itemStyle: { color: i.color },
      emphasis: { focus: 'series' }
    }))
  }
})

/* ---------- 事件过滤 ---------- */
const filteredEvents = computed(() => {
  const list = eventList.value.list || []
  if (!levelFilter.value) return list
  return list.filter((i) => i.level === levelFilter.value)
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

.level {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
</style>

<style lang="scss">
.event-table {
  :deep(th.el-table__cell) {
    background: $panel-sub;
    color: $text-2;
    font-weight: 600;
  }
  :deep(.el-table__row td) { border-bottom-color: $border-soft; }
  :deep(.el-table__inner-wrapper::before) { background-color: $border-soft; }
}
</style>
