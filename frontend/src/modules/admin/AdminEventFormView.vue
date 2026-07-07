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
import { createAdminEvent, updateAdminEvent } from './admin.api';

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params.eventId));
const title = ref('');
const location = ref('');
const description = ref('');
const price = ref('');
const startDate = ref('');
const endDate = ref('');
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
  return !errors.title && !errors.location && !errors.description && !errors.price && !errors.startDate && !errors.endDate;
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
      await createAdminEvent(payload);
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
