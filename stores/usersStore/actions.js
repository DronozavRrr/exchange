export default
{
    auth(user_token)
    {
        this.token =user_token;
        this.isLogin = true;
    },
    logout()
    {
        this.token ="";
        this.isLogin = false;
    }
}