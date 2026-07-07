<template>
  <label class="block">
    <span class="mb-2 block font-mono text-xs font-semibold uppercase text-paperCream/80">
      {{ label }}
    </span>
    <input
      :id="id"
      class="focus-ticket w-full rounded-sm border-2 border-paperCream/30 bg-paperCream px-4 py-3 text-stubCharcoal placeholder:text-stubCharcoal/45"
      :class="{ 'border-marqueeRed': error }"
      :type="type"
      :placeholder="placeholder"
      :value="modelValue"
      :autocomplete="autocomplete"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mt-2 block font-mono text-xs font-semibold text-marqueeRed">
      {{ error }}
    </span>
  </label>
</template>

<script setup lang="ts">
withDefaults(
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
</script>
