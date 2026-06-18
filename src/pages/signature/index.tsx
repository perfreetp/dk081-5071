import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Button, Image, Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclareStore } from '@/store/declare'
import { maskIdCard } from '@/utils/validator'
import type { SignatureInfo, HeirInfo } from '@/types'
import styles from './index.module.scss'

const promiseText = `
本人郑重声明：

一、本人所提交的全部申请材料真实、合法、有效，所填报的信息全部属实。如有虚假，本人愿承担由此产生的一切法律责任和后果。

二、本人清楚了解被继承人的全部继承人范围，包括：
1. 配偶：（如在世请注明）
2. 子女：（包括婚生子女、非婚生子女、养子女和有扶养关系的继子女）
3. 父母：（包括生父母、养父母和有扶养关系的继父母）
4. 兄弟姐妹：（包括同父母的兄弟姐妹、同父异母或者同母异父的兄弟姐妹、养兄弟姐妹、有扶养关系的继兄弟姐妹）
5. 祖父母、外祖父母

三、本人确认上述继承人均已知晓本次不动产继承登记事宜，且对继承事宜无异议。

四、本人承诺所申请继承的不动产权属清晰，无查封、无抵押、无争议。如有隐瞒，本人愿承担全部法律责任。

五、本人同意登记机构将本次登记信息记载于不动产登记簿。

六、本人已知晓并同意：如因提交虚假材料或者隐瞒真实情况等原因导致登记错误，给他人造成损害的，本人将依法承担赔偿责任。

特此承诺！
`

