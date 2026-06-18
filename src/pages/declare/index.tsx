import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import StepIndicator from '@/components/StepIndicator'
import { useDeclareStore } from '@/store/declare'
import { maskIdCard, maskPhone } from '@/utils/validator'
import type { StepItem } from '@/types'
import styles from './index.module.scss'

const stepConfigs = [
  { key: 'office', icon: '🏢', name: '选择登记机构', path: '/pages/select-office/index' },
  { key: 'scenario', icon: '📋', name: '选择继承情形', path: '/pages/scenario/index' },
  { key: 'decedent', icon: '👤', name: '被继承人信息', path: '/pages/decedent/index' },
  { key: 'heirs', icon: '👨‍👩‍👧‍👦', name: '继承人信息', path: '/pages/heir/index' },
  { key: 'property', icon: '🏠', name: '不动产信息', path: '/pages/property/index' },
  { key: 'materials', icon: '📎', name: '材料上传', path: '/pages/upload/index' },
  { key: 'signature', icon: '✍️', name: '签名确认', path: '/pages/signature/index' },
  { key: 'appointment', icon: '📅', name: '预约核验', path: '/pages/appointment/index' }
]

const DeclarePage: React.FC = () => {
  const {
    selectedOffice,
    selectedScenario,
    decedent,
    heirs,
    property,
    materials,
    signature,
    appointment
  } = useDeclareStore()

  const [stepStatus, setStepStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    checkStepCompletion()
  }, [selectedOffice, selectedScenario, decedent, heirs, property, materials, signature, appointment])

  useDidShow(() => {
    checkStepCompletion()
  })

  const checkStepCompletion = () => {
    const status: Record<string, boolean> = {
      office: !!selectedOffice,
      scenario: !!selectedScenario,
      decedent: !!decedent,
      heirs: heirs.length > 0,
      property: !!property?.verified,
      materials: materials.filter(m => m.required && m.uploaded).length === materials.filter(m => m.required).length && materials.length > 0,
      signature: !!signature?.signatureUrl && signature?.promiseConfirmed,
      appointment: !!appointment?.date
    }
    setStepStatus(status)
    console.log('[DeclarePage] 步骤完成状态:', status)
  }

  const steps: StepItem[] = useMemo(() => {
    return stepConfigs.map((step, index) => {
      const isCompleted = stepStatus[step.key]
      const firstIncomplete = stepConfigs.findIndex(s => !stepStatus[s.key])
      let status: StepItem['status'] = 'pending'
      if (isCompleted) {
        status = 'done'
      } else if (index === firstIncomplete) {
        status = 'active'
      }
      return {
        title: step.name,
        status
      }
    })
  }, [stepStatus])

  const currentStepIndex = useMemo(() => {
    return stepConfigs.findIndex(s => !stepStatus[s.key])
  }, [stepStatus])

  const completedCount = useMemo(() => {
    return Object.values(stepStatus).filter(Boolean).length
  }, [stepStatus])

  const allCompleted = useMemo(() => {
    return completedCount === stepConfigs.length
  }, [completedCount])

  const handleStepClick = (step: typeof stepConfigs[0]) => {
    Taro.navigateTo({ url: step.path })
  }

  const handleSaveDraft = () => {
    Taro.showToast({
      title: '草稿已保存',
      icon: 'success',
      duration: 1500
    })
    console.log('[DeclarePage] 保存草稿')
  }

  const handleSubmit = () => {
    if (!allCompleted) {
      const incompleteSteps = stepConfigs.filter(s => !stepStatus[s.key])
      Taro.showModal({
        title: '请完成所有步骤',
        content: `还需完成：${incompleteSteps.map(s => s.name).join('、')}`,
        showCancel: false,
        confirmText: '我知道了'
      })
      return
    }

    Taro.showModal({
      title: '提交申报',
      content: '确认提交您的不动产继承登记申报？提交后将进入审核阶段。',
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '提交中...' })
          setTimeout(() => {
            Taro.hideLoading()
            Taro.showToast({
              title: '申报提交成功',
              icon: 'success',
              duration: 2000
            })
            console.log('[DeclarePage] 申报提交成功')
            setTimeout(() => {
              Taro.switchTab({ url: '/pages/progress/index' })
            }, 2000)
          }, 1500)
        }
      }
    })
  }

  const getStepPreview = (key: string): string => {
    switch (key) {
      case 'office':
        return selectedOffice?.name || '未选择'
      case 'scenario':
        return selectedScenario?.name || '未选择'
      case 'decedent':
        return decedent ? `${decedent.name}（${maskIdCard(decedent.idCard)}）` : '未填写'
      case 'heirs':
        return heirs.length > 0 ? `共 ${heirs.length} 位继承人` : '未添加'
      case 'property':
        return property?.address || '未填写'
      case 'materials':
        return materials.length > 0
          ? `已上传 ${materials.filter(m => m.uploaded).length}/${materials.length} 项`
          : '未上传'
      case 'signature':
        return signature?.promiseConfirmed ? '已确认' : '未确认'
      case 'appointment':
        return appointment ? `${appointment.date} ${appointment.timeSlot}` : '未预约'
      default:
        return '未填写'
    }
  }

  return (
    <PageContainer scroll padding>
      <View className={styles.stepContainer}>
        <Text className={styles.stepTitle}>
          申报进度（{completedCount}/{stepConfigs.length}）
        </Text>
        <StepIndicator steps={steps.slice(0, 4)} currentIndex={Math.min(currentStepIndex, 3)} />
        {stepConfigs.length > 4 && (
          <StepIndicator
            steps={steps.slice(4, 8)}
            currentIndex={Math.max(currentStepIndex - 4, -1)}
          />
        )}
      </View>

      {selectedOffice && selectedScenario && (
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>
            <Text className={styles.summaryIcon}>📝</Text>
            已选信息概览
          </Text>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>登记机构：</Text>
            <Text className={styles.summaryValue}>{selectedOffice.name}</Text>
          </View>
          <View className={styles.summaryRow}>
            <Text className={styles.summaryLabel}>继承情形：</Text>
            <Text className={styles.summaryValue}>{selectedScenario.name}</Text>
          </View>
          {heirs.length > 0 && (
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>继承人：</Text>
              <Text className={styles.summaryValue}>
                {heirs.map(h => h.name).join('、')}
              </Text>
            </View>
          )}
        </View>
      )}

      {!allCompleted && (
        <View className={styles.progressTip}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text className={styles.tipText}>
            请按顺序完成以下步骤，标有"*"的为必填项。填写过程中可随时退出，系统会自动保存您的进度。
          </Text>
        </View>
      )}

      <View className={styles.stepList}>
        {stepConfigs.map((step, index) => (
          <View
            key={step.key}
            className={classnames(styles.stepCard, {
              [styles.completed]: stepStatus[step.key]
            })}
            onClick={() => handleStepClick(step)}
          >
            <View className={styles.stepIcon}>
              <Text>{step.icon}</Text>
            </View>
            <View className={styles.stepContent}>
              <View className={styles.stepHeader}>
                <Text className={styles.stepName}>{index + 1}. {step.name}</Text>
                <View className={classnames(styles.stepStatus, {
                  [styles.statusDone]: stepStatus[step.key],
                  [styles.statusTodo]: !stepStatus[step.key]
                })}>
                  <Text>{stepStatus[step.key] ? '已完成' : '待填写'}</Text>
                </View>
              </View>
              <Text className={styles.stepPreview}>{getStepPreview(step.key)}</Text>
            </View>
            <Text className={styles.stepArrow}>{'>'}</Text>
          </View>
        ))}
      </View>

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.saveBtn} onClick={handleSaveDraft}>
          <Text className={styles.saveBtnText}>保存草稿</Text>
        </Button>
        <Button
          className={classnames(styles.submitBtn, {
            [styles.disabled]: !allCompleted
          })}
          onClick={handleSubmit}
        >
          <Text className={styles.submitBtnText}>
            {allCompleted ? '提交申报' : `还需完成 ${stepConfigs.length - completedCount} 步`}
          </Text>
        </Button>
      </View>
    </PageContainer>
  )
}

export default DeclarePage
