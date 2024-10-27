
export default defineNuxtRouteMiddleware((to, from) => {
    const usersStore = useUsersStore();
    const runtimeConfig = useRuntimeConfig();
    const token = useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME); 
    
    if(token.value) 
      {
        usersStore.isLogin = true;
      }

    if (!usersStore.isLogin && !usersStore.token && to.path !== '/login') {
      return navigateTo('/login'); 
    }
  
    if (usersStore.isLogin && to.path === '/login') {
      return navigateTo('/');
    }
  });
  