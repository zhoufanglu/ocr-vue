<template>
  <div class="p-discern-pdf">
    <div class="operate-row">
      <el-button type="primary" size="mini" @click="$router.push('/demo')">返回制作模板</el-button>

      <el-form :inline="true" :model="formInline" class="demo-form-inline">
        <el-form-item label="选择模板：">
          <el-select size="mini" v-model="formInline.tempVal" placeholder="请选择">
            <el-option
                v-for="item in options"
                :key="item.name"
                :label="item.name"
                :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="选择pdf：">
          <input id="inputFile" type="file" @change="convertToBase64()" />
        </el-form-item>

        <el-form-item>
          <el-button size="small" type="primary" @click="onSubmit">识别</el-button>
        </el-form-item>
      </el-form>

    </div>
    <div class="pdf-wrapper" ref="canvasWrapper">
      <canvas
          class="bg-canvas"
          style="border: solid 1px red"
          id="bg-canvas1"
          ref="canvas1"
      >
      </canvas>
      <div class="read-data">
        <div class="rect">
          <h4>圈选识别</h4>
          <div v-for="i in rectList" class="row">
            <div>
              <label>key:</label>
              <span>{{i.wordName}}</span>
            </div>
            <div>
              <label>识别结果:</label>
              <span>{{i.word}}</span>
            </div>
          </div>
        </div>
        <div class="table">
          <h4>表格识别</h4>
          <div
              v-for="(table,index) in tableList"
          >
            <h5>表名：{{table.tableName}}</h5>
            <table>
              <tr>
                <th v-for="i in table.colNameList" :key="i">{{i}}</th>
              </tr>
              <tr v-for="(map,index) in table.mapRowList" :key="index">
                <td v-for="[key,value] in map" :key="key">{{value}}</td>
              </tr>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import PDFJS from 'pdfjs-dist'
