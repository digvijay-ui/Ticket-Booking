<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Seat map admin</p>
        <h1 class="font-display text-5xl leading-none text-paperCream">SEAT OVERVIEW</h1>
        <p class="text-sm text-paperCream/70">{{ eventLabel }}</p>
      </div>
      <RouterLink to="/admin/events">
        <AppButton variant="secondary" icon="mdi:arrow-left">Back to Events</AppButton>
      </RouterLink>
    </div>

    <p v-if="adminStore.seatsError" class="rounded-sm border border-marqueeRed bg-marqueeRed/15 px-3 py-2 text-sm font-semibold text-paperCream">
      {{ adminStore.seatsError }}
    </p>
    <p v-if="successMessage" class="rounded-sm border border-electricTeal bg-electricTeal/15 px-3 py-2 text-sm font-semibold text-paperCream">
      {{ successMessage }}
    </p>

    <section class="grid gap-4 lg:grid-cols-[360px_1fr]">
      <aside class="space-y-4">
        <div class="rounded-md border-2 border-stubCharcoal bg-paperCream p-4 text-stubCharcoal shadow-ticket">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-mono text-[10px] font-bold uppercase text-marqueeRed">Event</p>
              <h2 class="mt-1 font-display text-3xl leading-none">{{ eventName }}</h2>
            </div>
            <p class="max-w-28 truncate font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">{{ eventId }}</p>
          </div>

          <div class="my-4 border-t-2 border-dashed border-stubCharcoal/25" />

          <div class="grid grid-cols-2 gap-2 font-mono text-xs uppercase">
            <div class="rounded-sm border border-stubCharcoal/15 p-2">
              <p class="text-[9px] font-bold text-stubCharcoal/45">Total Seats</p>
              <p class="font-black">{{ seatStats.total }}</p>
            </div>
            <div class="rounded-sm border border-electricTeal/50 bg-electricTeal/15 p-2">
              <p class="text-[9px] font-bold text-stubCharcoal/45">Available</p>
              <p class="font-black">{{ seatStats.available }}</p>
            </div>
            <div class="rounded-sm border border-ticketGold/60 bg-ticketGold/20 p-2">
              <p class="text-[9px] font-bold text-stubCharcoal/45">Reserved</p>
              <p class="font-black">{{ seatStats.reserved }}</p>
            </div>
            <div class="rounded-sm border border-marqueeRed/40 bg-marqueeRed/10 p-2 text-marqueeRed">
              <p class="text-[9px] font-bold text-marqueeRed/70">Booked</p>
              <p class="font-black">{{ seatStats.booked }}</p>
            </div>
          </div>

          <div class="mt-4 max-w-40 [&>div]:h-8">
            <BarcodeStrip />
          </div>
        </div>

        <form class="rounded-md border-2 border-ticketGold/50 bg-deepPlum p-4 text-paperCream" @submit.prevent="submitBulkCreate">
          <p class="font-mono text-xs font-bold uppercase text-ticketGold">Bulk Create Seats</p>
          <div class="mt-4 space-y-3">
            <label class="block">
              <span class="mb-1.5 block font-mono text-[10px] font-bold uppercase text-paperCream/70">Rows</span>
              <input v-model="rows" class="admin-seat-input" placeholder="A,B,C" />
              <span v-if="errors.rows" class="mt-1 block font-mono text-xs font-bold text-marqueeRed">{{ errors.rows }}</span>
            </label>

            <label class="block">
              <span class="mb-1.5 block font-mono text-[10px] font-bold uppercase text-paperCream/70">Seats per row</span>
              <input v-model="seatsPerRow" class="admin-seat-input" type="number" min="1" step="1" placeholder="10" />
              <span v-if="errors.seatsPerRow" class="mt-1 block font-mono text-xs font-bold text-marqueeRed">{{ errors.seatsPerRow }}</span>
            </label>

            <label class="block">
              <span class="mb-1.5 block font-mono text-[10px] font-bold uppercase text-paperCream/70">Price in rupees</span>
              <input v-model="priceInRupees" class="admin-seat-input" type="number" min="1" step="1" placeholder="500" />
              <span v-if="errors.price" class="mt-1 block font-mono text-xs font-bold text-marqueeRed">{{ errors.price }}</span>
            </label>
          </div>

          <p class="mt-3 font-mono text-[10px] font-bold uppercase text-paperCream/55">
            Preview: {{ parsedRows.length || 0 }} rows x {{ Number(seatsPerRow || 0) || 0 }} seats
          </p>

          <AppButton class="mt-4 w-full" type="submit" icon="mdi:seat" :loading="adminStore.bulkCreating">
            {{ adminStore.bulkCreating ? 'Creating...' : 'Create Seats' }}
          </AppButton>
        </form>
      </aside>

      <section class="space-y-4">
        <SeatLegend />

        <div v-if="adminStore.seatsLoading" class="flex min-h-72 items-center justify-center rounded-md bg-deepPlum">
          <LoadingSpinner size="lg" />
        </div>

        <div v-else class="rounded-md border-2 border-paperCream/15 bg-deepPlum p-4">
          <SeatGrid :seats="adminStore.adminSeats" :selected-seat-ids="[]" @toggle-seat="noop" />
        </div>
      </section>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import LoadingSpinner from '@/components/common/LoadingSpinner.vue';
