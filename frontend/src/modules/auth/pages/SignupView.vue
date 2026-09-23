<template>
  <div class="auth-page min-h-screen bg-midnight-ink px-5 pb-20 pt-28 text-midnight-ivory sm:px-8 lg:px-12 lg:pt-32">
    <div class="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <AuthArtwork eyebrow="One account. Every ticket." title="Join the guest list." copy="Create your pass, load your wallet, and book the moments worth showing up for." />

      <main class="flex items-center">
        <form class="w-full rounded-[24px] border border-white/10 bg-midnight-surface p-6 sm:p-9 lg:p-11" novalidate @submit.prevent="submit">
          <p class="text-[10px] font-extrabold uppercase tracking-[0.18em] text-midnight-mint">Create your pass</p>
          <h1 class="mt-3 text-4xl font-black tracking-[-0.05em] sm:text-5xl">Make it official.</h1>
          <p class="mt-3 text-sm font-medium leading-6 text-midnight-stone">Your wallet and tickets stay connected to this account.</p>

          <div class="mt-8 grid gap-5 sm:grid-cols-2">
            <AuthField id="signup-name" v-model="name" name="name" label="Full name" autocomplete="name" placeholder="Your name" :error="errors.name" @blur="validateName" />
            <AuthField id="signup-email" v-model="email" name="email" label="Email address" type="email" autocomplete="email" placeholder="you@example.com" :error="errors.email" @blur="validateEmail" />
            <AuthField id="signup-password" v-model="password" name="password" label="Password" type="password" autocomplete="new-password" placeholder="At least 6 characters" helper="Use at least 6 characters." :error="errors.password" @blur="validatePassword" />
            <AuthField id="signup-confirm-password" v-model="confirmPassword" name="confirmPassword" label="Confirm password" type="password" autocomplete="new-password" placeholder="Repeat your password" :error="errors.confirmPassword" @blur="validateConfirmation" />
          </div>

          <p v-if="auth.userError" class="mt-5 rounded-xl border border-midnight-ember/35 bg-midnight-ember/10 p-3 text-sm font-semibold leading-6" role="alert">{{ auth.userError }}</p>

          <AppButton variant="midnight" type="submit" class="mt-7 w-full rounded-full" icon="mdi:account-plus-outline" :loading="auth.loading">
            {{ auth.loading ? 'Creating account…' : 'Create account' }}
          </AppButton>

          <div class="mt-7 flex flex-col gap-3 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p class="text-midnight-stone">Already a member? <RouterLink :to="loginLink" class="focus-midnight font-extrabold text-midnight-ivory underline decoration-midnight-ember underline-offset-4">Sign in</RouterLink></p>
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

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errors = reactive({ name: '', email: '', password: '', confirmPassword: '' });
const auth = useAuthStore();
const router = useRouter();
const route = useRoute();
const redirectPath = computed(() => typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/') ? route.query.redirect : '/events');
const loginLink = computed(() => ({ path: '/login', query: redirectPath.value !== '/events' ? { redirect: redirectPath.value } : {} }));

function validateName() { errors.name = name.value.trim().length >= 2 ? '' : 'Enter your full name.'; return !errors.name; }
function validateEmail() { errors.email = /^\S+@\S+\.\S+$/.test(email.value.trim()) ? '' : 'Enter a valid email address.'; return !errors.email; }
function validatePassword() { errors.password = password.value.length >= 6 ? '' : 'Password must be at least 6 characters.'; return !errors.password; }
function validateConfirmation() { errors.confirmPassword = confirmPassword.value === password.value && confirmPassword.value ? '' : 'Passwords must match.'; return !errors.confirmPassword; }

async function submit() {
  auth.userError = '';
  if (![validateName(), validateEmail(), validatePassword(), validateConfirmation()].every(Boolean)) return;
  try {
    await auth.signup({ name: name.value.trim(), email: email.value.trim(), password: password.value });
    await router.replace(redirectPath.value);
  } catch {
    // A safe, user-facing message is exposed by the auth store.
  }
}
</script>
