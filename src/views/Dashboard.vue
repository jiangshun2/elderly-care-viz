<template>
  <div class="page">
    <!-- ===== KPI 指标卡 ===== -->
    <section class="grid-12">
      <div class="col-2" v-for="k in kpiCards" :key="k.label">
        <StatCard
          :label="k.label"
          :value="k.value"
          :unit="k.unit"
          :icon="k.icon"
          :tone="k.tone"
          :tip-text="k.tip"
        >
          <template #foot>
            <span :class="k.trendClass">
              <span v-if="k.trend">{{ k.trend }}</span>
              <span v-else>{{ k.foot }}</span>
            </span>
          </template>
        </StatCard>
      </div>
    </section>

    <!-- ===== 健康概览 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="老人健康风险分级" sub="全量 3860 人">
          <ChartBox :option="riskOption" height="272px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="核心生命体征均值" sub="mmHg / mmol/L / bpm">
          <ChartBox :option="vitalOption" height="272px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="慢病构成 TOP 6" sub="患病人次">
          <ChartBox :option="chronicOption" height="272px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 服务需求 + 紧急事件 ===== -->
    <section class="grid-12">
      <div class="col-8">
        <PanelBox title="服务需求与供给趋势" sub="近 30 天">
          <template #extra>
            <div class="legend-inline">
              <span><i style="background:#3a6ff0"></i>需求量</span>
              <span><i style="background:#12b0a4"></i>实际供给</span>
              <span><i style="background:#f2a63b"></i>未满足缺口</span>
            </div>
          </template>
          <ChartBox :option="demandOption" height="286px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="紧急事件类型分布" sub="近 6 个月累计">
          <ChartBox :option="emergencyOption" height="286px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 事件时段 / 人员 / 响应 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="紧急事件时段分布" sub="24 小时">
          <ChartBox :option="hourOption" height="258px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="社区人员配备与需求匹配" sub="气泡大小=覆盖率">
          <ChartBox :option="staffScatterOption" height="258px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="平均响应时长趋势" sub="近 6 个月（分钟）">
          <ChartBox :option="responseTrendOption" height="258px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 高危关注名单 ===== -->
    <section class="grid-12">
      <div class="col-12">
        <PanelBox title="高危老人重点关注名单" sub="风险评分 ≥ 84" flush>
          <el-table :data="watchList" size="small" style="width: 100%" class="watch-table">
            <el-table-column prop="name" label="姓名" width="110" />
            <el-table-column prop="age" label="年龄" width="70" />
            <el-table-column prop="community" label="所属社区" width="120" />
            <el-table-column label="健康标签" min-width="230">
              <template #default="{ row }">
                <span v-for="t in row.tags" :key="t" class="tag">{{ t }}</span>
              </template>
            </el-table-column>
            <el-table-column label="风险评分" width="150">
              <template #default="{ row }">
                <div class="score">
                  <el-progress
                    :percentage="row.score"
                    :stroke-width="8"
                    :color="row.score >= 90 ? '#e5544b' : '#f2a63b'"
                    :show-text="false"
                  />
                  <span class="score__num u-num">{{ row.score }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最近随访" width="120" />
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
import { getKpi } from '@/api/modules/overview'
import { getHealthSummary, getChronicDisease, getRiskScore } from '@/api/modules/health'
import { getDemandTrend } from '@/api/modules/service'
import { getTypeDist, getHourDist } from '@/api/modules/emergency'
import { getDistribution, getResponseTime } from '@/api/modules/staff'
import { useAppStore } from '@/stores/app'
import { grad, hexToRgba, grid, tip, donutBase, centerTitle } from '@/utils/chartOptions'

const store = useAppStore()

const kpi = ref({})
const summary = ref({})
const chronic = ref({})
const risk = ref({})
const demand = ref({})
const emergency = ref({})
const hour = ref({})
const staffDist = ref({})
const respTime = ref({})
const watchList = ref([])

/* ---------- 加载 ---------- */
async function loadData() {
  const [k, s, c, r, d, e, h, sd, rt] = await Promise.all([
    getKpi(),
    getHealthSummary(),
    getChronicDisease(),
    getRiskScore(),
    getDemandTrend({ days: 30 }),
    getTypeDist({ months: 6 }),
    getHourDist(),
    getDistribution(),
    getResponseTime()
  ])
  kpi.value = k
  summary.value = s
  chronic.value = c
  risk.value = r
  demand.value = d
  emergency.value = e
  hour.value = h
  staffDist.value = sd
  respTime.value = rt
  watchList.value = r.watchList || []
}

onMounted(loadData)
watch(() => store.refreshKey, loadData)

/* ---------- KPI 卡片 ---------- */
const kpiCards = computed(() => {
  const k = kpi.value
  if (!k.totalElders) return []
  return [
    { label: '在册老人', value: k.totalElders, unit: '人', icon: 'user', tone: 'primary', tip: '覆盖 12 个社区', foot: '12 个社区' },
    { label: '健康监测覆盖率', value: k.monitoredRate, unit: '%', icon: 'heart', tone: 'teal', trend: '▲ 1.8%', trendClass: 'up' },
    { label: '今日服务人次', value: k.servedToday, unit: '人次', icon: 'service', tone: 'cyan', trend: '▲ 12.4%', trendClass: 'up' },
    { label: '今日紧急事件', value: k.emergencyToday, unit: '件', icon: 'alert', tone: 'red', foot: '待响应 3 件', trendClass: 'down' },
    { label: '平均响应时长', value: k.responseAvg, unit: '分钟', icon: 'clock', tone: 'amber', trend: '▼ 0.6 分钟', trendClass: 'up' },
    { label: '服务满意度', value: k.satisfaction, unit: '分', icon: 'chart', tone: 'purple', trend: '▲ 0.2 分', trendClass: 'up' }
  ]
})

/* ---------- 健康风险分级 ---------- */
const riskOption = computed(() => {
  const levels = risk.value.levels || []
  if (!levels.length) return null
  return {
    ...donutBase(['50%', '50%']),
    ...centerTitle(risk.value.total, '在册老人', { top: '38%' }),
    series: [
      {
        ...donutBase()['series'][0],
        center: ['50%', '50%'],
        radius: ['54%', '74%'],
        data: levels.map((l) => ({ name: l.name, value: l.count, itemStyle: { color: l.color } }))
      }
    ],
    legend: {
      bottom: 0,
      left: 'center',
      itemGap: 10,
      textStyle: { fontSize: 11 },
      icon: 'roundRect',
      itemWidth: 9,
      itemHeight: 9,
      formatter: (name) => {
        const l = levels.find((i) => i.name === name)
        return `${name} ${l.percent}%`
      }
    }
  }
})

/* ---------- 生命体征仪表 ---------- */
function gaugeSeries(center, value, name, color, min, max) {
  return {
    type: 'gauge',
    startAngle: 210,
    endAngle: -30,
    min,
    max,
    radius: '52%',
    center,
    progress: { show: true, width: 9, roundCap: true, itemStyle: { color } },
    axisLine: { lineStyle: { width: 9, color: [[1, '#eef1f7']] } },
    pointer: { show: false },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: false },
    anchor: { show: false },
    title: { offsetCenter: [0, '38%'], fontSize: 11.5, color: '#96a2b6' },
    detail: {
      valueAnimation: true,
      offsetCenter: [0, '0%'],
      fontSize: 19,
      fontWeight: 700,
      color: '#17223a',
      formatter: (v) => v.toFixed(1)
    },
    data: [{ value, name }]
  }
}

