<template>
  <div class="p-ocr">
    <div :style="{width:pdf_div_width,margin:'0 auto'}" >
      <input id="inputFile" type="file" @change="convertToBase64()" />
      <button @click="sendAjax">发送请求</button>
      <button @click="calcSize">计算比例</button>
<!--      <canvas
          style="border: solid 1px red"
          @click="canvasClick"
          v-for="page in pdf_pages" :id="'the-canvas'+page" :key="page">
      </canvas>-->
      <canvas
          style="border: solid 1px red"
          @mousedown="mouseDown"
          @mousemove="mouseMove"
          @mouseup="mouseUp"
          v-for="page in pdf_pages" :id="'the-canvas'+page" :key="page">
      </canvas>
    </div>
  </div>
</template>
<script>
import PDFJS from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.entry'
//PDFJS.workerSrc = workerSrc;
//参考 https://www.jianshu.com/p/c4a885e67a74
import {base64Test} from '@/util/base64PdfTest'
import {pyJson} from './pyJson'

export default {
  name: '',
  components: {},
  data() {
    return {
      pdf_scale:1.0,//pdf放大系数
      pdf_pages:[],
      pdf_div_width:'',
      pdf_src:null,
      pdfBase64: '',
      //画布属性
      canvas: {},
      context: {},
      rectList: [], //矩形数组
      //矩形两个点
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isDrawing: false, //是否在画中
      isDragging: false, //是否在拖动中
      currentRect: {}, //当前选中的矩形
      color: 'red', //背景颜色
      //缩放比例大小
      serverWidth: 3306,
      serverHeight: 4678,
      //画布大小
      canvasWidth: 0,
      canvasHeight: 0,
      //比例
      scaleWidth: 1,
      scaleHeight: 1
    }
  },
  created() {
    this.get_pdfurl()
    this.pdfBase64 = base64Test
    //console.log(33, this.pdfBase64)
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
    get_pdfurl() {  //获得pdf
      //例子:加载pdf线上示例
      //this.pdf_src = 'https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf'
      //嘉里大通
      this.pdf_src = '/static/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
      //日托
      //this.pdf_src = '/static/BOOKING 11-26.pdf'
      //船期
      //this.pdf_src = '/static/Weekly Vessel Arrangement -- AUS NZ M.East IPak Red Sea Seagull-- 2020 W10 -- Version 4 0.pdf'
      //this.pdf_src = 'https://github.com/zhoufanglu/markdownPhoto/blob/master/test/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
      this._loadFile(this.pdf_src)
    },
    _loadFile(url) {  //初始化pdf
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
    _renderPage(num) {  //渲染pdf页
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
            let viewport = page.getViewport({scale: this.pdf_scale})
            console.log(85, page)

            this.canvasWidth = viewport.width
            this.canvasHeight = viewport.height

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

            //赋值
            this.canvas = canvas
            this.context = ctx
            setTimeout(()=>{
              this.loadCanvasByPy()
            }, 1000)
            //test
            this.calcSize()


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
      console.log('实际',`x:${e.layerX},y:${e.layerY}`)
      console.log('计算后',`x:${e.layerX * this.scaleWidth},y:${e.layerY*this.scaleHeight}`)
      console.log('再次计算后',`x:${e.layerX * this.scaleWidth * 1.433},y:${e.layerY*this.scaleHeight * 0.7}`)
      console.log('----')
      let point = {
        x: e.layerX,
        y: e.layerY
      }
      //console.log(107, e.layerX,e.layerY)
      let canvas = document.getElementById('the-canvas1')
      let ctx = canvas.getContext('2d')

      ctx.fillStyle = "#fb0606";
      //绘制成矩形
      // ctx.arc(point.x, point.y,5, 0, Math.PI * 5);
      ctx.fillRect(point.x - 4, point.y - 4, 8, 8);
      //设置字体样式
      ctx.font = "12px bold 宋体";
      //绘制文字
      ctx.fillText("(" + point.x + "," + point.y + ")", point.x, point.y);
    },

    convertToBase64() {
      //Read File
      var selectedFile = document.getElementById("inputFile").files;
      //Check File is not Empty
      if (selectedFile.length > 0) {
        // Select the very first file from list
        var fileToLoad = selectedFile[0];
        // FileReader function for read the file.
        var fileReader = new FileReader();
        var base64;
        // Onload of file read the file content
        fileReader.onload = function (fileLoadedEvent) {
          base64 = fileLoadedEvent.target.result;
          // Print data in console
          console.log(base64);
        };
        // Convert data to base64
        fileReader.readAsDataURL(fileToLoad);
      }
    },

    async sendAjax() {
      this.$api.user.detect({basestr: this.pdfBase64})
    },

    calcSize() {
      console.log('实际大小', this.canvasWidth, this.canvasHeight)
      console.log('后端大小', this.serverWidth, this.serverHeight)

      this.scaleWidth =  this.serverWidth/this.canvasWidth
      this.scaleHeight =  this.serverHeight/this.canvasHeight

      console.log('宽度比', this.scaleWidth)
      console.log('高度比', this.scaleHeight)

    },
    /**********************canvas事件***********************/
    mouseDown(e){
      this.startX = e.offsetX
      this.startY = e.offsetY
      const rectIndex = this.rectList.findIndex(item => {
        if (item.startX < item.endX) {
          if (item.startY < item.endY) {
            return this.startX > item.startX && this.startX < item.endX && this.startY > item.startY && this.startY < item.endY
          } else {
            return this.startX > item.startX && this.startX < item.endX && this.startY > item.endY && sthis.tartY < item.startY
          }
        } else {
          if (item.startY < item.endY) {
            return this.startX > item.endY && this.startX < item.startY && this.startY > item.startY && this.startY < item.endY
          } else {
            return this.startX > item.startX && this.startX < item.endX && this.startY > item.endY && this.startY < item.startY
          }
        }
      })
      if (rectIndex !== -1) {
        this.currentRect = this.rectList[rectIndex]
        this.isDragging = true
        this.currentRect.isSelected = true
        //undoArray.pop()
        const tempRectList = this.rectList.slice()
        const tempCurrentRect = Object.assign({}, this.currentRect)
        tempRectList.splice(rectIndex, 1, tempCurrentRect)
        //undoArray.push(tempRectList)
      } else {
        this.isDrawing = true
      }
    },
    mouseMove(e){
      this.endX = e.offsetX
      this.endY = e.offsetY
      if (this.isDrawing) {
        // context.clearRect(0, 0, canvas.width, canvas.height)
        this.drawRects()
        this.context.globalAlpha = 0.3
        this.context.beginPath()
        this.context.moveTo(this.startX, this.startY)
        this.context.lineTo(this.endX, this.startY)
        this.context.lineTo(this.endX, this.endY)
        this.context.lineTo(this.startX, this.endY)
        this.context.lineTo(this.startX, this.startY)
        //this.context.fillStyle = this.color
        this.context.fillStyle =  'rgba(225,225,225,.01)';
        //this.context.strokeStyle = 'black'
        this.context.fill()
        this.context.stroke()
      } else if (this.isDragging) {
        const w = Math.abs(this.startX - this.endX)
        const h = Math.abs(this.startY - this.endY)
        if (this.endX < this.startX) {
          this.startX -= w
          this.endX -= w
          this.currentRect.startX -= w
          this.currentRect.endX -= w
        }
        if (this.endX >= this.startX) {
          this.startX += w
          this.endX += w
          this.currentRect.startX += w
          this.currentRect.endX += w
        }
        if (this.endY < sthis.tartY) {
          this.startY -= h
          this.endY -= h
          this.currentRect.startY -= h
          this.currentRect.endY -= h
        }
        if (this.endY >= this.startY) {
          this.startY += h
          this.endY += h
          this.currentRect.startY += h
          this.currentRect.endY += h
        }
        // context.clearRect(0, 0, canvas.width, canvas.height)
        this.drawRects()
      }
    },
    mouseUp(e){
      class Rect{
        constructor(startX, startY, endX, endY, color) {
          this.startX = startX
          this.startY = startY
          this.endX = endX
          this.endY = endY
          //this.color = color
          this.isSelected = false
        }
      }
      if (this.isDrawing) {
        this.rectList.unshift(new Rect(this.startX, this.startY, this.endX, this.endY, this.color))
      }
      if (this.isDragging) {
        this.rectList.forEach(item => {
          item.isSelected = false
        })
      }
      /*this.undoArray.push(this.rectList.slice())
      this.redoArray = []*/
      this.isDrawing = false
      this.isDragging = false
      let {startX, startY, endX, endY} = this.rectList[0]
      /**********************找出pyJson内的值***********************/
      const startPoint = [startX * this.scaleWidth * 1.433, startY * this.scaleHeight * 0.7]
      const endPoint = [endX * this.scaleWidth * 1.433, endY * this.scaleHeight * 0.7]
      console.log('处理前方块', startX, startY, endX, endY)
      console.log('处理后方块',
          '\n',
          startPoint,
          '\n',
          endPoint
      )
      this.findValByRect(startPoint, endPoint)
    },
    //找出圈选内的值
    findValByRect(start, end) {
      //找出与python列表差不多区间的范围的值
      const offSet = 50 //偏移量
      const findObj = pyJson[0].data.find(i=>{
        const pyPos = i.text_box_position
        //比较第一个与第三个点 pyPos[0], pyPos[2]
        if(
            //匹配第一个
            (Math.abs(pyPos[0][0] - start[0]) < offSet &&
             Math.abs(pyPos[0][1] - start[1])  < offSet)
            &&
            //匹配第三个
            (Math.abs(pyPos[2][0] - end[0]) < offSet &&
             Math.abs(pyPos[2][1] - end[1])  < offSet)
        ){
          console.log(343, pyPos[0][0], start[0])
          console.log(343, pyPos[0][0] - start[0])
          return i
        }
      })
      console.log(348, findObj)
    },
    drawRects() {
      //this.clearCanvas()
      for (let i = 0; i < this.rectList.length; i++) {
        let rect = this.rectList[i]
        this.context.globalAlpha = 0.3
        this.context.beginPath()
        this.context.moveTo(rect.startX, rect.startY)
        this.context.lineTo(rect.endX, rect.startY)
        this.context.lineTo(rect.endX, rect.endY)
        this.context.lineTo(rect.startX, rect.endY)
        this.context.lineTo(rect.startX, rect.startY)
        //this.context.fillStyle = rect.color
        this.context.fill()
        if (rect.isSelected) {
          this.context.strokeStyle = 'black'
          this.context.stroke()
        }
      }
    },
    clearCanvas() {
      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    },
    //数据反填
    loadCanvasByPy() {
      //console.log(385, this.context)
      //this.context.strokeRect(50, 20, 120, 100)
      //通过后端给的点，计算出前端渲染的矩形
      pyJson[0].data.forEach(i=>{
        const pos = i.text_box_position
        //x: pos[0][0], y: pos[0][1] ,值都除以5.5

        const width = (this.pyParseFront(pos[2][0], 'x') - this.pyParseFront(pos[0][0], 'x'))
        const height = (this.pyParseFront(pos[2][1], 'y') - this.pyParseFront(pos[0][1], 'y'))
        const x = this.pyParseFront(pos[0][0], 'x')
        const y = this.pyParseFront(pos[0][1], 'y')
        //console.log(width, height)
        this.context.strokeRect(x, y, width, height)
      })
    },
    //数据解析, 后端转前端
    pyParseFront(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale = cate === 'x' ? this.scaleWidth : this.scaleHeight
      return val/areaScale/itemScale
    }
  }
}
</script>
<style lang="scss" scoped>
.p-name {
}
</style>
