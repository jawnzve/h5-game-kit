<script setup lang="ts">
/** Preview 侧栏「尺寸」：机型预设与自定义宽高，作用于全部视口 */
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import {
  findPreviewDevice,
  PREVIEW_DEVICE_PRESETS,
  type PreviewDeviceId,
} from '@/lib/preview-devices';
import { usePreviewStore } from '@/stores/preview';

const preview = usePreviewStore();
const { previewPhoneWidth, previewPhoneHeight } = storeToRefs(preview);

const selectedDeviceId = ref<PreviewDeviceId>('iphone-12-pro');

function deviceOptionLabel(id: PreviewDeviceId): string {
  const preset = findPreviewDevice(id);
  if (!preset || id === 'custom') return preset?.label ?? '自定义设备…';
  return `${preset.label} (${preset.width}×${preset.height})`;
}

function applyDevicePreset(id: PreviewDeviceId) {
  const preset = findPreviewDevice(id);
  if (!preset || id === 'custom') return;
  previewPhoneWidth.value = preset.width;
  previewPhoneHeight.value = preset.height;
}

watch(selectedDeviceId, (id) => applyDevicePreset(id), { immediate: true });
</script>

<template>
  <label>
    尺寸
    <select v-model="selectedDeviceId" data-testid="preview-device-select">
      <option v-for="d in PREVIEW_DEVICE_PRESETS" :key="d.id" :value="d.id">
        {{ deviceOptionLabel(d.id) }}
      </option>
    </select>
  </label>
  <div v-if="selectedDeviceId === 'custom'" class="custom-device">
    <label>
      宽 (px)
      <input
        v-model.number="previewPhoneWidth"
        type="number"
        min="280"
        max="800"
        step="1"
        data-testid="preview-phone-width"
      />
    </label>
    <label>
      高 (px)
      <input
        v-model.number="previewPhoneHeight"
        type="number"
        min="400"
        max="1200"
        step="1"
        data-testid="preview-phone-height"
      />
    </label>
  </div>
</template>

<style scoped>
label {
  display: block;
  margin-top: 12px;
  font-size: 12px;
  color: var(--kit-text-secondary);
}
select,
input[type='number'] {
  width: 100%;
  margin-top: 4px;
  padding: 6px;
  border: 1px solid var(--kit-btn-border);
  border-radius: 6px;
  background: rgba(14, 16, 24, 1);
  color: var(--kit-text-primary);
  box-sizing: border-box;
}
.custom-device label {
  margin-top: 8px;
}
</style>
