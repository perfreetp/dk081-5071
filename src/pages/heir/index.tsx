import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button, Switch } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclareStore } from '@/store/declare'
import { validateIdCard, validatePhone } from '@/utils/validator'
import type { HeirInfo } from '@/types'
import styles from './index.module.scss'

const relationshipOptions = ['配偶', '子女', '父母', '兄弟姐妹', '祖父母', '外祖父母', '其他']
const shareOptions = ['均等分配', '1/2', '1/3', '1/4', '1/5', '自定义']

const HeirPage: React.FC = () => {
  const { heirs, addHeir, removeHeir, updateHeir } = useDeclareStore()
  const [forms, setForms] = useState<HeirInfo[]>([])

  useEffect(() => {
    if (heirs.length > 0) {
      setForms(heirs)
    } else {
      addNewHeir()
    }
  }, [])

  const addNewHeir = () => {
    const newHeir: HeirInfo = {
      id: Date.now().toString(),
      name: '',
      idCard: '',
      phone: '',
      relationship: '',
      share: '',
      isMain: forms.length === 0
    }
    setForms(prev => [...prev, newHeir])
  }

  const handleInput = (index: number, field: keyof HeirInfo, value: string | boolean) => {
    setForms(prev => {
      if (field === 'isMain' && value === true) {
        const targetId = prev[index].id
        return prev.map(f => ({ ...f, isMain: f.id === targetId }))
      }
      if (field === 'isMain' && value === false) {
        return prev.map((form, i) => (i === index ? { ...form, isMain: false } : form))
      }
      return prev.map((form, i) => (i === index ? { ...form, [field]: value } : form))
    })
  }

  const handleRelationshipSelect = (index: number) => {
    Taro.showActionSheet({
      itemList: relationshipOptions,
      success: (res) => {
        handleInput(index, 'relationship', relationshipOptions[res.tapIndex])
      }
    })
  }

  const handleShareSelect = (index: number) => {
    Taro.showActionSheet({
      itemList: shareOptions,
      success: (res) => {
        const selected = shareOptions[res.tapIndex]
        if (selected === '自定义') {
          Taro.showModal({
            title: '自定义份额',
            editable: true,
            placeholderText: '请输入份额，如：1/6 或 20%',
            success: (modalRes) => {
              if (modalRes.confirm && modalRes.content) {
                handleInput(index, 'share', modalRes.content)
              }
            }
          })
        } else {
          handleInput(index, 'share', selected)
        }
      }
    })
  }

  const handleDelete = (index: number) => {
    if (forms.length <= 1) {
      Taro.showToast({ title: '至少需保留一位继承人', icon: 'none' })
      return
    }
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除该继承人信息吗？',
      success: (res) => {
        if (res.confirm) {
          const id = forms[index].id
          setForms(prev => prev.filter((_, i) => i !== index))
          removeHeir(id)
        }
      }
    })
  }

  const validateForms = (): boolean => {
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i]
      if (!form.name.trim()) {
        Taro.showToast({ title: `请输入第${i + 1}位继承人姓名`, icon: 'none' })
        return false
      }
      if (!form.idCard.trim()) {
        Taro.showToast({ title: `请输入第${i + 1}位继承人身份证号`, icon: 'none' })
        return false
      }
      if (!validateIdCard(form.idCard)) {
        Taro.showToast({ title: `第${i + 1}位继承人身份证号格式不正确`, icon: 'none' })
        return false
      }
      if (!form.phone.trim()) {
        Taro.showToast({ title: `请输入第${i + 1}位继承人手机号`, icon: 'none' })
        return false
      }
      if (!validatePhone(form.phone)) {
        Taro.showToast({ title: `第${i + 1}位继承人手机号格式不正确`, icon: 'none' })
        return false
      }
      if (!form.relationship) {
        Taro.showToast({ title: `请选择第${i + 1}位继承人与被继承人关系`, icon: 'none' })
        return false
      }
      if (!form.share) {
        Taro.showToast({ title: `请选择第${i + 1}位继承人继承份额`, icon: 'none' })
        return false
      }
    }

    const hasMain = forms.some(f => f.isMain)
    if (!hasMain) {
      Taro.showToast({ title: '请指定一位主继承人', icon: 'none' })
      return false
    }

    return true
  }

  const handleSave = () => {
    if (!validateForms()) return

    forms.forEach(heir => {
      const existing = heirs.find(h => h.id === heir.id)
      if (existing) {
        updateHeir(heir.id, heir)
      } else {
        addHeir(heir)
      }
    })

    heirs.filter(h => !forms.find(f => f.id === h.id)).forEach(h => {
      removeHeir(h.id)
    })

    console.log('[HeirPage] 保存继承人信息:', forms)
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
      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text>温馨提示</Text>
        </View>
        <Text className={styles.tipContent}>
          1. 请填写所有继承人的真实信息，包括配偶、子女、父母等第一顺序继承人{'\n'}
          2. 需指定一位主继承人，用于接收通知和联系{'\n'}
          3. 继承份额可选择均等分配或自定义
        </Text>
      </View>

      {forms.map((form, index) => (
        <View key={form.id}>
          {index > 0 && <View className={styles.divider} />}
          <View className={styles.formCard}>
            <View className={styles.cardHeader}>
              <Text className={styles.cardTitle}>继承人信息</Text>
              <View style={{ display: 'flex', alignItems: 'center', gap: '16rpx' }}>
                <Text className={styles.heirIndex}>第{index + 1}位</Text>
                {forms.length > 1 && (
                  <Text className={styles.deleteBtn} onClick={() => handleDelete(index)}>删除</Text>
                )}
              </View>
            </View>

            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                <Text>姓名</Text>
              </View>
              <View className={styles.formInput}>
                <Input
                  className={styles.inputField}
                  placeholder="请输入继承人姓名"
                  placeholderClass={styles.inputPlaceholder}
                  value={form.name}
                  onInput={(e) => handleInput(index, 'name', e.detail.value)}
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
                  onInput={(e) => handleInput(index, 'idCard', e.detail.value.toUpperCase())}
                />
              </View>
            </View>

            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                <Text>手机号码</Text>
              </View>
              <View className={styles.formInput}>
                <Input
                  className={styles.inputField}
                  placeholder="请输入11位手机号码"
                  placeholderClass={styles.inputPlaceholder}
                  value={form.phone}
                  maxlength={11}
                  type="number"
                  onInput={(e) => handleInput(index, 'phone', e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                <Text>与被继承人关系</Text>
              </View>
              <View className={styles.formInput} onClick={() => handleRelationshipSelect(index)}>
                <Text className={form.relationship ? styles.inputField : styles.inputPlaceholder}>
                  {form.relationship || '请选择亲属关系'}
                </Text>
                <Text className={styles.inputArrow}>▼</Text>
              </View>
            </View>

            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text className={styles.required}>*</Text>
                <Text>继承份额</Text>
              </View>
              <View className={styles.formInput} onClick={() => handleShareSelect(index)}>
                <Text className={form.share ? styles.inputField : styles.inputPlaceholder}>
                  {form.share || '请选择继承份额'}
                </Text>
                <Text className={styles.inputArrow}>▼</Text>
              </View>
            </View>

            <View className={styles.formItem}>
              <View className={styles.formLabel}>
                <Text>主继承人</Text>
              </View>
              <View className={styles.switchItem}>
                <View>
                  <Text className={styles.switchLabel}>设为主继承人</Text>
                  <Text className={styles.switchDesc}>主继承人将接收所有通知</Text>
                </View>
                <Switch
                  checked={form.isMain}
                  color="#165dff"
                  onChange={(e) => handleInput(index, 'isMain', e.detail.value)}
                />
              </View>
            </View>
          </View>
        </View>
      ))}

      <Button className={styles.addBtn} onClick={addNewHeir}>
        <Text className={styles.addIcon}>+</Text>
        <Text className={styles.addText}>添加继承人</Text>
      </Button>

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

export default HeirPage
