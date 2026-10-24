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

    <!-- ===== 趋势 + 慢病构成 ===== -->
    <section class="grid-12">
      <div class="col-8">
        <PanelBox title="六大健康指标异常率趋势" :sub="`近 ${store.days} 天`">
          <template #extra>
            <el-radio-group v-model="trendMode" size="small">
              <el-radio-button label="rate">异常率</el-radio-button>
              <el-radio-button label="count">异常人数</el-radio-button>
            </el-radio-group>
          </template>
          <ChartBox :option="trendOption" height="310px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="慢病患病构成" :sub="`合并两种及以上慢病 ${chronic.multiChronic || 0} 人`">
          <ChartBox :option="chronicOption" height="310px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 年龄画像 / 雷达 / 社区排行 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="各年龄段健康画像" sub="人数与异常率">
          <ChartBox :option="ageOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="年龄段健康维度雷达" sub="归一化对比">
          <ChartBox :option="radarOption" height="300px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="各社区指标异常率排行" sub="按风险高低排序">
          <ChartBox :option="communityOption" height="300px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 社区对比散点 + 明细 ===== -->
    <section class="grid-12">
      <div class="col-5">
        <PanelBox title="社区健康负担 vs 干预覆盖" sub="气泡大小=高危人数">
          <ChartBox :option="scatterOption" height="320px" />
        </PanelBox>
      </div>
      <div class="col-7">
        <PanelBox title="异常指标明细" sub="实时监测告警" flush>
          <template #extra>
            <el-input
              v-model="keyword"
              size="small"
              placeholder="搜索姓名 / 社区"
              clearable
              style="width: 190px"
            />
          </template>
          <el-table :data="filteredAbnormal" size="small" height="330" class="abnormal-table">
            <el-table-column prop="name" label="姓名" width="92" />
            <el-table-column prop="age" label="年龄" width="62" />
            <el-table-column prop="community" label="社区" width="96" />
            <el-table-column prop="indicator" label="异常指标" width="104" />
            <el-table-column prop="value" label="测量值" width="84" />
            <el-table-column label="程度" width="76">
              <template #default="{ row }">
                <span class="level" :style="{ background: row.levelColor + '1a', color: row.levelColor }">
                  {{ row.level }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="device" label="采集设备" width="106" />
            <el-table-column prop="time" label="触发时间" min-width="132" />
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
  getHealthSummary,
  getIndicatorTrend,
  getAgeProfile,
  getChronicDisease,
  getCommunityCompare,
  getAbnormalList
} from '@/api/modules/health'
import { useAppStore } from '@/stores/app'
import { grad, hexToRgba, grid, tip, donutBase, centerTitle } from '@/utils/chartOptions'

const store = useAppStore()

const summary = ref({})
const trend = ref({})
const age = ref({})
const chronic = ref({})
const compare = ref({})
const abnormal = ref({ total: 0, list: [] })

const trendMode = ref('rate')
const keyword = ref('')

async function loadData() {
  const [s, t, a, c, cc, ab] = await Promise.all([
    getHealthSummary(),
    getIndicatorTrend({ days: store.days }),
    getAgeProfile(),
    getChronicDisease(),
    getCommunityCompare(),
    getAbnormalList({ size: 60 })
  ])
  summary.value = s
  trend.value = t
  age.value = a
  chronic.value = c
  compare.value = cc
  abnormal.value = ab
}

onMounted(loadData)
watch(() => store.refreshKey, loadData)

/* ---------- 指标卡 ---------- */
const cards = computed(() => {
  const s = summary.value
  if (!s.totalElders) return []
  return [
    { label: '健康档案建档', value: s.monitored, unit: '人', icon: 'user', tone: 'primary', tip: '监测覆盖率 87.4%', foot: '覆盖率 87.4%', footColor: '#28a86b' },
    { label: '指标异常人群', value: s.abnormalPeople, unit: '人', icon: 'heart', tone: 'amber', tip: '任一指标超出正常区间', foot: '占比 23.6%', footColor: '#f2a63b' },
    { label: '控制不佳人群', value: s.uncontrolled, unit: '人', icon: 'alert', tone: 'red', tip: '干预后仍未达标', foot: '需重点随访', footColor: '#e5544b' },
    { label: '慢病规范管理', value: chronic.value.managed || 0, unit: '人', icon: 'service', tone: 'teal', tip: '已纳入慢病管理项目', foot: '管理率 78.4%', footColor: '#12b0a4' }
  ]
})

