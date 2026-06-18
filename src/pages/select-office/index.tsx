import React, { useState, useMemo } from 'react'
import { View, Text, Input } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import PageContainer from '@/components/PageContainer'
import EmptyState from '@/components/EmptyState'
import { regions, offices, getOfficesByRegion, isMunicipality } from '@/data/offices'
import { useDeclareStore } from '@/store/declare'
import type { Office, Region } from '@/types'
import styles from './index.module.scss'

const SelectOfficePage: React.FC = () => {
  const [searchText, setSearchText] = useState('')
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null)
  const [selectedCity, setSelectedCity] = useState<Region | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<Region | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null)

  const { setOffice, selectedOffice: storeOffice } = useDeclareStore()

  const provinceIsMuni = isMunicipality(selectedProvince)

  const districtOptions = useMemo<Region[]>(() => {
    if (!selectedProvince) return []
    if (provinceIsMuni) return selectedProvince.children || []
    return selectedCity?.children || []
  }, [selectedProvince, selectedCity, provinceIsMuni])

  const officeList = useMemo<Office[]>(() => {
    let list: Office[]
    if (selectedDistrict) {
      list = getOfficesByRegion(selectedDistrict.code)
    } else if (!provinceIsMuni && selectedCity) {
      list = getOfficesByRegion(selectedCity.code)
    } else if (selectedProvince) {
      list = getOfficesByRegion(selectedProvince.code)
    } else {
      list = offices
    }
    if (searchText.trim()) {
      const keyword = searchText.trim()
      list = list.filter(
        (o) => o.name.includes(keyword) || o.address.includes(keyword)
      )
    }
    return list
  }, [selectedProvince, selectedCity, selectedDistrict, searchText, provinceIsMuni])

  const handleProvinceSelect = () => {
    Taro.showActionSheet({
      itemList: regions.map((r) => r.name),
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
    const cities = selectedProvince.children.filter((c) => c.children && c.children.length > 0)
    if (cities.length === 0) return
    Taro.showActionSheet({
      itemList: cities.map((r) => r.name),
      success: (res) => {
        const city = cities[res.tapIndex]
        setSelectedCity(city)
        setSelectedDistrict(null)
        console.log('[SelectOffice] 选择城市:', city.name)
      }
    })
  }

  const handleDistrictSelect = () => {
    if (districtOptions.length === 0) return
    Taro.showActionSheet({
      itemList: districtOptions.map((r) => r.name),
      success: (res) => {
        const district = districtOptions[res.tapIndex]
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

  const showCitySelector = selectedProvince && !provinceIsMuni

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

        {showCitySelector ? (
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
        ) : null}

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
                [styles.selected]: selectedOffice?.id === office.id || storeOffice?.id === office.id
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
                  {storeOffice?.id === office.id ? '已选择' : '选择该机构'}
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
            description={selectedProvince ? '当前区域暂无登记机构，请尝试其他区域或搜索其他关键词' : '请先选择所在地区，或通过关键词搜索登记机构'}
          />
        </View>
      )}
    </PageContainer>
  )
}

export default SelectOfficePage
