<template>
  <article class="booking-ticket flex h-full min-h-[390px] flex-col overflow-hidden rounded-2xl bg-midnight-ivory text-midnight-ink">
    <div class="flex-1 p-5 sm:p-6">
      <div class="flex items-start justify-between gap-3">
        <span class="text-[9px] font-black uppercase tracking-[0.18em] text-midnight-ember">EventBooking / Admission</span>
        <span class="rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide" :class="statusClass">{{ statusLabel }}</span>
      </div>
      <h3 class="mt-5 line-clamp-2 min-h-[2.4em] text-2xl font-black leading-tight tracking-[-0.04em]">{{ booking.event?.title || 'Event details unavailable' }}</h3>
      <dl class="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
        <div class="col-span-2"><dt class="ticket-label">Date &amp; time</dt><dd class="mt-1 font-bold">{{ booking.event?.startDate ? formatDateTime(booking.event.startDate) : 'Date unavailable' }}</dd></div>
        <div class="col-span-2"><dt class="ticket-label">Venue</dt><dd class="mt-1 truncate font-bold">{{ booking.event?.location || 'Venue unavailable' }}</dd></div>
        <div><dt class="ticket-label">Seats · {{ booking.seats?.length ?? booking.seatIds?.length ?? 0 }}</dt><dd class="mt-1 line-clamp-2 font-bold">{{ seatNumbers }}</dd></div>
        <div><dt class="ticket-label">Total paid</dt><dd class="mt-1 font-black">{{ formatINR(booking.totalAmountInPaise) }}</dd></div>
        <div class="col-span-2"><dt class="ticket-label">Booked on</dt><dd class="mt-1 font-bold">{{ formatDateTime(booking.createdAt) }}</dd></div>
      </dl>
    </div>
    <div class="ticket-divider relative border-t border-dashed border-midnight-ink/25 px-5 py-4 sm:px-6">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0"><p class="ticket-label">Booking ID</p><p class="mt-1 truncate font-mono text-[10px] font-bold" :title="booking.id">{{ booking.id }}</p></div>
        <span class="ticket-barcode block h-8 w-16 shrink-0" aria-hidden="true" />
      </div>
      <p v-if="statusLabel === 'Cancelled'" class="mt-3 text-xs font-semibold text-midnight-ink/65">Cancelled{{ booking.updatedAt ? ' · Updated ' + formatDateTime(booking.updatedAt) : '' }}.</p>
      <p v-else-if="statusLabel === 'Refunded'" class="mt-3 text-xs font-semibold text-midnight-ink/65">Wallet payment refunded{{ booking.refundedAmountInPaise !== undefined ? ' · ' + formatINR(booking.refundedAmountInPaise) : '' }}.</p>
      <button type="button" class="focus-midnight mt-4 flex min-h-10 w-full items-center justify-center rounded-full border border-midnight-ink bg-midnight-ink px-4 text-sm font-extrabold text-midnight-ivory transition-colors hover:bg-midnight-ember hover:text-white" @click="emit('view')">{{ statusLabel === 'Confirmed' ? 'View Ticket' : 'View Details' }}</button>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Booking } from '@/services/apiTypes';
import { formatDateTime } from '@/utils/date';
import { formatINR } from '@/utils/money';
const props = defineProps<{ booking: Booking }>();
const emit = defineEmits<{ view: [] }>();
const statusLabel = computed(() => props.booking.paymentStatus === 'REFUNDED' || props.booking.status === 'REFUNDED' ? 'Refunded' : props.booking.status === 'CANCELLED' ? 'Cancelled' : 'Confirmed');
const statusClass = computed(() => statusLabel.value === 'Confirmed' ? 'border-midnight-ink/25 text-midnight-ink' : 'border-midnight-ink/20 text-midnight-ink/65');
const seatNumbers = computed(() => props.booking.seats?.map((seat) => seat.seatNumber).join(', ') || props.booking.seatIds?.join(', ') || 'Unavailable');
</script>
