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

    <!-- ===== 人员配置 + 角色构成 ===== -->
    <section class="grid-12">
      <div class="col-8">
        <PanelBox title="各社区人员配置与服务需求匹配" sub="柱=人数 / 折线=覆盖率">
          <template #extra>
            <div class="legend-inline">
              <span><i style="background:#3a6ff0"></i>实际配置</span>
              <span><i style="background:#c6cfdd"></i>人员需求</span>
              <span><i style="background:#12b0a4"></i>需求覆盖率</span>
            </div>
          </template>
          <ChartBox :option="distOption" height="306px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="服务人员岗位构成" :sub="`当前在岗 ${overview.onDuty || 0} 人`">
          <ChartBox :option="roleOption" height="306px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 响应箱线 / 负荷散点 / 技能雷达 ===== -->
    <section class="grid-12">
      <div class="col-5">
        <PanelBox title="各社区响应时长分布" sub="箱线图（分钟）">
          <template #extra>
            <div class="legend-inline">
              <span><i style="background:#28a86b"></i>≤5分钟</span>
              <span><i style="background:#f2a63b"></i>≤10分钟</span>
              <span><i style="background:#e5544b"></i>&gt;15分钟</span>
            </div>
          </template>
          <ChartBox :option="boxOption" height="306px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="人员负荷与满意度关系" sub="气泡大小=服务单量">
          <ChartBox :option="loadOption" height="306px" />
        </PanelBox>
      </div>
      <div class="col-3">
        <PanelBox title="岗位技能雷达" sub="多维能力评估">
          <ChartBox :option="radarOption" height="306px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 人员名单 ===== -->
    <section class="grid-12">
      <div class="col-12">
        <PanelBox title="服务人员档案" :sub="`共 ${staffList.total || 0} 人`" flush>
          <template #extra>
            <el-input v-model="keyword" size="small" placeholder="搜索姓名 / 岗位 / 社区" clearable style="width: 210px" />
          </template>
          <el-table :data="filteredStaff" size="small" height="340" class="staff-table">
            <el-table-column prop="id" label="工号" width="112" />
            <el-table-column prop="name" label="姓名" width="92" />
            <el-table-column label="岗位" width="116">
              <template #default="{ row }">
                <span class="role" :style="{ background: row.roleColor + '1a', color: row.roleColor }">{{ row.role }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="community" label="所属社区" width="104" />
            <el-table-column prop="age" label="年龄" width="64" />
            <el-table-column prop="phone" label="联系电话" width="126" />
            <el-table-column prop="orders" label="累计服务单" width="112" />
            <el-table-column prop="response" label="平均响应(分)" width="128" />
            <el-table-column label="满意度" width="110">
              <template #default="{ row }">
                <el-rate :model-value="row.satisfaction" disabled size="small" />
              </template>
            </el-table-column>
            <el-table-column label="状态" width="84">
              <template #default="{ row }">
                <span class="state" :class="row.status === '在岗' ? 'is-on' : 'is-off'">{{ row.status }}</span>
              </template>
            </el-table-column>
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
  getStaffOverview,
  getDistribution,
  getResponseTime,
  getLoadSatisfaction,
  getSkillRadar,
  getStaffList
} from '@/api/modules/staff'
import { useAppStore } from '@/stores/app'
import { grad, hexToRgba, grid, tip, donutBase, centerTitle } from '@/utils/chartOptions'

const store = useAppStore()

const overview = ref({})
const distribution = ref({})
const respTime = ref({})
const loadSat = ref({})
const skill = ref({})
const staffList = ref({ total: 0, list: [] })
const keyword = ref('')

async function loadData() {
  const [o, d, rt, ls, sk, sl] = await Promise.all([
    getStaffOverview(),
    getDistribution(),
    getResponseTime(),
    getLoadSatisfaction(),
    getSkillRadar(),
    getStaffList({ size: 60 })
  ])
  overview.value = o
  distribution.value = d
  respTime.value = rt
  loadSat.value = ls
  skill.value = sk
  staffList.value = sl
}

onMounted(loadData)
watch(() => store.refreshKey, loadData)

