<template>
  <div class="space-y-6">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-ticketGold">Event editor</p>
        <h1 class="font-display text-5xl leading-none text-paperCream">{{ isEdit ? 'EDIT EVENT' : 'CREATE EVENT' }}</h1>
        <p class="text-sm text-paperCream/70">Frontend uses rupees. Backend receives seatPriceInPaise.</p>
      </div>
      <RouterLink to="/admin/events">
        <AppButton type="button" variant="secondary" icon="mdi:arrow-left">Back</AppButton>
      </RouterLink>
    </div>

    <div v-if="loadingEvent" class="rounded-md border-2 border-stubCharcoal bg-paperCream p-6 text-stubCharcoal shadow-ticket">
      <div class="h-3 w-32 animate-pulse rounded-sm bg-stubCharcoal/15" />
      <div class="mt-4 h-10 w-64 animate-pulse rounded-sm bg-stubCharcoal/20" />
      <div class="mt-6 h-40 animate-pulse rounded-sm bg-stubCharcoal/10" />
    </div>

    <form v-else class="rounded-md border-2 border-stubCharcoal bg-paperCream p-5 text-stubCharcoal shadow-ticket" @submit.prevent="submit">
      <div class="grid gap-4 md:grid-cols-2">
        <FieldBlock label="Title" :error="errors.title">
          <input v-model="title" class="admin-input" placeholder="Coldplay Concert" />
        </FieldBlock>

        <FieldBlock label="Location" :error="errors.location">
          <input v-model="location" class="admin-input" placeholder="Ahmedabad Stadium" />
        </FieldBlock>

        <FieldBlock label="Start Date" :error="errors.startDate">
          <input v-model="startDate" class="admin-input" type="datetime-local" />
        </FieldBlock>

        <FieldBlock label="End Date" :error="errors.endDate">
          <input v-model="endDate" class="admin-input" type="datetime-local" />
        </FieldBlock>

        <FieldBlock label="Seat Price in Rupees" :error="errors.price">
          <input v-model="price" class="admin-input" type="number" min="1" step="1" placeholder="500" />
        </FieldBlock>

        <FieldBlock label="Status" :error="errors.status">
          <select v-model="status" class="admin-input">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </FieldBlock>
      </div>

      <FieldBlock class="mt-4" label="Description" :error="errors.description">
        <textarea v-model="description" class="admin-input min-h-28 resize-y" placeholder="Describe the event" />
      </FieldBlock>

      <p v-if="submitError" class="mt-4 rounded-sm border border-marqueeRed bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
        {{ submitError }}
      </p>
      <p v-if="successMessage" class="mt-4 rounded-sm border border-electricTeal bg-electricTeal/15 px-3 py-2 text-sm font-semibold text-stubCharcoal">
        {{ successMessage }}
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <AppButton type="submit" icon="mdi:content-save" :loading="adminStore.eventSaving">
          {{ adminStore.eventSaving ? 'Please wait...' : isEdit ? 'UPDATE EVENT' : 'CREATE EVENT' }}
        </AppButton>
        <RouterLink to="/admin/events" class="inline-flex">
          <AppButton type="button" variant="secondary" icon="mdi:close">Cancel</AppButton>
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import { getEventByIdApi } from '@/modules/events/event.api';
import type { EventItem } from '@/services/apiTypes';
import { getApiErrorMessage } from '@/utils/apiError';
import { rupeesToPaise } from '@/utils/money';
import { useAdminStore } from './admin.store';

const FieldBlock = defineComponent({
  props: {
    label: { type: String, required: true },
    error: { type: String, default: '' },
  },
  setup(props, { slots, attrs }) {
    return () =>
      h('label', { class: ['block', attrs.class] }, [
        h('span', { class: 'mb-2 block font-mono text-xs font-bold uppercase text-stubCharcoal/60' }, props.label),
        slots.default?.(),
        props.error ? h('span', { class: 'mt-2 block font-mono text-xs font-bold text-marqueeRed' }, props.error) : null,
      ]);
  },
});

const route = useRoute();
const router = useRouter();
const adminStore = useAdminStore();
const isEdit = computed(() => Boolean(route.params.eventId));
const loadingEvent = ref(false);
const successMessage = ref('');
const submitError = ref('');

const title = ref('');
const location = ref('');
const description = ref('');
const price = ref('');
const startDate = ref('');
const endDate = ref('');
const status = ref<EventItem['status']>('DRAFT');
const errors = reactive({
  title: '',
  location: '',
  description: '',
  price: '',
  startDate: '',
  endDate: '',
  status: '',
});

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

function fillForm(event: EventItem) {
  title.value = event.title;
  location.value = event.location;
  description.value = event.description;
  price.value = String(event.seatPriceInPaise / 100);
  startDate.value = toDateTimeLocal(event.startDate);
  endDate.value = toDateTimeLocal(event.endDate);
  status.value = event.status;
}

async function loadEventForEdit() {
  if (!isEdit.value) {
    return;
  }

  loadingEvent.value = true;
  submitError.value = '';

  try {
    const eventId = String(route.params.eventId);
    const storedEvent = adminStore.events.find((event) => event.id === eventId);

    if (storedEvent) {
      fillForm(storedEvent);
      return;
    }

    const response = await getEventByIdApi(eventId);
    fillForm(response.data.data.event);
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  } finally {
    loadingEvent.value = false;
  }
}

function validate() {
  const numericPrice = Number(price.value);
  errors.title = title.value.trim() ? '' : 'Title is required';
  errors.location = location.value.trim() ? '' : 'Location is required';
  errors.description = description.value.trim() ? '' : 'Description is required';
  errors.price = Number.isInteger(numericPrice) && numericPrice > 0 ? '' : 'Seat price must be a positive whole number';
  errors.startDate = startDate.value ? '' : 'Start date is required';
  errors.endDate = endDate.value && new Date(endDate.value) > new Date(startDate.value) ? '' : 'End date must be after start date';
  errors.status = status.value ? '' : 'Status is required';

  return !errors.title && !errors.location && !errors.description && !errors.price && !errors.startDate && !errors.endDate && !errors.status;
}

async function submit() {
  submitError.value = '';
  successMessage.value = '';

  if (!validate()) {
    return;
  }

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
      await adminStore.updateEvent(String(route.params.eventId), payload);
      successMessage.value = 'Event updated successfully';
    } else {
      await adminStore.createEvent(payload);
      successMessage.value = 'Event created successfully';
    }

    router.push('/admin/events');
  } catch (error) {
    submitError.value = adminStore.eventsError || getApiErrorMessage(error);
  }
}

onMounted(loadEventForEdit);
</script>

<style scoped>
.admin-input {
  @apply focus-ticket w-full rounded-sm border-2 border-stubCharcoal/25 bg-inkNight px-4 py-3 text-paperCream placeholder:text-paperCream/40;
}
</style>
