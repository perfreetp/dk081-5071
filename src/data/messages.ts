import type { Message } from '@/types'

export const messages: Message[] = [
  {
    id: 'msg_001',
    type: 'acceptance',
    title: '申报已受理',
    content: '您的不动产继承登记申报（受理编号：BDC20240115001）已成功受理，我们将在3个工作日内完成审核。',
    time: '2024-01-15 10:35:00',
    read: false,
    relatedId: 'dec_001'
  },
  {
    id: 'msg_002',
    type: 'correction',
    title: '请补正材料',
    content: '您的申报（受理编号：BDC20240110002）需要补充材料，请提交公证遗嘱原件的扫描件。',
    time: '2024-01-14 09:30:00',
    read: false,
    relatedId: 'dec_002'
  },
  {
    id: 'msg_003',
    type: 'payment',
    title: '待缴税费提醒',
    content: '您的申报（受理编号：BDC20240105003）已审核通过，应缴税费共计15,005元，请在2024-01-22前完成缴费。',
    time: '2024-01-12 16:45:00',
    read: true,
    relatedId: 'dec_003'
  },
  {
    id: 'msg_004',
    type: 'completion',
    title: '业务已办结',
    content: '您的不动产继承登记（受理编号：BDC20240101004）已完成，不动产权证书已通过顺丰速运寄出，快递单号：SF1234567890。',
    time: '2024-01-10 10:00:00',
    read: true,
    relatedId: 'dec_004'
  },
  {
    id: 'msg_005',
    type: 'notice',
    title: '系统维护通知',
    content: '为提供更优质的服务，本系统将于2024年1月20日22:00-24:00进行系统维护，期间暂停服务。',
    time: '2024-01-18 17:00:00',
    read: true
  },
  {
    id: 'msg_006',
    type: 'notice',
    title: '春节放假通知',
    content: '2024年春节期间（2月9日-2月17日）登记中心暂停办理业务，2月18日起正常办公，请合理安排办理时间。',
    time: '2024-01-15 12:00:00',
    read: true
  },
  {
    id: 'msg_007',
    type: 'acceptance',
    title: '预约核验成功',
    content: '您已成功预约2024年1月20日09:00-10:00的原件核验，请携带所有材料原件按时前往北京市海淀区不动产登记中心。',
    time: '2024-01-15 11:00:00',
    read: false,
    relatedId: 'dec_001'
  },
  {
    id: 'msg_008',
    type: 'payment',
    title: '缴费成功',
    content: '您的申报（受理编号：BDC20240105003）税费已缴清，共计15,005元。我们将尽快为您制作不动产权证书。',
    time: '2024-01-13 10:15:00',
    read: true,
    relatedId: 'dec_003'
  }
]

export function getUnreadCount(): number {
  return messages.filter(msg => !msg.read).length
}

export function getMessagesByType(type?: Message['type']): Message[] {
  if (!type) return messages
  return messages.filter(msg => msg.type === type)
}