/* ---------- 指标卡 ---------- */
const cards = computed(() => {
  const o = overview.value
  if (!o.total) return []
  return [
    { label: '服务人员总数', value: o.total, unit: '人', icon: 'staff', tone: 'primary', tip: '覆盖 12 个社区', foot: `覆盖 12 个社区`, footColor: '#3a6ff0' },
    { label: '当前在岗', value: o.onDuty, unit: '人', icon: 'chart', tone: 'teal', tip: '实时在岗人数', foot: `在岗率 ${Math.round((o.onDuty / o.total) * 100)}%`, footColor: '#12b0a4' },
    { label: '平均响应时长', value: o.avgResponse, unit: '分钟', icon: 'clock', tone: 'amber', tip: '从告警到到达现场', foot: '5 分钟达标 96.2%', footColor: '#28a86b' },
    { label: '平均服务半径', value: o.avgRadius, unit: '米', icon: 'service', tone: 'purple', tip: '救援人员到老人的平均距离', foot: '半径覆盖率 96.2%', footColor: '#7a5bf0' }
  ]
})

/* ---------- 社区人员配置 ---------- */
const distOption = computed(() => {
  const list = distribution.value.communities || []
  if (!list.length) return null
  return {
    tooltip: tip({
      formatter: (p) => {
        const d = list[p[0].dataIndex]
        return `${d.name}<br/>配置人员 <b>${d.staff}</b> 人（在岗 ${d.onDuty}）<br/>人员需求 <b>${d.need}</b> 人<br/>人力缺口 <b>${d.gap}</b> 人<br/>覆盖率 <b>${d.coverage}%</b><br/>平均响应 <b>${d.avgResponse}</b> 分钟`
      }
    }),
    legend: { show: false },
    grid: grid({ top: 26, right: 14, bottom: 2, left: 4 }),
    xAxis: {
      type: 'category',
      data: list.map((i) => i.name.replace('社区', '')),
      axisLabel: { color: '#96a2b6', fontSize: 10.5, interval: 0, rotate: list.length > 8 ? 30 : 0 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: [
      { type: 'value', name: '人', nameTextStyle: { color: '#96a2b6', fontSize: 11 } },
      { type: 'value', name: '覆盖率 %', min: 60, max: 100, nameTextStyle: { color: '#96a2b6', fontSize: 11 }, splitLine: { show: false } }
    ],
    series: [
      {
        name: '人员需求',
        type: 'bar',
        data: list.map((i) => i.need),
        barWidth: 13,
        barGap: '-100%',
        itemStyle: { color: hexToRgba('#c6cfdd', .55), borderRadius: [4, 4, 0, 0] },
        z: 1
      },
      {
        name: '实际配置',
        type: 'bar',
        data: list.map((i) => i.staff),
        barWidth: 13,
        itemStyle: { color: grad('#3a6ff0', .95, .5), borderRadius: [4, 4, 0, 0] },
        z: 2
      },
      {
        name: '需求覆盖率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        data: list.map((i) => i.coverage),
        lineStyle: { width: 2.2, color: '#12b0a4' },
        itemStyle: { color: '#fff', borderColor: '#12b0a4', borderWidth: 2 }
      }
    ]
  }
})

/* ---------- 岗位构成 ---------- */
const roleOption = computed(() => {
  const roles = overview.value.roles || []
  if (!roles.length) return null
  return {
    ...donutBase(['50%', '45%']),
    ...centerTitle(overview.value.total, '服务人员总数', { top: '34%', size: 22 }),
    series: [
      {
        ...donutBase()['series'][0],
        center: ['50%', '45%'],
        radius: ['48%', '70%'],
        data: roles.map((r) => ({ name: r.name, value: r.base, itemStyle: { color: r.color } }))
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
        const r = roles.find((i) => i.name === name)
        return `${name} ${r.percent}%`
      }
    }
  }
})

/* ---------- 响应箱线图 ---------- */
const boxOption = computed(() => {
  const r = respTime.value
  if (!r.categories) return null
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const v = p.value.slice(1)
        return `${p.name}<br/>最快 <b>${v[0]}</b> 分钟<br/>下四分位 <b>${v[1]}</b><br/>中位数 <b>${v[2]}</b><br/>上四分位 <b>${v[3]}</b><br/>最慢 <b>${v[4]}</b>`
      }
    },
    grid: grid({ top: 18, right: 16, bottom: 2, left: 4 }),
    xAxis: {
      type: 'category',
      data: r.categories.map((c) => c.replace('社区', '')),
      axisLabel: { color: '#96a2b6', fontSize: 10, interval: 0, rotate: 32 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', name: '分钟', nameTextStyle: { color: '#96a2b6', fontSize: 11 } },
    series: [
      {
        type: 'boxplot',
        data: r.boxData,
        boxWidth: [10, 26],
        itemStyle: { color: hexToRgba('#3a6ff0', .16), borderColor: '#3a6ff0', borderWidth: 1.6 },
        emphasis: { itemStyle: { borderColor: '#f2a63b' } },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#e5544b', type: 'dashed', width: 1.2 },
          label: { formatter: '10 分钟线', color: '#e5544b', fontSize: 10 },
          data: [{ yAxis: 10 }]
        }
      }
    ]
  }
})

