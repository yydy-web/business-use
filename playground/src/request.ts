import axios from 'axios'
import request, { setRequest } from '@yy-web/request'

const service = axios.create({
  baseURL: '/api',
})

service.interceptors.response.use((res) => {
  return res.data.data
})

const yyRequest = request(service)
setRequest(yyRequest)

export default yyRequest
