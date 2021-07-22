<!--https://blog.csdn.net/lucky541788/article/details/103619561-->
<template>
  <div class="edit-anchor-zone">

<!--    <div class="edit-toolbar">
      <span class="toolbar-icon-wrap" :class="{'icon_active': isAnchorActive}">
        <el-tooltip class="item" effect="light" content="框选锚点" placement="top">
          框选锚点
          <el-button><i class="iconfont icon-OCR-circleselect toolbar-icon" @click="drawAnchor"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isTableActive}" v-if="!setAnchorFlag">
        框选列表
        <el-tooltip class="item" effect="light" content="框选列表" placement="top">
          <el-button><i class="iconfont icon-OCR-table toolbar-icon" @click="drawTable"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isdrawActive}">
        拖拽画布
        <el-tooltip class="item" effect="light" content="拖拽画布" placement="top">
          <el-button><i class="iconfont icon-OCR-drafting toolbar-icon" @click="dragDraw"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isZoomInActive}">
        <el-tooltip class="item" effect="light" content="放大" placement="top">
          放大
          <el-button><i class="iconfont icon-Zoomin toolbar-icon" @click="zoomIn"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isZoomOutActive}">
        <el-tooltip class="item" effect="light" content="缩小" placement="top">
          缩小
          <el-button><i class="iconfont icon-Zoomout toolbar-icon" @click="zoomOut"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isAdaptDrawActive}">
        适应画布
        <el-tooltip class="item" effect="light" content="适应画布" placement="top">
          <el-button><i class="iconfont icon-OCR-autoadaptation toolbar-icon" @click="adaptDraw"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isSetOriginActive}">
        <el-tooltip class="item" effect="light" content="原图" placement="top">
          原图
          <el-button><i class="iconfont icon-OCR-test toolbar-icon" @click="setOriginSize"></i></el-button>
        </el-tooltip>
      </span>
    </div>
    -->
    <div class="panel">
      <button @click="removeCurRect">删除选中</button>
      <button @click="submit">提交所有圈选</button>
<!--      <el-form
          label-position="left"
          :inline="true"
          :model="form"
          style="width:300px;border: solid 1px red">
        <h4>当前选中项</h4>
        <el-form-item label="坐标x：">
          <span>{{form.x}}</span>
        </el-form-item>
        <el-form-item label="坐标y：">
          <span>{{form.y}}</span>
        </el-form-item>
        <el-form-item label="宽度：">
          <span>{{form.width}}</span>
        </el-form-item>
        <el-form-item label="高度：">
          <span>{{form.height}}</span>
        </el-form-item>
        <el-form-item label="关键字key：">
          <el-input v-model="form.key" @input="keyInputChange"></el-input>
        </el-form-item>
      </el-form>-->
    </div>
    <div class="edit-body">
<!--      <div v-if="isLoading" class="init-page-tip">
        <i class="el-icon-loading"></i>
        <p>模板加载中，请稍后</p>
      </div>-->
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
      <div class="rect-panel">
        <div v-for="i in rectList1"
             :key="i.id"
             class="item"
             @click="rightItemClick(i.id)"
             :class="curRectId===i.id?'item-active':''"
        >
          <el-form :inline="false" :model="i" class="demo-form-inline">
            <el-form-item label="key" required>
              <el-input v-model="i.key"></el-input>
            </el-form-item>
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
            <el-form-item label="是否包含key">
              <el-select v-model="i.isHasKey">
                <el-option label="包含key" :value="1"></el-option>
                <el-option label="不包含key" :value="0"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitOnly(i)">识别选中区域</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <el-dialog title="请选择分割列数" :visible.sync="tableVisible" width="30%">
      <div class="select-wrapper">
        <div class="select">列数： <el-input-number v-model="tableCol" :min="2" :max="10" size='small'></el-input-number>
        </div>
      </div>
    </el-dialog>
<!--    <div style="margin-top:20px;">
      <el-button @click="mark">标记</el-button>
      <el-button @click="target">目标</el-button>
    </div>-->
  </div>
</template>

<script>
import PDFJS from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.entry'
import {base64Test} from '../../util/base64PdfTest'
import {pyJson} from './pyJson'

