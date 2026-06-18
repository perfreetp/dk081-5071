export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/materials/index',
    'pages/declare/index',
    'pages/progress/index',
    'pages/messages/index',
    'pages/select-office/index',
    'pages/scenario/index',
    'pages/decedent/index',
    'pages/heir/index',
    'pages/property/index',
    'pages/upload/index',
    'pages/signature/index',
    'pages/appointment/index',
    'pages/detail/index',
    'pages/tax/index',
    'pages/guide/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#165dff',
    navigationBarTitleText: '不动产继承登记',
    navigationBarTextStyle: 'white',
    backgroundColor: '#f5f6f7'
  },
  tabBar: {
    color: '#86909c',
    selectedColor: '#165dff',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/home/index',
        text: '首页'
      },
      {
        pagePath: 'pages/materials/index',
        text: '材料准备'
      },
      {
        pagePath: 'pages/declare/index',
        text: '在线申报'
      },
      {
        pagePath: 'pages/progress/index',
        text: '进度中心'
      },
      {
        pagePath: 'pages/messages/index',
        text: '消息'
      }
    ]
  }
})
