import enquireJs from 'enquire.js'

export const deviceTypeMap = {
  Computer: 'PC 端',
  Mobile: '移动端',
  Tablet: '平板电脑',
  'Game console': '游戏机',
  'Digital media receiver': '数字媒体接收器',
  'Wearable computer': '微型设备',
  Unknown: '未知设备'
}

export function isDef(v) {
  return v !== undefined && v !== null
}

/**
 * Remove an item from an array.
 */
export function remove(arr, item) {
  if (arr.length) {
    const index = arr.indexOf(item)
    if (index > -1) {
      return arr.splice(index, 1)
    }
  }
}

export function isRegExp(v) {
  return _toString.call(v) === '[object RegExp]'
}

export function enquireScreen(call) {
  const handler = {
    match: function () {
      call && call(true)
    },
    unmatch: function () {
      call && call(false)
    }
  }
  enquireJs.register('only screen and (max-width: 767.99px)', handler)
}

const _toString = Object.prototype.toString