import workerSrc from 'pdfjs-dist/build/pdf.worker.entry'
export default {
  name: '',
  components: {},
  data() {
    return {
      pdfBase: null,
      options: [{name: 'test'}],
      formInline: {
        tempVal: ''
      },
      readData: [],
      rectList: [],
      tableList: []
    }
  },
  created() {
    this.initData()
  },
  mounted() {
    setTimeout(()=>{
      this.wrapperTarget = this.$refs.canvasWrapper
      this.baseTarget = this.$refs.canvas1
      this.loadPdfCanvas()
    }, 1000)
  },
  methods: {
    async onSubmit(){
      const {data} = await this.$api.discern.readModel(
          {
            tempName: 'test',
            fileBase64: this.pdfBase
          }
      )
      console.log(data.reqData.fileContext.data.ret)
    },
    convertToBase64() {
      this.wrapperTarget = this.$refs.canvasWrapper
      this.baseTarget = this.$refs.canvas1
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
          _this.pdfBase = base64.split(',')[1]
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
    _renderPage(num) {  //渲染pdf页
      const that = this
      this.pdfDoc.getPage(num)
          .then((page) => {
            if(num !== 1){ //只计算第一页
              return false
            }
            let canvas = document.getElementById('bg-canvas' + num)
            console.log(117, canvas)
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

            //初始化外面容器宽度大小，由于定位，已经脱离了文档流
            this.wrapperTarget.style.width = `${defaultPdfWidth+10}px`
            this.wrapperTarget.style.height = `${defaultPdfHeight+10}px`

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
            //this.$refs.checkPanel.style.height = defaultPdfHeight + 'px'

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
              //this.loadCanvasByPy(this.pdfResData)
            })
            if (this.pdf_pages > num) {
              this._renderPage(num + 1)
            }
          })
    },
    initData() {
      this.readData =  [
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 449.7468908638636,
            "left": 549.1361681883147,
            "width": 1886.163360298994,
            "height": 142.02533395700954
          },
          "mappingTable": "",
          "wordName": "承运人舱单",
          "word": "OOCL Orient Overseas Container Line Ltd31/F, Harbour Centre 25 Harbour Road Wanchai HongHong Kong"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2300.005110238014,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#1#体积",
          "word": "10.760 M3"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2300.005110238014,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#2#体积",
          "word": "10.480 M3"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2300.005110238014,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#3#体积",
          "word": "2.521 M3"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2300.005110238014,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#4#体积",
          "word": "2.538 M3"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2300.005110238014,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#5#体积",
          "word": "13.571 M3"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2300.005110238014,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#6#体积",
          "word": "15.000 M3"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2721.8053553681684,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#1#长度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2721.8053553681684,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#2#长度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2721.8053553681684,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#3#长度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2721.8053553681684,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#4#长度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2721.8053553681684,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#5#长度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2083.0382313694736,
            "left": 2721.8053553681684,
            "width": 421.8002451301548,
            "height": 402.40511287819373
          },
          "mappingTable": "",
          "wordName": "test1#6#长度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3167.4810860717284,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#1#宽度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3167.4810860717284,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#2#宽度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3167.4810860717284,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#3#宽度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3167.4810860717284,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#4#宽度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3167.4810860717284,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#5#宽度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3167.4810860717284,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#6#宽度",
          "word": "0"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3557.447350437343,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#1#高度",
          "word": "0 CM"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3557.447350437343,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#2#高度",
          "word": "0 CM"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3557.447350437343,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#3#高度",
          "word": "0 CM"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3557.447350437343,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#4#高度",
          "word": "0 CM"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3557.447350437343,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#5#高度",
          "word": "0 CM"
        },
        {
          "isHasKey": 0,
          "probability": 100,
          "location": {
            "top": 2079.0930832040012,
            "left": 3557.447350437343,
            "width": 389.9662643656148,
            "height": 378.7342238853588
          },
          "mappingTable": "",
          "wordName": "test2#6#高度",
          "word": "0 CM"
        }
      ]
      this.rectList = this.readData.filter(i=> i.wordName.indexOf('#') === -1)
      let tableTemp = this.readData.filter(i=> i.wordName.indexOf('#') !== -1)
      let tableList = []
      let columnList = []
      //获取table的项
      tableTemp.forEach(item=>{
        let tableName = item.wordName.split('#')[0]//表格名
        //把名字存入行
        if(tableList.findIndex(i=>i.tableName===tableName) === -1){
          tableList.push({
            tableName: tableName
          })
        }
      })
      //找出每个表格的内容
      tableList.forEach(table=>{
        let maxRows = 0
        //获取表格下的每项数据
        table.data = []
        tableTemp.forEach(item=>{
          let tableName = item.wordName.split('#')[0]//表格名
          if(table.tableName === tableName){
            table.data.push(item)
          }
        })
        //获取表格的列名
        let colNameList = []
        table.data.forEach(i=>{
          let colName = i.wordName.split('#')[2]//列名
          let rowNum = i.wordName.split('#')[1]//第几行
          if(!colNameList.includes(colName)){
            colNameList.push(colName)
          }
          //计算最大行
          maxRows = Math.max(maxRows, rowNum)
        })
        table.colNameList = colNameList
        console.log(604, table.colNameList)
        table.maxRows = maxRows
        //计算每个行的值
        let mapRowList = []

        let obj = {}
        table.colNameList.forEach(colName=>{
          obj.name = colName
          obj.text = ''
        })
        console.log(612, obj)
        for(let i =1;i<maxRows+1;i++){
          const obj = {}
          let mapItem = new Map()
          table.colNameList.forEach(colName=>{
            const wordName = `${table.tableName}#${i}#${colName}`
            const val = table.data.find(j=>j.wordName === wordName)
            obj[colName] = val.word
            mapItem.set(colName, val.word)
          })
          mapRowList.push(mapItem)
        }
        console.log('------')
        console.log(626, mapRowList)

        table.mapRowList = mapRowList
      })

      console.log(947, tableList)
      console.log(948, columnList)
      console.log(923, this.readData)
      this.tableList = tableList
    }
  }
}
</script>
<style lang="scss" scoped>
.p-discern-pdf {
  display: flex;
  flex-direction: column;
  .operate-row{
    display: flex;
  }
  .pdf-wrapper{
    display: flex;
    .read-data{
      .rect{
        margin-bottom: 30px;
        display: flex;
        flex-direction: column;
        .row{
          display: flex;
          label{
            font-weight: bolder;
            margin-right: 20px;
            width: 100px;
            display: inline-block;
          }
        }
      }
      table{
        margin: 0 auto;
        border-collapse:collapse;
        td,th{
          border: solid 1px red;
        }
      }
    }
  }
}
</style>
