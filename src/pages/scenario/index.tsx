import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import { scenarios, getScenarioById } from '@/data/scenarios'
import { materialTemplates } from '@/data/materials'
import { useDeclareStore } from '@/store/declare'
import type { Scenario } from '@/types'
import styles from './index.module.scss'

const scenarioIcons: Record<string, string> = {
  legal_inheritance: '⚖️',
  will_inheritance: '📜',
  bequest: '🎁',
  bequest_support: '🤝',
  spouse_inheritance: '💑',
  minor_inheritance: '👶'
}

const ScenarioPage: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>('')
  const { setScenario, selectedScenario: storeScenario } = useDeclareStore()

  useEffect(() => {
    if (storeScenario) {
      setSelectedId(storeScenario.id)
    }
  }, [])

  const getMaterialName = (id: string): string => {
    return materialTemplates[id]?.name || '其他材料'
  }

  const handleSelect = (scenario: Scenario) => {
    setSelectedId(scenario.id)
    console.log('[ScenarioPage] 选择继承情形:', scenario.name)
  }

  const handleConfirm = () => {
    if (!selectedId) {
      Taro.showToast({
        title: '请选择继承情形',
        icon: 'none',
        duration: 1500
      })
      return
    }

    const scenario = getScenarioById(selectedId)
    if (scenario) {
      setScenario(scenario)
      Taro.showToast({
        title: `已选择${scenario.name}`,
        icon: 'success',
        duration: 1500
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
    }
  }

  return (
    <PageContainer scroll padding>
      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text className={styles.tipText}>请选择您的继承情形</Text>
        </View>
        <Text className={styles.tipContent}>
          系统将根据您选择的继承情形，自动为您生成所需的材料清单和办理指引。请根据实际情况选择最符合的情形。
        </Text>
      </View>

      <Text className={styles.sectionTitle}>继承情形列表</Text>

      <View>
        {scenarios.map((scenario) => (
          <View
            key={scenario.id}
            className={classnames(styles.scenarioCard, {
              [styles.selected]: selectedId === scenario.id
            })}
            onClick={() => handleSelect(scenario)}
          >
            <View className={styles.scenarioHeader}>
              <View className={styles.scenarioIcon}>
                <Text>{scenarioIcons[scenario.id] || '📋'}</Text>
              </View>
              <View className={styles.scenarioInfo}>
                <Text className={styles.scenarioName}>{scenario.name}</Text>
                <Text className={styles.scenarioDesc}>{scenario.description}</Text>
              </View>
            </View>
            <Text className={styles.materialTitle}>
              所需材料（{scenario.materials.length}项）
            </Text>
            <View className={styles.materialList}>
              {scenario.materials.slice(0, 5).map((materialId) => (
                <View key={materialId} className={styles.materialTag}>
                  <Text>{getMaterialName(materialId)}</Text>
                </View>
              ))}
              {scenario.materials.length > 5 && (
                <View className={styles.materialTag}>
                  <Text>+{scenario.materials.length - 5}项</Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </View>

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button
          className={classnames(styles.confirmBtn, {
            [styles.disabled]: !selectedId
          })}
          onClick={handleConfirm}
        >
          <Text className={styles.confirmBtnText}>
            {selectedId ? '确认选择' : '请选择继承情形'}
          </Text>
        </Button>
      </View>
    </PageContainer>
  )
}

export default ScenarioPage
