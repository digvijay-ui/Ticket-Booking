<template>
  <label class="block">
    <span :class="labelClass">
      {{ label }}
    </span>
    <input
      :id="resolvedId"
      :class="inputClass"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :autocomplete="autocomplete"
      :aria-invalid="Boolean(error)"
      :aria-describedby="error ? errorId : undefined"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" :id="errorId" :class="errorClass" role="alert">
      {{ error }}
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject, useId } from 'vue';

const isAdminUi = inject('adminUi', false);
const generatedId = useId();

const props = withDefaults(
  defineProps<{
    id?: string;
    label: string;
    modelValue: string;
    type?: string;
    placeholder?: string;
    autocomplete?: string;
    error?: string;
  }>(),
  {
    id: undefined,
    type: 'text',
    placeholder: '',
    autocomplete: undefined,
    error: '',
  },
);

defineEmits<{
  'update:modelValue': [value: string];
}>();

const resolvedId = computed(() => props.id || `field-${generatedId}`);
const errorId = computed(() => `${resolvedId.value}-error`);

const labelClass = computed(() =>
  isAdminUi
    ? 'mb-1.5 block text-xs font-semibold text-admin-secondary'
    : 'mb-2 block font-mono text-xs font-semibold uppercase text-paperCream/80',
);

const inputClass = computed(() => [
  isAdminUi
    ? 'w-full rounded-md border bg-white px-3 py-2.5 text-sm text-admin-text placeholder:text-admin-subtle transition-colors focus:border-admin-black focus:outline-none focus:ring-2 focus:ring-admin-black/10'
    : 'focus-ticket w-full rounded-sm border-2 bg-paperCream px-4 py-3 text-stubCharcoal placeholder:text-stubCharcoal/45',
  props.error
    ? isAdminUi ? 'border-admin-error' : 'border-marqueeRed'
    : isAdminUi ? 'border-admin-border' : 'border-paperCream/30',
]);

const errorClass = computed(() =>
  isAdminUi
    ? 'mt-1.5 block text-xs font-medium text-admin-error'
    : 'mt-2 block font-mono text-xs font-semibold text-marqueeRed',
);
</script>
