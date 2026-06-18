export function validateIdCard(idCard: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(idCard)) return false
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += parseInt(idCard[i]) * weights[i]
  }
  const checkCode = checkCodes[sum % 11]
  return idCard[17].toUpperCase() === checkCode
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone)
}

export function validateCertNumber(certNumber: string): boolean {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼][（(]20\d{2}[）)][\u4e00-\u9fa5]{0,2}不动产权第\d{4,8}号$/.test(certNumber) ||
         /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]房权证[\u4e00-\u9fa5]{0,2}字第\d{4,8}号$/.test(certNumber)
}

export function validateDate(date: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(date)
}

export function maskIdCard(idCard: string): string {
  if (idCard.length !== 18) return idCard
  return idCard.substring(0, 6) + '********' + idCard.substring(14)
}

export function maskPhone(phone: string): string {
  if (phone.length !== 11) return phone
  return phone.substring(0, 3) + '****' + phone.substring(7)
}
