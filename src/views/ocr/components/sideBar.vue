<template>
  <div class="p-side-bar">
    <el-button>圈选框</el-button>
    <el-popover
        popper-class="sideBar-popover"
        placement="right"
        width="160"
        v-model="visible">
      <div
          class="text"
      >
        <span>插入</span>
        <el-input size="small" v-model="columnNumber"/>
        <span>列</span>
      </div>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="visible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="visible = false">确定</el-button>
      </div>

      <el-button slot="reference">插入表格</el-button>
    </el-popover>

  </div>
</template>
<script>
export default {
  name: '',
  components: {},
  data() {
    return {
      visible: false,
      columnNumber: 4
    }
  },
  created() {
  },
  mounted() {
  },
  methods: {}
}
</script>
<style lang="scss" scoped>
.p-side-bar {
  position: fixed;
  left: 0;
  top: 30%;
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: solid 1px red;
  width: 100px;
}
</style>

<style lang="scss">
.p-side-bar {
  /*.el-radio-group {
    .el-radio {
      display: flex;
      margin-bottom: 20px;
    }
  }
  */
}
.sideBar-popover{
  border: solid 1px red;
  .text{
    @include vertical-center;
    justify-content: flex-start;
    align-items: center;
    .el-input{
      width: 40px;
    }
    .el-input__inner{
      padding: 6px;
    }
  }
}
</style>
