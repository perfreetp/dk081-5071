import type { Scenario } from '@/types'

export const scenarios: Scenario[] = [
  {
    id: 'legal_inheritance',
    name: '法定继承',
    description: '被继承人未立遗嘱，按照法律规定的继承人范围、继承顺序和遗产分配原则进行继承。适用情形：被继承人生前未订立遗嘱或遗赠扶养协议。',
    materials: ['death_proof', 'identity_proof', 'relationship_proof', 'property_cert', 'marriage_proof', 'household_register']
  },
  {
    id: 'will_inheritance',
    name: '遗嘱继承',
    description: '被继承人立有合法有效的遗嘱，按照遗嘱指定的继承人继承遗产。适用情形：被继承人生前已订立合法有效遗嘱。',
    materials: ['death_proof', 'will', 'identity_proof', 'relationship_proof', 'property_cert', 'marriage_proof']
  },
  {
    id: 'bequest',
    name: '遗赠',
    description: '被继承人通过遗嘱将个人财产赠与国家、集体或者法定继承人以外的组织、个人。适用情形：受遗赠人不是法定继承人。',
    materials: ['death_proof', 'will', 'identity_proof', 'acceptance_statement', 'property_cert']
  },
  {
    id: 'bequest_support',
    name: '遗赠扶养协议',
    description: '被继承人与扶养人签订协议，由扶养人承担被继承人生养死葬的义务，被继承人的财产在其死后归扶养人所有。',
    materials: ['death_proof', 'bequest_support_agreement', 'identity_proof', 'performance_proof', 'property_cert']
  },
  {
    id: 'spouse_inheritance',
    name: '夫妻共同财产继承',
    description: '夫妻在婚姻关系存续期间所得的共同所有财产，除有约定外，分割遗产时应先将共同财产的一半分出为配偶所有，其余为被继承人的遗产。',
    materials: ['death_proof', 'marriage_proof', 'identity_proof', 'property_cert', 'household_register', 'other_heirs_agreement']
  },
  {
    id: 'minor_inheritance',
    name: '未成年人继承',
    description: '继承人为未成年人，需要由其监护人代为办理相关手续。适用情形：继承人未满18周岁。',
    materials: ['death_proof', 'identity_proof', 'guardianship_proof', 'birth_proof', 'property_cert', 'relationship_proof']
  }
]

export function getScenarioById(id: string): Scenario | undefined {
  return scenarios.find(scenario => scenario.id === id)
}
