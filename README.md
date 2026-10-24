# 社区养老服务与健康监测可视化系统（前端）

面向社区养老服务机构的数据可视化驾驶舱。围绕 **老人健康指标、服务需求、紧急事件、服务人员分布与响应时间** 五大分析维度构建六大业务页面，**当前阶段只交付前端**，所有后端接口已按真实 REST 端点设计并保留，切换到真实后端时前端零改动。

## 技术栈

| 能力 | 选型 |
| --- | --- |
| 框架 | Vue 3.5（`<script setup>` + Composition API） |
| 构建 | Vite 5（`@` 别名、SCSS 变量自动注入） |
| 图表 | ECharts 5.5（按需引入 + 自定义 `care` 主题） |
| 状态 | Pinia（社区筛选、时间范围、告警、刷新信号） |
| 路由 | Vue Router 4（hash 模式 + 嵌套布局） |
| UI | Element Plus（表格、筛选、进度、评分等） |
| 请求 | axios 1.7 + **自定义 Mock adapter** |

## 功能模块

| 页面 | 路由 | 核心可视化 |
| --- | --- | --- |
| 数据驾驶舱 | `/dashboard` | 6 张 KPI 卡、风险分级环形图、生命体征仪表、慢病 TOP6、需求/供给双轴趋势、事件类型玫瑰图、24h 时段柱状、人员配备散点、响应时长趋势、高危老人表 |
| 健康指标分析 | `/health` | 指标异常率/人数双轨趋势、慢病构成、年龄段柱线组合、年龄段雷达、社区异常率排行、社区散点、异常指标明细表（可搜索） |
| 服务需求分析 | `/service` | 需求/满足缺口堆叠柱+线、类型构成环形、类型排行、社区供需缺口正负条、星期×时段热力图、满意度雷达、评价分布、评价列表、工单明细表 |
| 紧急事件监测 | `/emergency` | 响应时长双轴趋势、事件类型环形、24h 高发时段、处置漏斗、月度类型堆叠、实时事件台账（按级别过滤） |
| 人员分布与响应 | `/staff` | 社区人员配置双柱+覆盖率折线、岗位构成环形、响应时长箱线图、负荷-满意度散点、技能雷达、人员档案表 |
| 老人健康档案 | `/archive` | 居住方式环形、年龄段柱状、慢病标签 TOP8、老人档案表（社区/姓名过滤、指标异常标红） |

全站共 **40+ 个 ECharts 图表 + 6 张数据表格**，统一使用 `PanelBox` / `StatCard` / `ChartBox` 三个基础组件与 12 栅格布局。

## 目录结构

