<template>
  <div class="edit-anchor-zone">
    <h1>制作模板</h1>
    <div class="panel">
      <el-button type="primary" size="mini" @click="$router.push('/discernPdf')">去识别Pdf</el-button>
      <input id="inputFile" type="file" @change="convertToBase64()" />
      <button @click="removeCurRect">删除选中</button>
      <button @click="submitAll">提交所有圈选</button>
      <button @click="testCalc">测试计算</button>
    </div>
    <div class="edit-toolbar">
      <span class="toolbar-icon-wrap" :class="{'icon_active': isAnchorActive}">
        <el-tooltip class="item" effect="light" content="框选锚点" placement="top">
          <el-button  @click="drawAnchor">框选锚点<i class="iconfont icon-OCR-circleselect toolbar-icon"></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isTableActive}" v-if="!setAnchorFlag">
        <el-tooltip class="item" effect="light" content="框选列表" placement="top">
          <el-button  @click="drawTable">框选列表<i class="iconfont icon-OCR-table toolbar-icon"></i></el-button>
        </el-tooltip>
      </span>
<!--      <span class="toolbar-icon-wrap" :class="{'icon_active': isdrawActive}">
        <el-tooltip class="item" effect="light" content="拖拽画布" placement="top">
          <el-button @click="dragDraw">拖拽画布<i class="iconfont icon-OCR-drafting toolbar-icon" ></i></el-button>
        </el-tooltip>
      </span>-->
<!--      <span class="toolbar-icon-wrap" :class="{'icon_active': isZoomInActive}">
        <el-tooltip class="item" effect="light" content="放大" placement="top">
          <el-button @click="zoomIn"> 放大<i class="iconfont icon-Zoomin toolbar-icon" ></i></el-button>
        </el-tooltip>
      </span>
      <span class="toolbar-icon-wrap" :class="{'icon_active': isZoomOutActive}">
        <el-tooltip class="item" effect="light" content="缩小" placement="top">
          <el-button @click="zoomOut">缩小<i class="iconfont icon-Zoomout toolbar-icon" ></i></el-button>
        </el-tooltip>
      </span>-->
<!--      <span class="toolbar-icon-wrap" :class="{'icon_active': isAdaptDrawActive}">
        <el-tooltip class="item" effect="light" content="适应画布" placement="top">
          <el-button @click="adaptDraw">适应画布<i class="iconfont icon-OCR-autoadaptation toolbar-icon"></i></el-button>
        </el-tooltip>
      </span>-->
<!--      <span class="toolbar-icon-wrap" :class="{'icon_active': isSetOriginActive}">
        <el-tooltip class="item" effect="light" content="原图" placement="top">
          <el-button @click="setOriginSize">原图<i class="iconfont icon-OCR-test toolbar-icon" ></i></el-button>
        </el-tooltip>
      </span>-->
    </div>
    <div class="edit-body">
      <div v-if="isLoading" class="init-page-tip">
        <i class="el-icon-loading"></i>
        <p>模板加载中，请稍后</p>
      </div>
      <div class="canvas-wrapper" ref='canvasWrapper'>
        <!--作为背景的canvas，有pdf,有后端传来的框选 -->
<!--        <canvas
            class="bg-canvas"
            style="border: solid 1px red"
            v-for="page in pdf_pages"
            :id="'bg-canvas'+page" :key="page">
        </canvas>-->
        <!--暂时就做一页-->
        <canvas
            class="bg-canvas"
            style="border: solid 1px red"
            id="bg-canvas1"
            >
        </canvas>
        <!--实际操作的canvas, 做圈选操作-->
        <canvas
            width="1000" height="700"
                ref="operateCanvas"
            class='operate-canvas'>
        </canvas>
      </div>
      <!--右侧选框绑定内容-->
      <div class="rect-panel"
           ref="checkPanel"
      >
        <!--圈选方块-->
        <div class="rect-column">
          <h4>圈选的方块</h4>
          <div v-for="(i, index) in rectList2"
               :key="i.id"
               :id="'rect'+i.id"
               class="item"
               @click="rightItemClick(i.id, 'rect')"
               :class="curRectId===i.id?'item-active':''"
          >
            <el-form :inline="false" :model="i" class="demo-form-inline">
              <el-form-item :label="'key' +'-'+ i.id" required>
                <el-input v-model="i.key"></el-input>
              </el-form-item>
              <!--辅助信息-->