export default {
  data() {
    return {
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
      //toolbar
      isAnchorActive: false,
      isTableActive: false,
      isdrawActive: false,
      isZoomInActive: false,
      isZoomOutActive: false,
      isAdaptDrawActive: false,
      isSetOriginActive: false,

      // loading img
      isLoading: true,

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
      imgWidth: 0,
      imgHeight: 0,
      imgBase64Code: 0,
      movePoint: { x: null, y: null, width: null, height: null },

      // 选框
      setAnchorFlag: true, // true 为 rectList1 , false 为 rectList2
      rectList1: [],
      rectList2: [],
      tableList: [],
      tableVisible: false,
      tableCol: 2,
      color1: '#FF7782',
      color2: '#1E82FD',
      color3: '#4b1efd',
      opacity: 0.3,
      lineWidth: 2,
    }
  },
  watch: {
    rectList1: function (newVal, oldVal) {
      console.log('rectList1: ', newVal)
    },
    rectList2: function (newVal, oldVal) {
      console.log('rectList2: ', newVal)
    },
    tableList: function (newVal, oldVal) {
      console.log('tableList: ', newVal)
    },
  },
  methods: {
    /**********************加载和点击事件***********************/
    async detectPdf() {
      const res = await this.$api.user.detectLocal({
        pdfBase: base64Test
      })
      setTimeout(()=>{
        this.loadCanvasByPy(res.data)
      },1000)
    },
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
    //数据解析, 后端转前端
    pyParseFront(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale =  5.553726338706752
      return val/areaScale/itemScale
    },
    //前端转后端
    frontParsePy(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale =  5.553726338706752
      return val*areaScale*itemScale
    },
    submit() {
      console.log(225, this.rectList1)
    },
    submitOnly(i) {
      const params = {
        key: i.key,
        isHasKey: i.isHasKey,
        x: this.frontParsePy(i.x, 'x'),
        y: this.frontParsePy(i.y, 'y'),
        width: this.frontParsePy(i.width, 'x'),
        height: this.frontParsePy(i.height, 'y')
      }
      console.log(283, params)
    },
    rightItemClick(id) {
      this.curRectId = id
      this.selectId = id
      this.reShowRect(0, 0, false, this.selectId, 'revise')
    },
    /**********************canvas事件***********************/
    loadPdfCanvas() {
      const url = '/static/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
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

    removeCurRect() {
      console.log(136, this.selectId)
      const index = this.rectList1.findIndex(i=>i.id=== this.selectId)
      this.rectList1.splice(index, 1)
      this.reShowRect(0, 0, false, this.selectId, 'revise')
    },
    mark() {
      this.setAnchorFlag = true
      this.initDrawRect()
      this.drawAnchor()
    },
    target() {
      this.setAnchorFlag = false
      this.initDrawRect()
      this.drawAnchor()
    },
    initDraw(data) {
      this.isLoading = false;
      /*this.imgWidth = 1913;
      this.imgHeight = 1122;
      this.imgBase64Code = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1576560618051&di=b89a65984c6a0e5c4c8a3de5aa8f0fcd&imgtype=0&src=http%3A%2F%2Fimage.biaobaiju.com%2Fuploads%2F20180803%2F20%2F1533300579-gnUBlQZPbt.jpg'*/

      this.baseTarget = this.$refs.baseCanvas
      this.wrapperTarget = this.$refs.canvasWrapper

      this.computeInitData();
      this.drawCanvas();
      this.drawAnchor();
    },
    computeInitData() {
      let widthRatio = (this.drawWidth / this.imgWidth).toPrecision(5),
          heightRatio = (this.drawHeight / this.imgHeight).toPrecision(5);

      this.baseInstance = this.baseTarget.getContext('2d')

      this.initScaleVal = this.currentScaleVal = widthRatio >= heightRatio ? heightRatio : widthRatio;
      if (this.initScaleVal < 0.10) {
        this.initScaleVal = 0.10;
        this.currentScaleVal = 0.10;
      }
      if (this.initScaleVal > 4) {
        this.initScaleVal = 4;
        this.currentScaleVal = 4;
      }
      if (this.initScaleVal >= 1) {
        this.circlsRadius = 2;
      } else {
        this.circlsRadius = 4;
      }
    },
    zoomIn() {
      this.setToolBarUnactive();
      this.isZoomInActive = true;
      this.dragDrawX = 0;
      this.dragDrawY = 0;
      if (this.currentScaleVal > 4) {
        return;
      };
      this.adapt(this.currentScaleVal, parseFloat(this.currentScaleVal) + this.step)
      this.currentScaleVal = parseFloat(this.currentScaleVal) + this.step;
      this.drawCanvas();
    },
    zoomOut() {
      this.setToolBarUnactive();
      this.isZoomOutActive = true;
      this.dragDrawX = 0;
      this.dragDrawY = 0;
      if (this.currentScaleVal <= 0.10) {
        return;
      }
      this.adapt(this.currentScaleVal, parseFloat(this.currentScaleVal) - this.step)
      this.currentScaleVal -= this.step;
      this.drawCanvas();
    },
    setOriginSize() {
      this.setToolBarUnactive();
      this.isSetOriginActive = true;
      this.adapt(this.currentScaleVal, 1)
      this.currentScaleVal = 1;
      this.drawCanvas();
    },
    adaptDraw() {
      this.setToolBarUnactive();
      this.isAdaptDrawActive = true;
      this.adapt(this.currentScaleVal, this.initScaleVal)
      this.currentScaleVal = this.initScaleVal;
      this.dragDrawX = 0;
      this.dragDrawY = 0;
      this.drawCanvas();
    },
    dragDraw() {
      this.setToolBarUnactive();
      this.isdrawActive = true;
      this.baseTarget.style.cursor = 'move'
      this.dragCanvas()
    },
    drawAnchor() {
      this.setToolBarUnactive();
      this.isAnchorActive = true
      this._drawRect()
    },
    drawTable() {
      this.setToolBarUnactive();
      this.isTableActive = true
      this.tableVisible = true
      this._drawTable()
    },
    setToolBarUnactive() {
      this.isAnchorActive = false;
      this.isdrawActive = false;
      this.isZoomInActive = false;
      this.isZoomOutActive = false;
      this.isAdaptDrawActive = false;
      this.isSetOriginActive = false;
      this.isTableActive = false;
      this.baseTarget.style.cursor = 'default'
      this.clearHandle()
    },
    adapt(oldScale, newScale) {
      const adapt = (val) => val / oldScale * newScale;
      if (this.setAnchorFlag) {
        this.rectList1.map(item => {
          item.x = adapt(item.x)
          item.y = adapt(item.y)
          item.width = adapt(item.width)
          item.height = adapt(item.height)
        })
      } else {
        this.rectList2.map(item => {
          item.x = adapt(item.x)
          item.y = adapt(item.y)
          item.width = adapt(item.width)
          item.height = adapt(item.height)
        })
        this.tableList.map(item => {
          item.x = adapt(item.x)
          item.y = adapt(item.y)
          item.width = adapt(item.width)
          item.height = adapt(item.height)
        })
      }
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
    /*setCanvas() {
      this.baseTarget.width = this.movePoint.width
      this.baseTarget.height = this.movePoint.height
    },*/
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
            console.log(85, page)

            canvas.width = viewport.width * ratio
            canvas.height = viewport.height * ratio
            //存储Pdf原始大小
            this.pdfWidth = canvas.width
            this.pdfHeight = canvas.height
            //初始化圈选canvas大小
            this.baseTarget.width = canvas.width
            this.baseTarget.height = canvas.height
            this.baseTarget.style.width = viewport.width + 'px'
            this.baseTarget.style.height = viewport.height + 'px'

            this.movePoint = {
              height: canvas.height,
              width: canvas.width,
              x:0,
              y: 0
            }

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
            page.render(renderContext)
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
      if (this.setAnchorFlag) {
        this.rectList1.map(item => {
          this.baseInstance.beginPath()
          this.baseInstance.fillStyle = this.color1
          this.baseInstance.globalAlpha = this.opacity
          this.baseInstance.fillRect(item.x, item.y, item.width, item.height)
          this.baseInstance.closePath()
        })
      } else {
        this.rectList2.map(item => {
          this.baseInstance.beginPath()
          this.baseInstance.fillStyle = this.color2
          this.baseInstance.globalAlpha = this.opacity
          this.baseInstance.fillRect(item.x, item.y, item.width, item.height)
          this.baseInstance.closePath()
        })
        this.tableList.map(item => {
          this.baseInstance.beginPath()
          this.baseInstance.fillStyle = this.color3
          this.baseInstance.globalAlpha = this.opacity
          this.baseInstance.fillRect(item.x, item.y, item.width, item.height)
          this.baseInstance.closePath()
        })
      }
    },

    // 选框操作
    _drawRect() {
      let [moveIn, moved, mouseInit, mouse, move, selectList] = [false, false, {}, {}, {}, []]

      this.baseTarget.onmousedown = (e) => {
        mouseInit = { x: e.offsetX, y: e.offsetY }
        this.selectId = (this.setAnchorFlag ? this.rectList1 : this.rectList2).length
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
      }
    },
    getSelectRect(mouse) {
      let selectList = (this.setAnchorFlag ? this.rectList1 : this.rectList2).filter(item => {
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
      const key = '', isHasKey = 0;

      (this.setAnchorFlag ? this.rectList1 : this.rectList2)[id] = { x, y, width, height, id, key, isHasKey }
    },
    drawRectBorder(instance, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.initDrawRect();
      (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => {
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
          instance.strokeStyle = this.setAnchorFlag ? this.color1 : this.color2
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
            instance.strokeStyle = this.setAnchorFlag ? this.color1 : this.color2
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
      (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => {
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
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.x += moveX; item.y += moveY } })
          break
        case 'lLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.x += moveX; item.width -= moveX } })
          break
        case 'rLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.width += moveX } })
          break
        case 'tLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.y += moveY; item.height -= moveY } })
          break
        case 'bLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.height += moveY } })
          break
        case 'ltCircle':
          this.baseTarget.style.cursor = 'nw-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.x += moveX; item.y += moveY; item.width -= moveX; item.height -= moveY } })
          break
        case 'lbCircle':
          this.baseTarget.style.cursor = 'ne-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.x += moveX; item.width -= moveX; item.height += moveY } })
          break
        case 'rtCircle':
          this.baseTarget.style.cursor = 'ne-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.y += moveY; item.height -= moveY; item.width += moveX; } })
          break
        case 'rbCircle':
          this.baseTarget.style.cursor = 'nw-resize'
          moved && (this.setAnchorFlag ? this.rectList1 : this.rectList2).map(item => { if (item.id === id) { item.width += moveX; item.height += moveY } })
          break
        case 'revise':
          if (this.setAnchorFlag) {
            this.rectList1 = (this.setAnchorFlag ? this.rectList1 : this.rectList2).filter(item => item);
          } else {
            this.rectList2 = (this.setAnchorFlag ? this.rectList1 : this.rectList2).filter(item => item);
          };

          (this.setAnchorFlag ? this.rectList1 : this.rectList2).map((item, index, arr) => {
            if (item.id === id) {
              if (Math.abs(item.width) < this.minSelectArea || Math.abs(item.height) < this.minSelectArea) {
                this.$message.error('框选区过小，请重新框选!');
                arr.splice(index, 1)
                this.baseTarget.style.cursor = 'default'
              }
            }
          });
          (this.setAnchorFlag ? this.rectList1 : this.rectList2).map((item, index, arr) => {
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
      };

      this.drawRectBorder(this.baseInstance, id)
    },

    // 列表操作
    _drawTable() {
      let [moveIn, moved, mouseInit, mouse, move, selectList] = [false, false, {}, {}, {}, []]

      this.baseTarget.onmousedown = (e) => {
        mouseInit = { x: e.offsetX, y: e.offsetY }
        this.selectId = this.tableList.length
        moveIn = true
        moved = this.getSelectTable(mouseInit)
      }

      this.baseTarget.onmousemove = (e) => {
        mouse = { x: e.offsetX, y: e.offsetY }
        move = { x: mouse.x - mouseInit.x, y: mouse.y - mouseInit.y }

        // 新建拖拉选框
        if (moveIn && !moved) {
          return this.drawTableWithColor(this.baseInstance, mouseInit.x, mouseInit.y, move.x, move.y, this.selectId)
        }

        // 移动编辑操作
        mouseInit = { x: mouse.x, y: mouse.y }
        this.dragTable(moved, mouse.x, mouse.y, move.x, move.y, this.selectId)
      }

      this.baseTarget.onmouseup = (e) => {
        moveIn = false
        moved = false
        this.currentCursor = null
        this.reShowTable(0, 0, moved, this.selectId, 'revise')
      }
    },
    getSelectTable(mouse) {
      let selectList = this.tableList.filter(item => {
        const xFlag = mouse.x > item.x - this.circlsRadius && mouse.x < item.x + item.width + this.circlsRadius
        const yFlag = mouse.y > item.y - this.circlsRadius && mouse.y < item.y + item.height + this.circlsRadius
        return xFlag && yFlag
      })
      if (selectList.length) {
        this.selectId = selectList[selectList.length - 1] && selectList[selectList.length - 1].id
        this.drawTableBorder(this.baseInstance, this.selectId)
        return true
      }
      return false
    },
    drawTableWithColor(instance, x, y, width, height, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.initDrawRect();
      this.tableList[id] = { x, y, width, height, id }
    },
    drawTableBorder(instance, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.initDrawRect();
      this.tableList.map(item => {
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
          instance.strokeStyle = this.color3
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
            instance.strokeStyle = this.color3
            instance.lineWidth = this.lineWidth
            instance.globalAlpha = 1
            instance.stroke()
            instance.closePath()
          })

          // 画中间线
          if (!this.centerLineShow) return
          const rate = 1 / this.tableCol
          const x = rate
          if (!item.centerLineList) {
            item.centerLineList = []
            for (let i = 1; i < this.tableCol; i++) {
              item.centerLineList.push(x * i)
            }
          }
          item.centerLineList.map(rateX => {
            instance.beginPath()
            instance.moveTo(item.x + item.width * rateX, item.y)
            instance.lineTo(item.x + item.width * rateX, item.y + item.height)
            instance.strokeStyle = this.color3
            instance.lineWidth = this.lineWidth
            instance.globalAlpha = 1
            instance.stroke()
            instance.closePath()
            instance.beginPath()
            instance.arc(item.x + item.width * rateX, item.y + item.height / 2, this.circlsRadius, startAngle, endAngle)
            instance.fillStyle = '#fff'
            instance.fill()
            instance.strokeStyle = this.color3
            instance.lineWidth = this.lineWidth
            instance.globalAlpha = 1
            instance.stroke()
            instance.closePath()
          })
        }
      })
    },
    dragTable(moved, x, y, moveX, moveY, id) {
      if (id === null) return;
      this.tableList.map(item => {
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

          // 中间线
          let index = null
          const centerLine = item.centerLineList.some((rateX, i) => {
            index = i
            const xFlag = x > (item.x + item.width * rateX - this.circlsRadius) && x < (item.x + item.width * rateX + this.circlsRadius)
            const yFlag = y > (item.y + item.height / 2 - this.circlsRadius) && y < (item.y + item.height / 2 + this.circlsRadius)
            return xFlag && yFlag
          })

          // 使用当前 cursor 状态
          if (this.currentCursor) {
            return this.throttle(this.reShowTable)(moveX, moveY, moved, id, this.currentCursor)
          }

          if (ltCircle) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'ltCircle')
          } else if (lbCircle) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'lbCircle')
          } else if (rtCircle) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'rtCircle')
          } else if (rbCircle) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'rbCircle')
          } else if (lLine) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'lLine')
          } else if (rLine) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'rLine')
          } else if (tLine) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'tLine')
          } else if (bLine) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'bLine')
          } else if (centerLine) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'centerLine', index)
          } else if (move) {
            this.throttle(this.reShowTable)(moveX, moveY, moved, id, 'move')
          } else {
            this.baseTarget.style.cursor = 'default'
          }
        }
      })
    },
    reShowTable(moveX, moveY, moved, id, cursorStr, index = null) {
      this.baseTarget.style.cursor = cursorStr
      this.currentCursor = moved ? cursorStr : null
      this.baseInstance.clearRect(0, 0, this.movePoint.width, this.movePoint.height)
      if (cursorStr === 'ltCircle' || cursorStr === 'lbCircle' || cursorStr === 'rtCircle' || cursorStr === 'rbCircle' || cursorStr === 'lLine' || cursorStr === 'rLine' || cursorStr === 'tLine' || cursorStr === 'bLine') {
        this.centerLineShow = !moved
      }
      switch (cursorStr) {
        case 'centerLine':
          this.baseTarget.style.cursor = 'e-resize'
          this.centerLineIndex = index === null ? this.centerLineIndex : index
          moved && this.tableList.map(item => {
            const rateX = item.centerLineList[this.centerLineIndex]
            if (item.x + item.width * rateX + moveX <= item.x + this.circlsRadius) {
              return item.centerLineList[this.centerLineIndex] = (this.circlsRadius + 1) / item.width
            }
            if (item.x + item.width * rateX + moveX >= item.x + item.width - this.circlsRadius) {
              return item.centerLineList[this.centerLineIndex] = (item.width - this.circlsRadius - 1) / item.width
            }
            if (item.id === id && this.centerLineIndex !== null) {
              item.centerLineList[this.centerLineIndex] += moveX / item.width
            }
          })
          break
        case 'move':
          this.baseTarget.style.cursor = 'move'
          moved && this.tableList.map(item => { if (item.id === id) { item.x += moveX; item.y += moveY } })
          break
        case 'lLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.x += moveX; item.width -= moveX } })
          break
        case 'rLine':
          this.baseTarget.style.cursor = 'e-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.width += moveX } })
          break
        case 'tLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.y += moveY; item.height -= moveY } })
          break
        case 'bLine':
          this.baseTarget.style.cursor = 'n-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.height += moveY } })
          break
        case 'ltCircle':
          this.baseTarget.style.cursor = 'nw-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.x += moveX; item.y += moveY; item.width -= moveX; item.height -= moveY } })
          break
        case 'lbCircle':
          this.baseTarget.style.cursor = 'ne-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.x += moveX; item.width -= moveX; item.height += moveY } })
          break
        case 'rtCircle':
          this.baseTarget.style.cursor = 'ne-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.y += moveY; item.height -= moveY; item.width += moveX; } })
          break
        case 'rbCircle':
          this.baseTarget.style.cursor = 'nw-resize'
          moved && this.tableList.map(item => { if (item.id === id) { item.width += moveX; item.height += moveY } })
          break
        case 'revise':
          this.centerLineShow = true
          this.tableList = this.tableList.filter(item => item);
          this.tableList.map((item, index, arr) => {
            if (item.id === id) {
              if (Math.abs(item.width) < this.minSelectArea || Math.abs(item.height) < this.minSelectArea) {
                this.$message.error('框选区过小，请重新框选!');
                arr.splice(index, 1)
                this.baseTarget.style.cursor = 'default'
              }
            }
          });
          this.tableList.map((item, index, arr) => {
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
      };

      this.drawTableBorder(this.baseInstance, id)
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
      this.loadPdfCanvas()
      this.initDraw()
      //接口解析pdf,然后在canvas画出
      this.detectPdf()
    })
  },
}
</script>

