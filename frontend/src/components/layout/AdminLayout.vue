<template>
  <div class="min-h-screen bg-inkNight text-paperCream md:flex">
    <Sidebar />
    <main class="w-full px-4 py-6 sm:px-6 lg:px-8">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './Sidebar.vue';
</script>
