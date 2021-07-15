<template>
  <div class="p-ocr">
    <div :style="{width:pdf_div_width,margin:'0 auto'}" >
      <canvas
          style="border: solid 1px red"
          @click="canvasClick"
          v-for="page in pdf_pages" :id="'the-canvas'+page" :key="page"></canvas>
    </div>
  </div>
</template>
<script>
import PDFJS from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.entry'
PDFJS.workerSrc = workerSrc;
//参考 https://www.jianshu.com/p/c4a885e67a74
export default {
  name: '',
  components: {},
  data() {
    return {
      pdf_scale:1.0,//pdf放大系数
      pdf_pages:[],
      pdf_div_width:'',
      pdf_src:null,
    }
  },
  created() {
    this.get_pdfurl()
    /*
    pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    let winW = document.documentElement.clientWidth;

    // pdf 的 localhost地址是把用来做测试的pdf放在了项目里，实际运用可以用后台返回的线上地址
    let pdfUrl = 'http://localhost:8080/helloworld.pdf';
    const src = '../../assets/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
    pdfUrl = src
    let loadingTask = pdfjsLib.getDocument(pdfUrl);*/
  },

  mounted() {

  },
  methods: {
    get_pdfurl(){  //获得pdf
      //例子:加载pdf线上示例
      this.pdf_src = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
      //this.pdf_src = '../../assets/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
      this._loadFile(this.pdf_src)
    },
    _loadFile (url) {  //初始化pdf
      let loadingTask = PDFJS.getDocument(url)
      loadingTask.promise
          .then((pdf) => {
            this.pdfDoc = pdf
            this.pdf_pages = this.pdfDoc.numPages
            this.$nextTick(() => {
              this._renderPage(1)
            })
          })
    },
    _renderPage (num) {  //渲染pdf页
      const that = this
      this.pdfDoc.getPage(num)
          .then((page) => {
            let canvas = document.getElementById('the-canvas' + num)
            let ctx = canvas.getContext('2d')
            let dpr = window.devicePixelRatio || 1
            let bsr = ctx.webkitBackingStorePixelRatio ||
                ctx.mozBackingStorePixelRatio ||
                ctx.msBackingStorePixelRatio ||
                ctx.oBackingStorePixelRatio ||
                ctx.backingStorePixelRatio || 1
            let ratio = dpr / bsr
            let viewport = page.getViewport({ scale: this.pdf_scale })

            canvas.width = viewport.width * ratio
            canvas.height = viewport.height * ratio

            canvas.style.width = viewport.width + 'px'

            that.pdf_div_width = viewport.width + 'px'

            canvas.style.height = viewport.height + 'px'

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
            let renderContext = {
              canvasContext: ctx,
              viewport: viewport
            }
            page.render(renderContext)
            if (this.pdf_pages > num) {
              this._renderPage(num + 1)
            }
            //画点
            // 设置绘制颜色
           /* ctx.fillStyle = "#0000FF";
            // 绘制成矩形
            ctx.fillRect(point.x - 2, point.y - 2, 4, 4);

            // 设置字体样式
            ctx.font = "16px bold 宋体";
            // 绘制文字
            ctx.fillText("(" + point.x + ", " + point.y + ")", point.x, point.y);*/
          })
    },

    canvasClick(e) {
      console.log(`x:${e.layerX},y:${e.layerY}`)
      console.log('----')
      let point = {
        x: e.layerX,
        y: e.layerY
      }
      //console.log(107, e.layerX,e.layerY)
      let canvas = document.getElementById('the-canvas1')
      let ctx = canvas.getContext('2d')
      ctx.fillStyle="#fb0606";
      //绘制成矩形
      // ctx.arc(point.x, point.y,5, 0, Math.PI * 5);
      ctx.fillRect(point.x-4,point.y-4,8,8);
      //设置字体样式
      ctx.font = "12px bold 宋体";
      //绘制文字
      ctx.fillText("("+point.x+","+point.y+")",point.x,point.y);
    }
  }
}
</script>
<style lang="scss" scoped>
.p-name {
}
</style>
