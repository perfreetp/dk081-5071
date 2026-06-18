import React from 'react'
import { View, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  scroll?: boolean
  padding?: boolean
  safeBottom?: boolean
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  className,
  scroll = true,
  padding = true,
  safeBottom = true
}) => {
  const containerClass = classnames(
    styles.page,
    {
      [styles.withPadding]: padding,
      [styles.safeBottom]: safeBottom
    },
    className
  )

  if (scroll) {
    return (
      <ScrollView
        scrollY
        className={containerClass}
        enhanced
        showScrollbar={false}
      >
        {children}
      </ScrollView>
    )
  }

  return (
    <View className={containerClass}>
      {children}
    </View>
  )
}

export default PageContainer
