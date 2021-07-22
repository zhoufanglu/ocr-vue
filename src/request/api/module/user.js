/**
 *用户模块
 */
import base from '@/request/api/base'
import axios from '@/request/http'
import qs from 'qs'

const user = {
	test(params) {
		return axios.post(`${base.dynamicUrl}/user/test`, params)
	},
  detect(params) {
    return axios.post(`http://192.168.129.140:2234/detect`, params)
    //return axios.get(`${base.dynamicUrl}/enterpriseCatalog/tagList?${qs.stringify(params)}`)
  },
  detectLocal(params) {
    return axios.post(`http://192.168.9.45:2233/detect`, params)
    //return axios.get(`http://192.168.9.45:2233/detect?${qs.stringify(params)}`)
  },
  flaskTest(params) {
    return axios.post(`http://192.168.9.45:2233/detect`, params)
  }
}
export default user