/* ---------- 异常率趋势 ---------- */
const trendOption = computed(() => {
  const t = trend.value
  if (!t.dates) return null
  const isRate = trendMode.value === 'rate'
  return {
    tooltip: tip({ trigger: 'axis', axisPointer: { type: 'line' } }),
    legend: {
      top: 0,
      right: 0,
      itemGap: 14,
      textStyle: { fontSize: 11.5 },
      icon: 'roundRect',
      itemWidth: 12,
      itemHeight: 6
    },
    grid: grid({ top: 40, right: 12, bottom: 2, left: 4 }),
    xAxis: {
      type: 'category',
      data: t.dates,
      boundaryGap: false,
      axisLabel: { color: '#96a2b6', fontSize: 11, interval: Math.ceil(t.dates.length / 12) },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: {
      type: 'value',
      name: isRate ? '异常率 %' : '人数',
      nameTextStyle: { color: '#96a2b6', fontSize: 11 },
      axisLabel: { color: '#96a2b6', fontSize: 10.5 }
    },
    series: t.series.map((s, i) => ({
      name: s.name,
      type: 'line',
      smooth: true,
      symbol: 'none',
      data: isRate ? s.data : s.data.map((v) => Math.round((v / 100) * (summary.value.totalElders || 3800))),
      lineStyle: { width: 2.2, color: s.color },
      itemStyle: { color: s.color },
      areaStyle: i === 0 ? { color: grad(s.color, .18, .01) } : undefined
    }))
  }
})

/* ---------- 慢病构成 ---------- */
const chronicOption = computed(() => {
  const list = chronic.value.list || []
  if (!list.length) return null
  return {
    ...donutBase(['50%', '47%']),
    ...centerTitle(chronic.value.total, '慢病患病人次', { top: '36%', size: 22 }),
    series: [
      {
        ...donutBase()['series'][0],
        center: ['50%', '47%'],
        radius: ['48%', '70%'],
        data: list.map((i) => ({ name: i.name, value: i.value, itemStyle: { color: i.color } }))
      }
    ],
    legend: {
      bottom: 0,
      left: 'center',
      itemGap: 9,
      textStyle: { fontSize: 10.5 },
      icon: 'roundRect',
      itemWidth: 9,
      itemHeight: 9,
      formatter: (name) => {
        const d = list.find((i) => i.name === name)
        return `${name} ${d.percent}%`
      }
    }
  }
})

/* ---------- 年龄段画像 ---------- */
const ageOption = computed(() => {
  const list = age.value.data || []
  if (!list.length) return null
  return {
    tooltip: tip({
      formatter: (p) => {
        const d = list[p[0].dataIndex]
        return `${d.name}<br/>在册 <b>${d.count}</b> 人<br/>健康评分 <b>${d.score}</b><br/>异常率 <b>${d.abnormalRate}%</b>`
      }
    }),
    legend: { top: 0, right: 0, textStyle: { fontSize: 11.5 }, icon: 'roundRect', itemWidth: 12, itemHeight: 6 },
    grid: grid({ top: 36, right: 8, bottom: 2, left: 2 }),
    xAxis: {
      type: 'category',
      data: list.map((i) => i.name.replace('岁', '')),
      axisLabel: { color: '#96a2b6', fontSize: 10.5 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: [
      { type: 'value', name: '人数', nameTextStyle: { color: '#96a2b6', fontSize: 10.5 }, axisLabel: { color: '#96a2b6', fontSize: 10.5 } },
      { type: 'value', name: '异常率%', nameTextStyle: { color: '#96a2b6', fontSize: 10.5 }, axisLabel: { color: '#96a2b6', fontSize: 10.5 }, splitLine: { show: false } }
    ],
    series: [
      {
        name: '在册人数',
        type: 'bar',
        barWidth: 16,
        data: list.map((i) => i.count),
        itemStyle: { color: grad('#3a6ff0', .95, .45), borderRadius: [5, 5, 0, 0] }
      },
      {
        name: '异常率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        data: list.map((i) => i.abnormalRate),
        lineStyle: { width: 2.4, color: '#e5544b' },
        itemStyle: { color: '#fff', borderColor: '#e5544b', borderWidth: 2.2 }
      }
    ]
  }
})

/* ---------- 雷达 ---------- */
const radarOption = computed(() => {
  const list = age.value.data || []
  if (!list.length) return null
  const groups = [
    { name: '60-69岁', idx: [0, 1] },
    { name: '70-79岁', idx: [2, 3] },
    { name: '80岁以上', idx: [4, 5] }
  ]
  const indicators = ['血压控制', '血糖控制', '心率稳定', '指标正常率', '健康评分']
  const normalize = (arr) => arr.map((v, i) => {
    const max = Math.max(...arr) || 1
    const min = Math.min(...arr)
    const norm = ((v - min) / (max - min || 1)) * 100
    return Math.round(i === 3 ? norm : norm)
  })
  const maxSbp = Math.max(...list.map((i) => i.avgSbp))
  const maxGlu = Math.max(...list.map((i) => i.avgGlu))
  const maxHr = Math.max(...list.map((i) => i.avgHr))
  const minSbp = Math.min(...list.map((i) => i.avgSbp))
  const minGlu = Math.min(...list.map((i) => i.avgGlu))
  const minHr = Math.min(...list.map((i) => i.avgHr))

  const colors = ['#3a6ff0', '#f2a63b', '#e5544b']
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, itemGap: 16, textStyle: { fontSize: 11.5 }, icon: 'roundRect', itemWidth: 12, itemHeight: 6 },
    radar: {
      center: ['50%', '47%'],
      radius: '62%',
      indicator: indicators.map((i) => ({ name: i, max: 100 })),
      shape: 'polygon',
      splitNumber: 4,
      axisName: { color: '#5b6880', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e4e9f2' } },
      splitLine: { lineStyle: { color: '#eef1f7' } },
      splitArea: { areaStyle: { color: ['#fbfcfe', '#f7f9fd'] } }
    },
    series: [
      {
        type: 'radar',
        symbolSize: 4,
        data: groups.map((g, gi) => {
          const rows = g.idx.map((i) => list[i])
          const avg = (k) => (rows[0][k] + rows[1][k]) / 2
          const bp = Math.round(((maxSbp - avg('avgSbp')) / (maxSbp - minSbp || 1)) * 100)
          const gl = Math.round(((maxGlu - avg('avgGlu')) / (maxGlu - minGlu || 1)) * 100)
          const hr = Math.round(((maxHr - avg('avgHr')) / (maxHr - minHr || 1)) * 100)
          const nor = Math.round(100 - avg('abnormalRate'))
          const sc = Math.round(avg('score'))
          return {
            name: g.name,
            value: [bp, gl, hr, nor, sc],
            itemStyle: { color: colors[gi] },
            areaStyle: { color: hexToRgba(colors[gi], .18) },
            lineStyle: { width: 2 }
          }
        })
      }
    ]
  }
})

/* ---------- 社区异常率排行 ---------- */
const communityOption = computed(() => {
  const list = (compare.value.communities || []).slice().sort((a, b) => a.abnormalRate - b.abnormalRate)
  if (!list.length) return null
  return {
    grid: grid({ left: 8, right: 46, top: 6, bottom: 2 }),
    tooltip: tip({
      formatter: (p) => {
        const d = list[p[0].dataIndex]
        return `${d.name}<br/>异常率 <b>${d.abnormalRate}%</b><br/>平均收缩压 <b>${d.avgSbp}</b><br/>高危 <b>${d.highRisk}</b> 人`
      }
    }),
    xAxis: { type: 'value', show: false, max: Math.max(...list.map((i) => i.abnormalRate)) * 1.3 },
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
          value: i.abnormalRate,
          itemStyle: {
            borderRadius: [0, 6, 6, 0],
            color: grad(i.abnormalRate > 32 ? '#e5544b' : i.abnormalRate > 24 ? '#f2a63b' : '#3a6ff0', .95, .4)
          }
        })),
        label: { show: true, position: 'right', color: '#5b6880', fontSize: 10.5, formatter: '{c}%' }
      }
    ]
  }
})

