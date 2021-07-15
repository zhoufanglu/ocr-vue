<template>
  <div class="p-a">
    <h1>a 页面不需要权限访问</h1>
    <el-button type="primary">主要按钮</el-button>

  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  data() {
    return {}
  },
  created() {
    //this.$message('欢迎来到A页面')
    this.loadData()
  },
  mounted() {
  },
  methods: {
    async loadData() {
      const res = await this.$api.user.test({userName:'aa', password:'123'})
      console.log(24, res.data)
      const res1 = await this.$api.user.test({userName:'aa', password:'123'})
      const res2 = await this.$api.user.test({userName:'aa', password:'123'})
    }
  }
}
</script>
<style lang="scss" scoped>
.p-name {
}
</style>
