import React, { useState, useMemo } from 'react'
import { View, Text, Button, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import MessageItem from '@/components/MessageItem'
import EmptyState from '@/components/EmptyState'
import { useMessagesStore } from '@/store/messages'
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
  const messages = useMessagesStore((s) => s.messages)
  const markAllRead = useMessagesStore((s) => s.markAllRead)
  const markRead = useMessagesStore((s) => s.markRead)

  const list = useMemo(() => {
    if (activeTab === 'all') return messages
    return messages.filter((m) => m.type === activeTab)
  }, [messages, activeTab])

  const unreadCount = useMemo(
    () => messages.filter((m) => !m.read).length,
    [messages]
  )

  const tabUnreadCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    tabs.forEach((tab) => {
      if (tab.key === 'all') {
        counts[tab.key] = unreadCount
      } else {
        counts[tab.key] = messages.filter(
          (m) => m.type === tab.key && !m.read
        ).length
      }
    })
    return counts
  }, [messages, unreadCount])

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const handleMessageClick = (item: Message) => {
    if (!item.read) {
      markRead(item.id)
    }
    if (item.relatedId) {
      const pages = Taro.getCurrentPages()
      // 检查页面栈中是否已存在相同 id 的详情页
      const existIdx = pages.findIndex((p: any) => {
        const route = p.route || p.$taroPath || ''
        if (!route.includes('pages/detail/index')) return false
        const opts = p.options || (p as any).$taroParams || {}
        return opts.id === item.relatedId
      })
      if (existIdx >= 0) {
        // 已存在：回退到那一页而不是新开
        const delta = pages.length - 1 - existIdx
        if (delta > 0) {
          Taro.navigateBack({ delta })
          return
        }
      }
      // 检查当前栈顶是否就是任意 detail 页（不同 id），是则替换而不是叠加
      const top = pages[pages.length - 1]
      const topRoute = (top as any)?.route || (top as any)?.$taroPath || ''
      if (topRoute.includes('pages/detail/index')) {
        Taro.redirectTo({ url: `/pages/detail/index?id=${item.relatedId}` })
        return
      }
      Taro.navigateTo({ url: `/pages/detail/index?id=${item.relatedId}` })
      return
    }
    console.log('[MessagesPage] 点击消息:', item.id)
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
          markAllRead()
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
        <View className={styles.titleWrap}>
          <Text className={styles.title}>消息中心</Text>
          {unreadCount > 0 && (
            <View className={styles.unreadDot}>
              <Text className={styles.unreadDotText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
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
            <MessageItem key={item.id} item={item} onClick={() => handleMessageClick(item)} />
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
