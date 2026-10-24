/**
 * ============================================================
 *  Mock 数据源
 *  —— 使用固定种子的伪随机，保证每次刷新图表数据一致（便于联调比对）
 * ============================================================
 */
import { COMMUNITIES } from './communities'

// —— 固定种子随机数 ——
function mulberry32(seed) {
  let a = seed
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const rnd = mulberry32(20260424)
const rand = (min, max) => min + rnd() * (max - min)
const randInt = (min, max) => Math.floor(rand(min, max + 1))
const round = (n, p = 1) => Math.round(n * 10 ** p) / 10 ** p

// —— 日期工具 ——
function dateList(days) {
  const out = []
  const today = new Date('2026-10-24')
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    out.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }
  return out
}
function monthList(months) {
  const out = []
  const today = new Date('2026-10-24')
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return out
}

const NAMES = '赵钱孙李周吴郑王冯陈褚卫蒋沈韩杨朱秦尤许何吕施张孔曹严华金魏陶姜戚谢邹喻柏水窦章云苏潘葛奚范彭郎鲁韦昌马苗凤花方俞任袁柳'.split('')
const surname = (i) => NAMES[i % NAMES.length]

/* ============================================================
 *  1. 总览 KPI
 * ============================================================ */
export function getKpi() {
  const totalElders = COMMUNITIES.reduce((s, c) => s + c.elders, 0)
  const totalStaff = COMMUNITIES.reduce((s, c) => s + c.staff, 0)
  return {
    totalElders,
    totalStaff,
    monitoredRate: 87.4,       // 健康档案建档监测率
    abnormalRate: 23.6,        // 指标异常人群占比
    servedToday: 1284,         // 今日服务人次
    serviceOrders: 18642,      // 累计服务工单
    emergencyToday: 17,        // 今日紧急事件
    responseAvg: 8.4,          // 平均响应时长（分钟）
    responseRate: 96.2,        // 5分钟响应达标率
    satisfaction: 4.7,         // 服务满意度（5分制）
    avgServiceRadius: 620,     // 平均服务半径（米）
    highRiskCount: 286         // 高危老人数
  }
}

/* ============================================================
 *  2. 健康指标
 * ============================================================ */
const INDICATOR_META = [
  { key: 'sbp',  name: '收缩压偏高', unit: 'mmHg', color: '#e5544b', base: 18.6 },
  { key: 'dbp',  name: '舒张压偏高', unit: 'mmHg', color: '#f2a63b', base: 12.4 },
  { key: 'glu',  name: '血糖异常',   unit: 'mmol/L', color: '#7a5bf0', base: 15.2 },
  { key: 'hr',   name: '心率异常',   unit: 'bpm',   color: '#3a6ff0', base: 9.8 },
  { key: 'spo2', name: '血氧偏低',   unit: '%',     color: '#2fb6e0', base: 6.3 },
  { key: 'bmi',  name: '体重异常',   unit: 'kg',    color: '#12b0a4', base: 11.5 }
]

export function getHealthSummary() {
  const totalElders = COMMUNITIES.reduce((s, c) => s + c.elders, 0)
  const items = INDICATOR_META.map((m) => {
    const count = Math.round((totalElders * m.base) / 100)
    return {
      key: m.key,
      name: m.name,
      unit: m.unit,
      color: m.color,
      count,
      rate: round((count / totalElders) * 100, 1)
    }
  })
  return {
    totalElders,
    monitored: Math.round(totalElders * 0.874),
    items,
    avgSystolic: 136.8,
    avgDiastolic: 82.4,
    avgGlucose: 6.3,
    avgHeartRate: 73.5,
    avgSpo2: 96.2,
    abnormalPeople: Math.round(totalElders * 0.236),
    uncontrolled: Math.round(totalElders * 0.098) // 控制不佳人群
  }
}

export function getIndicatorTrend(days = 30) {
  const dates = dateList(days)
  const trend = {}
  INDICATOR_META.forEach((m, idx) => {
    trend[m.key] = dates.map((d, i) => {
      const wave = Math.sin((i + idx * 3) / 3.6) * 1.4
      return round(m.base + wave + rand(-1.1, 1.1), 1)
    })
  })
  return {
    dates,
    series: INDICATOR_META.map((m) => ({
      key: m.key,
      name: m.name,
      color: m.color,
      unit: '%',
      data: trend[m.key]
    }))
  }
}

