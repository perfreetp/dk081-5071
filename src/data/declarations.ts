import type { Declaration, TimelineNode } from '@/types'

/**
 * 按真实办件顺序生成完整办理轨迹，节点数固定为 6~8 个：
 *   已提交 → 已受理 → 审核中 → [待补正 → 补正已提交] → 审核通过 → 待缴费 → 待取证/邮寄 → 登记完成
 * 规则：
 *   1. active 节点严格与 status 对齐（顶部 badge 显示什么就高亮什么）
 *   2. active 之前的节点一律 done，之后的一律 pending
 *   3. 审核通过前 correction / correctionSubmitted 不出现；之后如果发生过补正则保留为 done
 *   4. paid / completed 等后续节点作为"待办理"节点始终可见（pending/done）
 *   5. 若 correctionSubmitted=true，说明已提交补正且已进入复审，此时 active 为 reviewing
 */
export function buildTimeline(
  status: Declaration['status'],
  createTime: string,
  updateTime: string,
  extra?: {
    correctionSubmitted?: boolean
    correctionSubmitTime?: string
    correctionTime?: string
    paidTime?: string
    approvedTime?: string
    completedTime?: string
    hadCorrection?: boolean
  }
): TimelineNode[] {
  const pad = (n: number) => String(n).padStart(2, '0')
  const plusMinutes = (t: string, mins: number) => {
    const d = new Date(t.replace(/-/g, '/'))
    if (isNaN(d.getTime())) return t
    d.setMinutes(d.getMinutes() + mins)
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
  }

  // 预计算各阶段的展示时间（尽量贴合真实办件节奏）
  const tSubmitted = createTime
  const tAccepted = extra?.correctionTime ? plusMinutes(createTime, 5) : plusMinutes(createTime, 3)
  const tReviewingStart = plusMinutes(createTime, 30)
  const tCorrection = extra?.correctionTime || plusMinutes(tReviewingStart, 60 * 6)
  const tCorrectionSubmitted = extra?.correctionSubmitTime || plusMinutes(tCorrection, 60 * 24)
  const tApproved = extra?.approvedTime || plusMinutes(tReviewingStart, 60 * 24 * 2)
  const tPaid = extra?.paidTime || plusMinutes(tApproved, 60 * 24)
  const tCompleted = extra?.completedTime || plusMinutes(tPaid, 60 * 24 * 2)

  const baseNodes: TimelineNode[] = [
    { key: 'submitted', title: '已提交申报', desc: '申报已成功提交，等待登记机构受理', time: tSubmitted, status: 'pending' },
    { key: 'accepted', title: '已受理', desc: '登记机构已受理您的申报，正在排期审核', time: tAccepted, status: 'pending' },
    { key: 'reviewing', title: '材料审核中', desc: '工作人员正在审核您提交的全部材料', time: tReviewingStart, status: 'pending' }
  ]

  // 补正相关节点：发生过补正（hadCorrection）或当前正处于待补正/复审中则展示
  const showCorrection =
    status === 'correction' ||
    !!extra?.correctionSubmitted ||
    !!extra?.hadCorrection

  if (showCorrection) {
    baseNodes.push({ key: 'correction', title: '待补正材料', desc: '请按意见补充或修正材料后重新提交', time: tCorrection, status: 'pending' })
    if (status !== 'correction' || !!extra?.correctionSubmitted) {
      baseNodes.push({ key: 'correctionSubmitted', title: '补正材料已提交', desc: '补正材料已重新提交，等待复审', time: tCorrectionSubmitted, status: 'pending' })
      // 复审中节点（补正提交后会回到审核）
      baseNodes.push({ key: 'reviewing2', title: '材料复审中', desc: '工作人员正在复审您补正后的材料', time: tCorrectionSubmitted, status: 'pending' })
    }
  }

  baseNodes.push(
    { key: 'approved', title: '审核通过', desc: '材料审核通过，已生成税费信息', time: tApproved, status: 'pending' },
    { key: 'payment', title: '待缴费', desc: '已生成税费单，请在规定时间内完成缴费', time: tApproved, status: 'pending' },
    { key: 'paid', title: '待取证/邮寄', desc: '税费已缴纳，等待证件制作与发放', time: tPaid, status: 'pending' },
    { key: 'completed', title: '登记完成', desc: '登记已完成，不动产权证书已制作发放', time: tCompleted, status: 'pending' }
  )

  // activeKey 决定当前高亮的节点
  let activeKey: string
  switch (status) {
    case 'submitted':
      activeKey = 'submitted'
      break
    case 'reviewing':
      // 有补正提交记录说明当前在复审阶段，高亮 reviewing2
      activeKey = !!extra?.correctionSubmitted ? 'reviewing2' : 'reviewing'
      break
    case 'correction':
      activeKey = 'correction'
      break
    case 'approved':
      activeKey = 'payment' // 审核通过后就进入待缴费阶段
      break
    case 'paid':
      activeKey = 'paid'
      break
    case 'completed':
      activeKey = 'completed'
      break
    case 'rejected':
      activeKey = 'reviewing'
      break
    default:
      activeKey = 'reviewing'
  }

  // 标记 done / active / pending
  const activeIndex = baseNodes.findIndex((n) => n.key === activeKey)
  baseNodes.forEach((n, i) => {
    if (activeIndex === -1) {
      n.status = i === 0 ? 'active' : 'pending'
    } else if (i < activeIndex) {
      n.status = 'done'
    } else if (i === activeIndex) {
      n.status = 'active'
    } else {
      n.status = 'pending'
    }
  })

  return baseNodes
}

