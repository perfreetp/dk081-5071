import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclarationsStore } from '@/store/declarations'
import { maskIdCard, maskPhone } from '@/utils/validator'
import type { Declaration, TimelineNode } from '@/types'
import styles from './index.module.scss'

const DetailPage: React.FC = () => {
  const [declaration, setDeclaration] = useState<Declaration | null>(null)
  const declarations = useDeclarationsStore((s) => s.declarations)
  const updateDeclaration = useDeclarationsStore((s) => s.updateDeclaration)

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

  const timeline = useMemo<TimelineNode[]>(() => {
    if (!declaration) return []
    if (declaration.timeline && declaration.timeline.length > 0) {
      return declaration.timeline
    }
    // fallback to legacy statusSteps
    const defaultNodes: TimelineNode[] = []
    const order: Declaration['status'][] = ['submitted', 'reviewing', 'correction', 'approved', 'paid', 'completed']
    const labels: Record<string, { title: string; desc: string }> = {
      submitted: { title: '已提交申报', desc: '申报已成功提交' },
      accepted: { title: '已受理', desc: '登记机构已受理' },
      reviewing: { title: '材料审核中', desc: '工作人员正在审核您的材料' },
      correction: { title: '待补正材料', desc: '请按要求补充或修正材料' },
      approved: { title: '审核通过', desc: '材料审核通过' },
      paid: { title: '待取证/邮寄', desc: '税费已缴纳' },
      completed: { title: '登记完成', desc: '证件已制作发放' }
    }
    const curIdx = order.indexOf(declaration.status)
    order.forEach((s, idx) => {
      if (idx === 0 && curIdx >= 0) {
        defaultNodes.push({
          key: 'submitted',
          title: labels.submitted.title,
          desc: labels.submitted.desc,
          time: declaration.createTime,
          status: curIdx >= 0 ? 'done' : 'pending'
        })
        defaultNodes.push({
          key: 'accepted',
          title: labels.accepted.title,
          desc: labels.accepted.desc,
          time: declaration.createTime,
          status: curIdx >= 1 ? 'done' : 'active'
        })
      }
      if (idx === 0) return
      const label = labels[s] || { title: s, desc: '' }
      if (idx > curIdx + 2) return
      defaultNodes.push({
        key: s,
        title: label.title,
        desc: label.desc,
        time: declaration.updateTime,
        status: idx < curIdx ? 'done' : idx === curIdx ? 'active' : 'pending'
      })
    })
    return defaultNodes
  }, [declaration])

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

  const correctionMaterials = useMemo(() => {
    if (!declaration?.correctionMaterials) return []
    return declaration.materials.filter((m) =>
      declaration.correctionMaterials!.includes(m.id)
    )
  }, [declaration])

  const handleCorrection = () => {
    if (!declaration) return
    Taro.showModal({
      title: '补正材料',
      content: `共需补正 ${correctionMaterials.length} 份材料，确认前往上传页面补传？`,
      success: (res) => {
        if (res.confirm) {
          Taro.navigateTo({ url: '/pages/upload/index?correction=1' })
        }
      }
    })
  }

  const handleSubmitCorrection = () => {
    if (!declaration) return
    // check required correction materials uploaded
    const allUploaded = correctionMaterials.every((m) => m.uploaded)
    if (!allUploaded) {
      Taro.showToast({ title: '请先完成全部补正材料上传', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '提交补正材料',
      content: '确认提交您补正的材料？提交后将重新进入审核流程。',
      success: (res) => {
        if (res.confirm && declaration) {
          const now = new Date()
          const pad = (n: number) => String(n).padStart(2, '0')
          const submitTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

          const newTimeline: TimelineNode[] = [
            ...(declaration.timeline || []).map((n) => {
              if (n.key === 'correction') return { ...n, status: 'done' as const }
              return n
            }),
            {
              key: 'correctionSubmitted',
              title: '补正材料已提交',
              desc: '补正材料已重新提交，等待复审',
              time: submitTime,
              status: 'active'
            },
            {
              key: 'reviewing',
              title: '材料复审中',
              desc: '工作人员正在复审您补正后的材料',
              time: submitTime,
              status: 'pending'
            }
          ]

          updateDeclaration(declaration.id, {
            status: 'reviewing',
            statusText: '复审中',
            correctionSubmitted: true,
            correctionSubmitTime: submitTime,
            timeline: newTimeline,
            updateTime: submitTime
          })

          Taro.showToast({ title: '补正材料已提交', icon: 'success', duration: 1500 })
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

      {declaration.status === 'correction' && (
        <View className={styles.correctionCard}>
          <Text className={styles.correctionTitle}>
            <Text className={styles.correctionIcon}>⚠️</Text>
            补正意见
          </Text>
          <Text className={styles.correctionContent}>{declaration.correctionOpinion}</Text>

          {correctionMaterials.length > 0 && (
            <View style={{ marginTop: '24rpx' }}>
              <Text className={styles.correctionSubtitle}>需补正材料清单：</Text>
              <View style={{ marginTop: '16rpx' }}>
                {correctionMaterials.map((m, idx) => (
                  <View key={m.id} className={styles.correctionMaterialItem}>
                    <Text className={styles.correctionMaterialIdx}>{idx + 1}.</Text>
                    <View style={{ flex: 1 }}>
                      <Text className={styles.correctionMaterialName}>
                        {m.name}
                        <Text style={{ color: '#f53f3f', marginLeft: '8rpx' }}>*</Text>
                      </Text>
                      <Text className={styles.correctionMaterialDesc}>{m.description}</Text>
                    </View>
                    <Text
                      className={`${styles.correctionMaterialStatus} ${m.uploaded ? styles.correctionMaterialUploaded : ''}`}
                    >
                      {m.uploaded ? '已上传' : '待补传'}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {!declaration.correctionSubmitted ? (
            <View style={{ display: 'flex', gap: '24rpx', marginTop: '32rpx' }}>
              <Button className={styles.correctionBtn} onClick={handleCorrection}>
                <Text className={styles.btnText}>去补传材料</Text>
              </Button>
              <Button
                className={styles.correctionSubmitBtn}
                onClick={handleSubmitCorrection}
              >
                <Text className={styles.btnText}>提交补正</Text>
              </Button>
            </View>
          ) : (
            <View className={styles.correctionSubmittedBar}>
              <Text style={{ color: '#00b42a', fontSize: '28rpx', fontWeight: 500 }}>
                ✅ 补正材料已于 {declaration.correctionSubmitTime} 提交，等待工作人员复审
              </Text>
            </View>
          )}
        </View>
      )}

      <View className={styles.statusSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          办理轨迹
        </Text>
        <View className={styles.timeline}>
          {timeline.map((node, index) => (
            <View key={`${node.key}-${index}`} className={styles.timelineItem}>
              <View
                className={`${styles.timelineDot} ${styles[node.status]}`}
              />
              <View className={styles.timelineContent}>
                <View className={styles.timelineHeader}>
                  <Text
                    className={styles.timelineTitle}
                    style={{
                      color:
                        node.status === 'active'
                          ? '#165dff'
                          : node.status === 'done'
                          ? '#1d2129'
                          : '#86909c',
                      fontWeight: node.status === 'active' ? 600 : 500
                    }}
                  >
                    {node.title}
                    {node.status === 'active' && (
                      <Text style={{ marginLeft: '16rpx', fontSize: '22rpx', color: '#165dff', fontWeight: 500 }}>
                        [当前]
                      </Text>
                    )}
                  </Text>
                  <Text className={styles.timelineTime}>
                    {node.status === 'pending' ? '待办理' : node.time}
                  </Text>
                </View>
                {node.desc && (
                  <Text className={styles.timelineDesc}>{node.desc}</Text>
                )}
              </View>
            </View>
          ))}
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
        {declaration.heirs.map((heir) => (
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
            <Text className={styles.infoValue}>
              {declaration.property.certNumber || '待人工核验'}
            </Text>
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
            <Text className={styles.infoValue}>
              {declaration.property.ownership}
              {declaration.property.pendingManualVerify && (
                <Text style={{ color: '#ff7d00', marginLeft: '12rpx', fontSize: '24rpx' }}>（待人工核验）</Text>
              )}
            </Text>
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
                {declaration.correctionMaterials?.includes(material.id) && (
                  <Text style={{
                    color: '#f53f3f',
                    fontSize: '22rpx',
                    marginLeft: '12rpx',
                    background: 'rgba(245,63,63,0.1)',
                    padding: '4rpx 12rpx',
                    borderRadius: '8rpx'
                  }}>
                    需补正
                  </Text>
                )}
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
        {declaration.status === 'correction' && !declaration.correctionSubmitted && (
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
