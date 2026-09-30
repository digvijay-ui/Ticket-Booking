import { createRouter, createWebHistory } from 'vue-router';

import { useAuthStore } from '@/modules/auth/auth.store';

const AdminLayout = () => import('@/components/layout/AdminLayout.vue');
const UserLayout = () => import('@/components/layout/UserLayout.vue');
const AdminBookingView = () => import('@/modules/admin/bookings/AdminBookingView.vue');
const AdminAnalyticsView = () => import('@/modules/admin/analytics/AdminAnalyticsView.vue');
const AdminCreateUserView = () => import('@/modules/admin/create-user/AdminCreateUserView.vue');
const AdminDashboardView = () => import('@/modules/admin/dashboard/AdminDashboardView.vue');
const AdminEventFormView = () => import('@/modules/admin/event-form/AdminEventFormView.vue');
const AdminEventListView = () => import('@/modules/admin/events/AdminEventListView.vue');
const AdminLoginView = () => import('@/modules/admin/login/AdminLoginView.vue');
const AdminSeatOverviewView = () => import('@/modules/admin/seats/AdminSeatOverviewView.vue');
const AdminTransactionView = () => import('@/modules/admin/transactions/AdminTransactionView.vue');
const LoginView = () => import('@/modules/auth/pages/LoginView.vue');
const SignupView = () => import('@/modules/auth/pages/SignupView.vue');
const BookingCheckoutView = () => import('@/modules/booking/pages/BookingCheckoutView.vue');
const BookingHistoryView = () => import('@/modules/booking/pages/BookingHistoryView.vue');
const BookingSuccessView = () => import('@/modules/booking/pages/BookingSuccessView.vue');
const SeatSelectionView = () => import('@/modules/booking/pages/SeatSelectionView.vue');
const EventDetailView = () => import('@/modules/events/details/EventDetailView.vue');
const EventListView = () => import('@/modules/events/pages/EventListView.vue');
const HomeView = () => import('@/modules/events/pages/HomeView.vue');
const WalletView = () => import('@/modules/wallet/pages/WalletView.vue');

const DEFAULT_DESCRIPTION = 'Discover live events, choose your seats, and book securely with EventBooking.';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  linkActiveClass: 'bg-paperCream/10 text-[#14b8a6]',
  linkExactActiveClass: 'bg-paperCream text-stubCharcoal',
  routes: [
    {
      path: '/',
      component: UserLayout,
      children: [
        { path: '', name: 'home', component: HomeView, meta: { title: 'EventBooking | Find your next live event', description: DEFAULT_DESCRIPTION } },
        { path: 'login', name: 'login', component: LoginView, meta: { title: 'Log in | EventBooking', description: 'Log in to manage your EventBooking tickets and wallet.', noIndex: true } },
        { path: 'signup', name: 'signup', component: SignupView, meta: { title: 'Create an account | EventBooking', description: 'Create your EventBooking account and start booking live experiences.', noIndex: true } },
        { path: 'events', name: 'events', component: EventListView, meta: { title: 'Explore events | EventBooking', description: 'Browse upcoming live events by date, location, price, and availability.' } },
        { path: 'events/:eventId', name: 'event-detail', component: EventDetailView, meta: { title: 'Event details | EventBooking', description: 'View event details, availability, venue information, and ticket pricing.' } },
        { path: 'events/:eventId/seats', name: 'seat-selection', component: SeatSelectionView, meta: { requiresAuth: true, title: 'Choose seats | EventBooking', noIndex: true } },
        { path: 'wallet', name: 'wallet', component: WalletView, meta: { requiresAuth: true, title: 'Wallet | EventBooking', noIndex: true } },
        {
          path: 'booking/checkout/:reservationId',
          name: 'booking-checkout',
          component: BookingCheckoutView,
          meta: { requiresAuth: true, title: 'Confirm booking | EventBooking', noIndex: true },
        },
        {
          path: 'booking/success/:bookingId',
          name: 'booking-success',
          component: BookingSuccessView,
          meta: { requiresAuth: true, title: 'Booking confirmed | EventBooking', noIndex: true },
        },
        { path: 'bookings', name: 'booking-history', component: BookingHistoryView, meta: { requiresAuth: true, title: 'My bookings | EventBooking', noIndex: true } },
      ],
    },
    { path: '/admin/login', name: 'admin-login', component: AdminLoginView, meta: { title: 'Admin login | EventBooking', noIndex: true } },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAdmin: true, noIndex: true },
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

function setMetaTag(name: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.append(element);
  }
  element.content = content;
}

function setPropertyMetaTag(property: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[property="${property}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('property', property);
    document.head.append(element);
  }
  element.content = content;
}

router.afterEach((to) => {
  const title = String(to.meta.title || 'EventBooking');
  const description = String(to.meta.description || DEFAULT_DESCRIPTION);
  document.title = title;
  setMetaTag('description', description);
  setMetaTag('robots', to.meta.noIndex || to.meta.requiresAdmin ? 'noindex, nofollow' : 'index, follow');
  setPropertyMetaTag('og:title', title);
  setPropertyMetaTag('og:description', description);
  setPropertyMetaTag('og:url', window.location.href);
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
