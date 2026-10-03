<template>
  <article class="booking-ticket flex h-full min-h-[390px] flex-col overflow-hidden rounded-2xl border border-white/15 bg-midnight-surface text-midnight-ivory">
    <div class="flex-1 p-5 sm:p-6">
      <div class="flex items-start justify-between gap-3">
        <span class="text-[9px] font-black uppercase tracking-[0.18em] text-midnight-mint">Seats on hold</span>
        <span class="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="expired ? 'status-expired border-white/20 text-midnight-stone' : 'border-midnight-ember/50 text-midnight-ember'" aria-live="polite">{{ expired ? 'Reservation Expired' : 'Payment Pending' }}</span>
      </div>
      <h3 class="mt-5 line-clamp-2 min-h-[2.4em] text-2xl font-black leading-tight tracking-[-0.04em]">{{ reservation.event?.title || 'Reserved event' }}</h3>
      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <div class="col-span-2"><dt class="reservation-label">Date &amp; time</dt><dd class="mt-1 font-bold">{{ reservation.event?.startDate ? formatDateTime(reservation.event.startDate) : 'Date unavailable' }}</dd></div>
        <div class="col-span-2"><dt class="reservation-label">Venue</dt><dd class="mt-1 truncate font-bold">{{ reservation.event?.location || 'Venue unavailable' }}</dd></div>
        <div><dt class="reservation-label">Selected seats · {{ reservation.seats.length }}</dt><dd class="mt-1 line-clamp-2 font-bold">{{ reservation.seats.map((seat) => seat.seatNumber).join(', ') || 'Unavailable' }}</dd></div>
        <div><dt class="reservation-label">Total amount</dt><dd class="mt-1 font-black">{{ formatINR(reservation.reservation.totalAmountInPaise) }}</dd></div>
        <div class="col-span-2"><dt class="reservation-label">{{ expired ? 'Expired at' : 'Time remaining' }}</dt><dd class="mt-1 font-black tabular-nums" :class="expired ? 'text-midnight-stone' : 'text-midnight-ember'">{{ expired ? formatDateTime(reservation.reservation.expiresAt) : remainingLabel }}</dd></div>
      </dl>
    </div>
    <div class="ticket-divider relative border-t border-dashed border-white/20 px-5 py-4 sm:px-6">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0"><p class="reservation-label">Reservation ID</p><p class="mt-1 truncate font-mono text-[10px] font-bold" :title="reservation.reservation.id">{{ reservation.reservation.id }}</p></div>
        <span class="ticket-barcode block h-8 w-16 shrink-0" aria-hidden="true" />
      </div>
      <RouterLink v-if="expired" :to="{ name: 'seat-selection', params: { eventId: reservation.reservation.eventId } }" class="focus-midnight mt-4 flex min-h-10 w-full items-center justify-center rounded-full border border-white/25 px-4 text-sm font-extrabold hover:border-midnight-ivory">Select Seats Again</RouterLink>
      <RouterLink v-else :to="{ name: 'booking-checkout', params: { reservationId: reservation.reservation.id } }" class="focus-midnight mt-4 flex min-h-10 w-full items-center justify-center rounded-full bg-midnight-ember px-4 text-sm font-extrabold text-white hover:bg-midnight-ivory hover:text-midnight-ink">Complete Booking</RouterLink>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { StoredReservationData } from '@/modules/booking/booking.store';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
const props = defineProps<{ reservation: StoredReservationData; now: number }>();
const remainingSeconds = computed(() => Math.max(0, Math.ceil((Date.parse(props.reservation.reservation.expiresAt) - props.now) / 1000) || 0));
const expired = computed(() => props.reservation.reservation.status !== 'ACTIVE' || remainingSeconds.value === 0);
const remainingLabel = computed(() => {
  const hours = Math.floor(remainingSeconds.value / 3600);
  const minutes = Math.floor((remainingSeconds.value % 3600) / 60);
  const seconds = remainingSeconds.value % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
});
</script>

<style scoped>
.status-expired { animation: reservation-status-update 420ms cubic-bezier(.2,.8,.2,1); }
@keyframes reservation-status-update { from { background: rgba(255, 90, 54, .18); } to { background: transparent; } }
@media (prefers-reduced-motion: reduce) { .status-expired { animation: none; } }
</style>
