<template>
  <div class="flex min-h-screen items-center justify-center bg-inkNight px-4 py-8 text-paperCream">
    <div class="grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <TicketStubCard
        title="ADMIN ENTRY"
        :subtitle="isSignupMode ? 'Create the first admin account for this MongoDB database.' : 'Manage events, seats, payments, and refunds.'"
        status="draft"
      />

      <form class="rounded-md border-2 border-ticketGold/60 bg-deepPlum p-6" @submit.prevent="submit">
        <div class="mb-6">
          <h1 class="font-display text-5xl leading-none text-ticketGold">{{ isSignupMode ? 'CREATE ADMIN' : 'COUNTER STAFF' }}</h1>
          <p class="text-sm text-paperCream/70">
            {{ isSignupMode ? 'Bootstrap is allowed only when no admin exists yet.' : 'Admin login uses a separate admin token.' }}
          </p>
        </div>

        <div class="space-y-4">
          <AppInput v-if="isSignupMode" v-model="name" label="Admin name" autocomplete="name" placeholder="Admin User" :error="errors.name" />
          <AppInput v-model="email" label="Admin email" type="email" autocomplete="email" placeholder="admin@example.com" :error="errors.email" />
          <AppInput
            v-model="password"
            label="Password"
            type="password"
            :autocomplete="isSignupMode ? 'new-password' : 'current-password'"
            placeholder="Password"
            :error="errors.password"
          />
          <AppInput
            v-if="isSignupMode"
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

        <AppButton class="mt-6" type="submit" icon="mdi:shield-key" :loading="auth.loading">
          {{ auth.loading ? 'Please wait...' : isSignupMode ? 'Create Admin' : 'Login as Admin' }}
        </AppButton>

        <button
          type="button"
          class="focus-ticket mt-5 block rounded-sm font-mono text-xs font-semibold uppercase text-ticketGold hover:text-paperCream"
          @click="toggleMode"
        >
          {{ isSignupMode ? 'Already have an admin? Login' : 'No admin yet? Create first admin' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import AppButton from '@/components/common/AppButton.vue';
import AppInput from '@/components/common/AppInput.vue';
import TicketStubCard from '@/components/common/TicketStubCard.vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import { getApiErrorMessage } from '@/utils/apiError';

const isSignupMode = ref(false);
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
const route = useRoute();

function validate() {
  errors.name = isSignupMode.value && !name.value.trim() ? 'Name is required' : '';
  errors.email = /^\S+@\S+\.\S+$/.test(email.value) ? '' : 'Enter a valid email';
  errors.password = password.value.length >= 6 ? '' : 'Password must be at least 6 characters';
  errors.confirmPassword = isSignupMode.value && confirmPassword.value !== password.value ? 'Passwords must match' : '';
  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword;
}

function toggleMode() {
  isSignupMode.value = !isSignupMode.value;
  submitError.value = '';
  errors.name = '';
  errors.email = '';
  errors.password = '';
  errors.confirmPassword = '';
}

async function submit() {
  submitError.value = '';

  if (!validate()) {
    return;
  }

  try {
    if (isSignupMode.value) {
      await auth.adminSignup({
        name: name.value.trim(),
        email: email.value,
        password: password.value,
      });
    } else {
      await auth.adminLogin({ email: email.value, password: password.value });
    }

    router.push(String(route.query.redirect || '/admin/dashboard'));
  } catch (error) {
    submitError.value = getApiErrorMessage(error);
  }
}
</script>
