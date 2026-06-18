import React from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import styles from './index.module.scss'
import type { MaterialItem } from '@/types'

interface MaterialItemProps {
  item: MaterialItem
  onUpload?: (id: string) => void
  onPreview?: (id: string, url: string) => void
  showUpload?: boolean
}

const MaterialItemComponent: React.FC<MaterialItemProps> = ({
  item,
  onUpload,
  onPreview,
  showUpload = true
}) => {
  const handleAction = () => {
    if (item.uploaded && item.uploadUrl) {
      onPreview?.(item.id, item.uploadUrl)
    } else {
      onUpload?.(item.id)
    }
  }

  const chooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera']
      })
      const tempFilePath = res.tempFilePaths[0]
      onUpload?.(item.id)
      console.log('[MaterialItem] 选择图片成功:', tempFilePath)
    } catch (error) {
      console.error('[MaterialItem] 选择图片失败:', error)
    }
  }

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.titleRow}>
          <Text className={styles.name}>{item.name}</Text>
          {item.required ? (
            <View className={classnames(styles.tag, styles.required)}>
              <Text className={styles.tagText}>必填</Text>
            </View>
          ) : (
            <View className={classnames(styles.tag, styles.optional)}>
              <Text className={styles.tagText}>选填</Text>
            </View>
          )}
          {item.uploaded && (
            <View className={classnames(styles.tag, styles.uploaded)}>
              <Text className={styles.tagText}>已上传</Text>
            </View>
          )}
        </View>
      </View>
      <Text className={styles.description}>{item.description}</Text>
      {showUpload && (
        <Button
          className={classnames(styles.actionBtn, {
            [styles.uploadedBtn]: item.uploaded
          })}
          onClick={item.uploaded ? handleAction : chooseImage}
        >
          <Text className={styles.actionText}>
            {item.uploaded ? '查看' : '上传'}
          </Text>
        </Button>
      )}
    </View>
  )
}

export default MaterialItemComponent
