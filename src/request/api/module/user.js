/**
 *用户模块
 */
import base from '@/request/api/base'
import axios from '@/request/http'

const user = {
	test(params) {
		return axios.post(`${base.dynamicUrl}/user/test`, params)
	}
}
export default user
