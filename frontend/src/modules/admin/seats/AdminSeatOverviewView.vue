<template>
  <div class="space-y-6">
    <header class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="admin-kicker">Seat management</p>
        <h1 class="admin-page-title">Seat overview</h1>
        <p class="admin-page-copy">{{ eventLabel }}</p>
      </div>
      <RouterLink to="/admin/events">
        <AppButton variant="secondary" icon="mdi:arrow-left">Back to Events</AppButton>
      </RouterLink>
    </header>

    <p v-if="adminStore.seatsError" class="admin-error-state text-sm font-medium" role="alert">
      {{ adminStore.seatsError }}
    </p>
    <p v-if="successMessage" class="rounded-md border border-admin-success/25 bg-admin-successSoft px-3 py-2 text-sm font-medium text-admin-success" role="status">
      {{ successMessage }}
    </p>

    <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Seat inventory summary">
      <article v-for="stat in seatStatCards" :key="stat.label" class="admin-ticket-card min-h-32 p-4">
        <p class="text-xs font-medium text-admin-secondary">{{ stat.label }}</p>
        <p class="mt-2 text-3xl font-bold text-admin-text tabular-nums">{{ stat.value }}</p>
        <div class="admin-barcode mt-4 w-24 opacity-50" aria-hidden="true" />
      </article>
    </section>

    <section class="grid gap-4 lg:grid-cols-[360px_1fr]">
      <aside class="space-y-4">
        <div class="rounded-lg border border-admin-border bg-white p-4 text-admin-text shadow-sm">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="text-[10px] font-bold uppercase text-admin-secondary">Event</p>
              <h2 class="admin-card-title mt-1 line-clamp-2">{{ eventName }}</h2>
            </div>
            <p class="max-w-28 truncate font-mono text-[10px] font-bold uppercase text-stubCharcoal/45">{{ eventId }}</p>
          </div>

          <div class="my-4 border-t-2 border-dashed border-stubCharcoal/25" />

          <div class="grid grid-cols-2 gap-2 font-mono text-xs uppercase">
            <div class="rounded-md border border-admin-border bg-admin-canvas p-2">
              <p class="text-[9px] font-bold text-stubCharcoal/45">Total Seats</p>
              <p class="font-black">{{ seatStats.total }}</p>
            </div>
            <div class="rounded-md border border-admin-success/25 bg-admin-successSoft p-2">
              <p class="text-[9px] font-bold text-stubCharcoal/45">Available</p>
              <p class="font-black">{{ seatStats.available }}</p>
            </div>
            <div class="rounded-md border border-admin-warning/25 bg-admin-warningSoft p-2">
              <p class="text-[9px] font-bold text-stubCharcoal/45">Reserved</p>
              <p class="font-black">{{ seatStats.reserved }}</p>
            </div>
            <div class="rounded-md border border-admin-error/25 bg-admin-errorSoft p-2 text-admin-error">
              <p class="text-[9px] font-bold text-admin-error">Booked</p>
              <p class="font-black">{{ seatStats.booked }}</p>
            </div>
          </div>

          <div class="mt-4 max-w-40 [&>div]:h-8">
            <BarcodeStrip />
          </div>
        </div>

        <form class="admin-panel-dark" @submit.prevent="submitBulkCreate">
          <p class="text-sm font-semibold text-admin-text">Bulk create seats</p>
          <div class="mt-4 space-y-3">
            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-admin-secondary">Rows</span>
              <input id="seat-rows" v-model="rows" name="rows" class="admin-seat-input" placeholder="A,B,C" :aria-invalid="Boolean(errors.rows)" :aria-describedby="errors.rows ? 'seat-rows-error' : undefined" />
              <span v-if="errors.rows" id="seat-rows-error" class="mt-1 block text-xs font-medium text-admin-error" role="alert">{{ errors.rows }}</span>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-admin-secondary">Seats per row</span>
              <input id="seats-per-row" v-model="seatsPerRow" name="seatsPerRow" class="admin-seat-input" type="number" min="1" step="1" placeholder="10" :aria-invalid="Boolean(errors.seatsPerRow)" :aria-describedby="errors.seatsPerRow ? 'seats-per-row-error' : undefined" />
              <span v-if="errors.seatsPerRow" id="seats-per-row-error" class="mt-1 block text-xs font-medium text-admin-error" role="alert">{{ errors.seatsPerRow }}</span>
            </label>

            <label class="block">
              <span class="mb-1.5 block text-xs font-medium text-admin-secondary">Price in rupees</span>
              <input id="seat-price" v-model="priceInRupees" name="price" class="admin-seat-input" type="number" min="1" step="1" placeholder="500" :aria-invalid="Boolean(errors.price)" :aria-describedby="errors.price ? 'seat-price-error' : undefined" />
              <span v-if="errors.price" id="seat-price-error" class="mt-1 block text-xs font-medium text-admin-error" role="alert">{{ errors.price }}</span>
            </label>
          </div>

          <p class="mt-3 text-xs font-medium text-admin-secondary">
            Preview: {{ parsedRows.length || 0 }} rows × {{ Number(seatsPerRow || 0) || 0 }} seats = {{ previewSeatCount }} seats total
          </p>

          <AppButton class="mt-4 w-full" type="submit" icon="mdi:seat" :loading="adminStore.bulkCreating">
            {{ adminStore.bulkCreating ? 'Creating...' : 'Create Seats' }}
          </AppButton>
        </form>
      </aside>

      <section class="space-y-4">
        <SeatLegend />

        <div v-if="adminStore.seatsLoading" class="admin-panel-dark flex min-h-72 items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>

        <SeatGrid v-else :seats="adminStore.adminSeats" :selected-seat-ids="[]" @toggle-seat="noop" />
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
import { useAdminStore } from '../admin.store';

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
const previewSeatCount = computed(() => uniqueRows.value.length * (Number(seatsPerRow.value) || 0));
const seatStatCards = computed(() => [
  { label: 'Total seats', value: seatStats.value.total, className: 'text-midnight-ivory' },
  { label: 'Available', value: seatStats.value.available, className: 'text-midnight-mint' },
  { label: 'Reserved', value: seatStats.value.reserved, className: 'text-midnight-stone' },
  { label: 'Booked', value: seatStats.value.booked, className: 'text-midnight-ember' },
]);

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
  if (adminStore.bulkCreating) return;
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
  @apply w-full rounded-md border border-admin-border bg-white px-3 py-2.5 text-sm text-admin-text placeholder:text-admin-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1;
}

.admin-seat-input:focus-visible {
  outline-color: #111111;
}
</style>
