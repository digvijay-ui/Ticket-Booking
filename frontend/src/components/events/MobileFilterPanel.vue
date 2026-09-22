<template>
  <Teleport to="body">
    <Transition name="filter-panel">
      <div v-if="open" class="fixed inset-0 z-[70] lg:hidden" @keydown="handleKeydown">
        <button type="button" class="absolute inset-0 cursor-default bg-midnight-ink/80" aria-label="Close filters" @click="$emit('close')" />
        <section ref="panel" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title" class="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-y-auto rounded-t-[26px] border-t border-white/15 bg-midnight-surface px-5 pb-7 pt-4 text-midnight-ivory shadow-2xl sm:left-auto sm:h-full sm:max-h-none sm:w-[420px] sm:rounded-none sm:border-l sm:border-t-0 sm:px-7 sm:pt-6">
          <div class="mx-auto mb-4 h-1 w-10 rounded-full bg-white/20 sm:hidden" aria-hidden="true" />
          <div class="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div><p class="text-[10px] font-extrabold uppercase tracking-[0.16em] text-midnight-mint">Refine the lineup</p><h2 id="mobile-filter-title" class="mt-1 text-2xl font-extrabold tracking-[-0.035em]">Filters</h2></div>
            <button ref="closeButton" type="button" class="focus-midnight grid h-11 w-11 place-items-center rounded-full border border-white/15" aria-label="Close filters" @click="$emit('close')"><Icon icon="mdi:close" class="h-5 w-5" aria-hidden="true" /></button>
          </div>
          <div class="py-6"><slot /></div>
          <button type="button" class="focus-midnight min-h-[50px] w-full rounded-full bg-midnight-ember px-5 text-sm font-extrabold text-white" @click="$emit('close')">Show {{ resultCount }} {{ resultCount === 1 ? 'event' : 'events' }}</button>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { nextTick, onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps<{ open: boolean; resultCount: number }>();
defineEmits<{ close: [] }>();
const panel = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

function focusableElements() {
  return Array.from(panel.value?.querySelectorAll<HTMLElement>('button:not([disabled]), select:not([disabled]), input:not([disabled]), a[href]') ?? []);
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault();
    panel.value?.querySelector<HTMLButtonElement>('[aria-label="Close filters"]')?.click();
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = focusableElements();
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
}

watch(() => props.open, async (open) => {
  if (open) {
    previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = 'hidden';
    await nextTick();
    closeButton.value?.focus();
  } else {
    document.body.style.removeProperty('overflow');
    previouslyFocused?.focus();
  }
});

onBeforeUnmount(() => document.body.style.removeProperty('overflow'));
</script>

<style scoped>
.filter-panel-enter-active, .filter-panel-leave-active { transition: opacity 220ms ease; }
.filter-panel-enter-active section, .filter-panel-leave-active section { transition: transform 260ms cubic-bezier(.2,.8,.2,1); }
.filter-panel-enter-from, .filter-panel-leave-to { opacity: 0; }
.filter-panel-enter-from section, .filter-panel-leave-to section { transform: translateY(100%); }
@media (min-width: 640px) { .filter-panel-enter-from section, .filter-panel-leave-to section { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) { .filter-panel-enter-active, .filter-panel-leave-active, .filter-panel-enter-active section, .filter-panel-leave-active section { transition: none; } }
</style>
