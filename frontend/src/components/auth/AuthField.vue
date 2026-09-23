<template>
  <div>
    <label :for="id" class="mb-2 block text-xs font-extrabold text-midnight-ivory">{{ label }}</label>
    <div class="relative">
      <input
        :id="id"
        :value="modelValue"
        :type="resolvedType"
        :name="name"
        :autocomplete="autocomplete"
        :placeholder="placeholder"
        :aria-invalid="Boolean(error)"
        :aria-describedby="describedBy"
        class="focus-midnight min-h-12 w-full rounded-xl border bg-midnight-ink px-4 text-sm font-semibold text-midnight-ivory outline-none placeholder:text-midnight-stone/55"
        :class="error ? 'border-midnight-ember' : 'border-white/15 focus:border-midnight-mint'"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @blur="$emit('blur')"
      />
      <button
        v-if="type === 'password'"
        type="button"
        class="focus-midnight absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-midnight-stone hover:text-midnight-ivory"
        :aria-label="passwordVisible ? 'Hide password' : 'Show password'"
        @click="passwordVisible = !passwordVisible"
      >
        <Icon :icon="passwordVisible ? 'mdi:eye-off-outline' : 'mdi:eye-outline'" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
    <p v-if="helper && !error" :id="`${id}-helper`" class="mt-2 text-xs font-medium leading-5 text-midnight-stone">{{ helper }}</p>
    <p v-if="error" :id="`${id}-error`" class="mt-2 flex items-center gap-1.5 text-xs font-bold text-midnight-ember">
      <Icon icon="mdi:alert-circle-outline" class="h-4 w-4 shrink-0" aria-hidden="true" />{{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

const props = withDefaults(defineProps<{
  id: string;
  name: string;
  label: string;
  modelValue: string;
  type?: 'text' | 'email' | 'password';
  autocomplete?: string;
  placeholder?: string;
  helper?: string;
  error?: string;
}>(), {
  type: 'text',
  autocomplete: undefined,
  placeholder: '',
  helper: '',
  error: '',
});

defineEmits<{ 'update:modelValue': [value: string]; blur: [] }>();
const passwordVisible = ref(false);
const resolvedType = computed(() => props.type === 'password' && passwordVisible.value ? 'text' : props.type);
const describedBy = computed(() => props.error ? `${props.id}-error` : props.helper ? `${props.id}-helper` : undefined);
</script>