const vitalOption = computed(() => {
  const s = summary.value
  if (!s.totalElders) return null
  return {
    series: [
      gaugeSeries(['18%', '54%'], s.avgSystolic, '收缩压', '#f2a63b', 80, 180),
      gaugeSeries(['50%', '54%'], s.avgGlucose, '空腹血糖', '#7a5bf0', 3, 12),
      gaugeSeries(['82%', '54%'], s.avgHeartRate, '心率', '#28a86b', 40, 120)
    ]
  }
})

/* ---------- 慢病构成 ---------- */
const chronicOption = computed(() => {
  const list = (chronic.value.list || []).slice(0, 6).reverse()
  if (!list.length) return null
  return {
    grid: grid({ left: 8, right: 52, top: 8, bottom: 4 }),
    tooltip: tip({
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (p) => `${p[0].name}<br/>患病人次 <b>${p[0].value}</b>`
    }),
    xAxis: { type: 'value', show: false, max: Math.max(...list.map((i) => i.value)) * 1.28 },
    yAxis: {
      type: 'category',
      data: list.map((i) => i.name),
      axisLabel: { color: '#5b6880', fontSize: 11.5 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        barWidth: 11,
        data: list.map((i) => ({
          value: i.value,
          itemStyle: { color: grad(i.color, 0.95, 0.35), borderRadius: [0, 6, 6, 0] }
        })),
        label: { show: true, position: 'right', color: '#5b6880', fontSize: 11, formatter: '{c}' }
      }
    ]
  }
})

