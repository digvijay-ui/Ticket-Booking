<template>
  <div class="bookings-page min-h-screen bg-midnight-ink px-5 pb-24 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pt-32">
    <div class="mx-auto max-w-[1440px]">
      <header class="bookings-entrance flex flex-wrap items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-midnight-mint">Your ticket drawer</p>
          <h1 class="mt-3 text-4xl font-black tracking-[-0.055em] sm:text-6xl">My Bookings</h1>
          <p class="mt-3 max-w-xl text-sm font-medium leading-6 text-midnight-stone">Every seat you have booked, all in one place. Find your next event or pick up a reservation in progress.</p>
        </div>
        <div class="flex items-end gap-3">
          <div class="border-r border-white/15 pr-5 text-right"><strong class="block text-4xl font-black tabular-nums">{{ bookings.length }}</strong><span class="text-[10px] font-bold uppercase tracking-[0.15em] text-midnight-stone">Total bookings</span></div>
          <RouterLink to="/events" class="focus-midnight inline-flex min-h-11 items-center rounded-full bg-midnight-ember px-5 text-sm font-extrabold text-white hover:bg-midnight-ivory hover:text-midnight-ink">Explore Events</RouterLink>
        </div>
      </header>

      <section class="mt-7" aria-label="Search and filter bookings">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div class="relative w-full lg:max-w-sm">
            <Icon icon="mdi:magnify" class="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-midnight-stone" aria-hidden="true" />
            <label for="booking-search" class="sr-only">Search bookings by event, venue, booking ID, or seat</label>
            <input id="booking-search" v-model="search" type="search" autocomplete="off" placeholder="Search tickets" class="focus-midnight min-h-12 w-full rounded-xl border border-white/15 bg-midnight-surface py-3 pl-12 pr-4 text-sm text-midnight-ivory placeholder:text-midnight-stone focus:border-midnight-ember focus:outline-none" />
          </div>
          <p class="text-xs font-semibold text-midnight-stone" aria-live="polite">Showing {{ filteredBookings.length + filteredReservations.length }} {{ filteredBookings.length + filteredReservations.length === 1 ? 'item' : 'items' }}</p>
        </div>
        <div class="mt-5 flex gap-2 overflow-x-auto pb-2" role="group" aria-label="Booking status filter">
          <button v-for="filter in filters" :key="filter.id" type="button" class="focus-midnight shrink-0 rounded-full border px-4 py-2.5 text-xs font-extrabold transition-colors duration-150" :class="activeFilter === filter.id ? 'border-midnight-ivory bg-midnight-ivory text-midnight-ink' : 'border-white/15 bg-midnight-surface text-midnight-stone hover:border-white/40 hover:text-midnight-ivory'" :aria-pressed="activeFilter === filter.id" @click="activeFilter = filter.id">{{ filter.label }}</button>
        </div>
      </section>

      <div v-if="initialLoad || bookingStore.bookingsLoading" class="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3" role="status" aria-label="Loading bookings">
        <div v-for="index in 6" :key="index" class="skeleton h-[390px] rounded-2xl" />
        <span class="sr-only">Loading bookings and saved reservations</span>
      </div>
      <div v-else-if="bookingStore.bookingsError" class="mt-8 rounded-2xl border border-midnight-ember/35 bg-midnight-surface p-7" role="alert">
        <h2 class="text-xl font-black">Your bookings are unavailable.</h2>
        <p class="mt-2 text-sm text-midnight-stone">{{ bookingStore.bookingsError }}</p>
        <button type="button" class="focus-midnight mt-5 min-h-11 rounded-full bg-midnight-ember px-5 text-sm font-extrabold text-white" @click="loadBookings">Try again</button>
      </div>
      <div v-else-if="!bookings.length && !reservations.length" class="mt-8 rounded-2xl border border-dashed border-white/20 bg-midnight-surface px-6 py-16 text-center">
        <Icon icon="mdi:ticket-outline" class="mx-auto h-11 w-11 text-midnight-mint" aria-hidden="true" />
        <h2 class="mt-5 text-2xl font-black">Your story starts with a seat.</h2>
        <p class="mt-2 text-sm text-midnight-stone">No bookings yet. Find an event and make it yours.</p>
        <RouterLink to="/events" class="focus-midnight mt-6 inline-flex min-h-11 items-center rounded-full bg-midnight-ember px-5 text-sm font-extrabold text-white">Explore Events</RouterLink>
      </div>
      <div v-else-if="!filteredBookings.length && !filteredReservations.length" class="mt-8 rounded-2xl border border-dashed border-white/20 bg-midnight-surface px-6 py-14 text-center">
        <h2 class="text-xl font-black">No matching tickets.</h2>
        <p class="mt-2 text-sm text-midnight-stone">Try another search or filter.</p>
        <button type="button" class="focus-midnight mt-5 min-h-11 rounded-full border border-white/25 px-5 text-sm font-extrabold" @click="clearFilters">Clear filters</button>
      </div>
      <template v-else>
        <section v-if="filteredReservations.length" class="mt-9" aria-labelledby="reservations-title">
          <div class="mb-5 flex items-baseline justify-between gap-3"><h2 id="reservations-title" class="text-xl font-black tracking-tight">Reservations in progress</h2><span class="text-xs text-midnight-stone">Saved this session · {{ filteredReservations.length }}</span></div>
          <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <ReservationHistoryCard v-for="(reservation, index) in filteredReservations" :key="reservation.reservation.id" :reservation="reservation" :now="now" class="initial-card-reveal" :style="{ animationDelay: Math.min(index, 5) * 55 + 'ms' }" />
          </div>
        </section>
        <section v-if="filteredBookings.length" class="mt-9" aria-labelledby="tickets-title">
          <div class="mb-5 flex items-baseline justify-between gap-3"><h2 id="tickets-title" class="text-xl font-black tracking-tight">Digital tickets</h2><span class="text-xs text-midnight-stone">{{ filteredBookings.length }} shown</span></div>
          <div class="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            <BookingHistoryCard v-for="(booking, index) in filteredBookings" :key="booking.id" :booking="booking" class="initial-card-reveal" :style="{ animationDelay: Math.min(index, 5) * 55 + 'ms' }" @view="selectedBooking = booking" />
          </div>
        </section>
      </template>
    </div>
    <BookingTicketDialog :booking="selectedBooking" :user-name="auth.user?.name" @close="selectedBooking = null" />
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import BookingHistoryCard from '@/components/booking/BookingHistoryCard.vue';
import BookingTicketDialog from '@/components/booking/BookingTicketDialog.vue';
import ReservationHistoryCard from '@/components/booking/ReservationHistoryCard.vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import type { Booking } from '@/services/apiTypes';
import { listStoredReservations, useBookingStore } from '../booking.store';

