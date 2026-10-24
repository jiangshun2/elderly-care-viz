import { onMounted, onBeforeUnmount, ref, watch, nextTick } from 'vue'
import { echarts } from './echarts'

/**
 * 深拷贝并剥离 Vue 响应式代理。
 * ECharts 在 setOption 过程中会回写 option 上的部分字段，
 * 若直接传入响应式对象，ECharts 的写操作会触发 Vue 的 watch，
 * 造成重复 setOption / 模型重建。
 */
function toPlain(value) {
  if (Array.isArray(value)) return value.map(toPlain)
  if (value && typeof value === 'object') {
    if (value instanceof Date) return value
    const out = {}
    for (const key in value) {
      out[key] = toPlain(value[key])
    }
    return out
  }
  return value
}

/**
 * ECharts 实例管理 composable
 * @param {import('vue').Ref<HTMLElement|null>} elRef 图表容器
 * @param {() => object} getOption option 生成函数（响应式）
 * @param {string} theme 主题名
 */
export function useChart(elRef, getOption, theme = 'care') {
  const chart = ref(null)
  let observer = null
  let resizeTimer = null
  let lastSize = { width: 0, height: 0 }

  /** 用最新 option 重绘 */
  function render() {
    if (!chart.value) return
    const option = getOption()
    if (!option) return
    chart.value.setOption(toPlain(option))
  }

  /** 销毁并重建实例（最终兜底：连 notMerge 也失败时才走这里） */
  function rebuild() {
    if (!elRef.value) return
    const option = getOption()
    if (chart.value) {
      chart.value.dispose()
      chart.value = null
    }
    chart.value = echarts.init(elRef.value, theme)
    if (option) chart.value.setOption(toPlain(option))
  }

  /**
   * 尺寸自适应。
   *
   * ECharts 5 的 resize 流程内部顺序为「重建坐标系 → 执行 series 渲染」，
   * 而 setOption 走的是「重建全部组件 → 重建坐标系 → 渲染」。
   * 在本项目按需引入（echarts/core + 按需注册组件）的场景下，
   * resize 路径会出现 seriesModel.coordinateSystem 尚未就绪的情况，
   * 表现为 "Cannot read properties of undefined (reading 'type')"，
   * 热力图还会连带抛出 "Heatmap must use with visualMap"。
   *
   * 处理方式：捕获异常后用 notMerge 重建整个模型（与首次挂载流程一致），
   * 若仍失败则销毁重建实例，保证画布尺寸与图表内容始终正确。
   */
  function applySize() {
    if (!chart.value) return
    try {
      chart.value.resize()
    } catch (e) {
      const option = getOption()
      try {
        if (option) chart.value.setOption(toPlain(option), { notMerge: true })
        else rebuild()
      } catch (e2) {
        rebuild()
      }
    }
  }

  /** 防抖：仅在尺寸确实变化时处理，并合并高频的 resize 事件 */
  function scheduleResize(width, height) {
    if (Math.abs(width - lastSize.width) < 1 && Math.abs(height - lastSize.height) < 1) return
    lastSize = { width, height }
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      resizeTimer = null
      applySize()
    }, 150)
  }

  onMounted(async () => {
    await nextTick()
    if (!elRef.value) return
    chart.value = echarts.init(elRef.value, theme)
    render()

    observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect
      if (!box) return
      scheduleResize(box.width, box.height)
    })
    observer.observe(elRef.value)
    window.addEventListener('resize', handleWindowResize)
  })

  function handleWindowResize() {
    if (!elRef.value) return
    scheduleResize(elRef.value.clientWidth, elRef.value.clientHeight)
  }

  // 仅在 option 引用变化时重绘（不加 deep，避免深度遍历响应式代理造成重复渲染）
  watch(getOption, render)

  onBeforeUnmount(() => {
    window.removeEventListener('resize', handleWindowResize)
    observer && observer.disconnect()
    if (resizeTimer) clearTimeout(resizeTimer)
    chart.value && chart.value.dispose()
    chart.value = null
  })

  return { chart, render }
}
