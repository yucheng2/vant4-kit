import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import Vant from 'vant' // 引入vant组件库
import 'vant/lib/index.css'
import Vant4Kit from '@yucheng2/vant4-kit'
import '@yucheng2/vant4-kit/dist/index.css'
createApp(App).use(Vant).use(Vant4Kit).mount('#app')
