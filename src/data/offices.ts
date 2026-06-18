import type { Office, Region } from '@/types'

export const regions: Region[] = [
  {
    code: '110000',
    name: '北京市',
    municipality: true,
    children: [
      { code: '110101', name: '东城区' },
      { code: '110102', name: '西城区' },
      { code: '110105', name: '朝阳区' },
      { code: '110106', name: '丰台区' },
      { code: '110107', name: '石景山区' },
      { code: '110108', name: '海淀区' },
      { code: '110109', name: '门头沟区' },
      { code: '110111', name: '房山区' },
      { code: '110112', name: '通州区' },
      { code: '110113', name: '顺义区' },
      { code: '110114', name: '昌平区' },
      { code: '110115', name: '大兴区' },
      { code: '110116', name: '怀柔区' },
      { code: '110117', name: '平谷区' },
      { code: '110118', name: '密云区' },
      { code: '110119', name: '延庆区' }
    ]
  },
  {
    code: '310000',
    name: '上海市',
    municipality: true,
    children: [
      { code: '310101', name: '黄浦区' },
      { code: '310104', name: '徐汇区' },
      { code: '310105', name: '长宁区' },
      { code: '310106', name: '静安区' },
      { code: '310107', name: '普陀区' },
      { code: '310109', name: '虹口区' },
      { code: '310110', name: '杨浦区' },
      { code: '310112', name: '闵行区' },
      { code: '310113', name: '宝山区' },
      { code: '310114', name: '嘉定区' },
      { code: '310115', name: '浦东新区' },
      { code: '310116', name: '金山区' },
      { code: '310117', name: '松江区' },
      { code: '310118', name: '青浦区' },
      { code: '310120', name: '奉贤区' },
      { code: '310151', name: '崇明区' }
    ]
  },
  {
    code: '440000',
    name: '广东省',
    children: [
      {
        code: '440100',
        name: '广州市',
        children: [
          { code: '440104', name: '越秀区' },
          { code: '440106', name: '天河区' },
          { code: '440111', name: '白云区' }
        ]
      },
      {
        code: '440300',
        name: '深圳市',
        children: [
          { code: '440304', name: '福田区' },
          { code: '440305', name: '南山区' },
          { code: '440306', name: '宝安区' }
        ]
      },
      { code: '440400', name: '珠海市' },
      { code: '440600', name: '佛山市' },
      { code: '441900', name: '东莞市' }
    ]
  }
]

export const offices: Office[] = [
  {
    id: '110108001',
    name: '北京市海淀区不动产登记中心',
    region: '北京市海淀区',
    regionCode: '110108',
    address: '北京市海淀区东北旺南路27号上地办公中心',
    phone: '010-82708600',
    workHours: '周一至周五 09:00-17:00'
  },
  {
    id: '110105001',
    name: '北京市朝阳区不动产登记中心',
    region: '北京市朝阳区',
    regionCode: '110105',
    address: '北京市朝阳区石佛营东里128号院3号楼',
    phone: '010-85839922',
    workHours: '周一至周五 09:00-17:00'
  },
  {
    id: '110102001',
    name: '北京市西城区不动产登记中心',
    region: '北京市西城区',
    regionCode: '110102',
    address: '北京市西城区南菜园街51号',
    phone: '010-63555789',
    workHours: '周一至周五 09:00-17:00'
  },
  {
    id: '310115001',
    name: '上海市浦东新区不动产登记事务中心',
    region: '上海市浦东新区',
    regionCode: '310115',
    address: '上海市浦东新区张杨路2899号',
    phone: '021-58881688',
    workHours: '周一至周五 09:00-17:00'
  },
  {
    id: '310104001',
    name: '上海市徐汇区不动产登记中心',
    region: '上海市徐汇区',
    regionCode: '310104',
    address: '上海市徐汇区上中路466号',
    phone: '021-31063300',
    workHours: '周一至周五 09:00-17:00'
  },
  {
    id: '440305001',
    name: '深圳市南山区不动产登记中心',
    region: '广东省深圳市南山区',
    regionCode: '440305',
    address: '深圳市南山区深南大道10138号',
    phone: '0755-96508888',
    workHours: '周一至周五 09:00-18:00'
  },
  {
    id: '440304001',
    name: '深圳市福田区不动产登记中心',
    region: '广东省深圳市福田区',
    regionCode: '440304',
    address: '深圳市福田区新闻路69号',
    phone: '0755-96508888',
    workHours: '周一至周五 09:00-18:00'
  },
  {
    id: '440104001',
    name: '广州市越秀区不动产登记中心',
    region: '广东省广州市越秀区',
    regionCode: '440104',
    address: '广州市越秀区珠江新城华利路61号',
    phone: '020-83625100',
    workHours: '周一至周五 09:00-17:00'
  }
]

export function getOfficesByRegion(regionCode: string): Office[] {
  let prefix = regionCode
  if (regionCode.endsWith('0000')) {
    prefix = regionCode.substring(0, 2)
  } else if (regionCode.endsWith('00')) {
    prefix = regionCode.substring(0, 4)
  }
  return offices.filter(office => office.regionCode.startsWith(prefix))
}

export function getOfficeById(id: string): Office | undefined {
  return offices.find(office => office.id === id)
}

export function isMunicipality(region?: Region | null): boolean {
  return !!region?.municipality
}