export function getAgeProfile() {
  const groups = [
    { name: '60-64岁', weight: 0.16 },
    { name: '65-69岁', weight: 0.19 },
    { name: '70-74岁', weight: 0.21 },
    { name: '75-79岁', weight: 0.18 },
    { name: '80-84岁', weight: 0.15 },
    { name: '85岁以上', weight: 0.11 }
  ]
  const totalElders = COMMUNITIES.reduce((s, c) => s + c.elders, 0)
  const data = groups.map((g, i) => {
    const count = Math.round(totalElders * g.weight)
    return {
      name: g.name,
      count,
      score: round(92 - i * 6.4 + rand(-2, 2), 1), // 健康评分
      abnormalRate: round(12 + i * 5.8 + rand(-2.5, 2.5), 1),
      avgSbp: round(128 + i * 3.2 + rand(-2, 2), 0),
      avgGlu: round(5.6 + i * 0.22 + rand(-0.3, 0.3), 1),
      avgHr: round(70 + i * 1.6 + rand(-1.5, 1.5), 0)
    }
  })
  return { totalElders, data }
}

export function getChronicDisease() {
  const list = [
    { name: '高血压', value: 1286, color: '#e5544b' },
    { name: '2型糖尿病', value: 872, color: '#7a5bf0' },
    { name: '冠心病', value: 541, color: '#f2a63b' },
    { name: '骨质疏松', value: 468, color: '#12b0a4' },
    { name: '慢阻肺', value: 356, color: '#2fb6e0' },
    { name: '脑卒中后遗症', value: 289, color: '#3a6ff0' },
    { name: '阿尔茨海默病', value: 173, color: '#e86fa8' },
    { name: '风湿性关节炎', value: 158, color: '#8b96ab' }
  ]
  const total = list.reduce((s, i) => s + i.value, 0)
  return {
    total,
    list: list.map((i) => ({ ...i, percent: round((i.value / total) * 100, 1) })),
    multiChronic: 612,   // 合并两种及以上慢病
    managed: 2718        // 慢病规范管理人数
  }
}

export function getCommunityCompare() {
  return {
    communities: COMMUNITIES.map((c) => {
      const base = 10 + (c.riskIndex ?? 0.2) * 60
      return {
        name: c.name,
        elders: c.elders,
        abnormalRate: round(base + rand(-4, 4), 1),
        avgSbp: round(126 + base * 0.22 + rand(-3, 3), 0),
        avgGlu: round(5.5 + base * 0.035 + rand(-0.3, 0.3), 1),
        highRisk: Math.round(c.elders * (0.04 + base * 0.0035)),
        coverage: round(78 + rand(-8, 16), 1)
      }
    })
  }
}

export function getRiskScore() {
  const levels = [
    { name: '低风险', range: '0-30', color: '#28a86b', count: 1832 },
    { name: '中风险', range: '31-60', color: '#f2a63b', count: 1204 },
    { name: '高风险', range: '61-80', color: '#e07b3c', count: 538 },
    { name: '极高风险', range: '81-100', color: '#e5544b', count: 286 }
  ]
  const total = levels.reduce((s, i) => s + i.count, 0)
  return {
    total,
    levels: levels.map((l) => ({ ...l, percent: round((l.count / total) * 100, 1) })),
    watchList: [
      { id: 'E10028', name: '王秀英', age: 82, community: '康乐社区', score: 94, tags: ['高血压', '独居', '跌倒史'], lastCheck: '2026-10-23' },
      { id: 'E10245', name: '李国安', age: 79, community: '和谐社区', score: 91, tags: ['冠心病', '糖尿病'], lastCheck: '2026-10-22' },
      { id: 'E10466', name: '张桂芳', age: 88, community: '平安社区', score: 89, tags: ['脑卒中后遗症', '独居'], lastCheck: '2026-10-23' },
      { id: 'E10703', name: '刘志强', age: 85, community: '和美社区', score: 87, tags: ['慢阻肺', '嗜烟'], lastCheck: '2026-10-21' },
      { id: 'E10890', name: '陈玉兰', age: 91, community: '安康社区', score: 86, tags: ['跌倒史', '骨质疏松'], lastCheck: '2026-10-24' },
      { id: 'E11022', name: '赵德山', age: 77, community: '长青社区', score: 84, tags: ['房颤', '高血压'], lastCheck: '2026-10-24' }
    ]
  }
}

