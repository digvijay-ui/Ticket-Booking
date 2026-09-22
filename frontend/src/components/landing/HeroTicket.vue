<template>
  <div
    ref="ticketScene"
    class="ticket-scene relative mx-auto w-full max-w-[610px] xl:ml-auto"
    @pointermove="moveTicket"
    @pointerleave="resetTicket"
  >
    <div class="ticket-shadow absolute inset-8 translate-x-5 translate-y-6 rounded-[28px] border border-white/10 bg-midnight-surface" aria-hidden="true" />

    <div class="hero-ticket relative overflow-hidden rounded-[26px] bg-midnight-ivory text-midnight-ink shadow-[0_30px_80px_rgba(0,0,0,0.38)]">
      <div class="grid md:grid-cols-[1fr_136px]">
        <div class="min-w-0 p-3 sm:p-4">
          <div class="ticket-art relative aspect-[16/9] overflow-hidden rounded-[18px] bg-[#28232d]">
            <svg viewBox="0 0 520 290" class="absolute inset-0 h-full w-full" role="img" aria-label="Abstract concert stage under a warm spotlight">
              <defs>
                <linearGradient id="stage-light" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stop-color="#FF8A52" />
                  <stop offset="1" stop-color="#FF5A36" />
                </linearGradient>
              </defs>
              <rect width="520" height="290" fill="#201d25" />
              <path d="M70 -20 278 290H126L16 -20Z" fill="url(#stage-light)" opacity=".92" />
              <circle cx="364" cy="88" r="64" fill="#78DCCA" opacity=".9" />
              <path d="M0 242c72-40 119 21 184-17 74-43 119-4 167 8 61 15 105-35 169-9v66H0Z" fill="#09090B" />
              <g fill="#09090B">
                <circle cx="175" cy="189" r="18" /><path d="m155 280 8-70h24l13 70Z" />
                <circle cx="319" cy="201" r="13" /><path d="m302 281 7-61h22l10 61Z" />
              </g>
              <g stroke="#F7F3EC" stroke-width="3" opacity=".7">
                <path d="M382 192h76M397 177v51M443 177v51" />
                <circle cx="419" cy="154" r="20" fill="none" />
              </g>
            </svg>
            <div class="absolute inset-x-0 top-0 flex items-center justify-between p-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">
              <span>Live / 2026</span><span>EB—001</span>
            </div>
            <div class="absolute bottom-4 left-4 right-4">
              <p class="text-xs font-semibold uppercase tracking-[0.15em] text-white/70">One night only</p>
              <p class="mt-1 max-w-sm text-2xl font-extrabold leading-none tracking-[-0.04em] text-white sm:text-4xl">AFTER DARK<br />LIVE SESSIONS</p>
            </div>
          </div>

          <div class="grid grid-cols-[74px_1fr] gap-4 px-1 pb-1 pt-5 sm:grid-cols-[88px_1fr] sm:gap-6">
            <div class="border-r border-midnight-ink/15 pr-4 sm:pr-6">
              <p class="text-[10px] font-bold uppercase tracking-[0.15em] text-midnight-ink/50">Oct</p>
              <p class="text-4xl font-black leading-none tracking-[-0.07em] sm:text-5xl">24</p>
              <p class="mt-1 text-[10px] font-bold uppercase tracking-[0.12em]">8:30 PM</p>
            </div>
            <div class="grid content-center gap-3 sm:grid-cols-2">
              <div><p class="ticket-label">Venue</p><p class="ticket-value">The Grand Hall</p></div>
              <div><p class="ticket-label">Seat</p><p class="ticket-value">BALC · B12</p></div>
            </div>
          </div>
        </div>

        <aside class="ticket-stub relative flex min-h-32 items-center border-t border-dashed border-midnight-ink/25 p-4 md:min-h-0 md:border-l md:border-t-0">
          <span class="stub-notch absolute -left-3 -top-3 h-6 w-6 rounded-full bg-midnight-ink md:top-auto md:-translate-y-[98px]" aria-hidden="true" />
          <span class="stub-notch absolute -left-3 -bottom-3 h-6 w-6 rounded-full bg-midnight-ink md:translate-y-[98px]" aria-hidden="true" />
          <div class="grid w-full grid-cols-[1fr_auto] items-center gap-4 md:block">
            <div class="md:rotate-90 md:whitespace-nowrap">
              <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-midnight-ink/45">Admit one</p>
              <p class="mt-1 text-sm font-extrabold">EVENTBOOKING</p>
            </div>
            <div class="barcode h-14 w-32 md:absolute md:bottom-8 md:left-1/2 md:h-20 md:w-12 md:-translate-x-1/2" aria-label="Decorative ticket barcode" role="img" />
          </div>
        </aside>
      </div>
    </div>

    <div class="float-chip float-chip--seat absolute -left-2 top-[32%] hidden items-center gap-2 rounded-full border border-white/10 bg-midnight-surface px-3 py-2 text-xs font-bold text-midnight-ivory shadow-xl sm:flex">
      <Icon icon="mdi:seat" class="h-4 w-4 text-midnight-mint" aria-hidden="true" />
      Seats available
    </div>
    <div class="float-chip float-chip--secure absolute -bottom-4 right-5 flex items-center gap-2 rounded-full border border-white/10 bg-midnight-surface px-3 py-2 text-xs font-bold text-midnight-ivory shadow-xl sm:right-10">
      <Icon icon="mdi:shield-check-outline" class="h-4 w-4 text-midnight-mint" aria-hidden="true" />
      Secure checkout
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue';
import { ref } from 'vue';

