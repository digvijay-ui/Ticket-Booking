<template>
  <section class="rounded-md border-2 border-paperCream/15 bg-deepPlum p-5">
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="font-mono text-xs font-bold uppercase text-paperCream/55">{{ eyebrow }}</p>
        <h2 class="font-display text-4xl leading-none">{{ title }}</h2>
      </div>
      <AppBadge variant="draft" :label="String(filteredItems.length)" />
    </div>

    <div class="mb-4 grid gap-2 md:grid-cols-[1fr_9rem_9rem_10rem]">
      <label class="relative block">
        <Icon icon="mdi:magnify" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stubCharcoal/45" aria-hidden="true" />
        <input
          v-model.trim="search"
          class="focus-ticket h-10 w-full rounded-sm border-2 border-stubCharcoal bg-paperCream pl-9 pr-3 text-sm font-semibold text-stubCharcoal placeholder:text-stubCharcoal/45"
          :placeholder="searchPlaceholder"
          type="search"
        />
      </label>
      <input
        v-model="dateFrom"
        class="focus-ticket h-10 rounded-sm border-2 border-stubCharcoal bg-paperCream px-3 text-sm font-semibold text-stubCharcoal"
        type="date"
        aria-label="Start date"
      />
      <input
        v-model="dateTo"
        class="focus-ticket h-10 rounded-sm border-2 border-stubCharcoal bg-paperCream px-3 text-sm font-semibold text-stubCharcoal"
        type="date"
        aria-label="End date"
      />
      <select
        v-model="status"
        class="focus-ticket h-10 rounded-sm border-2 border-stubCharcoal bg-paperCream px-3 text-sm font-semibold text-stubCharcoal"
        aria-label="Status"
      >
        <option value="">All statuses</option>
        <option v-for="option in statusOptions" :key="option" :value="option">{{ option }}</option>
      </select>
    </div>

    <div v-if="filteredItems.length" class="overflow-x-auto rounded-sm border border-paperCream/10">
      <div class="min-w-[46rem] divide-y divide-paperCream/10">
        <article
          v-for="item in filteredItems"
          :key="item.id"
          class="group relative grid min-h-14 grid-cols-[minmax(8rem,0.9fr)_minmax(10rem,1.25fr)_minmax(6.5rem,0.7fr)_auto_minmax(4.5rem,0.55fr)] items-center gap-3 bg-paperCream px-3 py-2 text-stubCharcoal"
          :title="detailTitle(item)"
        >
          <div class="flex min-w-0 items-center gap-2">
            <span class="truncate font-mono text-xs font-bold tabular-nums">{{ truncateId(item.id) }}</span>
            <button
              class="focus-ticket inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-stubCharcoal/20 text-stubCharcoal/70 transition hover:border-stubCharcoal hover:text-stubCharcoal"
              type="button"
              :aria-label="`Copy ${item.id}`"
              @click="copyId(item.id)"
            >
              <Icon :icon="copiedId === item.id ? 'mdi:check' : 'mdi:content-copy'" class="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
          <p class="min-w-0 truncate text-sm font-bold">{{ item.name }}</p>
          <p class="text-right font-mono text-sm font-bold tabular-nums" :class="item.amountClass">{{ item.amount }}</p>
          <AppBadge :variant="item.badgeVariant" :label="item.status" />
          <time class="text-right font-mono text-[11px] font-bold uppercase text-stubCharcoal/55 tabular-nums" :datetime="item.createdAt">{{ item.relativeTime }}</time>

          <div
            class="pointer-events-none absolute left-3 right-3 top-[calc(100%-2px)] z-20 hidden rounded-sm border border-stubCharcoal/20 bg-inkNight p-3 text-paperCream opacity-0 shadow-ticket transition group-hover:opacity-100 group-focus-within:opacity-100 md:block"
          >
            <dl class="grid gap-2 text-xs sm:grid-cols-2">
              <div v-for="detail in item.details" :key="detail.label" class="min-w-0">
                <dt class="font-mono text-[9px] font-bold uppercase text-paperCream/45">{{ detail.label }}</dt>
                <dd class="truncate font-semibold">{{ detail.value }}</dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </div>

    <div v-else class="rounded-sm border border-paperCream/15 bg-paperCream p-5 text-center text-stubCharcoal">
      <p class="font-semibold">{{ emptyText }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { computed, ref } from 'vue';

import AppBadge from '@/components/common/AppBadge.vue';

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
const copiedId = ref('');

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

function truncateId(id: string) {
  if (id.length <= 12) {
    return id;
  }

  return `${id.slice(0, 6)}...${id.slice(-4)}`;
}

function detailTitle(item: ActivityPanelItem) {
  return item.details.map((detail) => `${detail.label}: ${detail.value}`).join('\n');
}

async function copyId(id: string) {
  try {
    await navigator.clipboard.writeText(id);
    copiedId.value = id;
    window.setTimeout(() => {
      if (copiedId.value === id) {
        copiedId.value = '';
      }
    }, 1200);
  } catch {
    copiedId.value = '';
  }
}
</script>
