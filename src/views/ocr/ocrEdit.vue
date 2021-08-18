<!--https://blog.csdn.net/lucky541788/article/details/103619561-->
<template>
  <div class="edit-anchor-zone">
    <sideBar></sideBar>
    <div class="panel">
      <input id="inputFile" type="file" @change="convertToBase64()" />
      <button @click="removeCurRect">删除选中</button>
      <button @click="submit">提交所有圈选</button>
    </div>
    <div class="edit-body">
      <div class="canvas-wrapper" ref='canvasWrapper'>
        <!--作为背景的canvas，有pdf,有后端传来的框选 -->
        <canvas
            class="bg-canvas"
            style="border: solid 1px red"
            v-for="page in pdf_pages"
            :id="'the-canvas'+page" :key="page">
        </canvas>
        <!--实际操作的canvas, 做圈选操作-->
        <canvas
            style="border: solid 1px green"
            width="1000px"
            height="1000px"
            ref="baseCanvas" class='canvas'>
        </canvas>
      </div>
      <div class="rect-panel"
           ref="checkPanel"
      >
        <div v-for="(i, index) in rectList1"
             :key="i.id"
             :id="'rect'+i.id"
             class="item"
             @click="rightItemClick(i.id)"
             :class="curRectId===i.id?'item-active':''"
        >
          <el-form :inline="false" :model="i" class="demo-form-inline">
            <el-form-item label="key" required>
              <el-input v-model="i.key"></el-input>
            </el-form-item>
            <!--辅助信息-->
            <el-form-item label="x">
              <span>{{i.x}}</span>
            </el-form-item>
            <el-form-item label="y">
              <span>{{i.y}}</span>
            </el-form-item>
            <el-form-item label="宽度">
              <span>{{i.width}}</span>
            </el-form-item>
            <el-form-item label="高度">
              <span>{{i.height}}</span>
            </el-form-item>
            <!--辅助信息-->
            <el-form-item label="选中是否包含key">
              <el-select v-model="i.isHasKey">
                <el-option label="包含key" :value="1"></el-option>
                <el-option label="不包含key" :value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitOnly(i, index)">识别选中区域</el-button>
              <div :class="i.text?'item-text':''"> {{i.text}}</div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'

import sideBar from './components/sideBar'
import workerSrc from 'pdfjs-dist/build/pdf.worker.entry'
import {base64Test} from '../../util/base64PdfTest'
import {pyJson} from './pyJson'

