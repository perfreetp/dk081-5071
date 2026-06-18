import React, { useState, useEffect } from 'react'
import { View, Text, ScrollView, Button } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import MaterialItemComponent from '@/components/MaterialItem'
import { scenarios, getScenarioById } from '@/data/scenarios'
import { generateMaterialList } from '@/data/materials'
import { useDeclareStore } from '@/store/declare'
import type { MaterialItem, Scenario } from '@/types'
import styles from './index.module.scss'

const scenarioIcons: Record<string, string> = {
  legal_inheritance: '⚖️',
  will_inheritance: '📜',
  bequest: '🎁',
  bequest_support: '🤝',
  spouse_inheritance: '💑',
  minor_inheritance: '👶'
}

const MaterialsPage: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('legal_inheritance')
  const [materialList, setMaterialList] = useState<MaterialItem[]>([])
  const { setScenario, setMaterials, selectedScenario: storeScenario, materials: storeMaterials } = useDeclareStore()

  useEffect(() => {
    if (storeScenario) {
      setSelectedScenario(storeScenario.id)
    }
    if (storeMaterials.length > 0) {
      setMaterialList(storeMaterials)
    } else {
      loadMaterials(selectedScenario)
    }
  }, [])

  useEffect(() => {
    loadMaterials(selectedScenario)
  }, [selectedScenario])

  const loadMaterials = (scenarioId: string) => {
    const scenario = getScenarioById(scenarioId)
    if (scenario) {
      const materials = generateMaterialList(scenario.materials)
      setMaterialList(materials)
      console.log('[MaterialsPage] 生成材料清单:', materials.length, '项')
    }
  }

  const handleScenarioSelect = (scenario: Scenario) => {
    setSelectedScenario(scenario.id)
    setScenario(scenario)
    setMaterials([])
    Taro.showToast({
      title: `已选择${scenario.name}`,
      icon: 'success',
      duration: 1500
    })
  }

  const handleMaterialUpload = (id: string) => {
    setMaterialList(prev => prev.map(m =>
      m.id === id ? { ...m, uploaded: true, uploadUrl: `upload_${id}.png` } : m
    ))
    useDeclareStore.getState().updateMaterial(id, { uploaded: true, uploadUrl: `upload_${id}.png` })
    Taro.showToast({
      title: '上传成功',
      icon: 'success',
      duration: 1500
    })
  }

  const handleMaterialPreview = (id: string, url: string) => {
    Taro.previewImage({
      urls: [url]
    })
  }

  const handleUploadAll = () => {
    const requiredCount = materialList.filter(m => m.required).length
    const uploadedCount = materialList.filter(m => m.required && m.uploaded).length

    if (uploadedCount < requiredCount) {
      Taro.showModal({
        title: '提示',
        content: `还有 ${requiredCount - uploadedCount} 项必填材料未上传，是否继续填写申报信息？`,
        confirmText: '继续填写',
        cancelText: '返回上传',
        success: (res) => {
          if (res.confirm) {
            useDeclareStore.getState().setMaterials(materialList)
            Taro.switchTab({ url: '/pages/declare/index' })
          }
        }
      })
    } else {
      useDeclareStore.getState().setMaterials(materialList)
      Taro.showToast({
        title: '材料已准备齐全',
        icon: 'success',
        duration: 1500
      })
      setTimeout(() => {
        Taro.switchTab({ url: '/pages/declare/index' })
      }, 1500)
    }
  }

  const requiredCount = materialList.filter(m => m.required).length
  const optionalCount = materialList.filter(m => !m.required).length
  const uploadedCount = materialList.filter(m => m.uploaded).length

  return (
    <PageContainer scroll padding>
      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text className={styles.tipText}>温馨提示</Text>
        </View>
        <Text className={styles.tipContent}>
          请先选择您的继承情形，系统将自动为您生成所需材料清单。请确保所有必填材料都已准备齐全后再进行申报。
        </Text>
      </View>

      <Text className={styles.sectionTitle}>选择继承情形</Text>
      <ScrollView scrollX className={styles.scenarioScroll} enhanced showScrollbar={false}>
        {scenarios.map((scenario) => (
          <View
            key={scenario.id}
            className={classnames(styles.scenarioCard, {
              [styles.active]: selectedScenario === scenario.id
            })}
            onClick={() => handleScenarioSelect(scenario)}
          >
            <View className={styles.scenarioHeader}>
              <View className={styles.scenarioIcon}>
                <Text>{scenarioIcons[scenario.id] || '📋'}</Text>
              </View>
              <Text className={styles.scenarioName}>{scenario.name}</Text>
            </View>
            <Text className={styles.scenarioDesc}>{scenario.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{requiredCount}</Text>
          <Text className={styles.statLabel}>必填材料</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{optionalCount}</Text>
          <Text className={styles.statLabel}>选填材料</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNum}>{uploadedCount}</Text>
          <Text className={styles.statLabel}>已上传</Text>
        </View>
      </View>

      <View className={styles.materialHeader}>
        <Text className={styles.materialTitle}>材料清单</Text>
        <Text className={styles.materialCount}>共 {materialList.length} 项</Text>
      </View>

      <View className={styles.materialList}>
        {materialList.map((item) => (
          <MaterialItemComponent
            key={item.id}
            item={item}
            onUpload={handleMaterialUpload}
            onPreview={handleMaterialPreview}
          />
        ))}
      </View>

      <View className={styles.bottomPadding} />

      <Button className={styles.uploadAllBtn} onClick={handleUploadAll}>
        <Text className={styles.uploadAllBtnText}>
          {uploadedCount >= requiredCount ? '材料准备完成，去填写申报' : '继续填写申报信息'}
        </Text>
      </Button>
    </PageContainer>
  )
}

export default MaterialsPage