<!--              <el-form-item label="x">
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
              </el-form-item>-->
              <!--辅助信息-->
              <el-form-item label="选中是否包含key">
                <el-select v-model="i.isHasKey">
                  <el-option label="包含key" :value="1"></el-option>
                  <el-option label="不包含key" :value="0"></el-option>
                </el-select>
              </el-form-item>
<!--              <el-form-item>
                <el-button type="primary" @click="submitOnly(i, index, 'rect')">识别选中区域</el-button>
                <div :class="i.text?'item-text':''"> {{i.text}}</div>
              </el-form-item>-->
            </el-form>
          </div>
        </div>
        <!--圈选列表-->
        <div class="table-column">
          <h4>圈选列表</h4>
          <div v-for="(i, index) in tableList"
               :key="i.id"
               :id="'table'+i.id"
               class="item"
               @click="rightItemClick(i.id, 'table')"
               :class="curTableId===i.id?'item-active':''"
          >
            <el-form :inline="false" :model="i" class="demo-form-inline">
              <el-form-item :label="'表名(key)' + i.id" required>
                <el-input v-model="i.key"></el-input>
              </el-form-item>
              <!--辅助信息-->
<!--              <el-form-item label="x">
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
              </el-form-item>-->
              <!--辅助信息-->
              <el-form-item label="表格最大行数">
                <el-input-number v-model="i.maxRows" :min="1" :max="50"></el-input-number>
              </el-form-item>
              <el-form-item>
                <div v-for="(col, colIndex) in i.columnList">
                  <label>第{{colIndex+1}}列的key为:</label>
                  <span style="display:inline-block; width: 100px">
                    <el-input
                        @input="colChange"
                        size="small"
                        v-model="col.key">
                    </el-input>
                  </span>
                </div>
              </el-form-item>
<!--              <el-form-item>
                <el-button type="primary" @click="submitOnly(i, index, 'table')">识别选中区域</el-button>
                <div :class="i.text?'item-text':''"> {{i.text}}</div>
              </el-form-item>-->
            </el-form>
          </div>
        </div>
      </div>
    </div>
    <el-dialog title="请选择分割列数" :visible.sync="tableVisible" width="30%">
      <div class="select-wrapper">
        <div class="select">列数： <el-input-number v-model="tableCol" :min="2" :max="20" size='small'></el-input-number>
        </div>
        <el-button @click="tableVisible=false" style="margin-top: 20px;">确定</el-button>
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