export default {
  components: {sideBar},
  data() {
    return {
      scaleWidth: 0, //canvas宽度比
      scaleHeight: 0, //canvas高度比
      pdfResData: [],//后端pdf解析的数据
      //当前选中的选框id
      curRectId: 0,
      //渲染PDF
      pdf_pages: 0,
      pdfWidth: 0,
      pdfHeight: 0,
      //form
      form: {
        key: '',
        x: 0,
        y: 0,
        height: 0,
        width: 0
      },
      //上一次选框的大小
      prevLength: 0,
      // refs
      wrapperTarget: null,
      baseTarget: null,
      baseInstance: null,
      selectId: null,
      currentCursor: null,
      centerLineIndex: null,
      centerLineShow: true,

      //base data
      drawWidth: 1000,
      drawHeight: 700,
      initScaleVal: 1,
      currentScaleVal: 1,
      circlsRadius: 2,
      step: 0.05000,
      minSelectArea: 5,
      movePoint: { x: null, y: null, width: null, height: null },

      // 选框
      rectList1: [],
      color1: '#FF7782',
      opacity: 0.3,
      lineWidth: 2,
    }
  },
  watch: {
    rectList1: function (newVal, oldVal) {
      console.log('rectList1: ', newVal)
    }
  },
  methods: {
    /**********************加载和点击事件***********************/
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
        const _this = this
        fileReader.onload =  async function (fileLoadedEvent) {
          base64 = fileLoadedEvent.target.result;
          // Print data in console
          //console.log(129, base64.split(',')[1]);
          const {data} = await _this.$api.discern.testUpload({
            /*"bizId": "offline_CarrierBooking_v1",
            "fileType": "pdf",
            "contentType": "FORMWORK",*/
            base64: base64.split(',')[1],
          })
          _this.pdfResData = data.reqData
          _this.loadPdfCanvas()
          /*setTimeout(()=>{
            _this.loadCanvasByPy(data.reqData)
          }, 1000)*/
          //console.log(137, data.reqData)
        };
        // Convert data to base64
        fileReader.readAsDataURL(fileToLoad);
      }
    },
    //在base canvas上画圈选
    /*async detectPdf() {
      const res = await this.$api.discern.detectLocal({
        pdfBase: base64Test
      })
      setTimeout(()=>{
        this.loadCanvasByPy(res.data)
      },1000)
    },*/
    //根据json渲染区域
    loadCanvasByPy(res) {
      console.log(235, res)
      const canvas = document.getElementById('the-canvas1')
      let ctx = canvas.getContext('2d')
      console.log(238, ctx)
      res.data.forEach(i=>{
        const pos = i.text_box_position
        //x: pos[0][0], y: pos[0][1] ,值都除以5.5

        const width = (this.pyParseFront(pos[2][0], 'x') - this.pyParseFront(pos[0][0], 'x'))
        const height = (this.pyParseFront(pos[2][1], 'y') - this.pyParseFront(pos[0][1], 'y'))
        const x = this.pyParseFront(pos[0][0], 'x')
        const y = this.pyParseFront(pos[0][1], 'y')
        //console.log(width, height)
        ctx.strokeStyle = '#666'
        ctx.setLineDash([5,2])
        //ctx.globalAlpha  = 0.5
        ctx.strokeRect(x, y, width, height)
      })
    },
    //获取上传的pdf的url
    /*async getPdfUrl() {
      const res = await this.$api.discern.testDown()
    },*/
    //数据解析, 后端转前端
    pyParseFront(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale = cate === 'x' ? this.scaleWidth : this.scaleHeight
      return val/areaScale/itemScale
    },
    //前端转后端
    frontParsePy(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale = cate === 'x' ? this.scaleWidth : this.scaleHeight
      return val*areaScale*itemScale
    },
    async submit() {
      //初始化参数
      let tempList = JSON.parse(JSON.stringify(this.rectList1))
      //判断是否有未填写的key，填上
      const findIndex = tempList.findIndex(i=>i.key==='')
      if(findIndex !== -1){
        this.selectId = tempList[findIndex].id
        this.curRectId = tempList[findIndex].id
        this.$message.error('请填写key')
        return false
      }

      const sbList = tempList.reduce((prev, cur, index, arr) => {
        const temp = {
          key: cur.key,
          isHasKey: cur.isHasKey,
          x: this.frontParsePy(cur.x, 'x'),
          y: this.frontParsePy(cur.y, 'y'),
          width: this.frontParsePy(cur.width, 'x'),
          height: this.frontParsePy(cur.height, 'y')
        }
        prev.push(temp)
        return prev
      }, [])
      //进行识别赋值
      const {data} = await this.$api.discern.testUploadExcute({sblist: sbList})
      //数据反填
      data.reqData.dataList.forEach((i, index)=>{
        this.rectList1[index].text = i.text
      })
    },
    async submitOnly(i,index) {
      if(!i.key){
        this.$message.error('请填写Key！')
        return false
      }
      const params = {
        key: i.key,
        isHasKey: i.isHasKey,
        x: this.frontParsePy(i.x, 'x'),
        y: this.frontParsePy(i.y, 'y'),
        width: this.frontParsePy(i.width, 'x'),
        height: this.frontParsePy(i.height, 'y')
      }
      //const res = await this.$api.discern.boxInfo(params)
      const {data} = await this.$api.discern.testUploadExcute({sblist: [params]})
      this.rectList1[index].text = data.reqData.dataList[0].text
    },
    rightItemClick(id) {
      this.curRectId = id
      this.selectId = id
      this.reShowRect(0, 0, false, this.selectId, 'revise')
    },
    /**********************canvas事件***********************/
    loadPdfCanvas() {
      //const url = '/static/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
      const url = 'http://192.168.129.192:9099/ocr/test/down'
      let loadingTask = PDFJS.getDocument(url)
      loadingTask.promise
          .then((pdf) => {
            this.pdfDoc = pdf
            this.pdf_pages = this.pdfDoc.numPages
            this.$nextTick(() => {
              //这边pdf就一页，默认为1页
              this._renderPage(1)
            })
          })
    },
    //删除当前的选区
    removeCurRect() {
      console.log(136, this.selectId, this.isAnchorActive, this.isTableActive)
      if(this.isAnchorActive) {//单个方块选区
        const index = this.rectList1.findIndex(i=>i.id=== this.selectId)
        this.rectList1.splice(index, 1)
      } else if(this.isTableActive){ //列表选区
        const index = this.tableList.findIndex(i=>i.id=== this.selectId)
        this.tableList.splice(index, 1)
        console.log(292, this.tableList)
      }
      this.reShowRect(0, 0, false, this.selectId, 'revise')
    },
    mark() {
      //this.setAnchorFlag = true
      this.initDrawRect()
      this.drawAnchor()
    },

    initDraw() {
      this.baseTarget = this.$refs.baseCanvas
      this.wrapperTarget = this.$refs.canvasWrapper

      this.computeInitData();
      this.drawCanvas();
      this.drawAnchor();
    },
    computeInitData() {
      this.baseInstance = this.baseTarget.getContext('2d')
    },
    drawAnchor() {
      this._drawRect()
    },
    adapt(oldScale, newScale) {
      const adapt = (val) => val / oldScale * newScale;
      this.rectList1.map(item => {
        item.x = adapt(item.x)
        item.y = adapt(item.y)
        item.width = adapt(item.width)
        item.height = adapt(item.height)
      })
    },

    // 画布全局方法
    deepCopy(obj) {
      const result = Array.isArray(obj) ? [] : {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] instanceof Object || obj[key] instanceof Array) {
            result[key] = deepCopy(obj[key]);
          } else {
            result[key] = obj[key];
          }
        }
      }
      return result;
    },
    setWrapper() {
      this.wrapperTarget.style.left = `${this.movePoint.x}px`
      this.wrapperTarget.style.top = `${this.movePoint.y}px`
      this.wrapperTarget.style.width = `${this.movePoint.width}px`
      this.wrapperTarget.style.height = `${this.movePoint.height}px`
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
            let viewport = page.getViewport({scale: 1}) //缩放默认为1
            //radio会根据屏幕变化而变化，这里默认设置1
            //ratio = 1
            //默认的pdf实际大小
            let defaultPdfWidth = viewport.width
            let defaultPdfHeight = viewport.height

            canvas.width = viewport.width * ratio
            canvas.height = viewport.height * ratio
            //存储Pdf原始大小
            this.pdfWidth = canvas.width
            this.pdfHeight = canvas.height
            //初始化圈选canvas大小
            this.baseTarget.width = defaultPdfWidth
            this.baseTarget.height = defaultPdfHeight
            this.baseTarget.style.width = defaultPdfWidth + 'px'
            this.baseTarget.style.height = defaultPdfHeight + 'px'
            //console.log(504, canvas.width, canvas.height)
            //初始化右侧选择框高度
            //console.log(513, this.$refs.checkPanel)
            this.$refs.checkPanel.style.height = defaultPdfHeight + 'px'

            this.movePoint = {
              height: canvas.height,
              width: canvas.width,
              x:0,
              y: 0
            }
            //console.log(511, this.movePoint)

            /*this.wrapperTarget.style.width = canvas.width
            this.wrapperTarget.style.height = canvas.height*/

            canvas.style.width = viewport.width + 'px'

            that.pdf_div_width = viewport.width + 'px'

            canvas.style.height = viewport.height + 'px'

            ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
            let renderContext = {
              canvasContext: ctx,
              viewport: viewport
            }
            page.render(renderContext).promise.then(()=>{
              console.log('pdf渲染完成')
              //计算宽高比
              this.scaleWidth =  this.pdfResData.shape[0]/defaultPdfWidth
              this.scaleHeight =  this.pdfResData.shape[1]/defaultPdfHeight
              console.log(384, this.scaleWidth, this.scaleHeight)
              //然后进行选框
              this.loadCanvasByPy(this.pdfResData)
            })
            if (this.pdf_pages > num) {
              this._renderPage(num + 1)
            }
          })
    },

    throttle(fn, time = 10) {
      let timer = null
      return (...args) => {
        if (!timer) {
          timer = setTimeout(() => {
            fn.apply(null, args)
            timer = null
          }, time);
        }
      }
    },
    clearHandle() {
      this.baseTarget.onmousedown = null
      this.baseTarget.onmousemove = null
      this.baseTarget.onmouseup = null

      this.wrapperTarget.onmousedown = null
      this.wrapperTarget.onmousemove = null
      this.wrapperTarget.onmouseup = null
    },

    // 画布操作
    drawCanvas(moveX = 0, moveY = 0) {
      //const [width, height] = [this.imgWidth * this.currentScaleVal, this.imgHeight * this.currentScaleVal]
      this.movePoint = {
        height: 500,
        width: 500,
        x:0,
        y: 0
      }
      //this.setWrapper()
      //this.setCanvas()
      this.initDrawRect()
      /*const img = new Image()
      img.onload = () => {
        /!*[this.movePoint.x, this.movePoint.y] = this.isdrawActive ?
            [this.movePoint.x + moveX, this.movePoint.y + moveY] :
            [(this.drawWidth - width) / 2, (this.drawHeight - height) / 2];
        [this.movePoint.width, this.movePoint.height] = [width, height]
        console.log(446, this.movePoint)*!/
        //this.baseTarget.style.backgroundImage = `url(${img.src})`
        //this.baseTarget.style.backgroundSize = `${width}px ${height}px`

      }
      img.src = this.imgBase64Code*/
    },
    dragCanvas() {
      let [moveIn, mouseInit, mouse, move] = [false, {}, {}, {}]

      this.wrapperTarget.onmousedown = (e) => {
        mouseInit = { x: e.clientX, y: e.clientY }
        moveIn = true
      }

      this.wrapperTarget.onmousemove = (e) => {
        mouse = { x: e.clientX, y: e.clientY }
        move = { x: mouse.x - mouseInit.x, y: mouse.y - mouseInit.y }
        if (moveIn) {
          mouseInit = { x: mouse.x, y: mouse.y }
          this.throttle(this.drawCanvas)(move.x, move.y)
        }
      }

      this.wrapperTarget.onmouseup = (e) => {
        moveIn = false
      }
    },
    initDrawRect() {
      this.baseInstance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.rectList1.map(item => {
        this.baseInstance.beginPath()
        this.baseInstance.fillStyle = this.color1
        this.baseInstance.globalAlpha = this.opacity
        this.baseInstance.fillRect(item.x, item.y, item.width, item.height)
        this.baseInstance.closePath()
      })
    },

    // 选框操作
    _drawRect() {
      let [moveIn, moved, mouseInit, mouse, move, selectList] = [false, false, {}, {}, {}, []]

      this.baseTarget.onmousedown = (e) => {
        mouseInit = { x: e.offsetX, y: e.offsetY }
        console.log(634, mouseInit)
        this.selectId = this.rectList1.length
        moveIn = true
        moved = this.getSelectRect(mouseInit)
      }

      this.baseTarget.onmousemove = (e) => {
        mouse = { x: e.offsetX, y: e.offsetY }
        move = { x: mouse.x - mouseInit.x, y: mouse.y - mouseInit.y }

        // 新建拖拉选框
        if (moveIn && !moved) {
          return this.drawRectWithColor(this.baseInstance, mouseInit.x, mouseInit.y, move.x, move.y, this.selectId)
        }
        // 移动编辑操作
        mouseInit = { x: mouse.x, y: mouse.y }
        this.dragRect(moved, mouse.x, mouse.y, move.x, move.y, this.selectId)
      }

      this.baseTarget.onmouseup = (e) => {
        /**********************判断是否是新增，***********************/
        /*console.log(418, this.rectList1)
        console.log(421, this.prevLength)*/
        if(this.prevLength === this.rectList1.length){
          console.log('修改或者移动操作')
        }else{
          console.log('增加操作')
        }
        const curChooseRect = this.rectList1.find(i=>i.id===this.selectId)
        console.log(448, curChooseRect)
        if(curChooseRect){
          this.curRectId = curChooseRect.id
          this.form = {...curChooseRect}
          this.prevLength = this.rectList1.length
        }
        /*const index = this.rectList1.findIndex(i=>i.id=== this.selectId)
        console.log(this.selectId)
        console.log(421, this.rectList1)
        if(index === -1){
          console.log('新增了选框')
        }else{
          console.log('修改或者移动了选框')
        }*/
        /**********************选框事件***********************/
        moveIn = false
        moved = false
        this.currentCursor = null
        this.reShowRect(0, 0, moved, this.selectId, 'revise')
        //锚记链接
        this.$nextTick(()=>{
          if(curChooseRect){
            document.getElementById('rect'+ this.curRectId).scrollIntoView()
          }
        })
      }
    },
    getSelectRect(mouse) {
      let selectList = this.rectList1.filter(item => {
        const xFlag = mouse.x > item.x - this.circlsRadius && mouse.x < item.x + item.width + this.circlsRadius
        const yFlag = mouse.y > item.y - this.circlsRadius && mouse.y < item.y + item.height + this.circlsRadius
        return xFlag && yFlag
      })
      if (selectList.length) {
        this.selectId = selectList[selectList.length - 1] && selectList[selectList.length - 1].id
        this.drawRectBorder(this.baseInstance, this.selectId)
        return true
      }
      return false
    },
    drawRectWithColor(instance, x, y, width, height, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.initDrawRect();
      //初始化，增加两个值，key, 是否包含key
      const key = '', isHasKey = 0, text = '';

      this.rectList1[id] = { x, y, width, height, id, key, isHasKey, text }
    },
    drawRectBorder(instance, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.initDrawRect();
      (this.rectList1).map(item => {
        if (item.id === id) {
          const [startAngle, endAngle, pointList] = [
            0,
            2 * Math.PI,
            [
              { x: item.x + item.width, y: item.y },
              { x: item.x + item.width, y: item.y + item.height },
              { x: item.x, y: item.y + item.height },
              { x: item.x, y: item.y },
            ]
          ]

          // 画边框
          instance.beginPath()
          instance.moveTo(item.x, item.y)
          pointList.map(item => {
            instance.lineTo(item.x, item.y)
          })
          instance.strokeStyle = this.color1
          instance.lineWidth = this.lineWidth
          instance.globalAlpha = 1
          instance.stroke()
          instance.closePath()

          // 画四角圆
          pointList.map(item => {
            instance.beginPath()
            instance.arc(item.x, item.y, this.circlsRadius, startAngle, endAngle)
            instance.fillStyle = '#fff'
            instance.fill()
            instance.strokeStyle = this.color1
            instance.lineWidth = this.lineWidth
            instance.globalAlpha = 1
            instance.stroke()
            instance.closePath()
          })
        }
      })
    },
    dragRect(moved, x, y, moveX, moveY, id) {
      if (id === null) return;
      (this.rectList1).map(item => {
        if (item.id === id) {
          const getPoint = (a, b, step) => ([a - step, a + step, a + b - step, a + b + step])
          const xLine = getPoint(item.x, item.width, this.lineWidth),
              yLine = getPoint(item.y, item.height, this.lineWidth),
              xCircle = getPoint(item.x, item.width, this.circlsRadius),
              yCircle = getPoint(item.y, item.height, this.circlsRadius);
          // r:right; l:left; t:top; b:bottom;
          const move = x > xLine[1] && x < xLine[2] && y > yLine[1] && y < yLine[2],
              lLine = x > xLine[0] && x < xLine[1],
              rLine = x > xLine[2] && x < xLine[3],
              tLine = y > yLine[0] && y < yLine[1],
              bLine = y > yLine[2] && y < yLine[3],
              ltCircle = x > xCircle[0] && x < xCircle[1] && y > yCircle[0] && y < yCircle[1],
              lbCircle = x > xCircle[0] && x < xCircle[1] && y > yCircle[2] && y < yCircle[3],
              rtCircle = x > xCircle[2] && x < xCircle[3] && y > yCircle[0] && y < yCircle[1],
              rbCircle = x > xCircle[2] && x < xCircle[3] && y > yCircle[2] && y < yCircle[3];

          // 使用当前 cursor 状态
          if (this.currentCursor) {
            return this.throttle(this.reShowRect)(moveX, moveY, moved, id, this.currentCursor)
          }

          if (ltCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'ltCircle')
          } else if (lbCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'lbCircle')
          } else if (rtCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'rtCircle')
          } else if (rbCircle) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'rbCircle')
          } else if (lLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'lLine')
          } else if (rLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'rLine')
          } else if (tLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'tLine')
          } else if (bLine) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'bLine')
          } else if (move) {
            this.throttle(this.reShowRect)(moveX, moveY, moved, id, 'move')
          } else {
            this.baseTarget.style.cursor = 'default'
          }
        }
      })
    },
    reShowRect(moveX, moveY, moved, id, cursorStr) {
      this.baseTarget.style.cursor = cursorStr
      this.currentCursor = moved ? cursorStr : null
      this.baseInstance.clearRect(0, 0, this.movePoint.width, this.movePoint.height)
      switch (cursorStr) {
        case 'move':
          this.baseTarget.style.cursor = 'move'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.x += moveX; item.y += moveY } })
          break
        case 'lLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved && (this.rectList1 ).map(item => { if (item.id === id) { item.x += moveX; item.width -= moveX } })
          break
        case 'rLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.width += moveX } })
          break
        case 'tLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.y += moveY; item.height -= moveY } })
          break
        case 'bLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.height += moveY } })
          break
        case 'ltCircle':
          this.baseTarget.style.cursor = 'nw-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.x += moveX; item.y += moveY; item.width -= moveX; item.height -= moveY } })
          break
        case 'lbCircle':
          this.baseTarget.style.cursor = 'ne-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.x += moveX; item.width -= moveX; item.height += moveY } })
          break
        case 'rtCircle':
          this.baseTarget.style.cursor = 'ne-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.y += moveY; item.height -= moveY; item.width += moveX; } })
          break
        case 'rbCircle':
          this.baseTarget.style.cursor = 'nw-resize'
          moved && (this.rectList1).map(item => { if (item.id === id) { item.width += moveX; item.height += moveY } })
          break
        case 'revise':
          this.rectList1 = (this.rectList1).filter(item => item);

          (this.rectList1).map((item, index, arr) => {
            if (item.id === id) {
              if (Math.abs(item.width) < this.minSelectArea || Math.abs(item.height) < this.minSelectArea) {
                this.$message.error('框选区过小，请重新框选!');
                arr.splice(index, 1)
                this.baseTarget.style.cursor = 'default'
              }
            }
          });
          (this.rectList1).map((item, index, arr) => {
            if (item.id === id) {
              if (item.width < 0) {
                item.x += item.width
                item.width = Math.abs(item.width)
              }
              if (item.height < 0) {
                item.y += item.height
                item.height = Math.abs(item.height)
              }
            }
            item.id = index
          })
          break
      }

      this.drawRectBorder(this.baseInstance, id)
    },

    //form操作
    keyInputChange() {
      const curIndex = this.rectList1.findIndex(i=>i.id===this.selectId)
      if(curIndex !== -1){
        this.rectList1[curIndex].key = this.form.key
        this.rectList1[curIndex].isHasKey = 0
      }
    }
  },
  mounted() {
    this.$nextTick(() => {
      //加载初始化背景的canvas
      //this.loadPdfCanvas()
      //初始化可以画画的canvas
      this.initDraw()
      //接口解析pdf,然后在背景canvas画出辅助线选框
      //this.detectPdf()
    })
  },
}
</script>

