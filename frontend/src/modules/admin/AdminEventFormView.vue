<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Event editor</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">{{ isEdit ? 'EDIT EVENT' : 'CREATE EVENT' }}</h1>
      <p class="text-sm text-paperCream/70">Form shell for admin event APIs.</p>
    </div>

    <form class="rounded-md border-2 border-paperCream/20 bg-deepPlum p-5" @submit.prevent="submit">
      <div class="grid gap-4 md:grid-cols-2">
        <AppInput v-model="title" label="Title" placeholder="Event title" :error="errors.title" />
        <AppInput v-model="location" label="Location" placeholder="Venue name" :error="errors.location" />
        <AppInput v-model="price" label="Starting price in rupees" type="number" placeholder="499" :error="errors.price" />
        <AppInput v-model="startDate" label="Start date" type="datetime-local" :error="errors.startDate" />
        <AppInput v-model="endDate" label="End date" type="datetime-local" :error="errors.endDate" />
      </div>

      <div v-if="!isEdit" class="mt-5 rounded-sm border-2 border-ticketGold/40 bg-inkNight/45 p-4">
        <div class="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p class="font-mono text-xs font-semibold uppercase text-ticketGold">Seat layout</p>
            <p class="text-sm text-paperCream/65">Rows use letters. Example: A,B,C with 10 seats creates A1-A10, B1-B10, C1-C10.</p>
          </div>
          <p class="font-mono text-xs font-bold uppercase text-electricTeal">{{ seatPreview }}</p>
        </div>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <AppInput v-model="rows" label="Rows" placeholder="A,B,C" :error="errors.rows" />
          <AppInput v-model="seatsPerRow" label="Seats per row" type="number" placeholder="10" :error="errors.seatsPerRow" />
        </div>
      </div>

      <label class="mt-4 block">
        <span class="mb-2 block font-mono text-xs font-semibold uppercase text-paperCream/80">Description</span>
        <textarea
          v-model="description"
          class="focus-ticket min-h-28 w-full rounded-sm border-2 border-paperCream/30 bg-paperCream px-4 py-3 text-stubCharcoal placeholder:text-stubCharcoal/45"
          placeholder="Describe the event"
        />
        <span v-if="errors.description" class="mt-2 block font-mono text-xs font-semibold text-marqueeRed">{{ errors.description }}</span>
      </label>

      <label class="mt-4 block">
        <span class="mb-2 block font-mono text-xs font-semibold uppercase text-paperCream/80">Status</span>
        <select v-model="status" class="focus-ticket w-full rounded-sm border-2 border-paperCream/30 bg-paperCream px-4 py-3 text-stubCharcoal">
          <option value="DRAFT">Draft</option>
          <option value="PUBLISHED">Published</option>
        </select>
      </label>

      <p v-if="submitError" class="mt-4 rounded-sm border border-marqueeRed bg-marqueeRed/15 px-3 py-2 text-sm font-semibold text-paperCream">
        {{ submitError }}
      </p>

      <AppButton class="mt-5" type="submit" icon="mdi:content-save" :loading="saving">
        {{ saving ? 'Please wait...' : 'Save Event' }}
      </AppButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import { getEvent } from '@/modules/events/event.api';
import { getApiErrorMessage } from '@/utils/apiError';
import { rupeesToPaise } from '@/utils/money';
import { bulkCreateAdminSeats, createAdminEvent, updateAdminEvent } from './admin.api';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params.eventId));
const title = ref('');
const location = ref('');
const description = ref('');
const price = ref('');
const startDate = ref('');
const endDate = ref('');
const rows = ref('A,B,C');
const seatsPerRow = ref('10');
const status = ref<'DRAFT' | 'PUBLISHED'>('DRAFT');
const saving = ref(false);
const submitError = ref('');
const errors = reactive({
  title: '',
  location: '',
  description: '',
  price: '',
  startDate: '',
  endDate: '',
  rows: '',
  seatsPerRow: '',
});

const parsedRows = computed(() =>
  rows.value
    .split(',')
    .map((row) => row.trim().toUpperCase())
    .filter(Boolean),
);

const uniqueRows = computed(() => Array.from(new Set(parsedRows.value)));
const seatPreview = computed(() => {
  const count = uniqueRows.value.length * Number(seatsPerRow.value || 0);
  return count > 0 ? `${count} seats` : 'No seats';
});

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

async function loadEventForEdit() {
  if (!isEdit.value) {
    return;
  }

  try {
    const response = await getEvent(String(route.params.eventId));
    const event = response.data.data.event;
    title.value = event.title;
    location.value = event.location;
    description.value = event.description;
    price.value = String(event.seatPriceInPaise / 100);
    startDate.value = toDateTimeLocal(event.startDate);
    endDate.value = toDateTimeLocal(event.endDate);
    status.value = event.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT';
  } catch (err) {
    submitError.value = getApiErrorMessage(err);
  }
}

function validate() {
  errors.title = title.value.trim().length >= 2 ? '' : 'Title must be at least 2 characters';
  errors.location = location.value.trim().length >= 2 ? '' : 'Location is required';
  errors.description = description.value.trim().length >= 5 ? '' : 'Description must be at least 5 characters';
  errors.price = Number(price.value) > 0 ? '' : 'Price must be greater than 0';
  errors.startDate = startDate.value ? '' : 'Start date is required';
  errors.endDate = endDate.value && new Date(endDate.value) > new Date(startDate.value) ? '' : 'End date must be after start date';
  errors.rows = !isEdit.value && !uniqueRows.value.length ? 'Add at least one row letter' : '';
  errors.seatsPerRow =
    !isEdit.value && (!Number.isInteger(Number(seatsPerRow.value)) || Number(seatsPerRow.value) <= 0)
      ? 'Seats per row must be a whole number greater than 0'
      : '';

  return (
    !errors.title &&
    !errors.location &&
    !errors.description &&
    !errors.price &&
    !errors.startDate &&
    !errors.endDate &&
    !errors.rows &&
    !errors.seatsPerRow
  );
}

async function submit() {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  saving.value = true;

  const payload = {
    title: title.value.trim(),
    location: location.value.trim(),
    description: description.value.trim(),
    startDate: new Date(startDate.value).toISOString(),
    endDate: new Date(endDate.value).toISOString(),
    seatPriceInPaise: rupeesToPaise(Number(price.value)),
    status: status.value,
  };

  try {
    if (isEdit.value) {
      await updateAdminEvent(String(route.params.eventId), payload);
    } else {
      const response = await createAdminEvent(payload);
      await bulkCreateAdminSeats(response.data.data.event.id, {
        rows: uniqueRows.value,
        seatsPerRow: Number(seatsPerRow.value),
        priceInPaise: payload.seatPriceInPaise,
      });
    }

    router.push('/admin/events');
  } catch (err) {
    submitError.value = getApiErrorMessage(err);
  } finally {
    saving.value = false;
  }
}

onMounted(loadEventForEdit);
</script>
