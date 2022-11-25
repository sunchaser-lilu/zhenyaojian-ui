<template>
  <div>
    <i-frame :src="url" />
  </div>
</template>
<script>
import IFrame from '@/components/IFrame/IFrame'
export default {
  name: 'SpringBootAdmin',
  components: { IFrame },
  data() {
    return {
      url: process.env.VUE_APP_API_BASE_URL + '/observe/server'
    }
  },
  created() {
    console.log(this.url)
  }
}
</script>