export function getAbnormalList(size = 60) {
  const indicators = ['收缩压', '空腹血糖', '心率', '血氧饱和度', '体重指数', '舒张压']
  const levels = [
    { name: '严重', color: '#e5544b' },
    { name: '中度', color: '#f2a63b' },
    { name: '轻度', color: '#3a6ff0' }
  ]
  const list = []
  for (let i = 0; i < size; i++) {
    const c = COMMUNITIES[i % COMMUNITIES.length]
    const lv = levels[randInt(0, 2)]
    list.push({
      id: `E${10000 + i * 7}`,
      name: surname(i) + '某某',
      age: randInt(60, 94),
      gender: rnd() > 0.55 ? '男' : '女',
      community: c.name,
      indicator: indicators[randInt(0, indicators.length - 1)],
      value: round(rand(0, 1) > 0.5 ? rand(150, 185) : rand(2.8, 12.6), 1),
      level: lv.name,
      levelColor: lv.color,
      device: rnd() > 0.5 ? '智能血压计' : '智能手环',
      time: `2026-10-${String(randInt(20, 24)).padStart(2, '0')} ${String(randInt(0, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}`
    })
  }
  return { total: 892, list }
}

/* ============================================================
 *  3. 服务需求
 * ============================================================ */
const SERVICE_TYPES = [
  { name: '上门护理', color: '#3a6ff0', base: 2680 },
  { name: '康复理疗', color: '#12b0a4', base: 2140 },
  { name: '慢病管理', color: '#7a5bf0', base: 1980 },
  { name: '助餐助浴', color: '#f2a63b', base: 1720 },
  { name: '健康体检', color: '#2fb6e0', base: 1490 },
  { name: '精神慰藉', color: '#e86fa8', base: 1180 },
  { name: '助洁助行', color: '#e5544b', base: 960 },
  { name: '紧急救护', color: '#8b96ab', base: 720 }
]

export function getServiceSummary() {
  const total = SERVICE_TYPES.reduce((s, i) => s + i.base, 0)
  const today = 1284
  return {
    today,
    total,
    monthTotal: 8642,
    satisfiedRate: 94.6,
    avgDuration: 46.5,
    pending: 37,
    types: SERVICE_TYPES.map((t) => ({
      ...t,
      percent: round((t.base / total) * 100, 1),
      monthCount: Math.round(t.base / 4.2),
      growth: round(rand(-12, 26), 1)
    }))
  }
}

export function getDemandTrend(days = 30) {
  const dates = dateList(days)
  const demand = dates.map((d, i) => {
    const week = new Date(2026, 9, 24 - (days - 1 - i)).getDay()
    const weekend = week === 0 || week === 6 ? 1.18 : 1
    return Math.round((1120 + Math.sin(i / 4.2) * 120 + rand(-60, 60)) * weekend)
  })
  const supply = dates.map((d, i) => Math.round(demand[i] * (0.86 + rand(-0.04, 0.06))))
  return {
    dates,
    demand,
    supply,
    unsatisfied: demand.map((d, i) => Math.max(0, d - supply[i]))
  }
}

export function getServiceTypeRank() {
  const list = SERVICE_TYPES.map((t) => ({
    name: t.name,
    color: t.color,
    value: Math.round(t.base * (0.85 + rand(0, 0.35))),
    satisfied: round(rand(88, 99.4), 1),
    avgWait: round(rand(0.6, 5.8), 1)
  })).sort((a, b) => a.value - b.value)
  return { list }
}

export function getServiceHeatmap() {
  const hours = ['06', '08', '10', '12', '14', '16', '18', '20']
  const weekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = []
  weekdays.forEach((d, y) => {
    hours.forEach((h, x) => {
      let v = rand(40, 160)
      if (['10', '14'].includes(h)) v *= 1.5
      if (['周六', '周日'].includes(d)) v *= 0.8
      if (['08', '18'].includes(h)) v *= 1.25
      data.push([x, y, Math.round(v)])
    })
  })
  return { hours, weekdays, data }
}

export function getSupplyGap() {
  return {
    communities: COMMUNITIES.map((c) => {
      const demand = Math.round(c.elders * rand(0.55, 1.05))
      const capacity = Math.round(c.staff * rand(19, 30))
      return {
        name: c.name,
        demand,
        capacity,
        gap: demand - capacity,
        rate: round((capacity / demand) * 100, 1)
      }
    })
  }
}

