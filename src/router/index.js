/**
 * router/index.ts
 *
 * Automatic routes for `./src/pages/*.vue`
 */

// Composables
import { createRouter, createWebHistory } from 'vue-router/auto'
import { setupLayouts } from 'virtual:generated-layouts'
// import { userStore } from '@/stores/userStore';
// const user = userStore()

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  extendRoutes: setupLayouts,
})

// router.beforeEach((to, from, next) => {
//   const publicPages = ["/auth"];
//   const authRequired = !publicPages.includes(to.path);
//   const loggedIn = user.getAuth;
//   const isAdmin = user.getIsAdmin;
//   // trying to access a restricted page + not logged in
//   // redirect to login page
//   if (authRequired && !loggedIn && !isAdmin) {
//     next("/auth");
//   } else {
//     next();
//   }
// });

export default router
