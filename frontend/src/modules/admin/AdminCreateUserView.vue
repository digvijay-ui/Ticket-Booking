<template>
  <div class="space-y-6">
    <div>
      <p class="font-mono text-xs uppercase text-ticketGold">Admin users</p>
      <h1 class="font-display text-5xl leading-none text-paperCream">CREATE ADMIN</h1>
      <p class="text-sm text-paperCream/70">Only a logged-in admin can create another admin account.</p>
    </div>

    <form class="max-w-3xl rounded-md border-2 border-paperCream/20 bg-deepPlum p-5" @submit.prevent="submit">
      <div class="grid gap-4 md:grid-cols-2">
        <AppInput v-model="name" label="Name" autocomplete="name" placeholder="Admin name" :error="errors.name" />
        <AppInput v-model="email" label="Email" type="email" autocomplete="email" placeholder="admin@example.com" :error="errors.email" />
        <AppInput v-model="password" label="Password" type="password" autocomplete="new-password" placeholder="Password" :error="errors.password" />
        <AppInput
          v-model="confirmPassword"
          label="Confirm password"
          type="password"
          autocomplete="new-password"
          placeholder="Confirm password"
          :error="errors.confirmPassword"
        />
      </div>

      <p v-if="submitError" class="mt-4 rounded-sm border border-marqueeRed bg-marqueeRed/15 px-3 py-2 text-sm font-semibold text-paperCream">
        {{ submitError }}
      </p>

      <p v-if="successMessage" class="mt-4 rounded-sm border border-electricTeal bg-electricTeal/15 px-3 py-2 text-sm font-semibold text-paperCream">
        {{ successMessage }}
      </p>

      <div class="mt-5 flex flex-wrap gap-3">
        <AppButton type="submit" icon="mdi:shield-account" :loading="saving">
          {{ saving ? 'Please wait...' : 'Create Admin' }}
        </AppButton>
        <RouterLink to="/admin/dashboard">
          <AppButton type="button" variant="ghost" icon="mdi:arrow-left">Back</AppButton>
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';

import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import { getApiErrorMessage } from '@/utils/apiError';
import { createAdminUser } from './admin.api';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const saving = ref(false);
const submitError = ref('');
const successMessage = ref('');
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});

function validate() {
  errors.name = name.value.trim() ? '' : 'Name is required';
  errors.email = /^\S+@\S+\.\S+$/.test(email.value) ? '' : 'Enter a valid email';
  errors.password = password.value.length >= 6 ? '' : 'Password must be at least 6 characters';
  errors.confirmPassword = confirmPassword.value === password.value ? '' : 'Passwords must match';
  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
}

function resetForm() {
  name.value = '';
  email.value = '';
  password.value = '';
  confirmPassword.value = '';
}

async function submit() {
  submitError.value = '';
  successMessage.value = '';

  if (!validate()) {
    return;
  }

  saving.value = true;

  try {
    const response = await createAdminUser({
      name: name.value.trim(),
      email: email.value,
      password: password.value,
    });
    successMessage.value = `Admin created: ${response.data.data.user.email}`;
    resetForm();
  } catch (err) {
    submitError.value = getApiErrorMessage(err);
  } finally {
    saving.value = false;
  }
}
</script>
