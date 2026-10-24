/**
 * ============================================================
 *  ECharts 按需引入 + 统一主题
 * ============================================================
 */
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  HeatmapChart,
  GaugeChart,
  BoxplotChart,
  FunnelChart,
  EffectScatterChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  GraphicComponent,
  VisualMapComponent,
  MarkLineComponent
} from 'echarts/components'
import { LabelLayout, UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([
  BarChart, LineChart, PieChart, ScatterChart, RadarChart, HeatmapChart, GaugeChart, BoxplotChart, FunnelChart, EffectScatterChart,
  GridComponent, TooltipComponent, LegendComponent, TitleComponent, GraphicComponent,
  VisualMapComponent, MarkLineComponent,
  LabelLayout, UniversalTransition,
  CanvasRenderer
])

/** 主题色板 —— 全站统一 */
export const PALETTE = [
  '#3a6ff0', '#12b0a4', '#f2a63b', '#e5544b',
  '#7a5bf0', '#2fb6e0', '#e86fa8', '#28a86b',
  '#e07b3c', '#8b96ab'
]

export const CHART_FONT = "'PingFang SC','Microsoft YaHei',Helvetica,Arial,sans-serif"

echarts.registerTheme('care', {
  color: PALETTE,
  backgroundColor: 'transparent',
  textStyle: {
    fontFamily: CHART_FONT,
    color: '#5b6880'
  },
  title: {
    textStyle: { color: '#17223a', fontSize: 14, fontWeight: 600 },
    subtextStyle: { color: '#96a2b6', fontSize: 12 }
  },
  legend: {
    textStyle: { color: '#5b6880', fontSize: 12 },
    itemWidth: 10,
    itemHeight: 10,
    icon: 'roundRect'
  },
  tooltip: {
    backgroundColor: 'rgba(255,255,255,.97)',
    borderColor: '#e4e9f2',
    borderWidth: 1,
    padding: [9, 13],
    textStyle: { color: '#17223a', fontSize: 12, fontFamily: CHART_FONT },
    extraCssText: 'box-shadow:0 6px 20px rgba(23,34,58,.12);border-radius:8px;'
  },
  categoryAxis: {
    axisLine: { lineStyle: { color: '#e4e9f2' } },
    axisTick: { show: false },
    axisLabel: { color: '#5b6880', fontSize: 11 },
    splitLine: { show: false }
  },
  valueAxis: {
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#96a2b6', fontSize: 11 },
    splitLine: { lineStyle: { color: '#eef1f7', type: 'dashed' } }
  }
})

export { echarts }
export default echarts
