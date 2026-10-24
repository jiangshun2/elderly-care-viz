/**
 * 本地可视化验收脚本（仅开发用，不参与打包）
 * 用法：node scripts/verify.mjs
 *
 * 检查项：
 *   1. 六个页面加载后无控制台报错 / 无空白图表 / 无空态占位
 *   2. 改变视口尺寸后依旧无报错，且每个图表的 canvas 尺寸与容器一致
 */
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
// 默认校验 dev server；可用 BASE=http://127.0.0.1:4173/# 校验生产构建
const BASE = process.env.BASE || 'http://127.0.0.1:5173/#'
const OUT = path.resolve('.shots')
fs.mkdirSync(OUT, { recursive: true })

const PAGES = [
  { hash: '/dashboard', name: '01-数据驾驶舱' },
  { hash: '/health', name: '02-健康指标分析' },
  { hash: '/service', name: '03-服务需求分析' },
  { hash: '/emergency', name: '04-紧急事件监测' },
  { hash: '/staff', name: '05-人员分布与响应' },
  { hash: '/archive', name: '06-老人健康档案' }
]

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars']
})

let hasError = false

for (const p of PAGES) {
  const page = await browser.newPage()
  await page.setViewport({ width: 1680, height: 1000, deviceScaleFactor: 1 })

  const errors = []
  page.on('console', (m) => {
    if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`)
  })
  page.on('pageerror', (e) =>
    errors.push(`[pageerror] ${e.message}\n${(e.stack || '').split('\n').slice(1, 5).join('\n')}`)
  )
  page.on('requestfailed', (r) => errors.push(`[requestfailed] ${r.url()} ${r.failure()?.errorText}`))

  await page.goto(`${BASE}${p.hash}`, { waitUntil: 'networkidle0', timeout: 45000 })
  await new Promise((r) => setTimeout(r, 1800))

  const stats = await page.evaluate(() => {
    const panels = [...document.querySelectorAll('.panel')].map((p) => ({
      title: p.querySelector('.panel__title')?.innerText.trim() || '(无标题)',
      isChart: !!p.querySelector('.chart__canvas'),
      canvas: !!p.querySelector('canvas'),
      h: p.querySelector('.chart__canvas')?.clientHeight || 0
    }))
    return {
      panels,
      kpis: [...document.querySelectorAll('.stat__value')].map((e) => e.innerText.trim()),
      rows: document.querySelectorAll('.el-table__row').length,
      empties: document.querySelectorAll('.chart__empty').length,
      masks: document.querySelectorAll('.chart__mask').length
    }
  })

  const blank = stats.panels.filter((p) => p.isChart && (!p.canvas || p.h < 60)).map((p) => p.title)

  // —— 缩放视口，验证尺寸自适应 ——
  const errsBefore = errors.length
  await page.setViewport({ width: 1360, height: 860, deviceScaleFactor: 1 })
  await new Promise((r) => setTimeout(r, 1200))
  const resizeErrs = errors.slice(errsBefore)

  // 校验每个 canvas 的渲染尺寸是否与容器一致
  const canvasCheck = await page.evaluate(() => {
    const bad = []
    document.querySelectorAll('.chart__canvas').forEach((el) => {
      const cv = el.querySelector('canvas')
      if (!cv) return
      if (
        Math.abs(cv.clientWidth - el.clientWidth) > 2 ||
        Math.abs(cv.clientHeight - el.clientHeight) > 2
      ) {
        bad.push(`${el.clientWidth}x${el.clientHeight} vs canvas ${cv.clientWidth}x${cv.clientHeight}`)
      }
    })
    return bad
  })

  const file = path.join(OUT, `${p.name}.png`)
  await page.screenshot({ path: file, fullPage: true })

  const errs = errors.filter((e) => !/favicon|DevTools/i.test(e))
  if (errs.length || blank.length || stats.empties || canvasCheck.length) hasError = true

  console.log(`\n=== ${p.name} (${p.hash}) ===`)
  console.log(
    `  面板 ${stats.panels.length} 个 | KPI ${stats.kpis.length} 个 | 表格行 ${stats.rows} | 空图表 ${stats.empties}`
  )
  console.log(`  KPI值: ${stats.kpis.join(' | ') || '(无)'}`)
  if (blank.length) console.log(`  ⚠️ 未渲染面板: ${blank.join(' , ')}`)
  if (canvasCheck.length) console.log(`  ⚠️ 画布尺寸不匹配: ${canvasCheck.slice(0, 4).join(' ; ')}`)
  if (errs.length) console.log(`  ⚠️ 控制台: ${errs.slice(0, 6).join(' ;; ')}`)
  if (!blank.length && !errs.length && !stats.empties && !canvasCheck.length)
    console.log('  ✅ 正常（含缩放自适应）')

  await page.close()
}

await browser.close()
console.log(hasError ? '\n存在问题，请查看上方 ⚠️' : '\n全部页面通过 ✅')
