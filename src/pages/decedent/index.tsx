import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclareStore } from '@/store/declare'
import { validateIdCard, validateDate } from '@/utils/validator'
import type { DecedentInfo } from '@/types'
import styles from './index.module.scss'

const maritalStatusOptions = ['未婚', '已婚', '离异', '丧偶', '其他']
const deathProofOptions = ['医院死亡证明', '公安机关注销户口证明', '法院宣告死亡判决书', '其他死亡证明']

const DecedentPage: React.FC = () => {
  const [form, setForm] = useState<DecedentInfo>({
    name: '',
    idCard: '',
    deathDate: '',
    deathProof: '',
    maritalStatus: ''
  })

  const { setDecedent, decedent: storeDecedent } = useDeclareStore()

  useEffect(() => {
    if (storeDecedent) {
      setForm(storeDecedent)
    }
  }, [])

  const handleInput = (field: keyof DecedentInfo, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleDateSelect = () => {
    Taro.showActionSheet({
      itemList: [
        '2024-01-01', '2023-12-01', '2023-11-01',
        '2023-10-01', '2023-09-01', '2023-08-01'
      ],
      success: (res) => {
        const dates = ['2024-01-01', '2023-12-01', '2023-11-01', '2023-10-01', '2023-09-01', '2023-08-01']
        handleInput('deathDate', dates[res.tapIndex])
      }
    })
  }

  const handleMaritalSelect = () => {
    Taro.showActionSheet({
      itemList: maritalStatusOptions,
      success: (res) => {
        handleInput('maritalStatus', maritalStatusOptions[res.tapIndex])
      }
    })
  }

  const handleDeathProofSelect = () => {
    Taro.showActionSheet({
      itemList: deathProofOptions,
      success: (res) => {
        handleInput('deathProof', deathProofOptions[res.tapIndex])
      }
    })
  }

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      Taro.showToast({ title: '请输入姓名', icon: 'none' })
      return false
    }
    if (!form.idCard.trim()) {
      Taro.showToast({ title: '请输入身份证号', icon: 'none' })
      return false
    }
    if (!validateIdCard(form.idCard)) {
      Taro.showToast({ title: '身份证号格式不正确', icon: 'none' })
      return false
    }
    if (!form.deathDate) {
      Taro.showToast({ title: '请选择死亡日期', icon: 'none' })
      return false
    }
    if (!form.deathProof) {
      Taro.showToast({ title: '请选择死亡证明类型', icon: 'none' })
      return false
    }
    if (!form.maritalStatus) {
      Taro.showToast({ title: '请选择婚姻状况', icon: 'none' })
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validateForm()) return

    setDecedent(form)
    console.log('[DecedentPage] 保存被继承人信息:', form)
    Taro.showToast({
      title: '信息已保存',
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
      <View className={styles.formCard}>
        <Text className={styles.formTitle}>被继承人基本信息</Text>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>姓名</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入被继承人姓名"
              placeholderClass={styles.inputPlaceholder}
              value={form.name}
              onInput={(e) => handleInput('name', e.detail.value)}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>身份证号码</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入18位身份证号码"
              placeholderClass={styles.inputPlaceholder}
              value={form.idCard}
              maxlength={18}
              onInput={(e) => handleInput('idCard', e.detail.value.toUpperCase())}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>死亡日期</Text>
          </View>
          <View className={styles.formInput} onClick={handleDateSelect}>
            <Text className={form.deathDate ? styles.inputField : styles.inputPlaceholder}>
              {form.deathDate || '请选择死亡日期'}
            </Text>
            <Text className={styles.inputArrow}>▼</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>死亡证明类型</Text>
          </View>
          <View className={styles.formInput} onClick={handleDeathProofSelect}>
            <Text className={form.deathProof ? styles.inputField : styles.inputPlaceholder}>
              {form.deathProof || '请选择死亡证明类型'}
            </Text>
            <Text className={styles.inputArrow}>▼</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>婚姻状况</Text>
          </View>
          <View className={styles.formInput} onClick={handleMaritalSelect}>
            <Text className={form.maritalStatus ? styles.inputField : styles.inputPlaceholder}>
              {form.maritalStatus || '请选择婚姻状况'}
            </Text>
            <Text className={styles.inputArrow}>▼</Text>
          </View>
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

export default DecedentPage