<style lang='scss' scoped>
.edit-anchor-zone {
  width: 100%;
  .edit-toolbar {
    height: 60px;
    background-color: #565559;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .toolbar-icon-wrap {
      margin-right: 10px;
      .item {
        background-color: transparent;
        border-radius: 0;
        padding: 8px;
        font-size: 18px;
        color: #e5e5e5;
        border: 1px solid transparent;
      }
      &.icon_active {
        .item {
          color: red;
          border-color: red;
          background-color: red;
        }
      }
    }
  }
  .edit-body {
    height: 1000px;
    width: 100%;
    padding: 10px 0;
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
      width: 100%;
      height: 100%;
      /*width: 1000px;
      height: 1000px;*/
      /*position: absolute;
      top: 0;
      left: 0;*/
      .canvas {
        position: absolute;
        top: 0;
        left: 0;
      }
      .bg-canvas{
        position: absolute;
        top: 0;
        left: 0;
      }
    }

    .rect-panel{
      border: solid 1px red;
      //padding: 20px;
      padding: 20px 40px 20px 20px;
      overflow-y: auto;
      .item{
        padding: 10px;
        box-shadow:#eeeeee 0 0 10px;//四周
        width: 300px;
      }
      .item-active {
        box-shadow: rgb(157, 41, 42) 0 0 10px;//四周
      }
    }
  }
}
</style>
