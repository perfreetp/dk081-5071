import React, { useState, useEffect } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclarationsStore } from '@/store/declarations'
import type { Declaration } from '@/types'
import styles from './index.module.scss'

const paymentMethods = [
  { id: 'wechat', name: '微信支付', desc: '推荐使用，支持信用卡', icon: '💚' },
  { id: 'alipay', name: '支付宝', desc: '支持花呗、余额宝', icon: '💙' },
  { id: 'bank', name: '银行卡支付', desc: '支持储蓄卡和信用卡', icon: '💳' }
]

const TaxPage: React.FC = () => {
  const [declaration, setDeclaration] = useState<Declaration | null>(null)
  const [selectedMethod, setSelectedMethod] = useState('wechat')
  const [showSuccess, setShowSuccess] = useState(false)
  const declarations = useDeclarationsStore((s) => s.declarations)

  useEffect(() => {
    const pages = Taro.getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const id = (currentPage as any).options?.id || 'dec_003'

    const dec = declarations.find((d) => d.id === id)
    if (dec) {
      setDeclaration(dec)
    } else {
      Taro.showToast({ title: '申报记录不存在', icon: 'none' })
    }
  }, [declarations])

  const handlePay = () => {
    if (!declaration?.tax || declaration.tax.paid) return

    Taro.showModal({
      title: '确认缴费',
      content: `您即将缴纳税费共计 ¥${declaration.tax.totalAmount.toLocaleString()}，请确认支付。`,
      success: (res) => {
        if (res.confirm) {
          Taro.showLoading({ title: '支付中...' })
          setTimeout(() => {
            Taro.hideLoading()
            setShowSuccess(true)
          }, 2000)
        }
      }
    })
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    Taro.navigateBack()
  }

  const handleDownloadVoucher = () => {
    Taro.showToast({ title: '电子票据已发送至消息中心', icon: 'none' })
  }

  if (!declaration || !declaration.tax) {
    return (
      <PageContainer padding>
        <View style={{ textAlign: 'center', padding: '100rpx 0' }}>
          <Text style={{ fontSize: '64rpx', display: 'block', marginBottom: '24rpx' }}>💰</Text>
          <Text style={{ fontSize: '28rpx', color: '#86909c' }}>暂无税费信息</Text>
        </View>
      </PageContainer>
    )
  }

  const tax = declaration.tax

  return (
    <PageContainer scroll padding>
      <View className={styles.headerCard}>
        <Text className={styles.headerTitle}>应缴税费合计</Text>
        <View className={styles.totalAmount}>
          <Text className={styles.currency}>¥</Text>
          {tax.totalAmount.toLocaleString()}
        </View>
        <View
          className={`${styles.statusBadge} ${tax.paid ? styles.paid : styles.pending}`}
        >
          {tax.paid ? '已缴纳' : '待缴纳'}
        </View>
        {!tax.paid && (
          <Text className={styles.deadline}>
            请于 {tax.payDeadline} 前完成缴纳，逾期将产生滞纳金
          </Text>
        )}
      </View>

      <View className={styles.taxListSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📋</Text>
          税费明细
        </Text>
        {tax.items.map((item, index) => (
          <View key={index} className={styles.taxItem}>
            <View className={styles.taxInfo}>
              <Text className={styles.taxName}>{item.name}</Text>
              <Text className={styles.taxDesc}>
                {item.name === '契税' ? '按房屋评估价格的1%-3%征收' : '按件征收'}
              </Text>
            </View>
            <Text className={styles.taxAmount}>¥{item.amount.toLocaleString()}</Text>
          </View>
        ))}
        <View className={styles.totalRow}>
          <Text className={styles.totalLabel}>合计</Text>
          <Text className={styles.totalValue}>¥{tax.totalAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View className={styles.propertySection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏠</Text>
          计税房屋信息
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
        </View>
      </View>

      {!tax.paid && (
        <View className={styles.paymentSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💳</Text>
            选择支付方式
          </Text>
          <View className={styles.paymentMethods}>
            {paymentMethods.map(method => (
              <View
                key={method.id}
                className={`${styles.paymentMethod} ${selectedMethod === method.id ? styles.selected : ''}`}
                onClick={() => setSelectedMethod(method.id)}
              >
                <Text className={styles.methodIcon}>{method.icon}</Text>
                <View className={styles.methodInfo}>
                  <Text className={styles.methodName}>{method.name}</Text>
                  <Text className={styles.methodDesc}>{method.desc}</Text>
                </View>
                <View
                  className={`${styles.methodRadio} ${selectedMethod === method.id ? styles.selected : ''}`}
                />
              </View>
            ))}
          </View>
        </View>
      )}

      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text>温馨提示</Text>
        </View>
        <Text className={styles.tipContent}>
          1. 继承不动产登记免征增值税、个人所得税{'\n'}
          2. 契税按房屋评估价格的1%-3%征收，具体税率由当地政策确定{'\n'}
          3. 印花税按件征收，每件5元{'\n'}
          4. 缴费完成后将生成电子票据，可在消息中心查看
        </Text>
      </View>

      {tax.paid && (
        <View className={styles.voucherSection}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📄</Text>
            缴费凭证
          </Text>
          <View className={styles.voucherInfo}>
            <View className={styles.voucherRow}>
              <Text className={styles.voucherLabel}>缴费时间：</Text>
              <Text className={styles.voucherValue}>{declaration.updateTime}</Text>
            </View>
            <View className={styles.voucherRow}>
              <Text className={styles.voucherLabel}>交易流水号：</Text>
              <Text className={styles.voucherValue}>TXN{Date.now()}</Text>
            </View>
            <View className={styles.voucherRow}>
              <Text className={styles.voucherLabel}>支付方式：</Text>
              <Text className={styles.voucherValue}>微信支付</Text>
            </View>
            <View className={styles.voucherRow}>
              <Text className={styles.voucherLabel}>票据状态：</Text>
              <Text className={styles.voucherValue} style={{ color: '#00b42a' }}>已开具</Text>
            </View>
          </View>
          <Button className={styles.voucherAction} onClick={handleDownloadVoucher}>
            <Text className={styles.actionIcon}>📥</Text>
            <Text className={styles.actionText}>查看电子票据</Text>
          </Button>
        </View>
      )}

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.secondaryBtn} onClick={() => Taro.navigateBack()}>
          <Text className={styles.secondaryBtnText}>返回</Text>
        </Button>
        {!tax.paid && (
          <Button
            className={styles.payBtn}
            onClick={handlePay}
            disabled={!selectedMethod}
          >
            <Text className={styles.payBtnText}>
              立即支付 ¥{tax.totalAmount.toLocaleString()}
            </Text>
          </Button>
        )}
      </View>

      {showSuccess && (
        <View className={styles.successOverlay}>
          <View className={styles.successCard}>
            <View className={styles.successIcon}>
              <Text className={styles.iconText}>✓</Text>
            </View>
            <Text className={styles.successTitle}>缴费成功！</Text>
            <Text className={styles.successDesc}>
              您已成功缴纳税费共计 ¥{tax.totalAmount.toLocaleString()}
              {'\n'}
              电子票据已发送至消息中心，请注意查收
            </Text>
            <Button className={styles.successBtn} onClick={handleSuccessClose}>
              <Text className={styles.btnText}>完成</Text>
            </Button>
          </View>
        </View>
      )}
    </PageContainer>
  )
}

export default TaxPage
