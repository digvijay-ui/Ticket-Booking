<template>
  <Teleport to="body">
    <div v-if="booking" class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-midnight-ink/85 p-4 sm:p-8" @mousedown.self="emit('close')">
      <section ref="dialog" role="dialog" aria-modal="true" aria-labelledby="ticket-dialog-title" tabindex="-1" class="ticket-dialog relative my-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-midnight-ivory text-midnight-ink shadow-2xl">
        <div class="p-6 sm:p-9">
          <div class="flex items-start justify-between gap-4">
            <p class="text-[10px] font-black uppercase tracking-[0.18em] text-midnight-ember">EventBooking / Ticket details</p>
            <button ref="closeButton" type="button" class="focus-midnight -mr-2 -mt-2 grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-midnight-ink/10" aria-label="Close ticket details" @click="emit('close')"><Icon icon="mdi:close" class="h-6 w-6" aria-hidden="true" /></button>
          </div>
          <h2 id="ticket-dialog-title" class="mt-4 text-3xl font-black leading-tight tracking-[-0.05em] sm:text-4xl">{{ booking.event?.title || 'Event details unavailable' }}</h2>
          <p class="mt-2 text-sm font-bold">{{ booking.event?.startDate ? formatDateTime(booking.event.startDate) : 'Date unavailable' }} <span aria-hidden="true">·</span> {{ booking.event?.location || 'Venue unavailable' }}</p>
          <div class="my-7 border-t border-dashed border-midnight-ink/25" />
          <dl class="grid gap-5 text-sm sm:grid-cols-2">
            <div><dt class="ticket-label">Booking status</dt><dd class="mt-1 font-black">{{ statusLabel }}</dd></div>
            <div><dt class="ticket-label">Payment status</dt><dd class="mt-1 font-black">{{ booking.paymentStatus === 'REFUNDED' ? 'Refunded' : 'Paid' }}</dd></div>
            <div><dt class="ticket-label">Seats · {{ booking.seats?.length ?? booking.seatIds?.length ?? 0 }}</dt><dd class="mt-1 font-black">{{ seatNumbers }}</dd></div>
            <div><dt class="ticket-label">Amount paid</dt><dd class="mt-1 font-black">{{ formatINR(booking.totalAmountInPaise) }}</dd></div>
            <div v-if="booking.refundedAmountInPaise !== undefined"><dt class="ticket-label">Amount refunded</dt><dd class="mt-1 font-black">{{ formatINR(booking.refundedAmountInPaise) }}</dd></div>
            <div><dt class="ticket-label">Booked on</dt><dd class="mt-1 font-black">{{ formatDateTime(booking.createdAt) }}</dd></div>
            <div v-if="userName"><dt class="ticket-label">Booked for</dt><dd class="mt-1 font-black">{{ userName }}</dd></div>
            <div class="sm:col-span-2"><dt class="ticket-label">Booking ID</dt><dd class="mt-1 break-all font-mono text-xs font-bold">{{ booking.id }}</dd></div>
          </dl>
          <p v-if="statusLabel === 'Cancelled'" class="mt-6 rounded-xl bg-midnight-ink/5 p-4 text-sm font-semibold">This booking has been cancelled. There are no further actions available.</p>
          <p v-else-if="statusLabel === 'Refunded'" class="mt-6 rounded-xl bg-midnight-ink/5 p-4 text-sm font-semibold">This payment has been refunded. Check your wallet for the refund transaction.</p>
        </div>
        <div class="ticket-divider relative flex items-center justify-between gap-4 border-t border-dashed border-midnight-ink/25 px-6 py-5 sm:px-9">
          <p class="text-xs font-black uppercase tracking-[0.17em]">Keep this booking ID handy</p>
          <span class="ticket-barcode block h-8 w-24 shrink-0" aria-hidden="true" />
        </div>
      </section>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';
import { useDialogFocus } from '@/composables/useDialogFocus';
import type { Booking } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
const props = defineProps<{ booking: Booking | null; userName?: string }>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLElement | null>(null);
const closeButton = ref<HTMLElement | null>(null);
useDialogFocus(() => Boolean(props.booking), dialog, () => emit('close'), { initialFocus: closeButton });
const statusLabel = computed(() => props.booking?.paymentStatus === 'REFUNDED' || props.booking?.status === 'REFUNDED' ? 'Refunded' : props.booking?.status === 'CANCELLED' ? 'Cancelled' : 'Confirmed');
const seatNumbers = computed(() => props.booking?.seats?.map((seat) => seat.seatNumber).join(', ') || props.booking?.seatIds?.join(', ') || 'Unavailable');
</script>

<style scoped>
.ticket-dialog { animation: ticket-detail-reveal 280ms cubic-bezier(.2,.8,.2,1) both; }
@keyframes ticket-detail-reveal { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .ticket-dialog { animation: none; } }
</style>