import SeatGrid from '@/components/seats/SeatGrid.vue';
import SeatLegend from '@/components/seats/SeatLegend.vue';
import { rupeesToPaise } from '@/utils/money';
import { useAdminStore } from './admin.store';

const route = useRoute();
const adminStore = useAdminStore();
const rows = ref('A,B,C');
const seatsPerRow = ref('10');
const priceInRupees = ref('');
const successMessage = ref('');
const errors = reactive({
  rows: '',
  seatsPerRow: '',
  price: '',
});

const eventId = computed(() => String(route.params.eventId));
const event = computed(() => adminStore.events.find((item) => item.id === eventId.value) || adminStore.selectedEvent);
const eventName = computed(() => event.value?.title || 'Seat Inventory');
const eventLabel = computed(() => (event.value?.title ? `${event.value.title} seat inventory` : `Backend seat map preview for event ${eventId.value}.`));
const parsedRows = computed(() =>
  rows.value
    .split(',')
    .map((row) => row.trim().toUpperCase())
    .filter(Boolean),
);
const uniqueRows = computed(() => Array.from(new Set(parsedRows.value)));
const seatStats = computed(() => ({
  total: adminStore.adminSeats.length,
  available: adminStore.adminSeats.filter((seat) => seat.status === 'AVAILABLE').length,
  reserved: adminStore.adminSeats.filter((seat) => seat.status === 'RESERVED').length,
  booked: adminStore.adminSeats.filter((seat) => seat.status === 'BOOKED').length,
}));

function validate() {
  const seatsCount = Number(seatsPerRow.value);
  const price = Number(priceInRupees.value);

  errors.rows = uniqueRows.value.length ? '' : 'Add at least one row';
  errors.seatsPerRow = Number.isInteger(seatsCount) && seatsCount > 0 ? '' : 'Seats per row must be a positive whole number';
  errors.price = Number.isInteger(price) && price > 0 ? '' : 'Price must be a positive whole number';

  return !errors.rows && !errors.seatsPerRow && !errors.price;
}

function clearForm() {
  rows.value = '';
  seatsPerRow.value = '';
  priceInRupees.value = '';
}

function noop() {
  return undefined;
}

async function submitBulkCreate() {
  successMessage.value = '';

  if (!validate()) {
    return;
  }

  try {
    const data = await adminStore.bulkCreateSeats(eventId.value, {
      rows: uniqueRows.value,
      seatsPerRow: Number(seatsPerRow.value),
      priceInPaise: rupeesToPaise(Number(priceInRupees.value)),
    });
    successMessage.value = `${data.createdCount} seats created successfully`;
    clearForm();
  } catch {
    successMessage.value = '';
  }
}

onMounted(async () => {
  if (!adminStore.events.length) {
    adminStore.fetchEvents().catch(() => undefined);
  }

  await adminStore.fetchAdminEventSeats(eventId.value).catch(() => undefined);
});
</script>

<style scoped>
.admin-seat-input {
  @apply focus-ticket w-full rounded-sm border-2 border-paperCream/25 bg-paperCream px-3 py-2.5 text-stubCharcoal placeholder:text-stubCharcoal/45;
}
</style>
