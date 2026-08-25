<template>
  <section class="h-fit rounded-md border-2 border-paperCream/15 bg-deepPlum p-4 sm:p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-paperCream/55">{{ eyebrow }}</p>
        <h2 class="font-display text-3xl leading-none sm:text-4xl">{{ title }}</h2>
      </div>
      <AppBadge variant="draft" :label="String(filteredItems.length)" />
    </div>

    <div class="mb-4 grid gap-2 lg:grid-cols-[1fr_9rem_9rem_10rem]">
      <label class="relative block">
        <Icon icon="mdi:magnify" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-paperCream/45" aria-hidden="true" />
        <input
          v-model.trim="search"
          class="admin-filter-input h-10 pl-9 text-sm font-semibold"
          :placeholder="searchPlaceholder"
          type="search"
        />
      </label>
      <input
        v-model="dateFrom"
        class="admin-filter-input h-10 text-sm font-semibold"
        type="date"
        aria-label="Start date"
      />
      <input
        v-model="dateTo"
        class="admin-filter-input h-10 text-sm font-semibold"
        type="date"
        aria-label="End date"
      />
      <select
        v-model="status"
        class="admin-filter-input h-10 text-sm font-semibold"
        aria-label="Status"
      >
        <option value="">All statuses</option>
        <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <div v-if="filteredItems.length" class="space-y-2">
      <article
        v-for="item in filteredItems"
        :key="item.id"
        class="overflow-hidden rounded-sm border border-paperCream/10 bg-paperCream/5 text-paperCream transition-colors hover:border-[#14b8a6]/55"
      >
        <button
          type="button"
          class="focus-ticket grid w-full gap-2 px-3 py-2 text-left sm:grid-cols-[minmax(0,1fr)_auto] xl:grid-cols-[minmax(0,1fr)_minmax(6.25rem,auto)_auto_minmax(4.75rem,auto)_1.75rem] xl:items-center"
          :aria-expanded="expandedItemId === item.id"
          @click="toggleItem(item.id)"
        >
          <p class="admin-card-title min-w-0 truncate text-base text-paperCream">{{ item.name }}</p>
          <p class="font-mono text-sm font-bold tabular-nums sm:text-right" :class="item.amountClass">{{ item.amount }}</p>
          <AppBadge :variant="item.badgeVariant" :label="item.status" />
          <time class="font-mono text-[11px] font-bold uppercase text-paperCream/55 tabular-nums sm:text-right" :datetime="item.createdAt">{{ item.relativeTime }}</time>
          <Icon
            icon="mdi:chevron-down"
            class="hidden h-5 w-5 justify-self-end text-paperCream/55 transition-transform xl:block"
            :class="{ 'rotate-180 text-[#14b8a6]': expandedItemId === item.id }"
            aria-hidden="true"
          />
        </button>

        <Transition name="activity-detail">
          <div v-if="expandedItemId === item.id" class="activity-detail-shell">
            <div class="border-t border-paperCream/10 px-3 pb-3 pt-2">
              <div class="mb-3 flex min-w-0 items-center justify-between gap-3 rounded-sm border border-paperCream/10 bg-inkNight/70 p-2">
                <div class="min-w-0">
                  <p class="font-mono text-[9px] font-bold uppercase text-paperCream/45">Record ID</p>
                  <IdCopy :id="item.id" label="Record ID" />
                </div>
              </div>
              <dl class="grid gap-2 text-xs sm:grid-cols-2">
                <div v-for="detail in visibleDetails(item)" :key="detail.label" class="min-w-0">
                  <dt class="font-mono text-[9px] font-bold uppercase text-paperCream/45">{{ detail.label }}</dt>
                  <dd class="truncate font-semibold">{{ detail.value }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </Transition>
      </article>
    </div>

    <div v-else class="rounded-sm border border-paperCream/15 bg-paperCream/5 p-5 text-center text-paperCream">
      <p class="font-semibold">{{ emptyText }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';
import IdCopy from '@/components/common/IdCopy.vue';

type BadgeVariant = 'available' | 'reserved' | 'booked' | 'paid' | 'refunded' | 'cancelled' | 'draft' | 'published' | 'completed';

interface ActivityPanelItem {
  id: string;
  name: string;
  amount: string;
  amountClass: string;
  status: string;
  badgeVariant: BadgeVariant;
  createdAt: string;
  relativeTime: string;
  details: Array<{ label: string; value: string }>;
}

const props = defineProps<{
  eyebrow: string;
  title: string;
  items: ActivityPanelItem[];
  searchPlaceholder: string;
  emptyText: string;
}>();

const search = ref('');
const dateFrom = ref('');
const dateTo = ref('');
const status = ref('');
const expandedItemId = ref<string | null>(null);

const statusOptions = computed(() => Array.from(new Set(props.items.map((item) => item.status))).sort());

const filteredItems = computed(() => {
  const query = search.value.toLowerCase();
  const start = dateFrom.value ? new Date(`${dateFrom.value}T00:00:00`).getTime() : null;
  const end = dateTo.value ? new Date(`${dateTo.value}T23:59:59`).getTime() : null;

  return props.items.filter((item) => {
    const created = new Date(item.createdAt).getTime();
    const matchesSearch = !query || item.id.toLowerCase().includes(query) || item.name.toLowerCase().includes(query);
    const matchesStatus = !status.value || item.status === status.value;
    const matchesStart = start === null || created >= start;
    const matchesEnd = end === null || created <= end;

    return matchesSearch && matchesStatus && matchesStart && matchesEnd;
  });
});

function visibleDetails(item: ActivityPanelItem) {
  return item.details.filter((detail) => detail.label !== 'Booking ID' && detail.label !== 'Transaction ID');
}

function toggleItem(itemId: string) {
  expandedItemId.value = expandedItemId.value === itemId ? null : itemId;
}
</script>

<style scoped>
.activity-detail-shell {
  overflow: hidden;
}

.activity-detail-enter-active,
.activity-detail-leave-active {
  transition:
    max-height 180ms ease,
    opacity 160ms ease;
}

.activity-detail-enter-from,
.activity-detail-leave-to {
  max-height: 0;
  opacity: 0;
}

.activity-detail-enter-to,
.activity-detail-leave-from {
  max-height: 18rem;
  opacity: 1;
}
</style>
