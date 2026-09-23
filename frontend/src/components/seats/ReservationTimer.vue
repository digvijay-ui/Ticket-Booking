<template>
  <span class="tabular-nums" role="timer" :aria-label="isExpired ? 'Reservation expired' : `Reservation expires in ${label}`">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps<{ expiresAt: string }>();
const emit = defineEmits<{
  tick: [remainingSeconds: number];
  expired: [];
}>();

const remainingSeconds = ref(0);
let timer: number | undefined;
let expiredEmitted = false;

const isExpired = computed(() => remainingSeconds.value <= 0);
const label = computed(() => {
  const hours = Math.floor(remainingSeconds.value / 3600);
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60);
  const seconds = remainingSeconds.value % 60;
  const time = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return hours > 0 ? `${String(hours).padStart(2, '0')}:${time}` : time;
});

function updateCountdown() {
  const expiry = new Date(props.expiresAt).getTime();
  const seconds = Math.ceil((expiry - Date.now()) / 1000);
  remainingSeconds.value = Number.isFinite(seconds) ? Math.max(0, seconds) : 0;
  emit('tick', remainingSeconds.value);

  if (remainingSeconds.value <= 0 && !expiredEmitted) {
    expiredEmitted = true;
    emit('expired');
  }
}

function restart() {
  expiredEmitted = false;
  updateCountdown();
}

watch(() => props.expiresAt, restart);

onMounted(() => {
  updateCountdown();
  timer = window.setInterval(updateCountdown, 1000);
});

onBeforeUnmount(() => {
  if (timer !== undefined) window.clearInterval(timer);
});
</script>
