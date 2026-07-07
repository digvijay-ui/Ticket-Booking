<template>
  <div class="flex min-h-screen flex-col bg-inkNight text-paperCream">
    <Navbar />
    <main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:py-10">
      <RouterView />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Footer from './Footer.vue';
import Navbar from './Navbar.vue';
</script>
