import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Message } from '@/types'

interface MessageItemProps {
  item: Message
  onClick?: (id: string) => void
}

const typeConfig: Record<Message['type'], { icon: string; color: string; bgColor: string }> = {
  acceptance: { icon: '📋', color: '#165DFF', bgColor: '#E8F3FF' },
  completion: { icon: '✅', color: '#00B42A', bgColor: '#E8FFEA' },
  payment: { icon: '💰', color: '#FF7D00', bgColor: '#FFF3E8' },
  correction: { icon: '⚠️', color: '#FF7D00', bgColor: '#FFF3E8' },
  notice: { icon: '📢', color: '#86909C', bgColor: '#F2F3F5' }
}

const MessageItem: React.FC<MessageItemProps> = ({ item, onClick }) => {
  const typeStyle = typeConfig[item.type]

  const handleClick = () => {
    onClick?.(item.id)
    if (item.relatedId) {
      Taro.navigateTo({ url: `/pages/detail/index?id=${item.relatedId}` })
    }
  }

  return (
    <View className={styles.container} onClick={handleClick}>
      {!item.read && <View className={styles.unreadDot} />}
      <View
        className={styles.iconBox}
        style={{ backgroundColor: typeStyle.bgColor }}
      >
        <Text className={styles.icon}>{typeStyle.icon}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.header}>
          <Text className={styles.title}>{item.title}</Text>
          <Text className={styles.time}>{item.time}</Text>
        </View>
        <Text className={styles.description}>{item.content}</Text>
      </View>
    </View>
  )
}

export default MessageItem
