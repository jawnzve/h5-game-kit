import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PreviewApp from '@/PreviewApp.vue';

createApp(PreviewApp).use(createPinia()).mount('#app');
