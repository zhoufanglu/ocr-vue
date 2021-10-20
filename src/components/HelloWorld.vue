<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <code-diff
        :old-string="oldStr"
        :new-string="newStr"
        outputFormat="side-by-side"
        :context="10" />
    <div v-for="i in list" :key="i">
      {{i}}
    </div>
  </div>
</template>

<script>
import CodeDiff  from 'vue-code-diff'

export default {
  name: 'HelloWorld',
  components: {CodeDiff },
  props: {
    msg: String
  },
  data(){
    return{
      list: [],
      oldStr: 'import router from \'./router\'\n' +
          'import store from \'./store\'\n' +
          'import { Message } from \'element-ui\'',
      newStr: 'import router from \'./router\'\n' +
          'import store from \'./store\'\n' +
          'import { Message } from \'element-ui\'222'
    }
  },
  mounted() {
    this.$nextTick(()=>{
      console.log('页面加载完成')
    })
    setTimeout(()=>{
      this.list = [...new Array(10000).keys()]
      this.$nextTick(()=>{
        console.log('v-for已经渲染完成')
      })
    }, 1000)
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