const ticketScene = ref<HTMLElement | null>(null);

function canMove() {
  return window.matchMedia('(min-width: 1024px)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function moveTicket(event: PointerEvent) {
  if (!ticketScene.value || !canMove()) return;
  const bounds = ticketScene.value.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - 0.5;
  const y = (event.clientY - bounds.top) / bounds.height - 0.5;
  ticketScene.value.style.setProperty('--ticket-rotate-y', `${x * 3.5}deg`);
  ticketScene.value.style.setProperty('--ticket-rotate-x', `${y * -3}deg`);
  ticketScene.value.style.setProperty('--ticket-shift-x', `${x * 5}px`);
  ticketScene.value.style.setProperty('--ticket-shift-y', `${y * 5}px`);
}

function resetTicket() {
  ticketScene.value?.style.removeProperty('--ticket-rotate-y');
  ticketScene.value?.style.removeProperty('--ticket-rotate-x');
  ticketScene.value?.style.removeProperty('--ticket-shift-x');
  ticketScene.value?.style.removeProperty('--ticket-shift-y');
}
</script>

<style scoped>
.ticket-scene { perspective: 1200px; --ticket-rotate-x: 0deg; --ticket-rotate-y: 0deg; --ticket-shift-x: 0px; --ticket-shift-y: 0px; }
.hero-ticket { transform: rotateX(var(--ticket-rotate-x)) rotateY(var(--ticket-rotate-y)) translate(var(--ticket-shift-x), var(--ticket-shift-y)) rotate(1.4deg); transition: transform 220ms cubic-bezier(.2,.8,.2,1); transform-style: preserve-3d; }
.ticket-shadow { transform: translate(20px, 24px) rotate(-2deg); }
.ticket-label { font-size: 9px; font-weight: 800; letter-spacing: .15em; text-transform: uppercase; color: rgb(9 9 11 / .45); }
.ticket-value { margin-top: 2px; font-size: 12px; font-weight: 800; }
.barcode { background: repeating-linear-gradient(90deg, #09090b 0 2px, transparent 2px 5px, #09090b 5px 9px, transparent 9px 12px, #09090b 12px 13px, transparent 13px 17px); }
.float-chip { transition: transform 220ms cubic-bezier(.2,.8,.2,1); }
.ticket-scene:hover .float-chip--seat { transform: translate(-3px, -2px); }
.ticket-scene:hover .float-chip--secure { transform: translate(3px, 2px); }
@media (prefers-reduced-motion: reduce) { .hero-ticket, .float-chip { transition: none; } }
</style>