/* ---------- 负荷散点 ---------- */
const loadOption = computed(() => {
  const data = loadSat.value.data || []
  if (!data.length) return null
  const roleColors = {
    护理员: '#3a6ff0', 社区社工: '#12b0a4', 康复治疗师: '#7a5bf0',
    家庭医生: '#2fb6e0', 急救员: '#e5544b', 协调调度员: '#f2a63b'
  }
  return {
    tooltip: {
      trigger: 'item',
      formatter: (p) => {
        const d = data[p.dataIndex]
        return `${d.name}（${d.role}）<br/>社区 <b>${d.community}</b><br/>日均服务 <b>${d.value[0]}</b> 单<br/>满意度 <b>${d.value[1]}</b> 分`
      }
    },
    grid: grid({ top: 22, right: 18, bottom: 2, left: 2 }),
    xAxis: { type: 'value', name: '日均服务单量', nameTextStyle: { color: '#96a2b6', fontSize: 10 }, axisLabel: { color: '#96a2b6', fontSize: 10 } },
    yAxis: { type: 'value', name: '满意度', min: 3, max: 5, nameTextStyle: { color: '#96a2b6', fontSize: 10 }, axisLabel: { color: '#96a2b6', fontSize: 10 } },
    series: [
      {
        type: 'scatter',
        symbolSize: (val) => Math.max(9, (Number(val[2]) || 3) * 4),
        data: data.map((d) => ({ value: d.value, name: d.name, role: d.role })),
        itemStyle: {
          color: (p) => hexToRgba(roleColors[p.data.role] || '#3a6ff0', .78),
          borderColor: '#fff',
          borderWidth: 1.2
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: '#c6cfdd', type: 'dashed' },
          data: [{ yAxis: 4.3 }]
        }
      }
    ],
    legend: { show: false }
  }
})

/* ---------- 技能雷达 ---------- */
const radarOption = computed(() => {
  const s = skill.value
  if (!s.indicators) return null
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, itemGap: 10, textStyle: { fontSize: 10.5 }, icon: 'roundRect', itemWidth: 10, itemHeight: 5 },
    radar: {
      center: ['50%', '47%'],
      radius: '58%',
      indicator: s.indicators.map((i) => ({ name: i, max: 100 })),
      splitNumber: 4,
      axisName: { color: '#5b6880', fontSize: 10 },
      axisLine: { lineStyle: { color: '#e4e9f2' } },
      splitLine: { lineStyle: { color: '#eef1f7' } },
      splitArea: { areaStyle: { color: ['#fbfcfe', '#f7f9fd'] } }
    },
    series: [
      {
        type: 'radar',
        symbolSize: 3,
        data: s.series.map((i) => ({
          name: i.name,
          value: i.data,
          itemStyle: { color: i.color },
          areaStyle: { color: hexToRgba(i.color, .14) },
          lineStyle: { width: 1.8 }
        }))
      }
    ]
  }
})

/* ---------- 人员过滤 ---------- */
const filteredStaff = computed(() => {
  const list = staffList.value.list || []
  const k = keyword.value.trim()
  if (!k) return list
  return list.filter((i) => i.name.includes(k) || i.role.includes(k) || i.community.includes(k))
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

.role {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.state {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;

  &.is-on { background: rgba(40, 168, 107, .12); color: $green; }
  &.is-off { background: rgba(139, 150, 171, .14); color: $text-3; }
}
</style>

<style lang="scss">
.staff-table {
  :deep(th.el-table__cell) {
    background: $panel-sub;
    color: $text-2;
    font-weight: 600;
  }
  :deep(.el-table__row td) { border-bottom-color: $border-soft; }
  :deep(.el-table__inner-wrapper::before) { background-color: $border-soft; }
}
</style>