/* ---------- 社区散点 ---------- */
const scatterOption = computed(() => {
  const list = compare.value.communities || []
  if (!list.length) return null
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const d = list[p.dataIndex]
        return `${d.name}<br/>在册 <b>${d.elders}</b> 人<br/>异常率 <b>${d.abnormalRate}%</b><br/>高危 <b>${d.highRisk}</b> 人<br/>干预覆盖 <b>${d.coverage}%</b>`
      }
    },
    grid: grid({ top: 22, right: 24, bottom: 4, left: 6 }),
    xAxis: { type: 'value', name: '异常率 %', nameTextStyle: { color: '#96a2b6', fontSize: 10.5 }, axisLabel: { color: '#96a2b6', fontSize: 10.5 } },
    yAxis: { type: 'value', name: '干预覆盖率 %', nameTextStyle: { color: '#96a2b6', fontSize: 10.5 }, axisLabel: { color: '#96a2b6', fontSize: 10.5 } },
    series: [
      {
        type: 'scatter',
        symbolSize: (d) => Math.max(12, d[2] / 3.4),
        data: list.map((d) => [d.abnormalRate, d.coverage, d.highRisk]),
        itemStyle: {
          color: (p) => (p.data[0] > 32 ? hexToRgba('#e5544b', .8) : p.data[0] > 24 ? hexToRgba('#f2a63b', .82) : hexToRgba('#3a6ff0', .8)),
          borderColor: '#fff',
          borderWidth: 1.6
        },
        label: { show: true, position: 'top', formatter: (p) => list[p.dataIndex].name, color: '#5b6880', fontSize: 10 },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#c6cfdd', type: 'dashed' },
          data: [{ xAxis: 28 }, { yAxis: 90 }]
        }
      }
    ]
  }
})

/* ---------- 异常明细过滤 ---------- */
const filteredAbnormal = computed(() => {
  const list = abnormal.value.list || []
  const k = keyword.value.trim()
  if (!k) return list
  return list.filter((i) => i.name.includes(k) || i.community.includes(k))
})
</script>

<style lang="scss" scoped>
.level {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}
</style>

<style lang="scss">
.abnormal-table {
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
