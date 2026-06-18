import React, { useState, useEffect } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow, usePullDownRefresh } from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { messages, getUnreadCount } from '@/data/messages'
import styles from './index.module.scss'

const quickEntries = [
  { icon: '📝', text: '在线申报', path: '/pages/declare/index' },
  { icon: '📋', text: '材料准备', path: '/pages/materials/index' },
  { icon: '📊', text: '进度查询', path: '/pages/progress/index' },
  { icon: '💬', text: '消息中心', path: '/pages/messages/index' },
  { icon: '📖', text: '办事指南', path: '/pages/guide/index' },
  { icon: '💳', text: '税费查询', path: '/pages/progress/index?tab=tax' },
  { icon: '📍', text: '网点查询', path: '/pages/select-office/index' },
  { icon: '📞', text: '联系客服', action: 'contact' }
]

const processSteps = [
  { icon: '🏢', text: '选择机构' },
  { icon: '✍️', text: '填写信息' },
  { icon: '📎', text: '上传材料' },
  { icon: '📅', text: '预约核验' }
]

const HomePage: React.FC = () => {
  const [location, setLocation] = useState('北京市海淀区')
  const [unreadCount, setUnreadCount] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useDidShow(() => {
    setUnreadCount(getUnreadCount())
  })

  usePullDownRefresh(() => {
    setRefreshing(true)
    setTimeout(() => {
      loadData()
      setRefreshing(false)
      Taro.stopPullDownRefresh()
    }, 1000)
  })

  const loadData = () => {
    setUnreadCount(getUnreadCount())
    console.log('[HomePage] 加载首页数据')
  }

  const handleStart = () => {
    Taro.navigateTo({ url: '/pages/select-office/index' })
  }

  const handleQuickEntry = (item: typeof quickEntries[0]) => {
    if (item.action === 'contact') {
      Taro.showModal({
        title: '联系客服',
        content: '服务热线：010-12345\n服务时间：09:00-17:00（工作日）',
        showCancel: false,
        confirmText: '我知道了'
      })
      return
    }
    if (item.path) {
      Taro.switchTab({ url: item.path }).catch(() => {
        Taro.navigateTo({ url: item.path })
      })
    }
  }

  const handleMoreGuide = () => {
    Taro.navigateTo({ url: '/pages/guide/index' })
  }

  const handleNoticeClick = () => {
    Taro.switchTab({ url: '/pages/messages/index' })
  }

  return (
    <PageContainer scroll padding>
      <View className={styles.banner}>
        <View className={styles.bannerContent}>
          <Text className={styles.greeting}>您好</Text>
          <Text className={styles.subtitle}>办理不动产继承登记，少跑一次，材料一次交清</Text>
          <View className={styles.location}>
            <Text className={styles.locationIcon}>📍</Text>
            <Text className={styles.locationText}>{location}</Text>
          </View>
          <Button className={styles.startBtn} onClick={handleStart}>
            <Text className={styles.startBtnText}>开始办理</Text>
          </Button>
        </View>
      </View>

      <View className={styles.quickGrid}>
        {quickEntries.map((item, index) => (
          <View key={index} className={styles.quickItem} onClick={() => handleQuickEntry(item)}>
            <View className={styles.quickItemInner}>
              <Text className={styles.quickIcon}>{item.icon}</Text>
              <Text className={styles.quickText}>{item.text}</Text>
              {item.text === '消息中心' && unreadCount > 0 && (
                <View style={{
                  position: 'absolute',
                  top: 16,
                  right: 20,
                  minWidth: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: '#F53F3F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 8rpx'
                }}>
                  <Text style={{ fontSize: 20, color: '#fff', fontWeight: 600 }}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>办理流程</Text>
        </View>
        <View className={styles.processCard}>
          <Text className={styles.processTitle}>四步完成，足不出户办登记</Text>
          <View className={styles.processSteps}>
            {processSteps.map((step, index) => (
              <View key={index} className={styles.processStep}>
                {index < processSteps.length - 1 && <View className={styles.stepLine} />}
                <View className={styles.stepIcon}>
                  <Text>{step.icon}</Text>
                </View>
                <Text className={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>办事指南</Text>
          <View className={styles.sectionMore} onClick={handleMoreGuide}>
            <Text>更多</Text>
            <Text className={styles.arrow}>{'>'}</Text>
          </View>
        </View>
        <View className={styles.guideCard} onClick={handleMoreGuide}>
          <View className={styles.guideIcon}>
            <Text>📚</Text>
          </View>
          <View className={styles.guideContent}>
            <Text className={styles.guideTitle}>不动产继承登记办理指南</Text>
            <Text className={styles.guideDesc}>了解办理条件、所需材料、办理时限等详细信息</Text>
          </View>
          <Text className={styles.guideArrow}>{'>'}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>通知公告</Text>
          <View className={styles.sectionMore} onClick={handleNoticeClick}>
            <Text>更多</Text>
            <Text className={styles.arrow}>{'>'}</Text>
          </View>
        </View>
        <ScrollView scrollX className={styles.noticeScroll} enhanced showScrollbar={false}>
          {messages.filter(m => m.type === 'notice').slice(0, 3).map((notice) => (
            <View key={notice.id} className={styles.noticeItem} onClick={handleNoticeClick}>
              <View className={styles.noticeHeader}>
                <View className={styles.noticeTag}>
                  <Text>公告</Text>
                </View>
                <Text className={styles.noticeTime}>{notice.time.split(' ')[0]}</Text>
              </View>
              <Text className={styles.noticeTitle}>{notice.title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </PageContainer>
  )
}

export default HomePage