/* ---------- 服务需求趋势 ---------- */
const demandOption = computed(() => {
  const d = demand.value
  if (!d.dates) return null
  return {
    tooltip: tip({
      formatter: (p) => {
        const idx = p[0].dataIndex
        return `${d.dates[idx]}<br/>需求 <b>${d.demand[idx]}</b> 人次<br/>供给 <b>${d.supply[idx]}</b> 人次<br/>缺口 <b>${d.unsatisfied[idx]}</b> 人次`
      }
    }),
    legend: { show: false },
    grid: grid({ top: 24, right: 16, bottom: 4, left: 8 }),
    xAxis: {
      type: 'category',
      data: d.dates,
      boundaryGap: false,
      axisLabel: { color: '#96a2b6', fontSize: 11, interval: 4 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', name: '人次', nameTextStyle: { color: '#96a2b6', fontSize: 11 } },
    series: [
      {
        name: '未满足缺口',
        type: 'bar',
        data: d.unsatisfied,
        barWidth: 9,
        itemStyle: { color: hexToRgba('#f2a63b', .78), borderRadius: [3, 3, 0, 0] }
      },
      {
        name: '需求量',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: d.demand,
        lineStyle: { width: 2.4, color: '#3a6ff0' },
        areaStyle: { color: grad('#3a6ff0', .26, .02) }
      },
      {
        name: '实际供给',
        type: 'line',
        smooth: true,
        symbol: 'none',
        data: d.supply,
        lineStyle: { width: 2.2, color: '#12b0a4', type: 'dashed' },
        areaStyle: { color: grad('#12b0a4', .18, .01) }
      }
    ]
  }
})

/* ---------- 紧急事件类型 ---------- */
const emergencyOption = computed(() => {
  const list = emergency.value.list || []
  if (!list.length) return null
  const total = list.reduce((s, i) => s + i.data.reduce((a, b) => a + b, 0), 0)
  return {
    color: list.map((i) => i.color),
    ...centerTitle(total, '事件总数', { top: '36%' }),
    tooltip: { trigger: 'item', formatter: (p) => `${p.name}<br/>${p.value} 件 · ${p.percent}%` },
    legend: {
      bottom: 0,
      left: 'center',
      itemGap: 9,
      textStyle: { fontSize: 10.5 },
      icon: 'roundRect',
      itemWidth: 9,
      itemHeight: 9,
      formatter: (name) => {
        const item = list.find((i) => i.name === name)
        return `${name}  ${item.current}`
      }
    },
    series: [
      {
        type: 'pie',
        roseType: 'radius',
        radius: ['26%', '66%'],
        center: ['50%', '46%'],
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 6 },
        data: list.map((i) => ({ name: i.name, value: i.data.reduce((a, b) => a + b, 0) }))
      }
    ]
  }
})

/* ---------- 事件时段分布 ---------- */
const hourOption = computed(() => {
  const h = hour.value
  if (!h.hours) return null
  return {
    tooltip: tip({ formatter: (p) => `${p[0].name}<br/>事件数 <b>${p[0].value}</b> 件` }),
    grid: grid({ top: 22, right: 10, bottom: 2, left: 4 }),
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
        barWidth: '52%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (p) => {
            const hour = p.dataIndex
            if (hour >= 18 && hour <= 22) return grad('#e5544b', .95, .5)
            if ((hour >= 6 && hour <= 9)) return grad('#f2a63b', .95, .5)
            return grad('#3a6ff0', .9, .45)
          }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#e5544b', type: 'dashed', width: 1.2 },
          label: { formatter: '高峰 19:00-21:00', color: '#e5544b', fontSize: 10, position: 'insideEndTop' },
          data: [{ xAxis: '19' }]
        }
      }
    ]
  }
})

