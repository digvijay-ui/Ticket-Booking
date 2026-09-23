<template>
  <aside class="auth-art relative hidden min-h-[640px] overflow-hidden rounded-[28px] border border-white/10 bg-midnight-ember p-9 lg:flex lg:flex-col lg:justify-between">
    <div class="poster-grid absolute inset-0 opacity-20" aria-hidden="true" />
    <div class="relative flex items-center justify-between">
      <span class="rounded-full border border-white/25 bg-midnight-ink/75 px-3 py-1.5 text-[9px] font-extrabold uppercase tracking-[0.16em] text-white">Member admission</span>
      <span class="text-[9px] font-bold uppercase tracking-[0.18em] text-white/75">EB / ACCESS</span>
    </div>
    <div class="relative">
      <p class="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/75">{{ eyebrow }}</p>
      <h2 class="mt-4 max-w-md text-6xl font-black leading-[0.88] tracking-[-0.065em] text-white">{{ title }}</h2>
      <p class="mt-5 max-w-sm text-base font-semibold leading-7 text-white/80">{{ copy }}</p>
    </div>
    <div class="relative flex items-end justify-between gap-5 border-t border-dashed border-white/30 pt-6">
      <div><p class="text-[9px] font-extrabold uppercase tracking-[0.18em] text-white/65">Valid for</p><p class="mt-1 text-sm font-extrabold text-white">Events · Wallet · Tickets</p></div>
      <span class="barcode-light h-9 w-28" aria-hidden="true" />
    </div>
  </aside>
</template>

<script setup lang="ts">
defineProps<{ eyebrow: string; title: string; copy: string }>();
</script>

<style scoped>
.auth-art::before { position:absolute; right:-12%; top:12%; width:62%; aspect-ratio:1; content:''; border:1px solid rgb(255 255 255 / .38); border-radius:999px; }
.auth-art::after { position:absolute; left:-20%; bottom:-22%; width:85%; aspect-ratio:1; content:''; border-radius:999px; background:rgb(9 9 11 / .42); }
.poster-grid { background-image:linear-gradient(rgb(255 255 255 / .16) 1px,transparent 1px),linear-gradient(90deg,rgb(255 255 255 / .16) 1px,transparent 1px); background-size:34px 34px; }
.barcode-light { background:repeating-linear-gradient(90deg,rgb(255 255 255 / .85) 0 2px,transparent 2px 5px,rgb(255 255 255 / .85) 5px 8px,transparent 8px 12px); }
</style>
