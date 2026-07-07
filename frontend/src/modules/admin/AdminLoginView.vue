<template>
  <div class="min-h-screen bg-[#121221] px-4 py-8 text-[#e3e0f6]">
    <div class="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
      <section class="grid w-full overflow-hidden rounded-md border-2 border-stubCharcoal bg-paperCream text-stubCharcoal shadow-ticket lg:grid-cols-[1fr_420px]">
        <div class="relative p-6 sm:p-8">
          <div class="absolute left-0 top-0 h-full w-2 bg-marqueeRed" aria-hidden="true" />
          <p class="pl-2 font-mono text-xs font-bold uppercase text-marqueeRed">Admin counter</p>
          <h1 class="mt-2 pl-2 font-display text-6xl leading-none sm:text-7xl">ADMIN ENTRY</h1>
          <p class="mt-3 max-w-2xl pl-2 text-sm text-stubCharcoal/70">
            Manage events, seats, payments, refunds, and cancellations.
          </p>

          <div class="my-8 border-t-2 border-dashed border-stubCharcoal/25" />

          <div class="grid gap-3 pl-2 sm:grid-cols-2">
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Access level</p>
              <p class="mt-1 font-display text-3xl leading-none text-marqueeRed">ADMIN</p>
            </div>
            <div class="rounded-sm border border-stubCharcoal/15 p-3">
              <p class="font-mono text-[10px] font-bold uppercase text-stubCharcoal/50">Token storage</p>
              <p class="mt-1 font-mono text-xs font-bold">adminToken</p>
            </div>
          </div>

          <div class="mt-8 pl-2">
            <BarcodeStrip />
          </div>
        </div>

        <form class="relative border-t-2 border-dashed border-stubCharcoal/25 p-6 sm:p-8 lg:border-l-2 lg:border-t-0" @submit.prevent="submit">
          <span class="absolute -left-4 -top-4 hidden h-8 w-8 rounded-full bg-[#121221] lg:block" aria-hidden="true" />
          <span class="absolute -bottom-4 -left-4 hidden h-8 w-8 rounded-full bg-[#121221] lg:block" aria-hidden="true" />

          <p class="font-mono text-xs font-bold uppercase text-ticketGold">Secure desk</p>
          <h2 class="mt-1 font-display text-5xl leading-none">LOGIN AS ADMIN</h2>

          <div class="mt-6 space-y-4">
            <label class="block">
              <span class="mb-2 block font-mono text-xs font-bold uppercase text-stubCharcoal/60">Email</span>
              <input
                v-model.trim="email"
                class="focus-ticket w-full rounded-sm border-2 border-stubCharcoal/25 bg-paperCream px-4 py-3 text-stubCharcoal placeholder:text-stubCharcoal/40"
                :class="{ 'border-marqueeRed': errors.email }"
                type="email"
                autocomplete="email"
                placeholder="admin@example.com"
              />
              <span v-if="errors.email" class="mt-2 block font-mono text-xs font-bold text-marqueeRed">{{ errors.email }}</span>
            </label>

            <label class="block">
              <span class="mb-2 block font-mono text-xs font-bold uppercase text-stubCharcoal/60">Password</span>
              <input
                v-model="password"
                class="focus-ticket w-full rounded-sm border-2 border-stubCharcoal/25 bg-paperCream px-4 py-3 text-stubCharcoal placeholder:text-stubCharcoal/40"
                :class="{ 'border-marqueeRed': errors.password }"
                type="password"
                autocomplete="current-password"
                placeholder="password123"
              />
              <span v-if="errors.password" class="mt-2 block font-mono text-xs font-bold text-marqueeRed">{{ errors.password }}</span>
            </label>
          </div>

          <p v-if="submitError" class="mt-4 rounded-sm border border-marqueeRed bg-marqueeRed/10 px-3 py-2 text-sm font-semibold text-marqueeRed">
            {{ submitError }}
          </p>

          <AppButton class="mt-6 w-full" type="submit" icon="mdi:shield-key" :loading="auth.adminLoading">
            {{ auth.adminLoading ? 'Checking credentials...' : 'LOGIN AS ADMIN' }}
          </AppButton>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import BarcodeStrip from '@/components/common/BarcodeStrip.vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';

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
  submitError.value = '';

  if (!validate()) {
    return;
  }

  try {
    await auth.adminLogin({ email: email.value.trim(), password: password.value });
    router.push(String(route.query.redirect || '/admin/dashboard'));
  } catch (error) {
    submitError.value = getApiErrorMessage(error) || auth.adminError || 'Invalid admin login or something went wrong';
  }
}
</script>
