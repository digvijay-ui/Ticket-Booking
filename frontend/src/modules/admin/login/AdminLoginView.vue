<template>
  <div class="admin-login-shell min-h-screen bg-admin-canvas px-4 py-10 text-admin-text">
    <main class="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center">
      <section class="w-full">
        <div class="mb-6 flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-md bg-admin-black font-semibold text-white">EB</span>
          <div>
            <p class="text-sm font-semibold">EventBooking</p>
            <p class="text-xs text-admin-secondary">Administration</p>
          </div>
        </div>

        <form class="rounded-xl border border-admin-border bg-white p-6 shadow-[0_12px_30px_rgba(17,17,17,0.07)] sm:p-8" @submit.prevent="submit">
          <p class="text-xs font-medium text-admin-secondary">Secure access</p>
          <h1 class="mt-1 text-2xl font-bold tracking-[-0.03em]">Sign in to admin</h1>
          <p class="mt-2 text-sm leading-6 text-admin-secondary">Manage events, bookings, transactions, seats, and refunds.</p>

          <div class="mt-6 space-y-4">
            <label for="admin-email" class="block">
              <span class="mb-1.5 block text-xs font-medium text-admin-secondary">Email address</span>
              <input id="admin-email" v-model.trim="email" name="email" class="admin-login-input" :class="{ 'border-admin-error': errors.email }" type="email" autocomplete="email" placeholder="admin@example.com" :aria-invalid="Boolean(errors.email)" :aria-describedby="errors.email ? 'admin-email-error' : undefined" />
              <span v-if="errors.email" id="admin-email-error" class="mt-1.5 block text-xs font-medium text-admin-error" role="alert">{{ errors.email }}</span>
            </label>

            <label for="admin-password" class="block">
              <span class="mb-1.5 block text-xs font-medium text-admin-secondary">Password</span>
              <input id="admin-password" v-model="password" name="password" class="admin-login-input" :class="{ 'border-admin-error': errors.password }" type="password" autocomplete="current-password" placeholder="Enter your password" :aria-invalid="Boolean(errors.password)" :aria-describedby="errors.password ? 'admin-password-error' : undefined" />
              <span v-if="errors.password" id="admin-password-error" class="mt-1.5 block text-xs font-medium text-admin-error" role="alert">{{ errors.password }}</span>
            </label>
          </div>

          <p v-if="submitError" class="mt-4 rounded-md border border-admin-error/25 bg-admin-errorSoft px-3 py-2 text-sm font-medium text-admin-error" role="alert">
            {{ submitError }}
          </p>

          <AppButton class="mt-6 w-full" type="submit" icon="mdi:shield-key-outline" :loading="auth.adminLoading">
            {{ auth.adminLoading ? 'Checking credentials...' : 'Sign in' }}
          </AppButton>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { provide, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';

const email = ref('');
const password = ref('');
const submitError = ref('');
const errors = reactive({
  email: '',
  password: '',
});

provide('adminUi', true);
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

function validate() {
  errors.email = '';
  errors.password = '';

  if (!email.value.trim()) {
    errors.email = 'Email is required';
  } else if (!/^\S+@\S+\.\S+$/.test(email.value)) {
    errors.email = 'Enter a valid email';
  }

  if (!password.value) {
    errors.password = 'Password is required';
  } else if (password.value.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  return !errors.email && !errors.password;
}

async function submit() {
  if (auth.adminLoading) return;
  submitError.value = '';

  if (!validate()) {
    return;
  }

  try {
    await auth.adminLogin({ email: email.value.trim(), password: password.value });
    const requestedRedirect = route.query.redirect;
    const redirect = typeof requestedRedirect === 'string' && requestedRedirect.startsWith('/admin/')
      ? requestedRedirect
      : '/admin/dashboard';
    await router.push(redirect);
  } catch (error) {
    submitError.value = getApiErrorMessage(error) || auth.adminError || 'Invalid admin login or something went wrong';
  }
}
</script>

<style scoped>
.admin-login-input {
  @apply w-full rounded-md border border-admin-border bg-white px-3 py-2.5 text-sm text-admin-text placeholder:text-admin-subtle focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1;
}

.admin-login-input:focus-visible {
  outline-color: #111111;
}

.admin-login-shell { font-family: "Manrope", "Work Sans", system-ui, sans-serif; }

.admin-login-shell :is(h1, h2, h3) {
  font-family: "Manrope", "Work Sans", system-ui, sans-serif;
  letter-spacing: -0.03em;
  text-transform: none;
}
</style>