export function getSatisfaction() {
  const dims = ['服务及时性', '服务专业度', '服务态度', '服务内容匹配', '隐私保护', '家属沟通']
  const scores = dims.map(() => round(rand(3.9, 4.9), 1))
  return {
    dims,
    scores,
    overall: round(scores.reduce((a, b) => a + b, 0) / scores.length, 1),
    distribution: [
      { name: '非常满意', value: 6421 },
      { name: '满意', value: 3986 },
      { name: '一般', value: 812 },
      { name: '不满意', value: 186 },
      { name: '非常不满意', value: 54 }
    ],
    comments: [
      { user: '王*华', community: '阳光社区', rating: 5, content: '护理员很专业，伤口护理做得很细致。', time: '2026-10-23' },
      { user: '陈*芳', community: '康乐社区', rating: 4, content: '康复训练安排得不错，希望周末能多开一班。', time: '2026-10-22' },
      { user: '刘*民', community: '平安社区', rating: 4, content: '助餐准时，量也够，就是希望菜品再多一些花样。', time: '2026-10-21' },
      { user: '赵*英', community: '和谐社区', rating: 5, content: '独居老人有专人定期上门，心里踏实多了。', time: '2026-10-20' }
    ]
  }
}

export function getOrderList(size = 50) {
  const statuses = [
    { name: '已完成', color: '#28a86b' },
    { name: '服务中', color: '#3a6ff0' },
    { name: '待派单', color: '#f2a63b' },
    { name: '已取消', color: '#8b96ab' }
  ]
  const list = []
  for (let i = 0; i < size; i++) {
    const c = COMMUNITIES[i % COMMUNITIES.length]
    const st = statuses[randInt(0, 3)]
    list.push({
      id: `SO${20261000 + i * 3}`,
      elder: surname(i) + '某某',
      type: SERVICE_TYPES[randInt(0, SERVICE_TYPES.length - 1)].name,
      community: c.name,
      staff: surname(i + 9) + '师傅',
      status: st.name,
      statusColor: st.color,
      time: `2026-10-${String(randInt(18, 24)).padStart(2, '0')} ${String(randInt(7, 20)).padStart(2, '0')}:00`,
      duration: randInt(20, 95)
    })
  }
  return { total: 18642, list }
}

/* ============================================================
 *  4. 紧急事件
 * ============================================================ */
const EMERGENCY_TYPES = [
  { name: '跌倒受伤', color: '#e5544b', base: 214 },
  { name: '突发心梗/脑梗', color: '#e07b3c', base: 138 },
  { name: '紧急呼叫按钮', color: '#f2a63b', base: 176 },
  { name: '独居老人无应答', color: '#7a5bf0', base: 121 },
  { name: '燃气/烟雾告警', color: '#12b0a4', base: 96 },
  { name: '走失', color: '#3a6ff0', base: 54 },
  { name: '情绪异常', color: '#e86fa8', base: 71 },
  { name: '用药不良反应', color: '#2fb6e0', base: 43 }
]

export function getEmergencySummary() {
  const today = 17
  const month = 386
  return {
    today,
    month,
    pending: 3,
    handled: 368,
    avgResponse: 8.4,
    avgHandle: 32.6,
    successRate: 99.2,
    types: EMERGENCY_TYPES.map((t) => ({ ...t, percent: 0 }))
  }
}

export function getEmergencyTypeDist(monthCount = 6) {
  const months = monthList(monthCount)
  return {
    months,
    list: EMERGENCY_TYPES.map((t) => ({
      name: t.name,
      color: t.color,
      current: Math.round(t.base / months.length),
      data: months.map(() => Math.round(t.base / months.length + rand(-t.base * 0.22, t.base * 0.22)))
    }))
  }
}

export function getEmergencyHourDist() {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  const data = hours.map((_, h) => {
    let v = rand(0.4, 3)
    if (h >= 6 && h <= 9) v *= 2.1
    if (h >= 18 && h <= 22) v *= 2.8
    if (h >= 0 && h <= 5) v *= 1.3
    return round(v, 1)
  })
  return { hours, data, peak: '19:00-21:00' }
}

export function getHandleFunnel() {
  return {
    stages: [
      { name: '设备/人工上报', value: 386 },
      { name: '平台受理确认', value: 381 },
      { name: '智能派单', value: 376 },
      { name: '救援人员到达', value: 371 },
      { name: '现场处置完成', value: 368 }
    ],
    avgSteps: [
      { name: '上报→受理', value: 1.2 },
      { name: '受理→派单', value: 0.6 },
      { name: '派单→到达', value: 6.8 },
      { name: '到达→处置完成', value: 24.2 }
    ]
  }
}

