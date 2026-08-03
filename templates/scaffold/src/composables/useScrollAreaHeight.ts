import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';

/** 根据容器剩余高度设置 scroll 区域 max-height（配合 flex 一屏布局） */
export function useScrollAreaHeight(
  scrollRef: Ref<HTMLElement | null>,
  containerRef: Ref<HTMLElement | null>,
  fixedFooterRef?: Ref<HTMLElement | null>
) {
  const scrollStyle = ref<Record<string, string>>({});

  let observer: ResizeObserver | null = null;

  function measure() {
    const container = containerRef.value;
    const scroll = scrollRef.value;
    if (!container || !scroll) return;

    const footerHeight = fixedFooterRef?.value?.offsetHeight ?? 0;
    const gap = footerHeight > 0 ? 12 : 0;
    const available = container.clientHeight - footerHeight - gap;

    scrollStyle.value = {
      maxHeight: `${Math.max(0, available)}px`,
    };
  }

  onMounted(() => {
    observer = new ResizeObserver(measure);
    if (containerRef.value) observer.observe(containerRef.value);
    if (fixedFooterRef?.value) observer.observe(fixedFooterRef.value);
    measure();
    window.addEventListener('resize', measure);
  });

  onUnmounted(() => {
    observer?.disconnect();
    window.removeEventListener('resize', measure);
  });

  watch([scrollRef, containerRef, fixedFooterRef], () => {
    measure();
  });

  return { scrollStyle, remeasure: measure };
}
