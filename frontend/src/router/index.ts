import { createRouter, createWebHistory } from 'vue-router';

import AdminLayout from '@/components/layout/AdminLayout.vue';
import UserLayout from '@/components/layout/UserLayout.vue';
import AdminBookingView from '@/modules/admin/AdminBookingView.vue';
import AdminCreateUserView from '@/modules/admin/AdminCreateUserView.vue';
import AdminDashboardView from '@/modules/admin/AdminDashboardView.vue';
import AdminEventFormView from '@/modules/admin/AdminEventFormView.vue';
import AdminEventListView from '@/modules/admin/AdminEventListView.vue';
import AdminLoginView from '@/modules/admin/AdminLoginView.vue';
import AdminSeatOverviewView from '@/modules/admin/AdminSeatOverviewView.vue';
import AdminTransactionView from '@/modules/admin/AdminTransactionView.vue';
import LoginView from '@/modules/auth/LoginView.vue';
import SignupView from '@/modules/auth/SignupView.vue';
import BookingCheckoutView from '@/modules/booking/BookingCheckoutView.vue';
import BookingHistoryView from '@/modules/booking/BookingHistoryView.vue';
import BookingSuccessView from '@/modules/booking/BookingSuccessView.vue';
import SeatSelectionView from '@/modules/booking/SeatSelectionView.vue';
import EventDetailView from '@/modules/events/EventDetailView.vue';
import EventListView from '@/modules/events/EventListView.vue';
import HomeView from '@/modules/events/HomeView.vue';
import WalletView from '@/modules/wallet/WalletView.vue';
import { useAuthStore } from '@/modules/auth/auth.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'bg-paperCream/10 text-ticketGold',
  linkExactActiveClass: 'bg-paperCream text-stubCharcoal',
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', name: 'home', component: HomeView },
        { path: 'login', name: 'login', component: LoginView },
        { path: 'signup', name: 'signup', component: SignupView },
        { path: 'events', name: 'events', component: EventListView },
        { path: 'events/:eventId', name: 'event-detail', component: EventDetailView },
        { path: 'events/:eventId/seats', name: 'seat-selection', component: SeatSelectionView, meta: { requiresAuth: true } },
        { path: 'wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true } },
        {
          path: 'booking/checkout/:reservationId',
          name: 'booking-checkout',
          component: BookingCheckoutView,
          meta: { requiresAuth: true },
        },
        {
          path: 'booking/success/:bookingId',
          name: 'booking-success',
          component: BookingSuccessView,
          meta: { requiresAuth: true },
        },
        { path: 'bookings', name: 'booking-history', component: BookingHistoryView, meta: { requiresAuth: true } },
      ],
    },
    { path: '/admin/login', name: 'admin-login', component: AdminLoginView },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true },
      children: [
        { path: '', redirect: '/admin/dashboard' },
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView },
        { path: 'events', name: 'admin-events', component: AdminEventListView },
        { path: 'events/create', name: 'admin-event-create', component: AdminEventFormView },
        { path: 'events/:eventId/edit', name: 'admin-event-edit', component: AdminEventFormView },
        { path: 'events/:eventId/seats', name: 'admin-event-seats', component: AdminSeatOverviewView },
        { path: 'admins/create', name: 'admin-create-user', component: AdminCreateUserView },
        { path: 'bookings', name: 'admin-bookings', component: AdminBookingView },
        { path: 'transactions', name: 'admin-transactions', component: AdminTransactionView },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  auth.loadFromStorage();

  if ((to.name === 'login' || to.name === 'signup') && auth.isAuthenticated) {
    return '/events';
  }

  if (to.name === 'admin-login' && auth.isAdminAuthenticated) {
    return '/admin/dashboard';
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return {
      path: '/login',
      query: { redirect: to.fullPath },
    };
  }

  if (to.meta.requiresAdmin && !auth.isAdminAuthenticated) {
    return {
      path: '/admin/login',
      query: { redirect: to.fullPath },
    };
  }

  return true;
});

export default router;
