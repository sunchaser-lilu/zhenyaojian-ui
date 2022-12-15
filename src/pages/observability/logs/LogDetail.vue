<template>
  <a-drawer width="600" placement="right" :closable="false" :visible="visible" @close="onClose">
    <a-descriptions :column="1" :title="title">
      <a-descriptions-item label="请求 IP"> {{ this.data.requestIp }} </a-descriptions-item>
      <a-descriptions-item label="设备类型">
        {{ this.deviceTypeMap[this.data.deviceType] }}
      </a-descriptions-item>
      <a-descriptions-item label="User-Agent"> {{ this.data.userAgent }} </a-descriptions-item>
      <a-descriptions-item label="浏览器"> {{ this.data.browser }} </a-descriptions-item>
      <a-descriptions-item label="操作系统"> {{ this.data.os }} </a-descriptions-item>
      <a-descriptions-item label="地理位置"> {{ this.data.region }} </a-descriptions-item>
      <a-descriptions-item label="请求地址"> {{ this.data.requestUri }} </a-descriptions-item>
      <a-descriptions-item label="请求方式"> {{ this.data.requestMethod }} </a-descriptions-item>
      <a-descriptions-item label="请求类名"> {{ this.data.className }} </a-descriptions-item>
      <a-descriptions-item label="请求方法名"> {{ this.data.methodName }} </a-descriptions-item>
      <a-descriptions-item label="请求参数"> {{ this.data.parameters }} </a-descriptions-item>
      <a-descriptions-item label="返回值"> {{ this.data.response }} </a-descriptions-item>
      <a-descriptions-item label="异常描述"> {{ this.data.exception || '无' }} </a-descriptions-item>
      <a-descriptions-item label="操作人"> {{ this.data.userAccount }} </a-descriptions-item>
      <a-descriptions-item label="操作描述"> {{ this.data.description || '无' }} </a-descriptions-item>
      <a-descriptions-item label="请求状态">
        <a-badge
          :status="this.data.status === 0 ? 'success' : 'error'"
          :text="this.data.status === 0 ? '成功' : '异常'"
        />
      </a-descriptions-item>
      <a-descriptions-item label="操作类型"> {{ this.typeMap[this.data.type] }} </a-descriptions-item>
      <a-descriptions-item label="开始时间"> {{ this.data.startTime }} </a-descriptions-item>
      <a-descriptions-item label="结束时间"> {{ this.data.endTime }} </a-descriptions-item>
      <a-descriptions-item label="消耗时间"> {{ this.data.rt }} ms</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script>
import { deviceTypeMap } from '@/utils/util'

export default {
  name: 'LogDetail',
  props: {
    visible: {
      type: Boolean,
      required: false,
      default: false
    },
    data: {
      type: Object,
      required: true,
      default: () => {}
    },
    title: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      deviceTypeMap: deviceTypeMap,
      typeMap: {
        OTHER: '其它',
        SELECT: '查询',
        INSERT: '新增',
        UPDATE: '更新',
        DELETE: '删除',
        LOGIN: '登录',
        IMPORT: '导入',
        EXPORT: '导出',
        STATUS: '更新状态',
        CLEAN: '清除数据'
      }
    }
  },
  methods: {
    onClose() {
      this.visible = false
    }
  }
}
</script>

<style>
.ant-descriptions-item-content {
  word-break: break-all !important;
  word-wrap: break-word !important;
}
</style>
