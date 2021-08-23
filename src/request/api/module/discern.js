/**
 *用户模块
 */
import base from '@/request/api/base'
import axios from '@/request/http'
import qs from 'qs'
const  testEnv140 = 'http://192.168.129.140:4456'
const  local140 = 'http://192.168.9.45:2233'
const javaUrl = 'http://192.168.129.192:9099/ocr'
//唐思涵(�):
// http://192.168.5.204:9099/ocr/test/upload

const discern = {
	test(params) {
		return axios.post(`${base.dynamicUrl}/user/test`, params)
	},
  detect(params) {
    return axios.post(`${testEnv140}/detect`, params)
  },
  detectLocal(params) {
    return axios.post(`${testEnv140}/detect`, params)
  },
  boxInfo(params) {
    return axios.post(`${testEnv140}/boxInfo`, params)
  },
  testUpload(params) {
    //return axios.get(`http://192.168.9.45:2233/detect?${qs.stringify(params)}`)
    //return axios.get(`${javaUrl}/test/upload?${qs.stringify(params)}`)
    return axios.post(`${javaUrl}/test/upload`, params)
  },
  testDown(params) {
    return axios.get(`${javaUrl}/test/down`, params)
  },
  testUploadExcute(params) {
    return axios.post(`${javaUrl}/test/uploadExcute`, params)
  },
  //tableInfo
  testTableInfo(params) {
    return axios.post(`http://192.168.16.190:2233/tableInfo`, params)
  },
  /**********************模型保存***********************/
  saveModel(params) {
    return axios.post(`${javaUrl}/template/model/saveModel`, params)
  },
  readModel(params) {
    return axios.post(`${javaUrl}/template/model/executeModel`, params)
  },

}
export default discern
