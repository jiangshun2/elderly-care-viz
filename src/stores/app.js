import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { COMMUNITIES } from '@/api/mock/communities'

/**
 * 全局状态：社区筛选、时间范围、告警通知
 */
export const useAppStore = defineStore('app', () => {
  // 当前选中的社区（'all' 表示全部）
  const community = ref('all')
  // 时间范围（天）
  const days = ref(30)
  // 告警列表
  const notices = ref([])
  // 侧边栏折叠
  const collapsed = ref(false)
  // 数据刷新信号（各页面 watch 后重新拉取接口）
  const refreshKey = ref(0)

  const communityOptions = COMMUNITIES.map((c) => ({
    label: c.name,
    value: c.name,
    elders: c.elders,
    staff: c.staff
  }))

  const communityName = computed(() => {
    if (community.value === 'all') return '全部社区'
    return community.value
  })

  // 组装给后端的通用查询参数
  const queryParams = computed(() => ({
    community: community.value === 'all' ? undefined : community.value,
    days: days.value
  }))

  function setCommunity(v) {
    community.value = v
  }
  function setDays(v) {
    days.value = v
  }
  function setNotices(list) {
    notices.value = list || []
  }
  function toggleCollapse() {
    collapsed.value = !collapsed.value
  }

  return {
    community,
    communityName,
    communityOptions,
    days,
    notices,
    collapsed,
    refreshKey,
    queryParams,
    setCommunity,
    setDays,
    setNotices,
    toggleCollapse
  }
})
