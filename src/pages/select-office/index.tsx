import React, { useState, useEffect } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import EmptyState from '@/components/EmptyState'
import { regions, offices, getOfficesByRegion } from '@/data/offices'
import { useDeclareStore } from '@/store/declare'
import type { Office, Region } from '@/types'
import styles from './index.module.scss'

const SelectOfficePage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null)
  const [selectedCity, setSelectedCity] = useState<Region | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<Region | null>(null)
  const [officeList, setOfficeList] = useState<Office[]>([])
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)

  const { setOffice, selectedOffice: storeOffice } = useDeclareStore()

  useEffect(() => {
    if (storeOffice) {
      setSelectedOffice(storeOffice)
    }
    filterOffices()
  }, [selectedDistrict, searchText])

  const filterOffices = () => {
    let list: Office[] = offices
    if (selectedDistrict) {
      list = getOfficesByRegion(selectedDistrict.code)
    } else if (selectedCity) {
      list = getOfficesByRegion(selectedCity.code)
    } else if (selectedProvince) {
      list = getOfficesByRegion(selectedProvince.code)
    }
    if (searchText) {
      list = list.filter(o =>
        o.name.includes(searchText) || o.address.includes(searchText)
      )
    }
    setOfficeList(list)
  }

  const handleProvinceSelect = () => {
    Taro.showActionSheet({
      itemList: regions.map(r => r.name),
      success: (res) => {
        const province = regions[res.tapIndex]
        setSelectedProvince(province)
        setSelectedCity(null)
        setSelectedDistrict(null)
        console.log('[SelectOffice] 选择省份:', province.name)
      }
    })
  }

  const handleCitySelect = () => {
    if (!selectedProvince?.children) return
    Taro.showActionSheet({
      itemList: selectedProvince.children.map(r => r.name),
      success: (res) => {
        const city = selectedProvince.children![res.tapIndex]
        setSelectedCity(city)
        setSelectedDistrict(null)
        console.log('[SelectOffice] 选择城市:', city.name)
      }
    })
  }

  const handleDistrictSelect = () => {
    if (!selectedCity?.children) return
    Taro.showActionSheet({
      itemList: selectedCity.children.map(r => r.name),
      success: (res) => {
        const district = selectedCity.children![res.tapIndex]
        setSelectedDistrict(district)
        console.log('[SelectOffice] 选择区县:', district.name)
      }
    })
  }

  const handleOfficeSelect = (office: Office) => {
    setSelectedOffice(office)
    setOffice(office)
    Taro.showToast({
      title: `已选择${office.name}`,
      icon: 'success',
      duration: 1500
    })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1500)
  }

  return (
    <PageContainer scroll padding>
      <View className={styles.searchBox}>
        <Text className={styles.searchIcon}>🔍</Text>
        <Input
          className={styles.searchInput}
          placeholder="搜索登记机构名称"
          placeholderClass={styles.searchPlaceholder}
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      <View className={styles.regionSelector}>
        <View
          className={classnames(styles.regionItem, {
            [styles.active]: selectedProvince
          })}
          onClick={handleProvinceSelect}
        >
          <Text className={styles.regionText}>
            {selectedProvince?.name || '选择省份'}
          </Text>
          <Text className={styles.regionArrow}>▼</Text>
        </View>
        <View
          className={classnames(styles.regionItem, {
            [styles.active]: selectedCity
          })}
          onClick={handleCitySelect}
        >
          <Text className={styles.regionText}>
            {selectedCity?.name || '选择城市'}
          </Text>
          <Text className={styles.regionArrow}>▼</Text>
        </View>
        <View
          className={classnames(styles.regionItem, {
            [styles.active]: selectedDistrict
          })}
          onClick={handleDistrictSelect}
        >
          <Text className={styles.regionText}>
            {selectedDistrict?.name || '选择区县'}
          </Text>
          <Text className={styles.regionArrow}>▼</Text>
        </View>
      </View>

      <Text className={styles.sectionTitle}>
        可选择的登记机构（{officeList.length}个）
      </Text>

      {officeList.length > 0 ? (
        <View>
          {officeList.map((office) => (
            <View
              key={office.id}
              className={classnames(styles.officeCard, {
                [styles.selected]: selectedOffice?.id === office.id
              })}
            >
              <Text className={styles.officeName}>{office.name}</Text>
              <View className={styles.officeInfo}>
                <Text className={styles.infoIcon}>📍</Text>
                <Text className={styles.infoText}>{office.address}</Text>
              </View>
              <View className={styles.officeInfo}>
                <Text className={styles.infoIcon}>📞</Text>
                <Text className={styles.infoText}>{office.phone}</Text>
              </View>
              <View className={styles.officeInfo}>
                <Text className={styles.infoIcon}>🕐</Text>
                <Text className={styles.infoText}>{office.workHours}</Text>
              </View>
              <View
                className={styles.selectBtn}
                onClick={() => handleOfficeSelect(office)}
              >
                <Text className={styles.selectBtnText}>
                  {selectedOffice?.id === office.id ? '已选择' : '选择该机构'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className={styles.emptyWrap}>
          <EmptyState
            icon="🏢"
            title="暂无登记机构"
            description="请选择其他区域或搜索其他关键词"
          />
        </View>
      )}
    </PageContainer>
  )
}

export default SelectOfficePage
