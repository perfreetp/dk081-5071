import type { Declaration } from '@/types'

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
      confirmDate: '2024-01-15'
    },
    appointment: {
      type: 'onsite',
      date: '2024-01-20',
      timeSlot: '09:00-10:00',
      address: '北京市海淀区东北旺南路27号上地办公中心',
      contact: '李四',
      contactPhone: '13800138001'
    }
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
    correctionOpinion: '请补充提交公证遗嘱原件的扫描件，需要清晰可见公证处公章和公证员签名。'
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
    }
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
    }
  }
]

export function getDeclarationById(id: string): Declaration | undefined {
  return declarations.find(dec => dec.id === id)
}

export function getDeclarationsByStatus(status?: Declaration['status']): Declaration[] {
  if (!status) return declarations
  return declarations.filter(dec => dec.status === status)
}
