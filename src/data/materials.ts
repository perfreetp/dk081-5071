import type { MaterialItem } from '@/types'

export const materialTemplates: Record<string, Omit<MaterialItem, 'uploaded' | 'uploadUrl'>> = {
  death_proof: {
    id: 'death_proof',
    name: '被继承人死亡证明',
    required: true,
    description: '包括医院出具的死亡证明、公安机关注销户口证明、法院宣告死亡判决书等'
  },
  identity_proof: {
    id: 'identity_proof',
    name: '继承人身份证明',
    required: true,
    description: '继承人居民身份证、户口簿等有效身份证件'
  },
  relationship_proof: {
    id: 'relationship_proof',
    name: '亲属关系证明',
    required: true,
    description: '结婚证、户口簿、出生医学证明、收养证明、单位或社区出具的亲属关系证明等'
  },
  property_cert: {
    id: 'property_cert',
    name: '不动产权属证书',
    required: true,
    description: '房屋所有权证、土地使用权证、不动产权证书等'
  },
  marriage_proof: {
    id: 'marriage_proof',
    name: '婚姻状况证明',
    required: true,
    description: '结婚证、离婚证、婚姻登记机关出具的婚姻状况证明等'
  },
  household_register: {
    id: 'household_register',
    name: '户口簿',
    required: true,
    description: '证明家庭成员关系的户口簿'
  },
  will: {
    id: 'will',
    name: '遗嘱',
    required: true,
    description: '被继承人所立合法有效遗嘱，包括公证遗嘱、自书遗嘱、代书遗嘱等'
  },
  acceptance_statement: {
    id: 'acceptance_statement',
    name: '接受遗赠声明',
    required: true,
    description: '受遗赠人在知道受遗赠后六十日内作出的接受遗赠的书面声明'
  },
  bequest_support_agreement: {
    id: 'bequest_support_agreement',
    name: '遗赠扶养协议',
    required: true,
    description: '被继承人与扶养人签订的遗赠扶养协议原件'
  },
  performance_proof: {
    id: 'performance_proof',
    name: '履行扶养义务证明',
    required: true,
    description: '证明扶养人已履行生养死葬义务的相关材料'
  },
  guardianship_proof: {
    id: 'guardianship_proof',
    name: '监护权证明',
    required: true,
    description: '法院判决书或居委会/村委会指定监护人的证明'
  },
  birth_proof: {
    id: 'birth_proof',
    name: '出生医学证明',
    required: true,
    description: '继承人的出生医学证明'
  },
  other_heirs_agreement: {
    id: 'other_heirs_agreement',
    name: '其他继承人同意书',
    required: true,
    description: '其他合法继承人同意遗产处理方式的书面声明'
  },
  power_of_attorney: {
    id: 'power_of_attorney',
    name: '授权委托书',
    required: false,
    description: '委托他人代为办理的，需提供经公证的授权委托书'
  },
  other_materials: {
    id: 'other_materials',
    name: '其他补充材料',
    required: false,
    description: '登记机构认为需要提交的其他相关材料'
  }
}

export function generateMaterialList(materialIds: string[]): MaterialItem[] {
  return materialIds.map(id => {
    const template = materialTemplates[id]
    if (!template) {
      return {
        id,
        name: '其他材料',
        required: false,
        description: '请按要求上传相关材料',
        uploaded: false
      }
    }
    return {
      ...template,
      uploaded: false
    }
  })
}
