/**
 * 图表通用配置片段
 */
import { PALETTE } from './echarts'

/** 线性渐变填充 */
export function grad(color, from = 0.28, to = 0) {
  return {
    type: 'linear',
    x: 0, y: 0, x2: 0, y2: 1,
    colorStops: [
      { offset: 0, color: hexToRgba(color, from) },
      { offset: 1, color: hexToRgba(color, to) }
    ]
  }
}

export function hexToRgba(hex, alpha = 1) {
  const h = hex.replace('#', '')
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
  const r = parseInt(v.slice(0, 2), 16)
  const g = parseInt(v.slice(2, 4), 16)
  const b = parseInt(v.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

/** 通用网格 */
export const grid = (over = {}) => ({
  left: 10,
  right: 16,
  top: 30,
  bottom: 6,
  containLabel: true,
  ...over
})

/** 通用提示框 */
export const tip = (over = {}) => ({
  trigger: 'axis',
  axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(58,111,240,.06)' } },
  ...over
})

/** 饼图环形通用配置 */
export function donutBase(center = ['50%', '52%']) {
  return {
    color: PALETTE,
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 人 &nbsp;·&nbsp; {d}%' },
    legend: { bottom: 0, left: 'center', itemGap: 12, textStyle: { fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['52%', '74%'],
        center,
        avoidLabelOverlap: true,
        itemStyle: { borderColor: '#fff', borderWidth: 2, borderRadius: 4 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: { scale: true, scaleSize: 6 }
      }
    ]
  }
}

/** 环形图中心文本 */
export function centerText(title, value, color = '#17223a') {
  return {
    type: 'graphic',
    elements: [
      {
        type: 'text',
        left: 'center',
        top: '40%',
        style: {
          text: String(value),
          textAlign: 'center',
          fill: color,
          fontSize: 26,
          fontWeight: 700,
          fontFamily: 'DIN Alternate, Bahnschrift, sans-serif'
        }
      },
      {
        type: 'text',
        left: 'center',
        top: '58%',
        style: {
          text: title,
          textAlign: 'center',
          fill: '#96a2b6',
          fontSize: 12
        }
      }
    ]
  }
}

/** 环形图中心文本（基于 title 组件渲染，比 graphic 更稳定） */
export function centerTitle(value, sub, opts = {}) {
  return {
    title: {
      text: String(value ?? ''),
      subtext: sub || '',
      left: 'center',
      top: opts.top || '40%',
      textStyle: {
        color: opts.color || '#17223a',
        fontSize: opts.size || 24,
        fontWeight: 700,
        fontFamily: 'DIN Alternate, Bahnschrift, sans-serif'
      },
      subtextStyle: {
        color: '#96a2b6',
        fontSize: 11.5,
        lineHeight: 18
      },
      itemGap: 2
    }
  }
}

/** 横向条形图基础（类目轴在左侧） */
export function hbarBase(categories, data, color = PALETTE[0]) {
  return {
    grid: grid({ left: 10, right: 40, top: 10, bottom: 6 }),
    tooltip: tip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
    xAxis: { type: 'value', axisLabel: { show: false }, splitLine: { show: false } },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: { color: '#5b6880', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [
      {
        type: 'bar',
        data,
        barWidth: 12,
        itemStyle: {
          borderRadius: [0, 6, 6, 0],
          color: (p) => (typeof color === 'function' ? color(p) : color)
        },
        label: { show: true, position: 'right', color: '#5b6880', fontSize: 11 }
      }
    ]
  }
}