<style lang='scss' scoped>
.edit-anchor-zone {
  width: 100%;
  .panel{
    margin-left: 100px;
  }
  .edit-body {
    margin-left: 100px;
    //height: 1000px;
    width: 100%;
    //padding: 10px 0;
    box-sizing: border-box;
    background-color: white;
    position: relative;
    overflow: hidden;
    display: flex;
    .init-page-tip {
      position: absolute;
      top: 40%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      color: #e5e5e5;
      .el-icon-loading {
        font-size: 40px;
        margin-bottom: 20px;
      }
    }
    .canvas-wrapper {
      /*width: 100%;
      height: 100%;*/
      position: relative;
      .canvas {
        position: absolute;
        top: 0;
        left: 0;
      }
      .bg-canvas{
        /*position: absolute;
        top: 0;
        left: 0;*/
      }
    }

    .rect-panel{
      border: solid 1px red;
      box-sizing: border-box;
      //padding: 20px;
      padding: 20px 40px 20px 20px;
      overflow-y: auto;
      .item{
        padding: 10px;
        box-shadow:#eeeeee 0 0 10px;//四周
        width: 300px;
      }
      .item-active {
        box-shadow: $theme 0 0 10px;//四周
      }
      .item-text{
        overflow: auto;
        border: solid 1px $theme;
      }
    }
  }
}
</style>
