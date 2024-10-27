
export default defineNuxtRouteMiddleware((to, from) => {
    const usersStore = useUsersStore();
  

    if (!usersStore.isLogin && !usersStore.token && to.path !== '/login') {
      return navigateTo('/login'); 
    }
  
    if (usersStore.isLogin && to.path === '/login') {
      return navigateTo('/');
    }
  });
  