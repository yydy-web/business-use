import { createApp } from 'vue'
import Antd from 'ant-design-vue'
import { confBusiness } from '@yy-web/business-use'
import App from './App.vue'
import './request'

const app = createApp(App)
confBusiness(app, {
  table: {
    listKey: 'records',
    initLimit: 1,
  },
})
app.use(Antd).mount('#app')
