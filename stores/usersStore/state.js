export default function () 
{
    const runtimeConfig = useRuntimeConfig();
    // console.log(useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME, null))
    return {
      user: {role:"ff"},
      isLogin: false,
      isAdmin:false,
      token: useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME, null),
    refreshToken: useCookie(runtimeConfig.public.JWT_REFRESH_TOKEN_NAME, null),
    };
  }