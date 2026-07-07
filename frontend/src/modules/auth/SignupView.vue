<template>
  <div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <TicketStubCard title="CREATE YOUR PASS" subtitle="Sign up, load your wallet, and reserve your seat." status="draft" />

    <form class="rounded-md border-2 border-paperCream/20 bg-deepPlum p-6" @submit.prevent="submit">
      <div class="mb-6">
        <h1 class="font-display text-5xl leading-none text-ticketGold">SIGNUP</h1>
        <p class="text-sm text-paperCream/70">Create your account through the backend auth API.</p>
      </div>

      <div class="space-y-4">
        <AppInput v-model="name" label="Name" autocomplete="name" placeholder="Your name" :error="errors.name" />
        <AppInput v-model="email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" />
        <AppInput v-model="password" label="Password" type="password" autocomplete="new-password" placeholder="Password" :error="errors.password" />
        <AppInput
          v-model="confirmPassword"
          label="Confirm Password"
          type="password"
          autocomplete="new-password"
          placeholder="Confirm password"
          :error="errors.confirmPassword"
        />
      </div>

      <p v-if="submitError" class="mt-4 rounded-sm border border-marqueeRed bg-marqueeRed/15 px-3 py-2 text-sm font-semibold text-paperCream">
        {{ submitError }}
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <AppButton type="submit" icon="mdi:account-plus" :loading="auth.loading">
          {{ auth.loading ? 'Please wait...' : 'Create Account' }}
        </AppButton>
        <RouterLink class="focus-ticket rounded-sm font-mono text-xs uppercase text-ticketGold hover:text-paperCream" to="/login">
          Already have an account? Login
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import { getApiErrorMessage } from '@/utils/apiError';
import { useAuthStore } from './auth.store';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const submitError = ref('');
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
});
const auth = useAuthStore();
const router = useRouter();

function validate() {
  errors.name = name.value.trim() ? '' : 'Name is required';
  errors.email = /^\S+@\S+\.\S+$/.test(email.value) ? '' : 'Enter a valid email';
  errors.password = password.value.length >= 6 ? '' : 'Password must be at least 6 characters';
  errors.confirmPassword = confirmPassword.value === password.value ? '' : 'Passwords must match';
  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
}

async function submit() {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  try {
    await auth.signup({ name: name.value.trim(), email: email.value, password: password.value });
    router.push('/events');
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  }
}
</script>
