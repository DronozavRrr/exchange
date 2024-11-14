export default {
  async auth(user_token) {
    this.token = user_token;
    this.isLogin = true;
  
    const runtimeConfig = useRuntimeConfig();
    const token = useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME);
    token.value = user_token;
  
    await this.fetchCurrentUser(); // Дождитесь загрузки данных пользователя
  },
    logout() {
      this.token = "";
      this.isLogin = false;
      this.user = null; 
  
      const runtimeConfig = useRuntimeConfig();
      const token = useCookie(runtimeConfig.public.JWT_TOKEN_COOKIE_NAME);
      token.value = "";
    },
    async fetchCurrentUser() {
      try {
        const response = await fetch('http://localhost:8080/api/user/profile', {

          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        });
        console.log(response)
        if (response.ok) {
          const userData = await response.json();
          this.user = userData;
          console.log(this.user.role)
        } else {
          console.error('Не удалось загрузить данные пользователя');
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных пользователя:', error);
      }
    },
  };
  