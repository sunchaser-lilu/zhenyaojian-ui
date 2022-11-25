<template>
  <div :style="'height:' + height">
    <iframe :src="src" frameborder="no" style="width: 100%; height: 100%" scrolling="auto" />
  </div>
</template>
<script>
export default {
  props: {
    src: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      height: document.documentElement.clientHeight + 'px',
      url: this.src
    }
  },
  mounted: function () {
    const _this = this
    window.onresize = function temp() {
      _this.height = document.documentElement.clientHeight + 'px;'
    }
  }
}
</script>
