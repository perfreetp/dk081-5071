import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface InfoItem {
  label: string
  value: string | React.ReactNode
  span?: number
}

interface InfoCardProps {
  title?: string
  items: InfoItem[]
  className?: string
  bordered?: boolean
}

const InfoCard: React.FC<InfoCardProps> = ({ title, items, className, bordered = true }) => {
  return (
    <View className={classnames(styles.card, { [styles.bordered]: bordered }, className)}>
      {title && <Text className={styles.title}>{title}</Text>}
      <View className={styles.content}>
        {items.map((item, index) => (
          <View
            key={index}
            className={classnames(styles.item, { [styles.span2]: item.span === 2 })}
          >
            <Text className={styles.label}>{item.label}</Text>
            <View className={styles.value}>
              {typeof item.value === 'string' ? (
                <Text className={styles.valueText}>{item.value || '-'}</Text>
              ) : (
                item.value
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

export default InfoCard
