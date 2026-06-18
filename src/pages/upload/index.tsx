import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclareStore } from '@/store/declare'
import { useDeclarationsStore } from '@/store/declarations'
import { generateMaterialList } from '@/data/materials'
import type { MaterialItem } from '@/types'
import styles from './index.module.scss'

const UploadPage: React.FC = () => {
  const { materials, setMaterials, updateMaterial, selectedScenario } = useDeclareStore()
  const declarations = useDeclarationsStore((s) => s.declarations)
  const updateDeclaration = useDeclarationsStore((s) => s.updateDeclaration)

  const [correctionMode, setCorrectionMode] = useState(false)
  const [correctionDeclarationId, setCorrectionDeclarationId] = useState<string>('')
  const [correctionMaterialIds, setCorrectionMaterialIds] = useState<string[]>([])

  const [localMaterials, setLocalMaterials] = useState<MaterialItem[]>([])
  const [uploadingId, setUploadingId] = useState<string | null>(null)

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1] as any
    const options = currentPage?.options || {}
    const isCorrection = options.correction === '1' || options.correction === true
    setCorrectionMode(isCorrection)

    if (isCorrection) {
      const decId = options.declarationId
      const idsStr = options.materialIds ? decodeURIComponent(options.materialIds) : ''
      const ids = idsStr.split(',').filter(Boolean)
      setCorrectionDeclarationId(decId || '')
      setCorrectionMaterialIds(ids)

      if (decId) {
        const dec = declarations.find((d) => d.id === decId)
        if (dec) {
          // 只保留要补正的材料
          const filtered = dec.materials.filter((m) => ids.includes(m.id))
          setLocalMaterials(filtered)
          return
        }
      }
      setLocalMaterials([])
      return
    }

    // 非补正模式：从 declare store 读
    if (materials.length > 0) {
      setLocalMaterials(materials)
    } else if (selectedScenario) {
      const generated = generateMaterialList(selectedScenario.materials)
      setLocalMaterials(generated)
      setMaterials(generated)
    }
  }, [declarations])

  const handleUpload = async (itemId: string) => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const tempFilePath = res.tempFilePaths[0]

      setUploadingId(itemId)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      const mockUrl = tempFilePath
      const now = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')

      const updatedMaterials = localMaterials.map((m) =>
        m.id === itemId ? { ...m, uploaded: true, uploadUrl: mockUrl, uploadTime: now } : m
      )
      setLocalMaterials(updatedMaterials)

      if (correctionMode) {
        // 补正模式：将上传状态合并回 declaration 的 materials 列表
        if (correctionDeclarationId) {
          const dec = declarations.find((d) => d.id === correctionDeclarationId)
          if (dec) {
            const newMaterials = dec.materials.map((m) =>
              m.id === itemId ? { ...m, uploaded: true, uploadUrl: mockUrl, uploadTime: now } : m
            )
            updateDeclaration(correctionDeclarationId, { materials: newMaterials, updateTime: now })
          }
        }
      } else {
        updateMaterial(itemId, { uploaded: true, uploadUrl: mockUrl })
      }

      console.log('[UploadPage] 材料上传成功:', itemId, mockUrl)
      Taro.showToast({ title: '上传成功', icon: 'success' })
    } catch (error) {
      console.error('[UploadPage] 材料上传失败:', error)
      Taro.showToast({ title: '上传取消', icon: 'none' })
    } finally {
      setUploadingId(null)
    }
  }

  const handlePreview = (item: MaterialItem) => {
    if (item.uploadUrl) {
      Taro.previewImage({
        urls: [item.uploadUrl],
        current: item.uploadUrl
      })
    }
  }

  const handleDelete = (itemId: string) => {
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除已上传的材料吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedMaterials = localMaterials.map((m) =>
            m.id === itemId ? { ...m, uploaded: false, uploadUrl: undefined } : m
          )
          setLocalMaterials(updatedMaterials)
          if (correctionMode) {
            if (correctionDeclarationId) {
              const dec = declarations.find((d) => d.id === correctionDeclarationId)
              if (dec) {
                const newMaterials = dec.materials.map((m) =>
                  m.id === itemId ? { ...m, uploaded: false, uploadUrl: undefined } : m
                )
                updateDeclaration(correctionDeclarationId, { materials: newMaterials })
              }
            }
          } else {
            updateMaterial(itemId, { uploaded: false, uploadUrl: undefined })
          }
          Taro.showToast({ title: '已删除', icon: 'none' })
        }
      }
    })
  }

  const requiredCount = useMemo(() => localMaterials.filter((m) => m.required).length, [localMaterials])
  const uploadedRequiredCount = useMemo(
    () => localMaterials.filter((m) => m.required && m.uploaded).length,
    [localMaterials]
  )
  const totalUploaded = useMemo(() => localMaterials.filter((m) => m.uploaded).length, [localMaterials])
  const progressPercent = requiredCount > 0 ? Math.round((uploadedRequiredCount / requiredCount) * 100) : 0

  const validate = (): boolean => {
    if (correctionMode) {
      // 补正模式：所有展示出来的材料（都是要补正的）必须全部上传
      const missing = localMaterials.filter((m) => !m.uploaded)
      if (missing.length > 0) {
        Taro.showModal({
          title: '还有补正材料未上传',
          content: `请先上传以下补正材料：${missing.map((m) => m.name).join('、')}`,
          showCancel: false
        })
        return false
      }
      return true
    }
    const missingRequired = localMaterials.filter((m) => m.required && !m.uploaded)
    if (missingRequired.length > 0) {
      Taro.showModal({
        title: '还有必填材料未上传',
        content: `请先上传以下必填材料：${missingRequired.map((m) => m.name).join('、')}`,
        showCancel: false
      })
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validate()) return

    if (correctionMode) {
      // 补正模式：保存已直接逐份回写了 declaration，这里只 Toast 然后返回
      Taro.showToast({
        title: '补正材料已保存',
        icon: 'success',
        duration: 1500
      })
      setTimeout(() => {
        Taro.navigateBack()
      }, 1500)
      return
    }

    setMaterials(localMaterials)
    console.log('[UploadPage] 保存材料清单:', localMaterials)
    Taro.showToast({
      title: '已保存',
      icon: 'success',
      duration: 1500
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  const handleCancel = () => {
    Taro.navigateBack()
  }

  const requiredMaterials = localMaterials.filter((m) => m.required)
  const optionalMaterials = localMaterials.filter((m) => !m.required)

  const renderMaterialItem = (item: MaterialItem) => (
    <View key={item.id} className={`${styles.materialItem} ${item.uploaded ? styles.uploaded : ''}`}>
      <View className={styles.materialHeader}>
        <Text className={styles.materialName}>{item.name}</Text>
        <View className={styles.materialTags}>
          {item.required ? (
            <View className={`${styles.tag} ${styles.required}`}>
              <Text>必填</Text>
            </View>
          ) : (
            <View className={`${styles.tag} ${styles.optional}`}>
              <Text>选填</Text>
            </View>
          )}
          {correctionMode && (
            <View className={`${styles.tag}`} style={{ background: 'rgba(245,63,63,0.1)', color: '#f53f3f' }}>
              <Text>需补正</Text>
            </View>
          )}
          {item.uploaded && (
            <View className={`${styles.tag} ${styles.uploaded}`}>
              <Text>已上传</Text>
            </View>
          )}
        </View>
      </View>
      <Text className={styles.materialDesc}>{item.description}</Text>

      {item.uploaded && item.uploadUrl && (
        <View className={styles.uploadPreview}>
          <Image className={styles.previewImg} src={item.uploadUrl} mode="aspectFill" />
          <View className={styles.previewInfo}>
            <Text className={styles.previewName}>{item.name}</Text>
            <Text className={styles.previewTime}>
              上传时间：{(item as any).uploadTime || '刚刚'}
            </Text>
          </View>
        </View>
      )}

      <View className={styles.materialActions}>
        {!item.uploaded ? (
          <Button
            className={`${styles.actionBtn} ${styles.uploadBtn}`}
            onClick={() => handleUpload(item.id)}
          >
            <Text className={styles.btnIcon}>📷</Text>
            <Text>上传材料</Text>
          </Button>
        ) : (
          <>
            <Button className={`${styles.actionBtn} ${styles.viewBtn}`} onClick={() => handlePreview(item)}>
              <Text className={styles.btnIcon}>👁️</Text>
              <Text>查看</Text>
            </Button>
            <Button
              className={`${styles.actionBtn} ${styles.deleteBtn}`}
              onClick={() => handleDelete(item.id)}
            >
              <Text className={styles.btnIcon}>🗑️</Text>
              <Text>删除</Text>
            </Button>
          </>
        )}
      </View>
    </View>
  )

  return (
    <PageContainer scroll padding>
      {correctionMode ? (
        <View className={styles.statsCard} style={{ background: 'rgba(245,63,63,0.06)' }}>
          <View className={styles.statsIcon}>⚠️</View>
          <View className={styles.statsInfo}>
            <Text className={styles.statsTitle}>补正材料上传</Text>
            <Text className={styles.statsDetail}>
              请按要求上传 <Text className={styles.statsHighlight}>{totalUploaded}/{localMaterials.length}</Text> 份补正材料
            </Text>
          </View>
          <View className={styles.statsProgress}>
            <View
              className={styles.progressCircle}
              style={{ ['--progress' as any]: `${progressPercent}%`, ['--color' as any]: '#f53f3f' }}
            />
            <Text className={styles.progressText} style={{ color: '#f53f3f' }}>
              {progressPercent}%
            </Text>
          </View>
        </View>
      ) : (
        <View className={styles.statsCard}>
          <View className={styles.statsIcon}>📁</View>
          <View className={styles.statsInfo}>
            <Text className={styles.statsTitle}>材料上传进度</Text>
            <Text className={styles.statsDetail}>
              已上传 <Text className={styles.statsHighlight}>{uploadedRequiredCount}/{requiredCount}</Text> 份必填材料，
              共上传 <Text className={styles.statsHighlight}>{totalUploaded}</Text> 份
            </Text>
          </View>
          <View className={styles.statsProgress}>
            <View
              className={styles.progressCircle}
              style={{ ['--progress' as any]: `${progressPercent}%` }}
            />
            <Text className={styles.progressText}>{progressPercent}%</Text>
          </View>
        </View>
      )}

      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text>{correctionMode ? '补正上传须知' : '上传须知'}</Text>
        </View>
        <Text className={styles.tipContent}>
          1. 请上传清晰、完整的彩色扫描件或照片{'\n'}
          2. 支持 JPG、PNG 格式，单张不超过 10MB{'\n'}
          3. 标"需补正/必填"的材料请务必上传{'\n'}
          4. 原件将在核验环节进行核对
        </Text>
      </View>

      {localMaterials.length === 0 ? (
        <View className={styles.emptyState}>
          <Text className={styles.emptyIcon}>📋</Text>
          <Text className={styles.emptyText}>
            {correctionMode ? '没有需要补正的材料' : '请先选择继承情形'}
          </Text>
          {!correctionMode && (
            <Button
              className={styles.emptyAction}
              onClick={() => Taro.navigateTo({ url: '/pages/scenario/index' })}
            >
              <Text className={styles.actionText}>去选择</Text>
            </Button>
          )}
        </View>
      ) : (
        <>
          <View className={styles.sectionCard}>
            <Text className={styles.sectionTitle}>
              <Text className={styles.sectionIcon}>
                {correctionMode ? '⚠️' : '✅'}
              </Text>
              {correctionMode ? '需补正材料' : requiredMaterials.length > 0 ? '必填材料' : '材料清单'}
            </Text>
            <View className={styles.materialList}>
              {correctionMode
                ? localMaterials.map(renderMaterialItem)
                : requiredMaterials.map(renderMaterialItem)}
            </View>
          </View>

          {!correctionMode && optionalMaterials.length > 0 && (
            <View className={styles.sectionCard}>
              <Text className={styles.sectionTitle}>
                <Text className={styles.sectionIcon}>📎</Text>
                选填材料
              </Text>
              <View className={styles.materialList}>
                {optionalMaterials.map(renderMaterialItem)}
              </View>
            </View>
          )}
        </>
      )}

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          <Text className={styles.cancelBtnText}>取消</Text>
        </Button>
        <Button className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>
            {correctionMode ? '保存并返回详情' : '保存材料'}
          </Text>
        </Button>
      </View>

      {uploadingId && (
        <View className={styles.uploadingOverlay}>
          <View className={styles.uploadingContent}>
            <View className={styles.uploadingSpinner} />
            <Text className={styles.uploadingText}>正在上传...</Text>
            <Text className={styles.uploadingProgress}>请稍候</Text>
          </View>
        </View>
      )}
    </PageContainer>
  )
}

export default UploadPage
