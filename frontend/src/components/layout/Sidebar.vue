<template>
  <Teleport to="body">
    <Transition name="admin-backdrop">
      <button v-if="mobileOpen" type="button" class="fixed inset-0 z-40 bg-black/50 lg:hidden" aria-label="Close admin navigation" @click="emit('closeMobile')" />
    </Transition>
  </Teleport>

  <aside
    class="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/10 bg-admin-black text-white transition-[width,transform] duration-200 motion-reduce:transition-none"
    :class="[mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0', collapsed ? 'lg:w-[5.25rem]' : 'lg:w-64']"
    aria-label="Admin navigation"
  >
    <div class="flex h-16 items-center gap-3 border-b border-white/10 px-4" :class="collapsed ? 'lg:justify-center lg:px-2' : ''">
      <RouterLink to="/admin/dashboard" class="admin-focus flex min-w-0 flex-1 items-center gap-3" active-class="" exact-active-class="" @click="emit('closeMobile')">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white font-semibold text-admin-black">EB</span>
        <span v-if="!collapsed" class="hidden min-w-0 lg:block">
          <span class="block truncate text-sm font-semibold text-white">EventBooking</span>
          <span class="block text-[10px] text-white/55">Administration</span>
        </span>
        <span class="min-w-0 lg:hidden">
          <span class="block truncate text-sm font-semibold text-white">EventBooking</span>
          <span class="block text-[10px] text-white/55">Administration</span>
        </span>
      </RouterLink>
      <button type="button" class="admin-focus inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white/65 hover:bg-white/10 hover:text-white lg:hidden" aria-label="Close admin navigation" @click="emit('closeMobile')">
        <Icon icon="mdi:close" class="h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <nav class="flex-1 space-y-1 overflow-y-auto px-3 py-5">
      <RouterLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="admin-nav-link admin-focus group flex min-h-10 items-center gap-3 rounded-md border border-transparent px-3 text-sm font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        active-class="border-white/20 bg-admin-black text-white"
        exact-active-class="border-white/20 bg-admin-black text-white"
        :class="collapsed ? 'lg:justify-center lg:px-2' : ''"
        :title="collapsed ? link.label : undefined"
        @click="emit('closeMobile')"
      >
        <Icon :icon="link.icon" class="h-5 w-5 shrink-0" aria-hidden="true" />
        <span v-if="!collapsed" class="hidden lg:inline">{{ link.label }}</span>
        <span class="lg:hidden">{{ link.label }}</span>
      </RouterLink>
    </nav>

    <div class="border-t border-white/10 p-3">
      <button type="button" class="admin-focus hidden min-h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white lg:flex" :class="collapsed ? 'justify-center px-2' : ''" :aria-label="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" :title="collapsed ? 'Expand sidebar' : 'Collapse sidebar'" @click="emit('toggleCollapse')">
        <Icon :icon="collapsed ? 'mdi:chevron-double-right' : 'mdi:chevron-double-left'" class="h-5 w-5 shrink-0" aria-hidden="true" />
        <span v-if="!collapsed">Collapse sidebar</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';

defineProps<{ collapsed: boolean; mobileOpen: boolean }>();
const emit = defineEmits<{ closeMobile: []; toggleCollapse: [] }>();

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: 'mdi:view-dashboard-outline' },
  { to: '/admin/events', label: 'Events', icon: 'mdi:calendar-star' },
  { to: '/admin/bookings', label: 'Bookings', icon: 'mdi:ticket-confirmation-outline' },
  { to: '/admin/transactions', label: 'Transactions', icon: 'mdi:receipt-text-outline' },
  { to: '/admin/analytics', label: 'Analytics', icon: 'mdi:chart-box-outline' },
];
</script>

<style scoped>
.admin-nav-link.router-link-active {
  color: #ffffff !important;
}
</style>
