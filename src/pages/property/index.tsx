import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclareStore } from '@/store/declare'
import { validateCertNumber } from '@/utils/validator'
import type { PropertyInfo } from '@/types'
import styles from './index.module.scss'

const usageOptions = ['住宅', '商业', '办公', '工业', '其他']
const ownershipOptions = ['单独所有', '共同共有', '按份共有']

const mockPropertyData: Record<string, PropertyInfo> = {
  '京(2023)朝不动产权第001234号': {
    certNumber: '京(2023)朝不动产权第001234号',
    address: '北京市朝阳区建国路88号SOHO现代城A座1201室',
    area: '128.56',
    usage: '住宅',
    ownership: '单独所有',
    verified: true
  },
  '沪(2022)浦不动产权第123456号': {
    certNumber: '沪(2022)浦不动产权第123456号',
    address: '上海市浦东新区陆家嘴环路1000号恒生银行大厦2801室',
    area: '256.80',
    usage: '办公',
    ownership: '共同共有',
    verified: true
  },
  '粤(2021)穗不动产权第654321号': {
    certNumber: '粤(2021)穗不动产权第654321号',
    address: '广东省广州市天河区珠江新城华夏路10号富力中心3502室',
    area: '189.35',
    usage: '商业',
    ownership: '按份共有',
    verified: true
  }
}

