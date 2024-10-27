export default
{
    auth(user_token)
    {
        console.log()
        this.token =user_token;
        this.isLogin = true;
        const runtimeConfig = useRuntimeConfig();
        const token = useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME);
        token.value = user_token;
    },
    logout()
    {
        this.token ="";
        this.isLogin = false;
        const runtimeConfig = useRuntimeConfig();
        const token = useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME);
        token.value = "";
    }
}