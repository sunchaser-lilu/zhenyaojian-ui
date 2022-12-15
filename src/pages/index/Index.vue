<template>
  <a-card>
    <div class="md-content">
      <markdown-it-vue class="md-body" :content="readme" :options="{ markdownIt: { html: true } }" />
    </div>
  </a-card>
</template>

<script>
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
import axios from 'axios'
export default {
  name: 'Index',
  components: { MarkdownItVue },
  data() {
    return {
      readme: ''
    }
  },
  created() {
    axios.get('https://raw.githubusercontent.com/llnancy/zhenyaojian/master/README.md').then((response) => {
      this.readme = response.data
    })
  }
}
</script>