const SignaturePage: React.FC = () => {
  const { signature, setSignature, heirs, decedent, property } = useDeclareStore()
  const [signatureUrl, setSignatureUrl] = useState<string>('')
  const [promiseConfirmed, setPromiseConfirmed] = useState(false)
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [heirSignatures, setHeirSignatures] = useState<Record<string, boolean>>({})
  const [confirmDate, setConfirmDate] = useState('')
  const canvasRef = useRef<any>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const ctxRef = useRef<any>(null)

  useEffect(() => {
    const initialHeirSignatures: Record<string, boolean> = {}
    heirs.forEach(heir => {
      initialHeirSignatures[heir.id] = false
    })

    if (signature) {
      setSignatureUrl(signature.signatureUrl)
      setPromiseConfirmed(signature.promiseConfirmed)
      setConfirmDate(signature.confirmDate)
      if (signature.heirConfirmations) {
        heirs.forEach(heir => {
          if (signature.heirConfirmations![heir.id] !== undefined) {
            initialHeirSignatures[heir.id] = signature.heirConfirmations![heir.id]
          }
        })
      }
    }

    setHeirSignatures(initialHeirSignatures)
  }, [])

  const handleSign = () => {
    setShowSignaturePad(true)
    setTimeout(() => {
      initCanvas()
    }, 100)
  }

  const initCanvas = () => {
    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node
          const ctx = canvas.getContext('2d')
          const dpr = Taro.getSystemInfoSync().pixelRatio
          canvas.width = res[0].width * dpr
          canvas.height = res[0].height * dpr
          ctx.scale(dpr, dpr)
          ctx.strokeStyle = '#000000'
          ctx.lineWidth = 3
          ctx.lineCap = 'round'
          ctx.lineJoin = 'round'
          ctxRef.current = ctx
        }
      })
  }

  const handleTouchStart = (e: any) => {
    if (!ctxRef.current) return
    setIsDrawing(true)
    setHasDrawn(true)
    const touch = e.touches[0]
    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas').boundingClientRect().exec((rectRes) => {
      if (rectRes[0]) {
        const x = touch.clientX - rectRes[0].left
        const y = touch.clientY - rectRes[0].top
        ctxRef.current.beginPath()
        ctxRef.current.moveTo(x, y)
      }
    })
  }

  const handleTouchMove = (e: any) => {
    if (!isDrawing || !ctxRef.current) return
    const touch = e.touches[0]
    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas').boundingClientRect().exec((rectRes) => {
      if (rectRes[0]) {
        const x = touch.clientX - rectRes[0].left
        const y = touch.clientY - rectRes[0].top
        ctxRef.current.lineTo(x, y)
        ctxRef.current.stroke()
      }
    })
  }

  const handleTouchEnd = () => {
    setIsDrawing(false)
  }

  const handleClearSignature = () => {
    if (ctxRef.current) {
      const query = Taro.createSelectorQuery()
      query.select('#signatureCanvas')
        .fields({ node: true, size: true })
        .exec((res) => {
          if (res[0]) {
            ctxRef.current.clearRect(0, 0, res[0].width, res[0].height)
          }
        })
    }
    setHasDrawn(false)
  }

  const handleConfirmSignature = () => {
    if (!hasDrawn) {
      Taro.showToast({ title: '请先签名', icon: 'none' })
      return
    }

    const query = Taro.createSelectorQuery()
    query.select('#signatureCanvas')
      .fields({ node: true })
      .exec((res) => {
        if (res[0]) {
          const canvas = res[0].node
          const tempFilePath = canvas.toDataURL('image/png')
          setSignatureUrl(tempFilePath)
          setConfirmDate(new Date().toLocaleDateString('zh-CN'))
          setShowSignaturePad(false)
          Taro.showToast({ title: '签名已保存', icon: 'success' })
        }
      })
  }

  const handleClearSignatureLocal = () => {
    Taro.showModal({
      title: '确认清除',
      content: '确定要清除已签名的内容吗？',
      success: (res) => {
        if (res.confirm) {
          setSignatureUrl('')
          setHasDrawn(false)
        }
      }
    })
  }

  const handleConfirmHeir = (heir: HeirInfo) => {
    const isConfirmed = !!heirSignatures[heir.id]
    if (isConfirmed) {
      setHeirSignatures(prev => ({ ...prev, [heir.id]: false }))
      Taro.showToast({ title: '已取消确认', icon: 'none' })
      return
    }
    if (!signatureUrl) {
      Taro.showToast({ title: '请主继承人先完成签名', icon: 'none' })
      return
    }
    if (!promiseConfirmed) {
      Taro.showToast({ title: '请先确认承诺书', icon: 'none' })
      return
    }
    setHeirSignatures(prev => ({ ...prev, [heir.id]: true }))
    Taro.showToast({ title: `${heir.name} 已确认`, icon: 'success' })
  }

  const handleToggleConfirm = () => {
    if (!signatureUrl) {
      Taro.showToast({ title: '请先完成签名', icon: 'none' })
      return
    }
    setPromiseConfirmed(!promiseConfirmed)
  }

  const allHeirsConfirmed = heirs.every(heir => heirSignatures[heir.id])

  const validate = (): boolean => {
    if (!signatureUrl) {
      Taro.showToast({ title: '请完成手写签名', icon: 'none' })
      return false
    }
    if (!promiseConfirmed) {
      Taro.showToast({ title: '请确认承诺书内容', icon: 'none' })
      return false
    }
    if (!allHeirsConfirmed && heirs.length > 1) {
      Taro.showToast({ title: '请等待所有继承人确认', icon: 'none' })
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validate()) return

    const signatureInfo: SignatureInfo = {
      signatureUrl,
      promiseConfirmed,
      confirmDate,
      heirConfirmations: { ...heirSignatures }
    }
    setSignature(signatureInfo)
    console.log('[SignaturePage] 保存签名确认信息:', signatureInfo)
    Taro.showToast({
      title: '已确认',
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

  return (
    <PageContainer scroll padding>
      <View className={styles.promiseCard}>
        <Text className={styles.cardTitle}>
          <Text className={styles.cardIcon}>📜</Text>
          继承承诺书
        </Text>
        <View className={styles.promiseContent}>
          <Text className={styles.promiseTitle}>不动产继承登记承诺书</Text>
          {promiseText.split('\n\n').filter(Boolean).map((para, idx) => (
            <Text key={idx} className={styles.promiseParagraph}>
              {para}
            </Text>
          ))}
        </View>
        <Text className={styles.scrollHint}>↑ 向上滑动查看完整内容</Text>
      </View>

      <View className={styles.signatureSection}>
        <Text className={styles.cardTitle}>
          <Text className={styles.cardIcon}>✍️</Text>
          主继承人手写签名
        </Text>
        <View
          className={`${styles.signatureArea} ${signatureUrl ? styles.hasSignature : ''}`}
        >
          {signatureUrl ? (
            <Image
              className={styles.signatureImage}
              src={signatureUrl}
              mode="contain"
            />
          ) : (
            <View className={styles.signaturePlaceholder}>
              <Text className={styles.placeholderIcon}>✍️</Text>
              <Text className={styles.placeholderText}>点击下方按钮进行手写签名</Text>
            </View>
          )}
        </View>
        <View className={styles.signatureActions}>
          {!signatureUrl ? (
            <Button
              className={`${styles.actionBtn} ${styles.primaryBtn}`}
              onClick={handleSign}
            >
              <Text className={styles.btnIcon}>✍️</Text>
              <Text>手写签名</Text>
            </Button>
          ) : (
            <Button
              className={`${styles.actionBtn} ${styles.dangerBtn}`}
              onClick={handleClearSignatureLocal}
            >
              <Text className={styles.btnIcon}>🗑️</Text>
              <Text>清除签名</Text>
            </Button>
          )}
        </View>
      </View>

      {heirs.length > 0 && (
        <View className={styles.heirsConfirmSection}>
          <Text className={styles.cardTitle}>
            <Text className={styles.cardIcon}>👥</Text>
            继承人共同确认
          </Text>
          <View className={styles.heirsList}>
            {heirs.map((heir: HeirInfo) => {
              const confirmed = !!heirSignatures[heir.id]
              return (
                <View
                  key={heir.id}
                  className={`${styles.heirItem} ${confirmed ? styles.heirConfirmed : ''}`}
                  onClick={() => handleConfirmHeir(heir)}
                >
                  <View className={styles.heirInfo}>
                    <Text className={styles.heirName}>
                      {heir.name || '未填写'}
                      {heir.isMain && <Text className={styles.heirMain}>主继承人</Text>}
                    </Text>
                    <Text className={styles.heirRelation}>
                      {heir.relationship} · {maskIdCard(heir.idCard)}
                    </Text>
                  </View>
                  <View className={styles.confirmStatus}>
                    {confirmed ? (
                      <>
                        <Text className={styles.statusIcon}>✅</Text>
                        <Text className={`${styles.statusText} ${styles.confirmed}`}>已确认</Text>
                      </>
                    ) : (
                      <>
                        <Text className={styles.statusIcon}>👆</Text>
                        <Text className={`${styles.statusText} ${styles.pending}`}>点击确认</Text>
                      </>
                    )}
                  </View>
                </View>
              )
            })}
          </View>
          {!allHeirsConfirmed && (
            <Text className={styles.confirmTip}>
              请各位继承人逐个点击确认（{Object.values(heirSignatures).filter(Boolean).length}/{heirs.length}）
            </Text>
          )}
        </View>
      )}

      <View
        className={`${styles.confirmSection} ${promiseConfirmed ? styles.checked : ''}`}
        onClick={handleToggleConfirm}
      >
        <View className={styles.checkboxRow}>
          <View className={`${styles.checkbox} ${promiseConfirmed ? styles.checked : ''}`}>
            {promiseConfirmed && <Text className={styles.checkIcon}>✓</Text>}
          </View>
          <Text className={styles.checkboxLabel}>
            本人已仔细阅读并理解《不动产继承登记承诺书》的全部内容，
            <Text className={styles.highlight}>承诺所提交的材料真实、合法、有效</Text>，
            如有虚假愿承担相应的法律责任。
          </Text>
        </View>
      </View>

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          <Text className={styles.cancelBtnText}>取消</Text>
        </Button>
        <Button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!signatureUrl || !promiseConfirmed}
        >
          <Text className={styles.saveBtnText}>确认提交</Text>
        </Button>
      </View>

      {showSignaturePad && (
        <View className={styles.signaturePadOverlay}>
          <View className={styles.padHeader}>
            <Text className={styles.padTitle}>请在下方区域手写签名</Text>
            <Text className={styles.padClose} onClick={() => setShowSignaturePad(false)}>
              ✕
            </Text>
          </View>
          <View
            className={styles.padCanvas}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {!hasDrawn && (
              <View className={styles.padPlaceholder}>
                <Text className={styles.placeholderIcon}>✍️</Text>
                <Text className={styles.placeholderText}>请在此区域书写您的签名</Text>
              </View>
            )}
            <Canvas
              id="signatureCanvas"
              ref={canvasRef}
              style={{ width: '100%', height: '100%' }}
              type="2d"
            />
          </View>
          <View className={styles.padFooter}>
            <Button
              className={`${styles.padBtn} ${styles.clearBtn}`}
              onClick={handleClearSignature}
            >
              清除
            </Button>
            <Button
              className={`${styles.padBtn} ${styles.confirmBtn}`}
              onClick={handleConfirmSignature}
            >
              确认签名
            </Button>
          </View>
        </View>
      )}
    </PageContainer>
  )
}

export default SignaturePage
