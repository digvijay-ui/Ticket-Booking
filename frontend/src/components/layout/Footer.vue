<template>
  <footer class="border-t-2 border-ticketGold/25 bg-inkNight text-paperCream">
    <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <RouterLink to="/" class="focus-ticket w-fit rounded-sm font-display text-3xl leading-none text-paperCream hover:text-ticketGold">
        EVENT BOOKING
      </RouterLink>

      <nav class="flex flex-wrap gap-4 font-mono text-xs font-bold uppercase">
        <RouterLink class="focus-ticket rounded-sm hover:text-ticketGold" to="/events">Events</RouterLink>
        <RouterLink class="focus-ticket rounded-sm hover:text-ticketGold" to="/login">Login</RouterLink>
        <RouterLink class="focus-ticket rounded-sm hover:text-ticketGold" to="/signup">Sign Up</RouterLink>
      </nav>
    </div>
  </footer>
</template>
