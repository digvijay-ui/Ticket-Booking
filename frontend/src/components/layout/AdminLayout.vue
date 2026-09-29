<template>
  <div class="admin-shell min-h-screen bg-admin-canvas text-admin-text">
    <a href="#admin-content" class="admin-focus fixed left-4 top-3 z-[70] -translate-y-20 rounded-md bg-admin-black px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0">Skip to content</a>

    <Sidebar
      :collapsed="sidebarCollapsed"
      :mobile-open="mobileSidebarOpen"
      @close-mobile="mobileSidebarOpen = false"
      @toggle-collapse="sidebarCollapsed = !sidebarCollapsed"
    />

    <div class="min-h-screen transition-[padding] duration-200 motion-reduce:transition-none" :class="sidebarCollapsed ? 'lg:pl-[5.25rem]' : 'lg:pl-64'">
      <header class="sticky top-0 z-30 border-b border-admin-border bg-white">
        <div class="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button type="button" class="admin-focus inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-admin-border bg-white text-admin-text lg:hidden" aria-label="Open admin navigation" :aria-expanded="mobileSidebarOpen" @click="mobileSidebarOpen = true">
            <Icon icon="mdi:menu" class="h-5 w-5" aria-hidden="true" />
          </button>

          <div class="min-w-0 flex-1">
            <nav aria-label="Breadcrumb" class="flex items-center gap-1.5 text-xs font-medium text-admin-subtle">
              <RouterLink to="/admin/dashboard" class="admin-focus hover:text-admin-text">Admin</RouterLink>
              <Icon icon="mdi:chevron-right" class="h-3.5 w-3.5" aria-hidden="true" />
              <span class="truncate text-admin-secondary">{{ breadcrumb }}</span>
            </nav>
            <p class="truncate text-sm font-semibold text-admin-text sm:text-base">{{ pageTitle }}</p>
          </div>

          <div ref="accountMenuRef" class="relative">
            <button type="button" class="admin-focus flex min-h-10 items-center gap-2 rounded-md border border-admin-border bg-white px-2.5 text-left hover:bg-admin-hover" :aria-expanded="accountMenuOpen" aria-haspopup="menu" @click="accountMenuOpen = !accountMenuOpen">
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-admin-black text-xs font-bold text-white">{{ adminInitials }}</span>
              <span class="hidden min-w-0 sm:block">
                <span class="block max-w-36 truncate text-xs font-semibold text-admin-text">{{ adminName }}</span>
                <span class="block text-[10px] text-admin-secondary">Administrator</span>
              </span>
              <Icon icon="mdi:chevron-down" class="hidden h-4 w-4 text-admin-subtle sm:block" aria-hidden="true" />
            </button>

            <div v-if="accountMenuOpen" class="absolute right-0 top-[calc(100%+0.5rem)] w-64 rounded-lg border border-admin-border bg-white p-2 shadow-lg" role="menu">
              <div class="border-b border-admin-border px-3 py-2">
                <p class="truncate text-sm font-semibold text-admin-text">{{ adminName }}</p>
                <p class="mt-0.5 truncate text-xs text-admin-secondary">{{ auth.adminUser?.email || 'Admin account' }}</p>
              </div>
              <button type="button" class="admin-focus mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-admin-error hover:bg-admin-errorSoft" role="menuitem" @click="logout">
                <Icon icon="mdi:logout" class="h-4 w-4" aria-hidden="true" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="admin-content" class="mx-auto min-w-0 max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-6" tabindex="-1">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { useAuthStore } from '@/modules/auth/auth.store';
import Sidebar from './Sidebar.vue';

provide('adminUi', true);

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const mobileSidebarOpen = ref(false);
const sidebarCollapsed = ref(localStorage.getItem('adminSidebarCollapsed') === 'true');
const accountMenuOpen = ref(false);
const accountMenuRef = ref<HTMLElement | null>(null);

const pageTitle = computed(() => String(route.meta.title || 'Admin'));
const breadcrumb = computed(() => String(route.meta.breadcrumb || pageTitle.value));
const adminName = computed(() => auth.adminUser?.name || 'Admin');
const adminInitials = computed(() => adminName.value.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'A');

watch(sidebarCollapsed, (value) => localStorage.setItem('adminSidebarCollapsed', String(value)));
watch(() => route.fullPath, () => {
  mobileSidebarOpen.value = false;
  accountMenuOpen.value = false;
});
watch(mobileSidebarOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : '';
});

function onDocumentClick(event: MouseEvent) {
  if (accountMenuOpen.value && accountMenuRef.value && !accountMenuRef.value.contains(event.target as Node)) accountMenuOpen.value = false;
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    mobileSidebarOpen.value = false;
    accountMenuOpen.value = false;
  }
}

function logout() {
  auth.adminLogout();
  void router.push('/admin/login');
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick);
  document.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  document.body.style.overflow = '';
  document.removeEventListener('click', onDocumentClick);
  document.removeEventListener('keydown', onKeydown);
});
</script>
