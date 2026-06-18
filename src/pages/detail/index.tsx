import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclarationsStore } from '@/store/declarations'
import { maskIdCard, maskPhone } from '@/utils/validator'
import type { Declaration } from '@/types'
import styles from './index.module.scss'

const statusSteps = [
  { key: 'submitted', title: '提交申报', desc: '您的申报已成功提交' },
  { key: 'reviewing', title: '材料审核', desc: '工作人员正在审核您的材料' },
  { key: 'correction', title: '待补正', desc: '请按要求补充或修正材料' },
  { key: 'approved', title: '审核通过', desc: '材料审核通过，请预约核验' },
  { key: 'paid', title: '税费缴纳', desc: '已完成税费缴纳' },
  { key: 'completed', title: '已完成', desc: '登记完成，证件已制作' }
]

const DetailPage: React.FC = () => {
  const [declaration, setDeclaration] = useState<Declaration | null>(null)
  const declarations = useDeclarationsStore((s) => s.declarations)

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const id = (currentPage as any).options?.id || 'dec_001'

    const dec = declarations.find((d) => d.id === id)
    if (dec) {
      setDeclaration(dec)
    } else {
      Taro.showToast({ title: '申报记录不存在', icon: 'none' })
    }
  }, [declarations])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: '#86909c',
      submitted: '#165dff',
      reviewing: '#165dff',
      correction: '#f53f3f',
      approved: '#00b42a',
      paid: '#00b42a',
      completed: '#00b42a',
      rejected: '#f53f3f'
    }
    return colors[status] || '#86909c'
  }

  const getStepStatus = (stepKey: string, currentStatus: string) => {
    const stepIndex = statusSteps.findIndex(s => s.key === stepKey)
    const currentIndex = statusSteps.findIndex(s => s.key === currentStatus)

    if (stepIndex < currentIndex || currentStatus === 'completed') return 'done'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const handleCorrection = () => {
    Taro.showModal({
      title: '补正材料',
      content: '是否前往材料上传页面补充缺失的材料？',
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({ url: '/pages/upload/index' })
        }
      }
    })
  }

  const handleViewTax = () => {
    if (declaration?.id) {
      Taro.navigateTo({ url: `/pages/tax/index?id=${declaration.id}` })
    }
  }

  const handleReschedule = () => {
    Taro.navigateTo({ url: '/pages/appointment/index' })
  }

  const handleContact = () => {
    Taro.makePhoneCall({
      phoneNumber: '12345'
    }).catch(() => {})
  }

  if (!declaration) {
    return (
      <PageContainer padding>
        <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
          <Text style={{ fontSize: '64rpx', display: 'block', marginBottom: '24rpx' }}>📋</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909c' }}>加载中...</Text>
        </View>
      </PageContainer>
    )
  }

  const currentStepIndex = statusSteps.findIndex(s => s.key === declaration.status)

  return (
    <PageContainer scroll padding>
      <View className={styles.headerCard}>
        <View
          className={styles.statusBadge}
          style={{ background: `${getStatusColor(declaration.status)}33` }}
        >
          {declaration.statusText}
        </View>
        <Text className={styles.orderNo}>申报编号：{declaration.orderNo}</Text>
        <Text className={styles.officeName}>{declaration.officeName}</Text>
        <Text className={styles.timeInfo}>
          提交时间：{declaration.createTime}
          {'\n'}
          更新时间：{declaration.updateTime}
        </Text>
      </View>

      {declaration.status === 'correction' && declaration.correctionOpinion && (
        <View className={styles.correctionCard}>
          <Text className={styles.correctionTitle}>
            <Text className={styles.correctionIcon}>⚠️</Text>
            补正意见
          </Text>
          <Text className={styles.correctionContent}>{declaration.correctionOpinion}</Text>
          <Button className={styles.correctionBtn} onClick={handleCorrection}>
            <Text className={styles.btnText}>立即补正材料</Text>
          </Button>
        </View>
      )}

      <View className={styles.statusSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          办理进度
        </Text>
        <View className={styles.timeline}>
          {statusSteps.map((step, index) => {
            const stepStatus = getStepStatus(step.key, declaration.status)
            if (stepStatus === 'pending' && index > currentStepIndex + 1) return null

            return (
              <View key={step.key} className={styles.timelineItem}>
                <View className={`${styles.timelineDot} ${styles[stepStatus]}`} />
                <View className={styles.timelineContent}>
                  <Text className={styles.timelineTitle}>{step.title}</Text>
                  <Text className={styles.timelineTime}>
                    {stepStatus === 'done' && declaration.updateTime}
                    {stepStatus === 'active' && '进行中'}
                    {stepStatus === 'pending' && '待办理'}
                  </Text>
                  <Text className={styles.timelineDesc}>{step.desc}</Text>
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>👤</Text>
          被继承人信息
        </Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>姓名：</Text>
            <Text className={styles.infoValue}>{declaration.decedent.name}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>身份证号：</Text>
            <Text className={styles.infoValue}>{maskIdCard(declaration.decedent.idCard)}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>死亡日期：</Text>
            <Text className={styles.infoValue}>{declaration.decedent.deathDate}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>死亡证明：</Text>
            <Text className={styles.infoValue}>{declaration.decedent.deathProof}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>婚姻状况：</Text>
            <Text className={styles.infoValue}>{declaration.decedent.maritalStatus}</Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>👥</Text>
          继承人信息
        </Text>
        <Text className={styles.subTitle}>继承情形：{declaration.scenarioName}</Text>
        {declaration.heirs.map((heir, index) => (
          <View key={heir.id} className={styles.heirItem}>
            <Text className={styles.heirName}>
              {heir.name}
              {heir.isMain && <Text className={styles.heirTag}>主继承人</Text>}
            </Text>
            <Text className={styles.heirInfo}>
              {heir.relationship} · {maskIdCard(heir.idCard)} · {maskPhone(heir.phone)} · 份额：{heir.share}
            </Text>
          </View>
        ))}
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏠</Text>
          不动产信息
        </Text>
        <View className={styles.infoGrid}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>产权证号：</Text>
            <Text className={styles.infoValue}>{declaration.property.certNumber}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>房屋坐落：</Text>
            <Text className={styles.infoValue}>{declaration.property.address}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>建筑面积：</Text>
            <Text className={styles.infoValue}>{declaration.property.area}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>房屋用途：</Text>
            <Text className={styles.infoValue}>{declaration.property.usage}</Text>
          </View>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>所有权：</Text>
            <Text className={styles.infoValue}>{declaration.property.ownership}</Text>
          </View>
        </View>
      </View>

      <View className={styles.infoSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📁</Text>
          材料清单
        </Text>
        {declaration.materials.map(material => (
          <View key={material.id} className={styles.materialItem}>
            <View className={styles.materialInfo}>
              <Text className={styles.materialName}>
                {material.name}
                {material.required && <Text style={{ color: '#f53f3f', marginLeft: '8rpx' }}>*</Text>}
              </Text>
              <Text className={styles.materialDesc}>{material.description}</Text>
            </View>
            <View className={`${styles.materialStatus} ${material.uploaded ? styles.uploaded : styles.pending}`}>
              <Text className={styles.statusIcon}>
                {material.uploaded ? '✅' : '⏳'}
              </Text>
              <Text>{material.uploaded ? '已上传' : '待上传'}</Text>
            </View>
          </View>
        ))}
      </View>

      {declaration.appointment && (
        <View className={styles.infoSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📅</Text>
            预约核验
          </Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>核验方式：</Text>
              <Text className={styles.infoValue}>
                {declaration.appointment.type === 'onsite' ? '现场核验' : '上门核验'}
              </Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>预约日期：</Text>
              <Text className={styles.infoValue}>{declaration.appointment.date}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>预约时段：</Text>
              <Text className={styles.infoValue}>{declaration.appointment.timeSlot}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>核验地址：</Text>
              <Text className={styles.infoValue}>{declaration.appointment.address}</Text>
            </View>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>联系人：</Text>
              <Text className={styles.infoValue}>
                {declaration.appointment.contact}（{maskPhone(declaration.appointment.contactPhone)}）
              </Text>
            </View>
          </View>
        </View>
      )}

      {declaration.tax && (
        <View className={styles.actionSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💰</Text>
            税费信息
          </Text>
          <View className={styles.actionGrid}>
            <View className={styles.actionItem} onClick={handleViewTax}>
              <Text className={styles.actionIcon}>💳</Text>
              <Text className={styles.actionText}>
                {declaration.tax.paid ? '已缴纳' : '去缴费'}
              </Text>
              <Text className={styles.actionDesc}>
                应缴：¥{declaration.tax.totalAmount.toLocaleString()}
              </Text>
            </View>
            <View className={styles.actionItem}>
              <Text className={styles.actionIcon}>📄</Text>
              <Text className={styles.actionText}>缴费凭证</Text>
              <Text className={styles.actionDesc}>查看电子票据</Text>
            </View>
          </View>
        </View>
      )}

      {declaration.pickup && (
        <View className={styles.infoSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📦</Text>
            取证信息
          </Text>
          <View className={styles.infoGrid}>
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>取证方式：</Text>
              <Text className={styles.infoValue}>
                {declaration.pickup.type === 'self' ? '现场取证' : '邮寄送达'}
              </Text>
            </View>
            {declaration.pickup.type === 'self' && declaration.pickup.date && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>取证日期：</Text>
                <Text className={styles.infoValue}>{declaration.pickup.date}</Text>
              </View>
            )}
            {declaration.pickup.address && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>
                  {declaration.pickup.type === 'self' ? '取证地址：' : '邮寄地址：'}
                </Text>
                <Text className={styles.infoValue}>{declaration.pickup.address}</Text>
              </View>
            )}
            {declaration.pickup.receiver && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>收件人：</Text>
                <Text className={styles.infoValue}>
                  {declaration.pickup.receiver}（{maskPhone(declaration.pickup.receiverPhone || '')}）
                </Text>
              </View>
            )}
            {declaration.pickup.trackingNo && (
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>快递单号：</Text>
                <Text className={styles.infoValue}>{declaration.pickup.trackingNo}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      <View className={styles.actionSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🛠️</Text>
          更多操作
        </Text>
        <View className={styles.actionGrid}>
          <View className={styles.actionItem} onClick={handleContact}>
            <Text className={styles.actionIcon}>📞</Text>
            <Text className={styles.actionText}>联系客服</Text>
            <Text className={styles.actionDesc}>12345</Text>
          </View>
          <View className={styles.actionItem} onClick={handleReschedule}>
            <Text className={styles.actionIcon}>📅</Text>
            <Text className={styles.actionText}>更改预约</Text>
            <Text className={styles.actionDesc}>修改核验时间</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={() => Taro.navigateBack()}>
          <Text className={styles.secondaryBtnText}>返回</Text>
        </Button>
        {declaration.status === 'correction' && (
          <Button className={styles.primaryBtn} onClick={handleCorrection}>
            <Text className={styles.primaryBtnText}>补正材料</Text>
          </Button>
        )}
        {declaration.tax && !declaration.tax.paid && (
          <Button className={styles.primaryBtn} onClick={handleViewTax}>
            <Text className={styles.primaryBtnText}>去缴费</Text>
          </Button>
        )}
        {(declaration.status === 'completed' || declaration.status === 'paid') && (
          <Button className={styles.primaryBtn}>
            <Text className={styles.primaryBtnText}>查看电子证</Text>
          </Button>
        )}
      </View>
    </PageContainer>
  )
}

export default DetailPage