export const declarations: Declaration[] = [
  {
    id: 'dec_001',
    orderNo: 'BDC20240115001',
    officeId: '110108001',
    officeName: '北京市海淀区不动产登记中心',
    scenarioId: 'legal_inheritance',
    scenarioName: '法定继承',
    status: 'reviewing',
    statusText: '审核中',
    createTime: '2024-01-15 10:30:00',
    updateTime: '2024-01-16 14:20:00',
    decedent: {
      name: '张三',
      idCard: '110108195001011234',
      deathDate: '2023-12-20',
      deathProof: '医院死亡证明',
      maritalStatus: '已婚'
    },
    heirs: [
      {
        id: 'heir_001',
        name: '李四',
        idCard: '110108195202025678',
        phone: '13800138001',
        relationship: '配偶',
        share: '50%',
        isMain: true
      },
      {
        id: 'heir_002',
        name: '张小明',
        idCard: '110108198003039012',
        phone: '13900139002',
        relationship: '子女',
        share: '25%',
        isMain: false
      },
      {
        id: 'heir_003',
        name: '张小红',
        idCard: '110108198204049023',
        phone: '13700137003',
        relationship: '子女',
        share: '25%',
        isMain: false
      }
    ],
    property: {
      certNumber: '京（2020）海不动产权第001234号',
      address: '北京市海淀区中关村大街1号1号楼1单元101室',
      area: '120.5平方米',
      usage: '住宅',
      ownership: '共同共有',
      verified: true
    },
    materials: [
      { id: 'death_proof', name: '被继承人死亡证明', required: true, description: '医院死亡证明', uploaded: true },
      { id: 'identity_proof', name: '继承人身份证明', required: true, description: '居民身份证', uploaded: true },
      { id: 'relationship_proof', name: '亲属关系证明', required: true, description: '结婚证、户口簿', uploaded: true },
      { id: 'property_cert', name: '不动产权属证书', required: true, description: '不动产权证书', uploaded: true },
      { id: 'marriage_proof', name: '婚姻状况证明', required: true, description: '结婚证', uploaded: true },
      { id: 'household_register', name: '户口簿', required: true, description: '户口簿', uploaded: true }
    ],
    signature: {
      signatureUrl: 'signature_001.png',
      promiseConfirmed: true,
      confirmDate: '2024-01-15',
      heirConfirmations: { heir_001: true, heir_002: true, heir_003: true }
    },
    appointment: {
      type: 'onsite',
      date: '2024-01-20',
      timeSlot: '09:00-10:00',
      address: '北京市海淀区东北旺南路27号上地办公中心',
      contact: '李四',
      contactPhone: '13800138001'
    },
    timeline: buildTimeline('reviewing', '2024-01-15 10:30:00', '2024-01-16 14:20:00')
  },
  {
    id: 'dec_002',
    orderNo: 'BDC20240110002',
    officeId: '110105001',
    officeName: '北京市朝阳区不动产登记中心',
    scenarioId: 'will_inheritance',
    scenarioName: '遗嘱继承',
    status: 'correction',
    statusText: '待补正',
    createTime: '2024-01-10 15:20:00',
    updateTime: '2024-01-14 09:30:00',
    decedent: {
      name: '王五',
      idCard: '110105194505054321',
      deathDate: '2023-11-15',
      deathProof: '公安机关注销户口证明',
      maritalStatus: '丧偶'
    },
    heirs: [
      {
        id: 'heir_004',
        name: '王小明',
        idCard: '110105197506068765',
        phone: '13600136004',
        relationship: '儿子',
        share: '100%',
        isMain: true
      }
    ],
    property: {
      certNumber: '京（2018）朝不动产权第005678号',
      address: '北京市朝阳区建国路88号8号楼2单元202室',
      area: '95.8平方米',
      usage: '住宅',
      ownership: '单独所有',
      verified: true
    },
    materials: [
      { id: 'death_proof', name: '被继承人死亡证明', required: true, description: '注销户口证明', uploaded: true },
      { id: 'will', name: '遗嘱', required: true, description: '公证遗嘱', uploaded: false },
      { id: 'identity_proof', name: '继承人身份证明', required: true, description: '居民身份证', uploaded: true },
      { id: 'relationship_proof', name: '亲属关系证明', required: true, description: '出生证明', uploaded: true },
      { id: 'property_cert', name: '不动产权属证书', required: true, description: '不动产权证书', uploaded: true },
      { id: 'marriage_proof', name: '婚姻状况证明', required: true, description: '死亡证明', uploaded: true }
    ],
    correctionOpinion: '请补充提交公证遗嘱原件的扫描件，需要清晰可见公证处公章和公证员签名。',
    correctionMaterials: ['will'],
    timeline: buildTimeline('correction', '2024-01-10 15:20:00', '2024-01-14 09:30:00', { correctionTime: '2024-01-14 09:30:00' })
  },
  {
    id: 'dec_003',
    orderNo: 'BDC20240105003',
    officeId: '310115001',
    officeName: '上海市浦东新区不动产登记事务中心',
    scenarioId: 'legal_inheritance',
    scenarioName: '法定继承',
    status: 'paid',
    statusText: '待取证',
    createTime: '2024-01-05 11:00:00',
    updateTime: '2024-01-12 16:45:00',
    decedent: {
      name: '赵六',
      idCard: '310115194807071234',
      deathDate: '2023-10-25',
      deathProof: '医院死亡证明',
      maritalStatus: '已婚'
    },
    heirs: [
      {
        id: 'heir_005',
        name: '赵小明',
        idCard: '310115197808085678',
        phone: '13500135005',
        relationship: '儿子',
        share: '100%',
        isMain: true
      }
    ],
    property: {
      certNumber: '沪（2019）浦不动产权第009012号',
      address: '上海市浦东新区陆家嘴环路1000号10号楼3单元303室',
      area: '150.2平方米',
      usage: '住宅',
      ownership: '共同共有',
      verified: true
    },
    materials: [
      { id: 'death_proof', name: '被继承人死亡证明', required: true, description: '医院死亡证明', uploaded: true },
      { id: 'identity_proof', name: '继承人身份证明', required: true, description: '居民身份证', uploaded: true },
      { id: 'relationship_proof', name: '亲属关系证明', required: true, description: '户口簿', uploaded: true },
      { id: 'property_cert', name: '不动产权属证书', required: true, description: '不动产权证书', uploaded: true },
      { id: 'marriage_proof', name: '婚姻状况证明', required: true, description: '结婚证', uploaded: true },
      { id: 'household_register', name: '户口簿', required: true, description: '户口簿', uploaded: true }
    ],
    tax: {
      totalAmount: 15000,
      items: [
        { name: '契税', amount: 15000 },
        { name: '印花税', amount: 5 }
      ],
      paid: true,
      payDeadline: '2024-01-22'
    },
    pickup: {
      type: 'self',
      date: '2024-01-20',
      address: '上海市浦东新区张杨路2899号'
    },
    timeline: buildTimeline('paid', '2024-01-05 11:00:00', '2024-01-12 16:45:00', { paidTime: '2024-01-12 16:45:00' })
  },
  {
    id: 'dec_004',
    orderNo: 'BDC20240101004',
    officeId: '440305001',
    officeName: '深圳市南山区不动产登记中心',
    scenarioId: 'legal_inheritance',
    scenarioName: '法定继承',
    status: 'completed',
    statusText: '已完成',
    createTime: '2024-01-01 09:30:00',
    updateTime: '2024-01-10 10:00:00',
    decedent: {
      name: '孙七',
      idCard: '440305195009091234',
      deathDate: '2023-09-10',
      deathProof: '医院死亡证明',
      maritalStatus: '已婚'
    },
    heirs: [
      {
        id: 'heir_006',
        name: '孙小红',
        idCard: '440305198010105678',
        phone: '13400134006',
        relationship: '女儿',
        share: '100%',
        isMain: true
      }
    ],
    property: {
      certNumber: '粤（2020）深圳市不动产权第003456号',
      address: '深圳市南山区科技园路100号12号楼4单元404室',
      area: '88.6平方米',
      usage: '住宅',
      ownership: '单独所有',
      verified: true
    },
    materials: [
      { id: 'death_proof', name: '被继承人死亡证明', required: true, description: '医院死亡证明', uploaded: true },
      { id: 'identity_proof', name: '继承人身份证明', required: true, description: '居民身份证', uploaded: true },
      { id: 'relationship_proof', name: '亲属关系证明', required: true, description: '出生证明', uploaded: true },
      { id: 'property_cert', name: '不动产权属证书', required: true, description: '不动产权证书', uploaded: true },
      { id: 'marriage_proof', name: '婚姻状况证明', required: true, description: '结婚证', uploaded: true },
      { id: 'household_register', name: '户口簿', required: true, description: '户口簿', uploaded: true }
    ],
    tax: {
      totalAmount: 8800,
      items: [
        { name: '契税', amount: 8800 },
        { name: '印花税', amount: 5 }
      ],
      paid: true,
      payDeadline: '2024-01-15'
    },
    pickup: {
      type: 'mail',
      receiver: '孙小红',
      receiverPhone: '13400134006',
      address: '深圳市南山区科技园路100号12号楼4单元404室',
      trackingNo: 'SF1234567890'
    },
    timeline: buildTimeline('completed', '2024-01-01 09:30:00', '2024-01-10 10:00:00')
  }
]

export function getDeclarationById(id: string): Declaration | undefined {
  return declarations.find(dec => dec.id === id)
}

export function getDeclarationsByStatus(status?: Declaration['status']): Declaration[] {
  if (!status) return declarations
  return declarations.filter(dec => dec.status === status)
}
