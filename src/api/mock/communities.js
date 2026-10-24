/**
 * 社区基础档案（Mock 阶段内置；后端应提供 GET /api/v1/community/list）
 */
export const COMMUNITIES = [
  { id: 'C01', name: '阳光社区', elders: 386, staff: 14, riskIndex: 0.14, x: 12, y: 62 },
  { id: 'C02', name: '幸福社区', elders: 342, staff: 12, riskIndex: 0.19, x: 24, y: 44 },
  { id: 'C03', name: '康乐社区', elders: 428, staff: 15, riskIndex: 0.27, x: 38, y: 70 },
  { id: 'C04', name: '和谐社区', elders: 315, staff: 11, riskIndex: 0.17, x: 50, y: 38 },
  { id: 'C05', name: '平安社区', elders: 396, staff: 13, riskIndex: 0.31, x: 61, y: 66 },
  { id: 'C06', name: '和美社区', elders: 288, staff: 10, riskIndex: 0.12, x: 72, y: 34 },
  { id: 'C07', name: '安康社区', elders: 355, staff: 12, riskIndex: 0.24, x: 83, y: 58 },
  { id: 'C08', name: '颐和社区', elders: 267, staff: 9,  riskIndex: 0.09, x: 18, y: 26 },
  { id: 'C09', name: '长青社区', elders: 378, staff: 13, riskIndex: 0.22, x: 44, y: 18 },
  { id: 'C10', name: '金桂社区', elders: 241, staff: 8,  riskIndex: 0.08, x: 66, y: 22 },
  { id: 'C11', name: '锦绣社区', elders: 263, staff: 9,  riskIndex: 0.11, x: 30, y: 82 },
  { id: 'C12', name: '同心社区', elders: 201, staff: 8,  riskIndex: 0.16, x: 78, y: 80 }
]

export const COMMUNITY_NAMES = COMMUNITIES.map((c) => c.name)
