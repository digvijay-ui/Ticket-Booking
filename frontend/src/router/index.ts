import { createRouter, createWebHistory } from 'vue-router';

import AdminLayout from '@/components/layout/AdminLayout.vue';
import UserLayout from '@/components/layout/UserLayout.vue';
import AdminBookingView from '@/modules/admin/bookings/AdminBookingView.vue';
import AdminAnalyticsView from '@/modules/admin/analytics/AdminAnalyticsView.vue';
import AdminCreateUserView from '@/modules/admin/create-user/AdminCreateUserView.vue';
import AdminDashboardView from '@/modules/admin/dashboard/AdminDashboardView.vue';
import AdminEventFormView from '@/modules/admin/event-form/AdminEventFormView.vue';
import AdminEventListView from '@/modules/admin/events/AdminEventListView.vue';
import AdminLoginView from '@/modules/admin/login/AdminLoginView.vue';
import AdminSeatOverviewView from '@/modules/admin/seats/AdminSeatOverviewView.vue';
import AdminTransactionView from '@/modules/admin/transactions/AdminTransactionView.vue';
import LoginView from '@/modules/auth/pages/LoginView.vue';
import SignupView from '@/modules/auth/pages/SignupView.vue';
import BookingCheckoutView from '@/modules/booking/pages/BookingCheckoutView.vue';
import BookingHistoryView from '@/modules/booking/pages/BookingHistoryView.vue';
import BookingSuccessView from '@/modules/booking/pages/BookingSuccessView.vue';
import SeatSelectionView from '@/modules/booking/pages/SeatSelectionView.vue';
import EventDetailView from '@/modules/events/details/EventDetailView.vue';
import EventListView from '@/modules/events/pages/EventListView.vue';
import HomeView from '@/modules/events/pages/HomeView.vue';
import WalletView from '@/modules/wallet/pages/WalletView.vue';
import { useAuthStore } from '@/modules/auth/auth.store';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'bg-paperCream/10 text-[#14b8a6]',
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
        { path: 'dashboard', name: 'admin-dashboard', component: AdminDashboardView, meta: { title: 'Dashboard' } },
        { path: 'events', name: 'admin-events', component: AdminEventListView, meta: { title: 'Events' } },
        { path: 'events/create', name: 'admin-event-create', component: AdminEventFormView, meta: { title: 'Create event', breadcrumb: 'Events / Create' } },
        { path: 'events/:eventId/edit', name: 'admin-event-edit', component: AdminEventFormView, meta: { title: 'Edit event', breadcrumb: 'Events / Edit' } },
        { path: 'events/:eventId/seats', name: 'admin-event-seats', component: AdminSeatOverviewView, meta: { title: 'Seat management', breadcrumb: 'Events / Seats' } },
        { path: 'admins/create', name: 'admin-create-user', component: AdminCreateUserView, meta: { title: 'Create administrator' } },
        { path: 'bookings', name: 'admin-bookings', component: AdminBookingView, meta: { title: 'Bookings' } },
        { path: 'transactions', name: 'admin-transactions', component: AdminTransactionView, meta: { title: 'Transactions' } },
        { path: 'analytics', name: 'admin-analytics', component: AdminAnalyticsView, meta: { title: 'Analytics' } },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const auth = useAuthStore();
  auth.loadFromStorage();

  if ((to.name === 'login' || to.name === 'signup') && auth.isAuthenticated) {
    const redirect = typeof to.query.redirect === 'string' && to.query.redirect.startsWith('/')
      ? to.query.redirect
      : '/events';
    return redirect;
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
