import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StepItem {
  title: string
  status: 'done' | 'active' | 'pending'
}

interface StepIndicatorProps {
  steps: StepItem[]
  currentIndex: number
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ steps, currentIndex }) => {
  return (
    <View className={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <View className={styles.stepItem}>
            <View
              className={classnames(styles.stepCircle, {
                [styles.done]: step.status === 'done',
                [styles.active]: step.status === 'active',
                [styles.pending]: step.status === 'pending'
              })}
            >
              {step.status === 'done' && <Text className={styles.checkIcon}>✓</Text>}
              {step.status === 'active' && <Text className={styles.stepNum}>{index + 1}</Text>}
              {step.status === 'pending' && <Text className={styles.stepNum}>{index + 1}</Text>}
            </View>
            <Text
              className={classnames(styles.stepTitle, {
                [styles.activeText]: step.status === 'active' || step.status === 'done',
                [styles.pendingText]: step.status === 'pending'
              })}
            >
              {step.title}
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View
              className={classnames(styles.stepLine, {
                [styles.lineDone]: index < currentIndex,
                [styles.linePending]: index >= currentIndex
              })}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  )
}

export default StepIndicator
