import React, { useState, useEffect } from 'react'
import { View, Text, Input, Button, Textarea } from '@tarojs/components'
import Taro from '@tarojs/taro'
import PageContainer from '@/components/PageContainer'
import { useDeclareStore } from '@/store/declare'
import type { AppointmentInfo } from '@/types'
import styles from './index.module.scss'

const timeSlots = [
  { id: '1', time: '09:00-10:00', available: true },
  { id: '2', time: '10:00-11:00', available: true },
  { id: '3', time: '11:00-12:00', available: false },
  { id: '4', time: '13:30-14:30', available: true },
  { id: '5', time: '14:30-15:30', available: true },
  { id: '6', time: '15:30-16:30', available: true },
  { id: '7', time: '16:30-17:30', available: false },
  { id: '8', time: '17:30-18:00', available: false }
]

const generateDates = () => {
  const dates = []
  const today = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

  for (let i = 0; i < 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i + 1)
    dates.push({
      id: date.toISOString().split('T')[0],
      week: weekDays[date.getDay()],
      day: date.getDate(),
      month: `${date.getMonth() + 1}月`,
      fullDate: date.toISOString().split('T')[0],
      disabled: date.getDay() === 0 || date.getDay() === 6
    })
  }
  return dates
}

const AppointmentPage: React.FC = () => {
  const { appointment, setAppointment, selectedOffice, heirs } = useDeclareStore()
  const [type, setType] = useState<'onsite' | 'home'>('onsite')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [address, setAddress] = useState('')
  const [contact, setContact] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [dates] = useState(generateDates())

  useEffect(() => {
    if (appointment) {
      setType(appointment.type)
      setSelectedDate(appointment.date)
      setSelectedTime(appointment.timeSlot)
      setAddress(appointment.address)
      setContact(appointment.contact)
      setContactPhone(appointment.contactPhone)
    } else if (heirs.length > 0) {
      const mainHeir = heirs.find(h => h.isMain) || heirs[0]
      setContact(mainHeir.name)
      setContactPhone(mainHeir.phone)
    }

    if (selectedOffice) {
      setAddress(selectedOffice.address)
    }
  }, [])

  const handleTypeSelect = (selectedType: 'onsite' | 'home') => {
    setType(selectedType)
    setSelectedDate('')
    setSelectedTime('')
    if (selectedType === 'onsite' && selectedOffice) {
      setAddress(selectedOffice.address)
    } else if (selectedType === 'home') {
      setAddress('')
    }
  }

  const handleDateSelect = (date: any) => {
    if (date.disabled) {
      Taro.showToast({ title: '周末不提供核验服务', icon: 'none' })
      return
    }
    setSelectedDate(date.fullDate)
  }

  const handleTimeSelect = (time: any) => {
    if (!time.available) {
      Taro.showToast({ title: '该时段已约满', icon: 'none' })
      return
    }
    setSelectedTime(time.time)
  }

  const handleAddressInput = (e: any) => {
    setAddress(e.detail.value)
  }

  const handleContactInput = (e: any) => {
    setContact(e.detail.value)
  }

  const handleContactPhoneInput = (e: any) => {
    setContactPhone(e.detail.value)
  }

  const validatePhone = (phone: string): boolean => {
    return /^1[3-9]\d{9}$/.test(phone)
  }

  const validate = (): boolean => {
    if (!selectedDate) {
      Taro.showToast({ title: '请选择预约日期', icon: 'none' })
      return false
    }
    if (!selectedTime) {
      Taro.showToast({ title: '请选择预约时段', icon: 'none' })
      return false
    }
    if (!address.trim()) {
      Taro.showToast({ title: type === 'onsite' ? '请确认核验地址' : '请输入上门地址', icon: 'none' })
      return false
    }
    if (!contact.trim()) {
      Taro.showToast({ title: '请输入联系人姓名', icon: 'none' })
      return false
    }
    if (!contactPhone.trim()) {
      Taro.showToast({ title: '请输入联系电话', icon: 'none' })
      return false
    }
    if (!validatePhone(contactPhone)) {
      Taro.showToast({ title: '手机号格式不正确', icon: 'none' })
      return false
    }
    return true
  }

  const handleSave = () => {
    if (!validate()) return

    const appointmentInfo: AppointmentInfo = {
      type,
      date: selectedDate,
      timeSlot: selectedTime,
      address,
      contact,
      contactPhone
    }
    setAppointment(appointmentInfo)
    console.log('[AppointmentPage] 保存预约信息:', appointmentInfo)
    Taro.showToast({
      title: '预约成功',
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

  const canSave = selectedDate && selectedTime && address.trim() && contact.trim() && contactPhone.trim()

  return (
    <PageContainer scroll padding>
      <View className={styles.tipCard}>
        <View className={styles.tipTitle}>
          <Text className={styles.tipIcon}>💡</Text>
          <Text>核验须知</Text>
        </View>
        <Text className={styles.tipContent}>
          1. 请携带所有上传材料的原件到场核验{'\n'}
          2. 所有继承人需到场配合核验{'\n'}
          3. 如需取消预约，请提前1个工作日{'\n'}
          4. 核验通过后将进入税费缴纳环节
        </Text>
      </View>

      <View className={styles.typeSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📍</Text>
          选择核验方式
        </Text>
        <View className={styles.typeOptions}>
          <View
            className={`${styles.typeOption} ${type === 'onsite' ? styles.selected : ''}`}
            onClick={() => handleTypeSelect('onsite')}
          >
            <Text className={styles.typeIcon}>🏢</Text>
            <Text className={styles.typeName}>现场核验</Text>
            <Text className={styles.typeDesc}>
              携带材料原件到登记机构核验
            </Text>
            <Text className={styles.typeTag}>推荐</Text>
            {type === 'onsite' && selectedOffice && (
              <View className={styles.officeInfo}>
                <Text className={styles.officeName}>{selectedOffice.name}</Text>
                <Text className={styles.officeAddress}>{selectedOffice.address}</Text>
              </View>
            )}
          </View>
          <View
            className={`${styles.typeOption} ${type === 'home' ? styles.selected : ''}`}
            onClick={() => handleTypeSelect('home')}
          >
            <Text className={styles.typeIcon}>🏠</Text>
            <Text className={styles.typeName}>上门核验</Text>
            <Text className={styles.typeDesc}>
              工作人员上门进行材料核验
            </Text>
            {type === 'home' && (
              <View className={styles.homeNote}>
                <Text className={styles.noteTitle}>温馨提示</Text>
                <Text className={styles.noteContent}>
                  上门核验需提前3个工作日预约，核验时间将由工作人员电话确认
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View className={styles.dateSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📅</Text>
          选择预约日期
        </Text>
        <View className={styles.dateList}>
          {dates.map(date => (
            <View
              key={date.id}
              className={`${styles.dateItem} ${selectedDate === date.fullDate ? styles.selected : ''} ${date.disabled ? styles.disabled : ''}`}
              onClick={() => handleDateSelect(date)}
            >
              <Text className={styles.dateWeek}>{date.week}</Text>
              <Text className={styles.dateDay}>{date.day}</Text>
              <Text className={styles.dateMonth}>{date.month}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.timeSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>⏰</Text>
          选择预约时段
        </Text>
        <View className={styles.timeGrid}>
          {timeSlots.map(time => (
            <View
              key={time.id}
              className={`${styles.timeItem} ${selectedTime === time.time ? styles.selected : ''} ${!time.available ? styles.disabled : ''}`}
              onClick={() => handleTimeSelect(time)}
            >
              <Text className={styles.timeRange}>{time.time}</Text>
              <Text className={`${styles.timeStatus} ${!time.available ? styles.full : ''}`}>
                {time.available ? '可预约' : '已约满'}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.addressSection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📝</Text>
          联系信息
        </Text>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>{type === 'onsite' ? '核验地址' : '上门地址'}</Text>
          </View>
          {type === 'onsite' ? (
            <View className={styles.formInput}>
              <Text className={address ? styles.inputField : styles.inputPlaceholder}>
                {address || '请选择登记机构'}
              </Text>
            </View>
          ) : (
            <View className={styles.textareaField}>
              <Textarea
                className={styles.inputField}
                placeholder="请输入详细地址，精确到门牌号"
                placeholderClass={styles.inputPlaceholder}
                value={address}
                onInput={handleAddressInput}
                maxlength={100}
                autoHeight
              />
            </View>
          )}
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>联系人姓名</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入联系人姓名"
              placeholderClass={styles.inputPlaceholder}
              value={contact}
              onInput={handleContactInput}
            />
          </View>
        </View>

        <View className={styles.formItem}>
          <View className={styles.formLabel}>
            <Text className={styles.required}>*</Text>
            <Text>联系电话</Text>
          </View>
          <View className={styles.formInput}>
            <Input
              className={styles.inputField}
              placeholder="请输入11位手机号码"
              placeholderClass={styles.inputPlaceholder}
              value={contactPhone}
              onInput={handleContactPhoneInput}
              maxlength={11}
              type="number"
            />
          </View>
        </View>
      </View>

      {selectedDate && selectedTime && (
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>预约信息确认</Text>
          <View className={styles.summaryContent}>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>核验方式：</Text>
              <Text className={styles.summaryValue}>{type === 'onsite' ? '现场核验' : '上门核验'}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>预约日期：</Text>
              <Text className={styles.summaryValue}>{selectedDate}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>预约时段：</Text>
              <Text className={styles.summaryValue}>{selectedTime}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>核验地址：</Text>
              <Text className={styles.summaryValue}>{address}</Text>
            </View>
            <View className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>联系人：</Text>
              <Text className={styles.summaryValue}>{contact}（{contactPhone}）</Text>
            </View>
          </View>
        </View>
      )}

      <View className={styles.bottomPadding} />

      <View className={styles.bottomBar}>
        <Button className={styles.cancelBtn} onClick={handleCancel}>
          <Text className={styles.cancelBtnText}>取消</Text>
        </Button>
        <Button
          className={styles.saveBtn}
          onClick={handleSave}
          disabled={!canSave}
        >
          <Text className={styles.saveBtnText}>确认预约</Text>
        </Button>
      </View>
    </PageContainer>
  )
}

export default AppointmentPage