export default {
  data() {
    return {
      pdfBase: null,
      scaleWidth: 0, //canvas宽度比
      scaleHeight: 0, //canvas高度比
      pdfResData: [],//后端pdf解析的数据
      //当前选中的选框id
      curRectId: 0,
      curTableId: 0,
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
      minSelectArea: 15,
      imgWidth: 0,
      imgHeight: 0,
      imgBase64Code: 0,
      movePoint: { x: null, y: null, width: null, height: null },

      // 选框
      setAnchorFlag: false, // true 为 rectList1 , false 为 rectList2
      rectList1: [],
      rectList2: [],
      tableList: [],
      tableVisible: false,
      tableCol: 2,
      color1: '#FF7782',
      color2: '#1E82FD',
      color3: 'rgba(62,3,132,0.5)',
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
      console.log('rectList2: ', JSON.stringify(newVal))
    },
    tableList: function (newVal, oldVal) {
      console.log('tableList: ', newVal)
      /*console.log('tableList: ', JSON.stringify(newVal))
      */
      //增加columnList
      this.tableList.forEach(i=>{
        //判断数据有无初始化过,没有 就增加centerLineListTemp属性，反之更新数值
        /*if(false){
          console.log('初始化，计算数值')
          //为分割线，增加首尾两条线,增加新的centerLineListTemp
          i.centerLineListTemp = [...i.centerLineList]
          i.centerLineListTemp.unshift(0)
          i.centerLineListTemp.push(1)
          i.columnList = []
          const centerLineList = i.centerLineListTemp
          let widthCale = 0 //每块的宽度占比
          centerLineList.forEach((line,lineIndex)=>{
            if(lineIndex!==centerLineList.length-1){
              //当前块的宽度比例为后面一个减前面一个
              widthCale = i.centerLineListTemp[lineIndex+1] - line
              //为列表增加columnList，里面有每块的x,y,width,height,key
              //console.log(281, widthCale)
              i.columnList.push({
                width: i.width * widthCale,
                height: i.height,
                y: i.y,
                key: ''
              })
            }
          })
          //计算出偏移量x的值, 计算方法为，当前点 加上前面宽的的和,还要加上x默认的偏移量
          i.columnList.forEach((col,colIndex)=>{
            const defaultX = i.x
            if(colIndex === 0){
              col.x = defaultX
            }else{
              let x = defaultX
              for(let j=0;j<colIndex;j++){
                x += i.columnList[j].width
              }
              console.log(304, x)
              col.x = x
            }
          })
        }*/
      })
      //this.tableList = newVal
      //console.log(287, newVal)
      /**********************给当前的columnList的属性计算出来***********************/
      let curTableItem = this.tableList.find(i=>i.id === this.curTableId)
      /*const findIndex = this.tableList.findIndex(i=>i.id === this.curTableId)
      let curTableItem = this.deepCopy(this.tableList[findIndex])*/
      console.log('当前方框的属性', curTableItem)
      if(!curTableItem){
        return false
      }
      //增加centerLineListTemp属性，包含0 跟 1的线
      curTableItem.centerLineListTemp = [...curTableItem.centerLineList]
      curTableItem.centerLineListTemp.unshift(0)
      curTableItem.centerLineListTemp.push(1)
      /*if(!curTableItem.hasOwnProperty('centerLineListTemp')){
        curTableItem.centerLineListTemp = [...curTableItem.centerLineList]
        curTableItem.centerLineListTemp.unshift(0)
        curTableItem.centerLineListTemp.push(1)
      }*/
      //计算width, height, y
      const centerLineList = curTableItem.centerLineListTemp
      let widthCale = 0 //每块的宽度占比
      centerLineList.forEach((line,lineIndex)=>{
        if(lineIndex!==centerLineList.length-1){
          //当前块的宽度比例为后面一个减前面一个
          widthCale = curTableItem.centerLineListTemp[lineIndex+1] - line
          //为列表增加columnList，里面有每块的x,y,width,height,key
          //console.log(281, widthCale)
          curTableItem.columnList[lineIndex] =
              Object.assign(
                  curTableItem.columnList[lineIndex],
                  {
                    width: curTableItem.width * widthCale,
                    height: curTableItem.height,
                    y: curTableItem.y,
                  })
          //计算出偏移量x的值, 计算方法为，当前点 加上前面宽的的和,还要加上x默认的偏移量
          curTableItem.columnList.forEach((col,colIndex)=>{
            const defaultX = curTableItem.x
            if(colIndex === 0){
              col.x = defaultX
            }else{
              let x = defaultX
              for(let j=0;j<colIndex;j++){
                x += curTableItem.columnList[j].width
              }
              col.x = x
            }
          })
          console.log(355, curTableItem)
        }
      })
      //this.tableList[findIndex] = this.deepCopy(curTableItem)
      console.log(360, this.tableList)
    },
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
          //testUpload detect
          const {data} = await _this.$api.discern.detect({
            /*"bizId": "offline_CarrierBooking_v1",
            "fileType": "pdf",
            "contentType": "FORMWORK",*/
            pdfBase: base64.split(',')[1],
          })
          _this.pdfBase = base64.split(',')[1]
          _this.pdfResData = data
          _this.loadPdfCanvas(base64)
          /*setTimeout(()=>{
            _this.loadCanvasByPy(data.reqData)
          }, 1000)*/
          //console.log(137, data.reqData)
        };
        // Convert data to base64
        fileReader.readAsDataURL(fileToLoad);
      }
    },
    loadPdfCanvas(base64) {
      //const url = '/static/SE_BOOKING_GEN_SHAASCAVAN1000069.pdf'
      //const url = 'http://192.168.129.192:9099/ocr/test/down'
      //let loadingTask = PDFJS.getDocument(url)
      let loadingTask = PDFJS.getDocument({data: window.atob(this.pdfBase)})
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
    _renderPage(num) {  //渲染pdf页
      const that = this
      this.pdfDoc.getPage(num)
          .then((page) => {
            let canvas = document.getElementById('bg-canvas' + num)
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
            //console.log('pdf宽高', defaultPdfWidth, defaultPdfHeight)

            //初始化外面容器宽度大小，由于定位，已经脱离了文档流
            this.wrapperTarget.style.width = `${defaultPdfWidth+10}px`
            this.wrapperTarget.style.height = `${defaultPdfHeight+10}px`
            console.log(446, ratio)
            ratio = 1
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
    //根据json渲染区域
    loadCanvasByPy(res) {
      console.log(235, res)
      const canvas = document.getElementById('bg-canvas1')
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
    //提交所有
    async submitAll() {
      if (this.rectList2.length === 0 && this.tableList.length === 0) {
        this.$message.error('请先圈选后进行保存')
        return false
      }
      const {data} = await this.$api.discern.saveModel({
        fileBase64: this.pdfBase,
        tempName: 'test',
        pdfWidth: this.pdfWidth,
        pdfHeight: this.pdfHeight,
        /*config: {
          rectList: this.parseDataByPy(this.rectList2, 'rect'),
          tableList: this.parseDataByPy(this.tableList, 'table')
        }*/
        config: {
          rectList: this.rectList2,
          tableList: this.tableList
        }
      })
      console.log(536, this.parseDataByPy(this.rectList2, 'rect'))
      if(data.statusCode === 200){
        this.$message.success('模板保存成功')
      }else{
        this.$message.error('模板保存失败,失败原因'+ data.msg)
      }
    },
    /**********************解析数据值***********************/
    //数据解析, 后端转前端
    pyParseFront(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale = cate === 'x' ? this.scaleWidth : this.scaleHeight
      return val / areaScale / itemScale
    },
    //前端转后端
    frontParsePy(val, cate) {
      const itemScale = cate === 'x' ? 1.433 : 0.71
      const areaScale = cate === 'x' ? this.scaleWidth : this.scaleHeight
      return val * areaScale * itemScale
    },
    //解析
    parseDataByPy(data, cate) {
      let returnData = []
      if(cate === 'rect'){
        returnData = data.map(i=>{
          return {
            key: i.key,
            isHasKey: i.isHasKey,
            x: this.frontParsePy(i.x, 'x'),
            y: this.frontParsePy(i.y, 'y'),
            width: this.frontParsePy(i.width, 'x'),
            height: this.frontParsePy(i.height, 'y')
          }

        })
      }else if(cate === 'table'){
        returnData = data.map(i=>{
          const item = this.deepCopy(i)
          item.columnList.forEach(i=>{
            i.width = this.frontParsePy(i.width, 'x')
            i.height = this.frontParsePy(i.height, 'y')
            i.x = this.frontParsePy(i.x, 'x')
            i.y = this.frontParsePy(i.y, 'y')
          })
          item.width = this.frontParsePy(item.width,'x')
          item.height = this.frontParsePy(item.height,'y')
          item.x = this.frontParsePy(item.x,'x')
          item.y = this.frontParsePy(item.y,'y')
          return item
        })
      }
      return returnData
    },
    /**********************右侧圈选绑定内容事件***********************/
    /**
     * 点击右侧选项， 绑定左侧圈选选中
     * @id, @cate, 点击的id，点击的类别 圈选方框，圈选列表
     **/
    rightItemClick(id,cate='rect') {
      this.setToolBarUnactive();
      this.selectId = id
      if(cate === 'rect'){
        this.curRectId = id
        this.isAnchorActive = true
        //this.isTableActive = false
        this.reShowRect(0, 0, false, this.selectId, 'revise')
        this.curTableId = -1
        this._drawRect()
      }else if(cate === 'table') {
        this.curTableId = id
        //this.isAnchorActive = false
        this.isTableActive = true
        this.curRectId = -1
        this.reShowTable(0, 0, false, this.selectId, 'revise')
        this._drawTable()
      }
    },
    async submitOnly(i,index,cate) {
      if(cate === 'rect'){
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
        console.log(384, i)
        //const res = await this.$api.discern.boxInfo(params)
        const {data} = await this.$api.discern.testUploadExcute({sblist: [params]})
        this.rectList2[index].text = data.reqData.dataList[0].text
      }else if(cate === 'table'){
        console.log(501, i)
        //解析单位
        const item = this.deepCopy(i)
        item.columnList.forEach(i=>{
          i.width = this.frontParsePy(i.width, 'x')
          i.height = this.frontParsePy(i.height, 'y')
          i.x = this.frontParsePy(i.x, 'x')
          i.y = this.frontParsePy(i.y, 'y')
        })
        item.width = this.frontParsePy(item.width,'x')
        item.height = this.frontParsePy(item.height,'y')
        item.x = this.frontParsePy(item.x,'x')
        item.y = this.frontParsePy(item.y,'y')
        console.log('解析后',JSON.stringify(item))
        const {data} = await this.$api.discern.testTableInfo({tableList: item, pdfBase: this.pdfBase})
        this.tableList[index].text = data
      }
    },
    colChange() {
      console.log('onInput')
      //this.reShowTable(0, 0, false, this.selectId, 'revise')
    },
    /**********************canvas事件***********************/
    //删除当前选区
    removeCurRect() {
      console.log(136, this.selectId, this.isAnchorActive, this.isTableActive)
      if(this.isAnchorActive) {//单个方块选区 目前用的是rectList2
        const index = this.rectList2.findIndex(i=>i.id=== this.selectId)
        this.rectList2.splice(index, 1)
      } else if(this.isTableActive){ //列表选区
        const index = this.tableList.findIndex(i=>i.id=== this.selectId)
        this.tableList.splice(index, 1)
      }
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
      this.imgWidth = 1913;
      this.imgHeight = 1122;
      this.imgBase64Code = 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1576560618051&di=b89a65984c6a0e5c4c8a3de5aa8f0fcd&imgtype=0&src=http%3A%2F%2Fimage.biaobaiju.com%2Fuploads%2F20180803%2F20%2F1533300579-gnUBlQZPbt.jpg'

      this.baseTarget = this.$refs.operateCanvas
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
            result[key] = this.deepCopy(obj[key]);
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
    setCanvas() {
      this.baseTarget.width = this.movePoint.width
      this.baseTarget.height = this.movePoint.height
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
      const [width, height] = [this.imgWidth * this.currentScaleVal, this.imgHeight * this.currentScaleVal]
      /*const width = 500
      const height = 500*/
      this.movePoint.width = width
      this.movePoint.height = height
      this.movePoint.x = 0
      this.movePoint.y = 0
          /*[this.movePoint.x, this.movePoint.y] = this.isdrawActive ?
          [this.movePoint.x + moveX, this.movePoint.y + moveY] :
          [(this.drawWidth - width) / 2, (this.drawHeight - height) / 2]*/

      this.setWrapper()
      this.setCanvas()

      this.initDrawRect()
         /* [this.movePoint.x, this.movePoint.y] = this.isdrawActive ?
          [this.movePoint.x + moveX, this.movePoint.y + moveY] :
          [(this.drawWidth - width) / 2, (this.drawHeight - height) / 2];*/

      /*[this.movePoint.x, this.movePoint.y] = this.isdrawActive ?
      [this.movePoint.x + moveX, this.movePoint.y + moveY] :
      [(this.drawWidth - width) / 2, (this.drawHeight - height) / 2];

      [this.movePoint.width, this.movePoint.height] = [width, height]

      this.setWrapper()
      this.setCanvas()

      this.initDrawRect()*/

      /*const img = new Image()
      img.onload = () => {
        [this.movePoint.x, this.movePoint.y] = this.isdrawActive ?
            [this.movePoint.x + moveX, this.movePoint.y + moveY] :
            [(this.drawWidth - width) / 2, (this.drawHeight - height) / 2];
        [this.movePoint.width, this.movePoint.height] = [width, height]

        this.setWrapper()
        this.setCanvas()

        /!*this.baseTarget.style.backgroundImage = `url(${img.src})`
        this.baseTarget.style.backgroundSize = `${width}px ${height}px`*!/
        this.initDrawRect()
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
        //记录选中id
        this.curRectId = this.selectId
        this.curTableId = -1

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
      (this.setAnchorFlag ? this.rectList1 : this.rectList2)[id] = { x, y, width, height, id, key, isHasKey, text }
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
        //记录选中id
        this.curTableId = this.selectId
        this.curRectId = -1

        this.drawTableBorder(this.baseInstance, this.selectId)
        return true
      }
      return false
    },
    //此方法只会在第一次创建表格的时候触发，其余时刻不会
    drawTableWithColor(instance, x, y, width, height, id) {
      instance.clearRect(0, 0, this.movePoint.width, this.movePoint.height);
      this.initDrawRect();
      //初始化，key, text,columnList,maxRows
      const key = '', columnList = [], text = '', maxRows = 0;
      //给columnList设置默认值
      for (let i = 0; i < this.tableCol; i++) {
        columnList.push({
          width: 0,
          height: 0,
          y: 0,
          key: '',
          x: 0
        })
      }
      this.tableList[id] = { x, y, width, height, id, key, columnList, text, maxRows }
      console.log(1127, this.tableList[id])
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
    /**********************测试方法，后期可以注释***********************/
    testData(){
      let testArr = [
        {
          "x": 34,
          "y": 531,
          "width": 529,
          "height": 95,
          "id": 0,
          "columnList": [],
          "centerLineList": [
            0.1375761394664986,
            0.2222222222222222,
            0.34089477000630125,
            0.47658055030455815,
            0.6009241755933632,
            0.6817895400126025,
            0.7777777777777777,
            0.868094938038227
          ]
        }
      ]
      /*testArr = [
        {
          x: 0,
          y: 0,
          width: 60,
          height: 40,
          id: 0,
          columnList: [],
          centerLineList: [0.5, 0.75]
        }
      ]*/
      //testArr[0].columnList.length = testArr[0].centerLineList.length+1
      testArr[0].centerLineList.unshift(0)
      testArr[0].centerLineList.push(1)
      let widthCale = 0
      console.log(testArr[0])
      testArr[0].centerLineList.forEach((i,index)=>{
        widthCale = testArr[0].centerLineList[index+1] - i
        if(widthCale<=1){
          console.log(widthCale)
          testArr[0].columnList.push({
            width: testArr[0].width * widthCale,
            height: testArr[0].height,
            y: testArr[0].y
          })
        }
      })
      //计算出偏移量x的值, 计算方法为，当前点 加上前面宽的的和
      testArr[0].columnList.forEach((i,index)=>{
        if(index === 0){
          i.x = testArr[0].x
        }else{
          let x = 0
          for(let j=0;j<=index;j++){
            x += testArr[0].columnList[j].width
          }
          i.x = x
        }
      })

      console.log('end',testArr)
      /*console.log('test', this.frontParsePy(76.88, 'x'))
      return false*/
      //解析单位
      testArr[0].columnList.forEach(i=>{
        i.width = this.frontParsePy(i.width, 'x')
        i.height = this.frontParsePy(i.height, 'y')
        i.x = this.frontParsePy(i.x, 'x')
        i.y = this.frontParsePy(i.y, 'y')
      })
      testArr[0].width = this.frontParsePy(testArr[0].width,'x')
      testArr[0].height = this.frontParsePy(testArr[0].height,'y')
      testArr[0].x = this.frontParsePy(testArr[0].x,'x')
      testArr[0].y = this.frontParsePy(testArr[0].y,'y')
      console.log('解析后',JSON.stringify(testArr))

    },
    testCalc() {
      this.testData()
      console.log(1565, this.frontParsePy(77, 'x'))

    },
    loadTestTable() {
      setTimeout(()=>{
        //模拟框选列表
        this.tableList = [{"x":126,"y":94,"width":60,"height":56,"id":0,"key":"","columnList":[],"text":"","maxRows":1,"centerLineList":[0.5]},{"x":351,"y":90,"width":67,"height":52,"id":1,"key":"","columnList":[],"text":"","maxRows":1,"centerLineList":[0.5]}]
        this.reShowRect(0, 0, false, 0, 'revise')
        //this.reShowRect(0, 0, false, 1, 'revise')

        this.setToolBarUnactive();
        this.isTableActive = true
        //this.tableVisible = true
        this._drawTable()

      }, 1000)
    }
  },
  mounted() {
    this.$nextTick(() => {
      //初始化可以画画的canvas
      this.initDraw()
      //加载初始化背景的canvas
      //this.loadPdfCanvas()
      //接口解析pdf,然后在背景canvas画出辅助线选框
      //this.detectPdf()
      //this.loadTestTable()
    })
    //this.testData()
  },
}
</script>

<style lang='scss' scoped>
$tlt-btn-active: red;
$tlt-btn-active: green;
$nav-left-bg: blue;


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
          color: $tlt-btn-active;
          border-color: $tlt-btn-active;
          background-color: $nav-left-bg;
        }
      }
    }
  }
  .edit-body {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    //background-color: $nav-left-bg;
    /*position: relative;
    overflow: hidden;*/
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
      position: relative;
      canvas {
        position: absolute;
        top: 0;
        left: 0;
        border: solid 1px red;
      }
    }
    .rect-panel{
      border: solid 1px red;
      box-sizing: border-box;
      //padding: 20px;
      padding: 20px 40px 20px 20px;
      //overflow-y: auto;
      display: flex;
      .rect-column{

      }
      .table-column{

      }
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