type FilterId = 'all' | 'pending' | 'confirmed' | 'cancelled' | 'refunded' | 'upcoming' | 'past';
const filters: Array<{ id: FilterId; label: string }> = [
  { id: 'all', label: 'All' }, { id: 'pending', label: 'Payment Pending' },
  { id: 'confirmed', label: 'Confirmed' }, { id: 'cancelled', label: 'Cancelled' },
  { id: 'refunded', label: 'Refunded' }, { id: 'upcoming', label: 'Upcoming events' },
  { id: 'past', label: 'Past events' },
];
const auth = useAuthStore();
const bookingStore = useBookingStore();
const search = ref('');
const activeFilter = ref<FilterId>('all');
const selectedBooking = ref<Booking | null>(null);
const initialLoad = ref(true);
const now = ref(Date.now());
let clock: number | undefined;
const bookings = computed(() => bookingStore.bookings);
const reservations = computed(() => {
  const bookedReservationIds = new Set(bookings.value.map((booking) => booking.reservationId));
  return auth.user?.id ? listStoredReservations(auth.user.id).filter((item) => !bookedReservationIds.has(item.reservation.id)) : [];
});
const query = computed(() => search.value.trim().toLocaleLowerCase());
const filteredBookings = computed(() => bookings.value.filter((booking) => {
  const status = booking.paymentStatus === 'REFUNDED' ? 'REFUNDED' : booking.status;
  const eventTime = booking.event?.startDate ? Date.parse(booking.event.startDate) : NaN;
  if (activeFilter.value === 'pending') return false;
  if (['confirmed', 'cancelled', 'refunded'].includes(activeFilter.value) && status.toLowerCase() !== activeFilter.value) return false;
  if (activeFilter.value === 'upcoming' && !(Number.isFinite(eventTime) && eventTime >= now.value)) return false;
  if (activeFilter.value === 'past' && !(Number.isFinite(eventTime) && eventTime < now.value)) return false;
  return [booking.id, booking.event?.title, booking.event?.location, ...(booking.seats?.map((seat) => seat.seatNumber) ?? [])].some((part) => part?.toLocaleLowerCase().includes(query.value));
}));
const filteredReservations = computed(() => reservations.value.filter((item) => {
  const eventTime = item.event?.startDate ? Date.parse(item.event.startDate) : NaN;
  const pending = item.reservation.status === 'ACTIVE' && Date.parse(item.reservation.expiresAt) > now.value;
  if (activeFilter.value === 'pending' && !pending) return false;
  if (['confirmed', 'cancelled', 'refunded'].includes(activeFilter.value)) return false;
  if (activeFilter.value === 'upcoming' && !(Number.isFinite(eventTime) && eventTime >= now.value)) return false;
  if (activeFilter.value === 'past' && !(Number.isFinite(eventTime) && eventTime < now.value)) return false;
  return [item.reservation.id, item.event?.title, item.event?.location, ...item.seats.map((seat) => seat.seatNumber)].some((part) => part?.toLocaleLowerCase().includes(query.value));
}));
function clearFilters() { search.value = ''; activeFilter.value = 'all'; }
async function loadBookings() { try { await bookingStore.fetchMyBookings(); } catch { /* A safe retry message is shown above. */ } finally { initialLoad.value = false; } }
onMounted(() => { loadBookings(); clock = window.setInterval(() => { now.value = Date.now(); }, 1000); });
onBeforeUnmount(() => { if (clock !== undefined) window.clearInterval(clock); });
</script>

<style scoped>
.bookings-entrance { animation: booking-entrance 420ms cubic-bezier(.2,.8,.2,1) both; }
@keyframes booking-entrance { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .bookings-entrance { animation: none; } }
</style>
