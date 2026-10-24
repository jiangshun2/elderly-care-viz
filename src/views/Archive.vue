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

    <!-- ===== 结构分析 ===== -->
    <section class="grid-12">
      <div class="col-4">
        <PanelBox title="老人居住方式构成" sub="独居风险重点关注">
          <ChartBox :option="livingOption" height="292px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="年龄段人口分布" sub="在册人数">
          <ChartBox :option="ageOption" height="292px" />
        </PanelBox>
      </div>
      <div class="col-4">
        <PanelBox title="高频慢病标签 TOP 8" sub="档案标签统计">
          <ChartBox :option="tagOption" height="292px" />
        </PanelBox>
      </div>
    </section>

    <!-- ===== 档案表 ===== -->
    <section class="grid-12">
      <div class="col-12">
        <PanelBox title="老人健康档案" :sub="`共 ${elderList.total || 0} 人`" flush>
          <template #extra>
            <el-select v-model="communityFilter" size="small" placeholder="社区" clearable style="width: 130px">
              <el-option v-for="c in store.communityOptions" :key="c.value" :label="c.label" :value="c.value" />
            </el-select>
            <el-input v-model="keyword" size="small" placeholder="搜索姓名" clearable style="width: 150px" />
          </template>
          <el-table :data="filteredElders" size="small" height="420" class="elder-table">
            <el-table-column prop="id" label="档案编号" width="104" />
            <el-table-column prop="name" label="姓名" width="90" />
            <el-table-column prop="gender" label="性别" width="64" />
            <el-table-column prop="age" label="年龄" width="64" />
            <el-table-column prop="community" label="社区" width="98" />
            <el-table-column prop="address" label="居住地址" min-width="180" />
            <el-table-column prop="living" label="居住方式" width="106" />
            <el-table-column label="健康标签" min-width="180">
              <template #default="{ row }">
                <span v-for="t in row.tags" :key="t" class="tag">{{ t }}</span>
                <span v-if="!row.tags.length" class="muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="血压" width="74">
              <template #default="{ row }">
                <span :class="{ 'is-warn': row.sbp > 150 || row.sbp < 100 }">{{ row.sbp }}</span>
              </template>
            </el-table-column>
            <el-table-column label="血糖" width="74">
              <template #default="{ row }">
                <span :class="{ 'is-warn': row.glu > 7 || row.glu < 3.9 }">{{ row.glu }}</span>
              </template>
            </el-table-column>
            <el-table-column label="心率" width="70">
              <template #default="{ row }">
                <span :class="{ 'is-warn': row.hr > 100 || row.hr < 55 }">{{ row.hr }}</span>
              </template>
            </el-table-column>
            <el-table-column label="设备" width="86">
              <template #default="{ row }">
                <span class="device" :class="row.device === '已绑定' ? 'is-on' : 'is-off'">{{ row.device }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="lastCheck" label="最近随访" width="106" />
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
import { getElderList } from '@/api/modules/elder'
import { useAppStore } from '@/stores/app'
import { grad, grid, tip, donutBase, centerTitle } from '@/utils/chartOptions'

const store = useAppStore()

const elderList = ref({ total: 0, list: [] })
const keyword = ref('')
const communityFilter = ref('')

async function loadData() {
  const res = await getElderList({ size: 120 })
  elderList.value = res
}

onMounted(loadData)
watch(() => store.refreshKey, loadData)

/* ---------- 指标卡 ---------- */
const cards = computed(() => {
  const list = elderList.value.list || []
  if (!list.length) return []
  const alone = list.filter((i) => i.living === '独居').length
  const bound = list.filter((i) => i.device === '已绑定').length
  const chronicCount = list.filter((i) => i.tags.length >= 2).length
  return [
    { label: '在册老人', value: elderList.value.total, unit: '人', icon: 'user', tone: 'primary', tip: '已建立电子健康档案', foot: '覆盖 12 个社区', footColor: '#3a6ff0' },
    { label: '独居老人', value: alone, unit: '人', icon: 'alert', tone: 'amber', tip: '无子女同住，需重点巡访', foot: `占比 ${Math.round((alone / list.length) * 100)}%`, footColor: '#f2a63b' },
    { label: '已绑定监测设备', value: bound, unit: '人', icon: 'chart', tone: 'teal', tip: '血压计 / 手环 / 呼叫器', foot: `绑定率 ${Math.round((bound / list.length) * 100)}%`, footColor: '#12b0a4' },
    { label: '多重慢病人群', value: chronicCount, unit: '人', icon: 'heart', tone: 'red', tip: '合并两种及以上慢病', foot: '需专项干预方案', footColor: '#e5544b' }
  ]
})

/* ---------- 居住方式 ---------- */
const livingOption = computed(() => {
  const list = elderList.value.list || []
  if (!list.length) return null
  const map = {}
  list.forEach((i) => (map[i.living] = (map[i.living] || 0) + 1))
  const colors = ['#e5544b', '#3a6ff0', '#12b0a4']
  const data = Object.entries(map).map(([name, value], i) => ({
    name,
    value,
    itemStyle: { color: colors[i % colors.length] }
  }))
  return {
    ...donutBase(['50%', '45%']),
    ...centerTitle(map['独居'] || 0, '独居老人', { top: '34%', size: 22, color: '#e5544b' }),
    series: [{ ...donutBase()['series'][0], center: ['50%', '45%'], radius: ['48%', '70%'], data }],
    legend: {
      bottom: 0,
      left: 'center',
      itemGap: 12,
      textStyle: { fontSize: 11 },
      icon: 'roundRect',
      itemWidth: 9,
      itemHeight: 9,
      formatter: (name) => {
        const d = data.find((i) => i.name === name)
        return `${name} ${d.value}人`
      }
    }
  }
})

/* ---------- 年龄分布 ---------- */
const ageOption = computed(() => {
  const list = elderList.value.list || []
  if (!list.length) return null
  const buckets = [
    { name: '60-69', min: 60, max: 69, color: '#28a86b' },
    { name: '70-79', min: 70, max: 79, color: '#3a6ff0' },
    { name: '80-89', min: 80, max: 89, color: '#f2a63b' },
    { name: '90+', min: 90, max: 200, color: '#e5544b' }
  ].map((b) => ({
    ...b,
    value: list.filter((i) => i.age >= b.min && i.age <= b.max).length
  }))
  return {
    tooltip: tip({ formatter: (p) => `${p[0].name} 岁<br/><b>${p[0].value}</b> 人` }),
    grid: grid({ top: 22, right: 14, bottom: 2, left: 2 }),
    xAxis: {
      type: 'category',
      data: buckets.map((b) => b.name),
      axisLabel: { color: '#96a2b6', fontSize: 11 },
      axisLine: { lineStyle: { color: '#e4e9f2' } }
    },
    yAxis: { type: 'value', name: '人', nameTextStyle: { color: '#96a2b6', fontSize: 11 } },
    series: [
      {
        type: 'bar',
        barWidth: '46%',
        data: buckets.map((b) => ({
          value: b.value,
          itemStyle: { color: grad(b.color, .95, .5), borderRadius: [5, 5, 0, 0] }
        })),
        label: { show: true, position: 'top', color: '#5b6880', fontSize: 11 }
      }
    ]
  }
})

/* ---------- 慢病标签 ---------- */
const tagOption = computed(() => {
  const list = elderList.value.list || []
  if (!list.length) return null
  const map = {}
  list.forEach((i) => i.tags.forEach((t) => (map[t] = (map[t] || 0) + 1)))
  const entries = Object.entries(map)
    .sort((a, b) => a[1] - b[1])
    .slice(-8)
    .reverse()
  const colors = ['#3a6ff0', '#12b0a4', '#f2a63b', '#e5544b', '#7a5bf0', '#2fb6e0', '#e86fa8', '#e07b3c']
  return {
    grid: grid({ left: 8, right: 46, top: 6, bottom: 2 }),
    tooltip: tip({ formatter: (p) => `${p[0].name}<br/><b>${p[0].value}</b> 人` }),
    xAxis: { type: 'value', show: false, max: Math.max(...entries.map((i) => i[1])) * 1.3 },
    yAxis: {
      type: 'category',
      data: entries.map((i) => i[0]),
      axisLabel: { color: '#5b6880', fontSize: 11 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        barWidth: 11,
        data: entries.map((i, idx) => ({
          value: i[1],
          itemStyle: { color: grad(colors[idx % colors.length], .95, .4), borderRadius: [0, 6, 6, 0] }
        })),
        label: { show: true, position: 'right', color: '#5b6880', fontSize: 10.5 }
      }
    ]
  }
})

/* ---------- 表格过滤 ---------- */
const filteredElders = computed(() => {
  let list = elderList.value.list || []
  if (communityFilter.value) list = list.filter((i) => i.community === communityFilter.value)
  const k = keyword.value.trim()
  if (k) list = list.filter((i) => i.name.includes(k) || i.address.includes(k))
  return list
})
</script>

<style lang="scss" scoped>
.tag {
  display: inline-block;
  padding: 1px 7px;
  margin: 2px 4px 2px 0;
  border-radius: 4px;
  background: $primary-soft;
  color: $primary-dark;
  font-size: 11px;
}

.muted { color: $text-3; }

.is-warn { color: $red; font-weight: 600; }

.device {
  display: inline-block;
  padding: 1px 8px;
  border-radius: 20px;
  font-size: 11px;

  &.is-on { background: rgba(40, 168, 107, .12); color: $green; }
  &.is-off { background: rgba(139, 150, 171, .14); color: $text-3; }
}
</style>

<style lang="scss">
.elder-table {
  :deep(th.el-table__cell) {
    background: $panel-sub;
    color: $text-2;
    font-weight: 600;
  }
  :deep(.el-table__row td) { border-bottom-color: $border-soft; }
  :deep(.el-table__inner-wrapper::before) { background-color: $border-soft; }
}
</style>