```
├── index.html
├── vite.config.js            # 别名 / SCSS 变量注入 / dev server
├── .env.development          # 接口开关与基地址
├── scripts/
│   └── verify.mjs            # puppeteer 无头验收脚本（逐页截图 + 报错统计 + 尺寸自适应校验）
└── src/
    ├── main.js               # 入口：Pinia / Router / Element Plus(zhCn)
    ├── App.vue
    ├── api/
    │   ├── endpoints.js      # ★ 后端接口对照表（唯一权威清单）
    │   ├── request.js        # axios 封装：拦截器、响应解包、Mock 开关
    │   ├── modules/          # 业务 API 层（overview/health/service/emergency/staff/elder）
    │   └── mock/             # Mock 路由表 + 固定种子数据生成器
    ├── components/           # PanelBox / StatCard / ChartBox / AppIcon
    ├── layouts/              # BasicLayout + SideNav + TopBar
    ├── router/
    ├── stores/app.js         # 全局状态
    ├── styles/               # variables / main / grid（12 栅格）
    ├── utils/
    │   ├── echarts.js        # 按需引入 + 主题注册 + 色板
    │   ├── chartOptions.js   # 通用 option 片段（渐变/tooltip/网格/环形中心标题）
    │   └── useChart.js       # ECharts 实例管理、尺寸自适应
    └── views/                # 六大业务页面
```

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # 产物输出到 dist/
npm run preview    # 预览生产构建
```

## 接入真实后端

项目默认开启内置 Mock，只需改环境变量即可切换，**业务代码零改动**：

```bash
# .env.development
VITE_USE_MOCK=false
VITE_API_BASE_URL=https://your-api-host/api/v1
```

Mock 层是挂在 axios 上的自定义 adapter（`src/api/mock/index.js`），路由表按 `"METHOD /api/v1/xxx"` 匹配，返回 `{ code: 0, message: 'ok', data }`；关闭 Mock 后同一路径会真实发往 `VITE_API_BASE_URL`。

### 前后端约定

- 统一响应体：`{ code: 0, data: {...}, message: 'ok' }`（响应拦截器已自动解包 `data`）
- 请求头：拦截器自动注入 `Authorization: Bearer <token>` 与 `X-Org-Id`（读取 localStorage，对应真实鉴权与多机构场景）
- 查询参数：社区筛选 `community`、时间范围 `days`、分页 `page/size` 等均由 `src/stores/app.js` 统一注入

### 后端待实现接口清单

完整清单见 [`src/api/endpoints.js`](src/api/endpoints.js)，共 5 个模块 34 个端点：

| 模块 | 端点数 | 端点 |
| --- | --- | --- |
| overview | 6 | `/overview/kpi`、`/health-board`、`/service-board`、`/emergency-board`、`/staff-board`、`/notices` |
| health | 7 | `/health/summary`、`/indicator-trend`、`/age-profile`、`/chronic-disease`、`/community-compare`、`/risk-score`、`/abnormal-list` |
| service | 6 | `/service/demand-trend`、`/type-rank`、`/heatmap`、`/supply-gap`、`/satisfaction`、`/order-list` |
| emergency | 6 | `/emergency/overview`、`/type-dist`、`/hour-dist`、`/handle-funnel`、`/response-trend`、`/event-list` |
| staff | 6 | `/staff/overview`、`/distribution`、`/response-time`、`/load-satisfaction`、`/skill-radar`、`/staff-list` |
| elder | 2 | `/elder/list`、`/elder/detail/:id` |

## Mock 数据说明

- 12 个社区、3860 名注册老人、116 名服务人员，慢病构成、服务工单、紧急事件台账等均由固定种子伪随机生成（`mulberry32`），**刷新页面数据保持稳定**，便于演示与回归比对。
- 后端就绪后删除 `src/api/mock/` 并置 `VITE_USE_MOCK=false` 即可。

## 验收脚本

```bash
npm run dev            # 另开一个终端保持运行
node scripts/verify.mjs
```

脚本用 puppeteer-core 驱动本机 Chrome，对六个页面依次执行：

1. 加载后统计面板 / KPI / 表格行 / 空图表数量，捕获 `console.error`、`pageerror`、`requestfailed`
2. 改变视口尺寸，验证**尺寸自适应**不产生新报错，且每个 canvas 的渲染尺寸与容器一致
3. 逐页输出全屏截图到 `.shots/`

当前结果：**六个页面全部通过（含缩放自适应）**。

## 实现说明

- **按需引入 ECharts**：只注册用到的图表与组件（bar/line/pie/scatter/radar/heatmap/gauge/boxplot/funnel + grid/tooltip/legend/title/graphic/visualMap/markLine），并自定义 `care` 主题统一视觉。
- **响应式隔离**：`useChart` 中用 `toPlain()` 深拷贝剥离 Vue 响应式代理后再传给 ECharts，避免 ECharts 回写 option 触发 Vue watch 造成重复渲染。
- **尺寸自适应**：`ResizeObserver` + `window.resize` 双通道监听，150ms 防抖合并高频事件。ECharts 5 的 `resize()` 内部在按需引入场景下偶发出现 `seriesModel.coordinateSystem` 未就绪（表现为 `Cannot read properties of undefined (reading 'type')`，热力图连带 `Heatmap must use with visualMap`），因此对 `resize()` 做了异常兜底：捕获后以 `notMerge` 方式重建模型（等价于首次挂载流程），仍失败则销毁重建实例，确保画布尺寸与图表内容始终正确。
- **视觉规范**：主色 `#3a6ff0`、辅色 `#12b0a4` / `#f2a63b` / `#e5544b`，风险等级与涨跌色遵循国内财务惯例（涨红跌绿），全部收敛在 `src/styles/variables.scss` 与 `src/utils/chartOptions.js`。
