import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from '@/App.vue';
import { setupE2EHooks } from '@/lib/e2e';
import { initAppLifecycle } from '@/lib/app-lifecycle';

const gameId = import.meta.env.VITE_GAME_ID;

setupE2EHooks(gameId);
initAppLifecycle();

createApp(App).use(createPinia()).mount('#app');
