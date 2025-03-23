import { createApp } from 'vue'
import App from './App.vue'
import { setupRouter } from './router'

import 'vant/lib/index.css';
import Vant4Kit from '@yucheng2/vant4-kit'
import '@yucheng2/vant4-kit/dist/index.css'

import './styles/index.css'

async function setupApp() {
    const app = createApp(App);
    app.use(Vant4Kit)
    // 注册路由
    await setupRouter(app);
    app.mount("#app");
}

setupApp();