/* ---------- 人员配备散点 ---------- */
const staffScatterOption = computed(() => {
  const list = staffDist.value.communities || []
  if (!list.length) return null
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const d = list[p.dataIndex]
        return `${d.name}<br/>在岗人员 <b>${d.onDuty}</b> 人<br/>老人数 <b>${d.elders ?? '-'}</b><br/>覆盖率 <b>${d.coverage}%</b><br/>平均响应 <b>${d.avgResponse}</b> 分钟`
      }
    },
    grid: grid({ top: 18, right: 22, bottom: 4, left: 6 }),
    xAxis: {
      type: 'value',
      name: '需求人数',
      nameTextStyle: { color: '#96a2b6', fontSize: 10 },
      axisLabel: { color: '#96a2b6', fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: '在岗人员',
      nameTextStyle: { color: '#96a2b6', fontSize: 10 },
      axisLabel: { color: '#96a2b6', fontSize: 10 }
    },
    series: [
      {
        type: 'scatter',
        symbolSize: (d) => Math.max(12, d[2] / 4),
        data: list.map((d) => [d.need, d.onDuty, d.coverage]),
        itemStyle: {
          color: (p) => (p.data[2] >= 92 ? hexToRgba('#28a86b', .78) : p.data[2] >= 86 ? hexToRgba('#f2a63b', .8) : hexToRgba('#e5544b', .78)),
          borderColor: '#fff',
          borderWidth: 1.5
        },
        emphasis: { itemStyle: { borderWidth: 2 } },
        label: {
          show: true,
          position: 'top',
          formatter: (p) => list[p.dataIndex].name,
          color: '#5b6880',
          fontSize: 10
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#c6cfdd', type: 'dashed' },
          data: [{ yAxis: 10 }]
        }
      }
    ]
  }
})

/* ---------- 响应时长趋势 ---------- */
const responseTrendOption = computed(() => {
  const t = respTime.value.trend || []
  if (!t.length) return null
  return {
    tooltip: tip({ formatter: (p) => `${p[0].name}<br/>平均响应 <b>${p[0].value}</b> 分钟` }),
    grid: grid({ top: 26, right: 18, bottom: 2, left: 4 }),
    xAxis: {
      type: 'category',
      data: t.map((i) => i.month.slice(5) + '月'),
      boundaryGap: false,
      axisLabel: { color: '#96a2b6', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', axisLabel: { color: '#96a2b6', fontSize: 10 }, min: (v) => Math.floor(v.min - 1) },
    series: [
      {
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: t.map((i) => i.value),
        lineStyle: { width: 2.6, color: '#3a6ff0' },
        itemStyle: { color: '#fff', borderColor: '#3a6ff0', borderWidth: 2.4 },
        areaStyle: { color: grad('#3a6ff0', .26, .02) },
        label: { show: true, position: 'top', color: '#5b6880', fontSize: 10.5, formatter: '{c}' },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#28a86b', type: 'dashed', width: 1.2 },
          label: { formatter: '目标 10 分钟', color: '#28a86b', fontSize: 10, position: 'insideEndTop' },
          data: [{ yAxis: 10 }]
        }
      }
    ]
  }
})
</script>

<style lang="scss" scoped>
.legend-inline {
  display: flex;
  gap: 14px;
  font-size: 12px;
  color: $text-2;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  i {
    width: 9px;
    height: 9px;
    border-radius: 2px;
    display: inline-block;
  }
}

.up { color: $green; }
.down { color: $red; }

.tag {
  display: inline-block;
  padding: 1px 8px;
  margin: 2px 5px 2px 0;
  border-radius: 20px;
  background: $primary-soft;
  color: $primary-dark;
  font-size: 11px;
}

.score {
  display: flex;
  align-items: center;
  gap: 9px;

  :deep(.el-progress) { flex: 1; }
}

.score__num {
  font-size: 12px;
  font-weight: 700;
  color: $text-2;
  width: 24px;
  text-align: right;
}
</style>

<style lang="scss">
.watch-table {
  :deep(th.el-table__cell) {
    background: $panel-sub;
    color: $text-2;
    font-weight: 600;
  }
  :deep(.el-table__row td) {
    border-bottom-color: $border-soft;
  }
  :deep(.el-table__inner-wrapper::before) {
    background-color: $border-soft;
  }
}
</style>
