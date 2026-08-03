import '@/styles/tokens.css';
import '@/styles/actions.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PreviewApp from '@/PreviewApp.vue';

createApp(PreviewApp).use(createPinia()).mount('#app');
