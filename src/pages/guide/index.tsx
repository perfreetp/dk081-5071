import React, { useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'

interface FAQ {
  id: string
  question: string
  answer: string
}

interface FlowStep {
  id: string
  title: string
  desc: string
  time: string
}

const faqData: FAQ[] = [
  {
    id: '1',
    question: '哪些继承情形可以在线办理？',
    answer: '目前支持以下继承情形在线办理：法定继承（无遗嘱）、遗嘱继承、遗赠、遗赠扶养协议、代位继承、转继承。涉及复杂家庭关系或产权纠纷的情形建议到窗口现场办理。'
  },
  {
    id: '2',
    question: '办理继承转移登记需要缴纳哪些税费？',
    answer: '继承不动产主要涉及以下税费：1）印花税：按不动产评估价值的0.05%征收；2）契税：法定继承人免征，非法定继承人（受遗赠人）按3%征收。个人所得税和增值税目前免征。具体税费以税务部门核算为准。'
  },
  {
    id: '3',
    question: '多长时间可以办好？',
    answer: '材料齐全的情况下，承诺办理时限为5个工作日。如需补正材料，办理时限从补正材料齐全之日起重新计算。涉及实地查看的，所需时间不计入办理时限。'
  },
  {
    id: '4',
    question: '多人继承时如何共同确认？',
    answer: '所有继承人需分别完成身份验证、材料上传和手写签名确认。主继承人完成申报后，系统会通过短信通知其他继承人，其他继承人可通过短信链接或登录小程序进入"待确认"列表进行确认操作。'
  },
  {
    id: '5',
    question: '材料上传有什么要求？',
    answer: '所有上传的材料需为原件扫描件或清晰照片，支持JPG、PNG、PDF格式，单个文件不超过10MB。身份证需上传正反两面，户口本需上传首页和本人页。请确保照片文字清晰可辨认。'
  },
  {
    id: '6',
    question: '原件核验必须本人到场吗？',
    answer: '原件核验原则上需本人到场。如本人确实无法到场，可委托他人代办，需提供经公证的授权委托书。行动不便的特殊群体可申请上门核验服务。'
  },
  {
    id: '7',
    question: '新的不动产权证如何领取？',
    answer: '登记完成后，您可以选择到登记机构现场领取，或选择邮寄送达（邮费到付）。选择邮寄的，我们会在制证完成后3个工作日内寄出。'
  },
  {
    id: '8',
    question: '申报信息填错了怎么办？',
    answer: '在审核完成前，您可以在"申报详情"页面点击"修改申报"进行信息更正。如果审核已完成，则需要到登记机构窗口申请更正登记。'
  }
]

const flowSteps: FlowStep[] = [
  {
    id: '1',
    title: '在线申报',
    desc: '填写被继承人和继承人信息，上传相关材料',
    time: '约15-30分钟'
  },
  {
    id: '2',
    title: '多人确认',
    desc: '所有继承人完成电子签名和承诺书确认',
    time: '视继承人人数而定'
  },
  {
    id: '3',
    title: '材料审核',
    desc: '登记机构对申报材料进行审核',
    time: '3-5个工作日'
  },
  {
    id: '4',
    title: '原件核验',
    desc: '预约时间进行原件核验或申请上门核验',
    time: '按预约时间'
  },
  {
    id: '5',
    title: '税费缴纳',
    desc: '在线缴纳相关税费',
    time: '约5分钟'
  },
  {
    id: '6',
    title: '领取证书',
    desc: '现场领取或邮寄送达新不动产权证',
    time: '制证完成后3个工作日'
  }
]

const noticeItems = [
  '请确保填写的信息真实、准确、完整，虚假申报需承担相应法律责任',
  '所有上传的材料需为原件扫描件或清晰照片，确保文字可辨认',
  '需所有继承人共同确认后，申报才会进入审核环节',
  '请保持手机畅通，审核过程中如有问题工作人员会与您联系',
  '建议提前准备好所有材料，可参考"材料准备"页面的清单'
]

const GuidePage: React.FC = () => {
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set())

  const toggleFaq = (id: string) => {
    setExpandedFaqs(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCall = () => {
    Taro.makePhoneCall({
      phoneNumber: '12345'
    })
  }

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.noticeCard}>
        <View className={styles.noticeHeader}>
          <Text className={styles.noticeIcon}>💡</Text>
          <Text className={styles.noticeTitle}>温馨提示</Text>
        </View>
        <View className={styles.noticeList}>
          {noticeItems.map((item, index) => (
            <View key={index} className={styles.noticeItem}>
              <Text className={styles.bullet}>•</Text>
              <Text>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>办理流程</Text>
        <View className={styles.timelineFlow}>
          {flowSteps.map(step => (
            <View key={step.id} className={styles.flowItem}>
              <View className={styles.flowDot} />
              <Text className={styles.flowTitle}>{step.title}</Text>
              <Text className={styles.flowDesc}>{step.desc}</Text>
              <Text className={styles.flowTime}>预计时间：{step.time}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>办理条件</Text>
        <View className={styles.stepList}>
          <View className={styles.stepItem}>
            <View className={styles.stepNumber}>1</View>
            <View className={styles.stepContent}>
              <Text className={styles.stepTitle}>继承人资格</Text>
              <Text className={styles.stepDesc}>申请人为法定继承人、遗嘱继承人或受遗赠人，具有完全民事行为能力</Text>
            </View>
          </View>
          <View className={styles.stepItem}>
            <View className={styles.stepNumber}>2</View>
            <View className={styles.stepContent}>
              <Text className={styles.stepTitle}>产权清晰</Text>
              <Text className={styles.stepDesc}>被继承的不动产已依法登记，权属清晰，无查封、无抵押（或抵押权已注销）</Text>
            </View>
          </View>
          <View className={styles.stepItem}>
            <View className={styles.stepNumber}>3</View>
            <View className={styles.stepContent}>
              <Text className={styles.stepTitle}>材料齐全</Text>
              <Text className={styles.stepDesc}>具备办理继承转移登记所需的身份证明、亲属关系证明、死亡证明、产权证明等材料</Text>
            </View>
          </View>
          <View className={styles.stepItem}>
            <View className={styles.stepNumber}>4</View>
            <View className={styles.stepContent}>
              <Text className={styles.stepTitle}>无纠纷</Text>
              <Text className={styles.stepDesc}>所有继承人对继承事项无异议，能够共同确认，不存在产权纠纷</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.sectionCard}>
        <Text className={styles.sectionTitle}>常见问题</Text>
        <View className={styles.faqList}>
          {faqData.map(faq => (
            <View key={faq.id} className={styles.faqItem}>
              <button
                className={styles.faqHeader}
                onClick={() => toggleFaq(faq.id)}
              >
                <Text className={styles.faqQuestion}>{faq.question}</Text>
                <Text className={`${styles.faqIcon} ${expandedFaqs.has(faq.id) ? styles.expanded : ''}`}>▼</Text>
              </button>
              {expandedFaqs.has(faq.id) && (
                <View className={styles.faqAnswer}>
                  {faq.answer}
                </View>
              )}
            </View>
          ))}
        </View>
      </View>

      <View className={styles.contactCard}>
        <View className={styles.contactInfo}>
          <View className={styles.contactIcon}>📞</View>
          <View className={styles.contactText}>
            <Text className={styles.contactLabel}>服务热线</Text>
            <Text className={styles.contactPhone}>12345</Text>
          </View>
        </View>
        <button className={styles.callBtn} onClick={handleCall}>
          立即拨打
        </button>
      </View>

      <View style={{ padding: '0 32rpx', textAlign: 'center' }}>
        <Text style={{ fontSize: '24rpx', color: '#999' }}>
          工作时间：周一至周五 9:00-17:00（法定节假日除外）
        </Text>
      </View>
    </ScrollView>
  )
}

export default GuidePage
