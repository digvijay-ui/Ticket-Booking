<template>
  <div class="auth-page min-h-screen bg-midnight-ink px-5 pb-20 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pt-32">
    <div class="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthArtwork eyebrow="Your next night starts here" title="Back to the front row." copy="Sign in to reserve seats, use your wallet, and keep every ticket close." />

      <main class="flex items-center">
        <form class="w-full rounded-[24px] border border-white/10 bg-midnight-surface p-6 sm:p-9 lg:p-11" novalidate @submit.prevent="submit">
          <p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">User access</p>
          <h1 class="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Welcome back.</h1>
          <p class="mt-3 text-sm font-medium leading-6 text-midnight-stone">Sign in to continue to your EventBooking account.</p>

          <p v-if="sessionExpired" class="mt-5 flex gap-2 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-sm font-semibold" role="status">
            <Icon icon="mdi:clock-alert-outline" class="mt-0.5 h-5 w-5 shrink-0 text-midnight-ember" aria-hidden="true" />
            Your session expired. Please log in again.
          </p>

          <div class="mt-8 space-y-5">
            <AuthField id="login-email" v-model="email" name="email" label="Email address" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" @blur="validateEmail" />
            <AuthField id="login-password" v-model="password" name="password" label="Password" type="password" autocomplete="current-password" placeholder="Enter your password" :error="errors.password" @blur="validatePassword" />
          </div>

          <p v-if="auth.userError" class="mt-5 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-sm font-semibold leading-6" role="alert">{{ auth.userError }}</p>

          <AppButton variant="midnight" type="submit" class="mt-7 w-full rounded-full" icon="mdi:arrow-right" :loading="auth.loading">
            {{ auth.loading ? 'Signing in…' : 'Sign in' }}
          </AppButton>

          <div class="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p class="text-midnight-stone">New here? <RouterLink :to="signupLink" class="focus-midnight font-extrabold text-midnight-ivory underline decoration-midnight-ember underline-offset-4">Create an account</RouterLink></p>
            <RouterLink to="/admin/login" class="focus-midnight inline-flex items-center gap-1.5 font-bold text-midnight-stone hover:text-midnight-ivory"><Icon icon="mdi:shield-account-outline" class="h-4 w-4" aria-hidden="true" />Admin login</RouterLink>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AuthArtwork from '@/components/auth/AuthArtwork.vue';
import AuthField from '@/components/auth/AuthField.vue';
import AppButton from '@/components/common/AppButton.vue';
import { useAuthStore } from '../auth.store';

const email = ref('');
const password = ref('');
const errors = reactive({ email: '', password: '' });
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const redirectPath = computed(() => typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/events');
const signupLink = computed(() => ({ path: '/signup', query: redirectPath.value !== '/events' ? { redirect: redirectPath.value } : {} }));
const sessionExpired = computed(() => route.query.reason === 'session-expired');

function validateEmail() {
  errors.email = /^\S+@\S+\.\S+$/.test(email.value.trim()) ? '' : 'Enter a valid email address.';
  return !errors.email;
}
function validatePassword() {
  errors.password = password.value ? '' : 'Enter your password.';
  return !errors.password;
}
async function submit() {
  auth.userError = '';
  if (!validateEmail() || !validatePassword()) return;
  try {
    await auth.login({ email: email.value.trim(), password: password.value });
    await router.replace(redirectPath.value);
  } catch {
    // A safe, user-facing message is exposed by the auth store.
  }
}
</script>
