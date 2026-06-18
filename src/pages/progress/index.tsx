import React, { useState, useEffect, useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useDidShow, useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import ProgressCard from '@/components/ProgressCard'
import EmptyState from '@/components/EmptyState'
import { useDeclarationsStore } from '@/store/declarations'
import type { Declaration } from '@/types'
import styles from './index.module.scss'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'reviewing', label: '审核中' },
  { key: 'correction', label: '待补正' },
  { key: 'paid', label: '待取证' },
  { key: 'completed', label: '已完成' }
]

const ProgressPage: React.FC = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('all')
  const declarations = useDeclarationsStore((s) => s.declarations)

  useEffect(() => {
    const tabParam = router.params.tab
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [])

  useDidShow(() => {
    console.log('[ProgressPage] 进入进度中心，当前申报数:', declarations.length)
  })

  const list = useMemo(() => {
    if (activeTab === 'all') return declarations
    return declarations.filter((d) => d.status === activeTab)
  }, [activeTab, declarations])

  const stats = useMemo(
    () => ({
      total: declarations.length,
      reviewing: declarations.filter(
        (d) => d.status === 'reviewing' || d.status === 'submitted'
      ).length,
      correction: declarations.filter((d) => d.status === 'correction').length,
      completed: declarations.filter(
        (d) => d.status === 'completed' || d.status === 'paid'
      ).length
    }),
    [declarations]
  )

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const handleCardClick = (id: string) => {
    console.log('[ProgressPage] 点击申报详情:', id)
  }

  const handleStart = () => {
    Taro.switchTab({ url: '/pages/declare/index' })
  }

  return (
    <PageContainer scroll padding>
      <View className={styles.tabBar}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, {
              [styles.active]: activeTab === tab.key
            })}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
          </View>
        ))}
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.total}</Text>
          <Text className={styles.statLabel}>全部</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.reviewing}</Text>
          <Text className={styles.statLabel}>审核中</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.correction}</Text>
          <Text className={styles.statLabel}>待补正</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{stats.completed}</Text>
          <Text className={styles.statLabel}>已完成</Text>
        </View>
      </View>

      <View className={styles.listHeader}>
        <Text className={styles.listTitle}>申报记录</Text>
        <Text className={styles.listCount}>共 {list.length} 条</Text>
      </View>

      {list.length > 0 ? (
        <View>
          {list.map((item) => (
            <ProgressCard key={item.id} item={item} onClick={handleCardClick} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState
            icon="📋"
            title="暂无申报记录"
            description="您还没有申报记录，快去开始您的不动产继承登记申报吧"
            actionText="立即申报"
            onAction={handleStart}
          />
        </View>
      )}
    </PageContainer>
  )
}

export default ProgressPage
