<template>
  <div class="mx-auto grid max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
    <TicketStubCard title="ENTER THE BOX OFFICE" subtitle="Login to book seats, manage wallet, and view your tickets." status="draft" />

    <form class="rounded-md border-2 border-paperCream/20 bg-deepPlum p-6" @submit.prevent="submit">
      <div class="mb-6">
        <h1 class="font-display text-5xl leading-none text-ticketGold">LOGIN</h1>
        <p class="text-sm text-paperCream/70">Enter the box office with your backend account.</p>
      </div>

      <div class="space-y-4">
        <AppInput v-model="email" label="Email" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" />
        <AppInput v-model="password" label="Password" type="password" autocomplete="current-password" placeholder="Password" :error="errors.password" />
      </div>

      <p v-if="submitError" class="mt-4 rounded-sm border border-marqueeRed bg-marqueeRed/15 px-3 py-2 text-sm font-semibold text-paperCream">
        {{ submitError }}
      </p>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <AppButton type="submit" icon="mdi:login" :loading="auth.loading">
          {{ auth.loading ? 'Please wait...' : 'Login' }}
        </AppButton>
        <RouterLink class="focus-ticket rounded-sm font-mono text-xs uppercase text-ticketGold hover:text-paperCream" to="/signup">
          New here? Create account
        </RouterLink>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import { getApiErrorMessage } from '@/utils/apiError';
import { useAuthStore } from './auth.store';

const email = ref('');
const password = ref('');
const submitError = ref('');
const errors = reactive({
  email: '',
  password: '',
});
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

function validate() {
  errors.email = /^\S+@\S+\.\S+$/.test(email.value) ? '' : 'Enter a valid email';
  errors.password = password.value ? '' : 'Password is required';
  return !errors.email && !errors.password;
}

async function submit() {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  try {
    await auth.login({ email: email.value, password: password.value });
    router.push(String(route.query.redirect || '/events'));
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  }
}
</script>