const PropertyPage: React.FC = () => {
  const { property, setProperty } = useDeclareStore()
  const [form, setForm] = useState<PropertyInfo>({
    certNumber: '',
    address: '',
    area: '',
    usage: '',
    ownership: '',
    verified: false
  })
  const [isVerifying, setIsVerifying] = useState(false)
  const [showVerified, setShowVerified] = useState(false)

  useEffect(() => {
    if (property) {
      setForm(property)
      setShowVerified(property.verified)
    }
  }, [])

  const handleInput = (field: keyof PropertyInfo, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }))
    if (field === 'certNumber') {
      setShowVerified(false)
      setForm(prev => ({ ...prev, verified: false, pendingManualVerify: false }))
    }
  }

  const handleUsageSelect = () => {
    Taro.showActionSheet({
      itemList: usageOptions,
      success: (res) => {
        handleInput('usage', usageOptions[res.tapIndex])
      }
    })
  }

  const handleOwnershipSelect = () => {
    Taro.showActionSheet({
      itemList: ownershipOptions,
      success: (res) => {
        handleInput('ownership', ownershipOptions[res.tapIndex])
      }
    })
  }

  const handleVerify = async () => {
    if (!form.certNumber.trim()) {
      Taro.showToast({ title: '请输入不动产权证号', icon: 'none' })
      return
    }

    if (!validateCertNumber(form.certNumber)) {
      Taro.showToast({ title: '证号格式不正确', icon: 'none' })
      return
    }

    setIsVerifying(true)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const mockData = mockPropertyData[form.certNumber]
    if (mockData) {
      setForm({ ...mockData, verified: true, pendingManualVerify: false })
      setShowVerified(true)
      Taro.showToast({ title: '信息校验通过', icon: 'success' })
    } else {
      Taro.showModal({
        title: '未查询到信息',
        content: '未在系统中查询到该证号信息。您可手动填写不动产信息后继续申报，该信息将在原件核验环节进行人工核验。',
        confirmText: '手动填写',
        cancelText: '重新输入',
        success: (res) => {
          if (res.confirm) {
            setForm(prev => ({ ...prev, verified: false, pendingManualVerify: true }))
            Taro.showToast({ title: '请补充填写不动产信息', icon: 'none' })
          }
        }
      })
    }

    setIsVerifying(false)
  }

  const handleFillExample = () => {
    const examples = Object.keys(mockPropertyData)
    Taro.showActionSheet({
      itemList: examples,
      success: (res) => {
        const certNumber = examples[res.tapIndex]
        handleInput('certNumber', certNumber)
      }
    })
  }

  const validateForm = (): boolean => {
    if (!form.certNumber.trim()) {
      Taro.showToast({ title: '请输入不动产权证号', icon: 'none' })
      return false
    }
    if (!form.address.trim()) {
      Taro.showToast({ title: '请输入房屋坐落地址', icon: 'none' })
      return false
    }
    if (!form.area.trim()) {
      Taro.showToast({ title: '请输入建筑面积', icon: 'none' })
      return false
    }
    if (!form.usage) {
      Taro.showToast({ title: '请选择房屋用途', icon: 'none' })
      return false
    }
    if (!form.ownership) {
      Taro.showToast({ title: '请选择所有权性质', icon: 'none' })
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validateForm()) return

    const dataToSave: PropertyInfo = {
      ...form,
      verified: form.verified,
      pendingManualVerify: !form.verified ? true : !!form.pendingManualVerify
    }
    setProperty(dataToSave)
    console.log('[PropertyPage] 保存不动产信息:', dataToSave)
    Taro.showToast({
      title: form.verified ? '信息已保存' : '已保存（待人工核验）',
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
      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>⚠️</Text>
          <Text>重要提示</Text>
        </View>
        <Text className={styles.tipContent}>
          请准确填写不动产权证号，系统将自动校验并回填不动产基础信息。{'\n'}
          如证号校验不通过，可手动填写不动产信息。
        </Text>
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>不动产权证号</Text>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>不动产权证号</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入不动产权证号"
              placeholderClass={styles.inputPlaceholder}
              value={form.certNumber}
              maxlength={30}
              onInput={(e) => handleInput('certNumber', e.detail.value)}
            />
          </View>
          <View className={styles.verifySection}>
            <Button
              className={styles.verifyBtn}
              onClick={handleVerify}
              disabled={isVerifying}
            >
              <Text className={styles.verifyBtnText}>
                {isVerifying ? '校验中...' : '立即校验'}
              </Text>
            </Button>
            <Button className={styles.verifyBtnSecondary} onClick={handleFillExample}>
              <Text className={styles.verifyBtnText}>填入示例</Text>
            </Button>
          </View>
        </View>

        {isVerifying && (
          <View className={styles.loading}>
            <View className={styles.loadingSpinner} />
            <Text className={styles.loadingText}>正在校验不动产信息...</Text>
          </View>
        )}

        {showVerified && (
          <View className={styles.infoDisplay}>
            <View className={styles.infoHeader}>
              <Text className={styles.infoIcon}>✅</Text>
              <Text className={styles.infoTitle}>信息校验通过</Text>
              <Text className={styles.infoStatus}>已核验</Text>
            </View>
            <View className={styles.infoGrid}>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>房屋坐落：</Text>
                <Text className={styles.infoValue}>{form.address}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>建筑面积：</Text>
                <Text className={styles.infoValue}>{form.area} ㎡</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>房屋用途：</Text>
                <Text className={styles.infoValue}>{form.usage}</Text>
              </View>
              <View className={styles.infoRow}>
                <Text className={styles.infoLabel}>所有权性质：</Text>
                <Text className={styles.infoValue}>{form.ownership}</Text>
              </View>
            </View>
          </View>
        )}

        {form.pendingManualVerify && !showVerified && (
          <View
            className={styles.infoDisplay}
            style={{ background: 'rgba(255, 125, 0, 0.08)' }}
          >
            <View className={styles.infoHeader}>
              <Text className={styles.infoIcon}>⏳</Text>
              <Text className={styles.infoTitle}>待人工核验</Text>
              <Text
                className={styles.infoStatus}
                style={{ color: '#FF7D00', background: '#FFF3E8' }}
              >
                待核验
              </Text>
            </View>
            <Text style={{ fontSize: '24rpx', color: '#4e5969', lineHeight: 1.6 }}>
              该证号未在系统中查询到，请补充填写下方不动产信息。信息将在原件核验环节由工作人员人工核验，不影响您继续申报。
            </Text>
          </View>
        )}
      </View>

      <View className={styles.formCard}>
        <Text className={styles.formTitle}>手动补充信息</Text>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>房屋坐落地址</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入房屋详细地址"
              placeholderClass={styles.inputPlaceholder}
              value={form.address}
              onInput={(e) => handleInput('address', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>建筑面积（㎡）</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入建筑面积，如：128.56"
              placeholderClass={styles.inputPlaceholder}
              value={form.area}
              type="digit"
              onInput={(e) => handleInput('area', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>房屋用途</Text>
          </View>
          <View className={styles.formInput} onClick={handleUsageSelect}>
            <Text className={form.usage ? styles.inputField : styles.inputPlaceholder}>
              {form.usage || '请选择房屋用途'}
            </Text>
            <Text className={styles.inputArrow}>▼</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>所有权性质</Text>
          </View>
          <View className={styles.formInput} onClick={handleOwnershipSelect}>
            <Text className={form.ownership ? styles.inputField : styles.inputPlaceholder}>
              {form.ownership || '请选择所有权性质'}
            </Text>
            <Text className={styles.inputArrow}>▼</Text>
          </View>
        </View>
      </View>

      <View className={styles.exampleCard}>
        <Text className={styles.exampleTitle}>证号格式说明：</Text>
        <View className={styles.exampleList}>
          <Text>• 不动产权证：京(2023)朝不动产权第001234号{'\n'}</Text>
          <Text>• 房屋所有权证：京房权证朝字第123456号{'\n'}</Text>
          <Text>• 首次字符为省/直辖市简称，如京、沪、粤、浙等</Text>
        </View>
      </View>

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          <Text className={styles.cancelBtnText}>取消</Text>
        </Button>
        <Button className={styles.saveBtn} onClick={handleSave}>
          <Text className={styles.saveBtnText}>保存信息</Text>
        </Button>
      </View>
    </PageContainer>
  )
}

export default PropertyPage