export function getEmergencyResponseTrend(days = 30) {
  const dates = dateList(days)
  return {
    dates,
    responseTime: dates.map(() => round(rand(6.2, 11.4), 1)),
    handleTime: dates.map(() => round(rand(24, 42), 1)),
    count: dates.map(() => randInt(8, 22)),
    meetRate: dates.map(() => round(rand(90, 99.4), 1))
  }
}

export function getEmergencyList(size = 40) {
  const levels = [
    { name: '紧急', color: '#e5544b' },
    { name: '重要', color: '#f2a63b' },
    { name: '一般', color: '#3a6ff0' }
  ]
  const statuses = [
    { name: '已处置', color: '#28a86b' },
    { name: '处置中', color: '#3a6ff0' },
    { name: '待响应', color: '#e5544b' }
  ]
  const list = []
  for (let i = 0; i < size; i++) {
    const c = COMMUNITIES[i % COMMUNITIES.length]
    const lv = levels[randInt(0, 2)]
    const st = statuses[randInt(0, 2)]
    list.push({
      id: `EM${20261000 + i * 5}`,
      type: EMERGENCY_TYPES[randInt(0, EMERGENCY_TYPES.length - 1)].name,
      level: lv.name,
      levelColor: lv.color,
      community: c.name,
      elder: surname(i) + '某某',
      age: randInt(60, 93),
      device: rnd() > 0.5 ? '一键呼叫器' : '智能手表',
      trigger: rnd() > 0.5 ? '手动触发' : '设备自动告警',
      staff: surname(i + 4) + '护理员',
      responseTime: round(rand(2.5, 16), 1),
      status: st.name,
      statusColor: st.color,
      time: `2026-10-${String(randInt(20, 24)).padStart(2, '0')} ${String(randInt(0, 23)).padStart(2, '0')}:${String(randInt(0, 59)).padStart(2, '0')}`,
      result: st.name === '已处置' ? '老人转危为安，已通知家属并转诊' : '救援人员已出发'
    })
  }
  return { total: 386, list }
}

/* ============================================================
 *  5. 服务人员与响应
 * ============================================================ */
const STAFF_ROLES = [
  { name: '护理员', color: '#3a6ff0', base: 46 },
  { name: '社区社工', color: '#12b0a4', base: 22 },
  { name: '康复治疗师', color: '#7a5bf0', base: 18 },
  { name: '家庭医生', color: '#2fb6e0', base: 12 },
  { name: '急救员', color: '#e5544b', base: 10 },
  { name: '协调调度员', color: '#f2a63b', base: 8 }
]

export function getStaffSummary() {
  const total = STAFF_ROLES.reduce((s, i) => s + i.base, 0)
  return {
    total,
    onDuty: 86,
    avgResponse: 8.4,
    reachRate: 96.2,
    avgOrdersPerDay: 6.8,
    avgSatisfaction: 4.7,
    avgRadius: 620,
    roles: STAFF_ROLES.map((r) => ({ ...r, percent: round((r.base / total) * 100, 1) })),
    workload: STAFF_ROLES.map((r) => ({
      name: r.name,
      color: r.color,
      capacity: r.base * 42,
      load: Math.round(r.base * 42 * rand(0.72, 1.22))
    }))
  }
}

export function getStaffDistribution() {
  return {
    communities: COMMUNITIES.map((c) => {
      const need = Math.round(c.elders / 28)
      return {
        name: c.name,
        staff: c.staff,
        need,
        gap: c.staff - need,
        onDuty: Math.max(1, Math.round(c.staff * rand(0.6, 0.95))),
        avgResponse: round(rand(4.5, 13.2), 1),
        coverage: round(rand(82, 99.6), 1)
      }
    })
  }
}

export function getResponseTime() {
  return {
    categories: COMMUNITIES.map((c) => c.name),
    boxData: COMMUNITIES.map((c) => {
      const med = round(rand(4.5, 9.8), 1)
      return [
        round(med - rand(1.5, 3.2), 1),
        round(med - rand(0.5, 1.4), 1),
        med,
        round(med + rand(0.6, 2.4), 1),
        round(med + rand(2.5, 6.8), 1)
      ]
    }),
    thresholds: [
      { name: '5分钟内到达', value: 5, color: '#28a86b' },
      { name: '10分钟内到达', value: 10, color: '#f2a63b' },
      { name: '15分钟内到达', value: 15, color: '#e5544b' }
    ],
    trend: monthList(6).map((m, i) => ({ month: m, value: round(11.2 - i * 0.62 + rand(-0.5, 0.5), 1) }))
  }
}

