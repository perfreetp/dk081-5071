import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { Declaration } from '@/types'

interface ProgressCardProps {
  item: Declaration
  onClick?: (id: string) => void
}

const statusConfig: Record<Declaration['status'], { color: string; bgColor: string }> = {
  draft: { color: '#86909C', bgColor: '#F2F3F5' },
  submitted: { color: '#165DFF', bgColor: '#E8F3FF' },
  reviewing: { color: '#165DFF', bgColor: '#E8F3FF' },
  correction: { color: '#FF7D00', bgColor: '#FFF3E8' },
  approved: { color: '#165DFF', bgColor: '#E8F3FF' },
  paid: { color: '#00B42A', bgColor: '#E8FFEA' },
  completed: { color: '#00B42A', bgColor: '#E8FFEA' },
  rejected: { color: '#F53F3F', bgColor: '#FFEBE8' }
}

const ProgressCard: React.FC<ProgressCardProps> = ({ item, onClick }) => {
  const statusStyle = statusConfig[item.status]

  const handleClick = () => {
    onClick?.(item.id)
    Taro.navigateTo({ url: `/pages/detail/index?id=${item.id}` })
  }

  return (
    <View className={styles.card} onClick={handleClick}>
      <View className={styles.header}>
        <Text className={styles.orderNo}>{item.orderNo}</Text>
        <View
          className={styles.status}
          style={{ backgroundColor: statusStyle.bgColor }}
        >
          <Text className={styles.statusText} style={{ color: statusStyle.color }}>
            {item.statusText}
          </Text>
        </View>
      </View>

      <View className={styles.info}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>登记机构：</Text>
          <Text className={styles.value}>{item.officeName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>继承类型：</Text>
          <Text className={styles.value}>{item.scenarioName}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>不动产：</Text>
          <Text className={styles.value}>{item.property.address}</Text>
        </View>
      </View>

      {item.correctionOpinion && (
        <View className={styles.correctionBox}>
          <Text className={styles.correctionLabel}>补正意见：</Text>
          <Text className={styles.correctionText}>{item.correctionOpinion}</Text>
        </View>
      )}

      <View className={styles.footer}>
        <Text className={styles.time}>申请时间：{item.createTime}</Text>
        <View className={styles.arrow}>
          <Text className={styles.arrowText}>{'>'}</Text>
        </View>
      </View>
    </View>
  )
}

export default ProgressCard
