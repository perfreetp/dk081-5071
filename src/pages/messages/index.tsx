import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import MessageItem from '@/components/MessageItem'
import EmptyState from '@/components/EmptyState'
import { messages, getMessagesByType, getUnreadCount } from '@/data/messages'
import type { Message } from '@/types'
import styles from './index.module.scss'

const tabs = [
  { key: 'all', label: '全部' },
  { key: 'acceptance', label: '受理通知' },
  { key: 'completion', label: '办结通知' },
  { key: 'payment', label: '缴费提醒' },
  { key: 'correction', label: '补正通知' },
  { key: 'notice', label: '系统公告' }
]

const MessagesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all')
  const [list, setList] = useState<Message[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadData()
  }, [activeTab])

  useDidShow(() => {
    loadData()
    setUnreadCount(getUnreadCount())
  })

  const loadData = () => {
    const type = activeTab === 'all' ? undefined : activeTab as Message['type']
    const data = getMessagesByType(type)
    setList(data)
    console.log('[MessagesPage] 加载消息:', data.length, '条')
  }

  const tabUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tabs.forEach(tab => {
      if (tab.key === 'all') {
        counts[tab.key] = getUnreadCount()
      } else {
        counts[tab.key] = messages.filter(
          m => m.type === tab.key && !m.read
        ).length
      }
    })
    return counts
  }, [])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const handleMessageClick = (id: string) => {
    console.log('[MessagesPage] 点击消息:', id)
  }

  const handleReadAll = () => {
    if (unreadCount === 0) {
      Taro.showToast({
        title: '暂无未读消息',
        icon: 'none',
        duration: 1500
      })
      return
    }

    Taro.showModal({
      title: '一键已读',
      content: '确定将所有消息标记为已读吗？',
      success: (res) => {
        if (res.confirm) {
          setUnreadCount(0)
          Taro.showToast({
            title: '已全部标记为已读',
            icon: 'success',
            duration: 1500
          })
          console.log('[MessagesPage] 一键已读')
        }
      }
    })
  }

  return (
    <PageContainer scroll padding>
      <View className={styles.header}>
        <Text className={styles.title}>消息中心</Text>
        <Button className={styles.readAllBtn} onClick={handleReadAll}>
          <Text className={styles.readAllText}>一键已读</Text>
        </Button>
      </View>

      <ScrollView scrollX className={styles.tabScroll} enhanced showScrollbar={false}>
        {tabs.map((tab) => (
          <View
            key={tab.key}
            className={classnames(styles.tabItem, {
              [styles.active]: activeTab === tab.key
            })}
            onClick={() => handleTabChange(tab.key)}
          >
            <Text className={styles.tabText}>{tab.label}</Text>
            <View className={styles.tabLine} />
            {tabUnreadCounts[tab.key] > 0 && (
              <View className={styles.unreadBadge}>
                <Text className={styles.unreadBadgeText}>
                  {tabUnreadCounts[tab.key] > 99 ? '99+' : tabUnreadCounts[tab.key]}
                </Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {list.length > 0 ? (
        <View className={styles.messageList}>
          {list.map((item) => (
            <MessageItem key={item.id} item={item} onClick={handleMessageClick} />
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState
            icon="📭"
            title="暂无消息"
            description="您还没有相关消息，新消息将第一时间通知您"
          />
        </View>
      )}
    </PageContainer>
  )
}

export default MessagesPage