export function getLoadSatisfaction() {
  const data = []
  COMMUNITIES.forEach((c, i) => {
    const cnt = randInt(6, 14)
    for (let k = 0; k < cnt; k++) {
      const load = round(rand(1.8, 9.4), 1)
      const sat = round(5.35 - load * 0.13 + rand(-0.35, 0.35), 1)
      data.push({
        name: surname(i * 7 + k) + '师傅',
        value: [load, Math.max(3.2, Math.min(5, sat)), randInt(1, 6)],
        community: c.name,
        role: STAFF_ROLES[randInt(0, 5)].name
      })
    }
  })
  return { data }
}

export function getSkillRadar() {
  return {
    roles: ['护理员', '社区社工', '康复治疗师', '家庭医生', '急救员'],
    indicators: ['应急处置', '康复护理', '慢病管理', '心理疏导', '沟通协调', '家政照护'],
    series: STAFF_ROLES.slice(0, 5).map((r) => ({
      name: r.name,
      color: r.color,
      data: [0, 1, 2, 3, 4, 5].map(() => round(rand(55, 96), 1))
    }))
  }
}

export function getStaffList(size = 50) {
  const list = []
  for (let i = 0; i < size; i++) {
    const c = COMMUNITIES[i % COMMUNITIES.length]
    const role = STAFF_ROLES[randInt(0, 5)]
    list.push({
      id: `SF${20260000 + i * 3}`,
      name: surname(i + 3) + '**',
      role: role.name,
      roleColor: role.color,
      community: c.name,
      age: randInt(26, 58),
      phone: `138****${randInt(1000, 9999)}`,
      orders: randInt(120, 980),
      response: round(rand(3.2, 14.6), 1),
      satisfaction: round(rand(3.8, 5), 1),
      status: rnd() > 0.25 ? '在岗' : '休息'
    })
  }
  return { total: 116, list }
}

/* ============================================================
 *  6. 老人档案
 * ============================================================ */
export function getElderList(size = 60) {
  const chronicPool = ['高血压', '糖尿病', '冠心病', '慢阻肺', '骨质疏松', '脑卒中后遗症', '风湿性关节炎']
  const list = []
  for (let i = 0; i < size; i++) {
    const c = COMMUNITIES[i % COMMUNITIES.length]
    const risk = randInt(0, 4)
    const tags = []
    for (let k = 0; k < risk; k++) tags.push(chronicPool[randInt(0, chronicPool.length - 1)])
    list.push({
      id: `E${10000 + i * 7}`,
      name: surname(i) + '某某',
      gender: rnd() > 0.5 ? '男' : '女',
      age: randInt(60, 96),
      community: c.name,
      address: `${c.name}${[1, 2, 3, 5, 6, 8][randInt(0, 5)]}号楼${randInt(1, 24)}0${randInt(1, 4)}`,
      living: rnd() > 0.45 ? '独居' : rnd() > 0.4 ? '与配偶同住' : '与子女同住',
      tags,
      score: round(rand(45, 97), 1),
      sbp: randInt(112, 176),
      glu: round(rand(4.8, 12.4), 1),
      hr: randInt(56, 108),
      spo2: randInt(88, 99),
      device: rnd() > 0.5 ? '已绑定' : '未绑定',
      lastCheck: `2026-10-${String(randInt(15, 24)).padStart(2, '0')}`
    })
  }
  return { total: 3860, list }
}

/* ============================================================
 *  7. 通知公告
 * ============================================================ */
export function getNotices() {
  return [
    { id: 1, level: 'danger', title: '康乐社区 王*英 老人跌倒告警，等待救援', time: '2 分钟前' },
    { id: 2, level: 'warning', title: '安康社区 智能手环电量低于 10%，请及时更换', time: '18 分钟前' },
    { id: 3, level: 'info', title: '和平路社区新增「上门护理」服务排班，请查收', time: '1 小时前' },
    { id: 4, level: 'info', title: '10 月慢病随访任务已完成 92%，剩余 38 人', time: '3 小时前' }
  ]
}
