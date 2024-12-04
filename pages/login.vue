<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUsersStore } from '~/stores/index.js';

const router = useRouter();
const isLogin = ref(true); 
const toggleAuthMode = () => {
  isLogin.value = !isLogin.value;
};
const usersStore = useUsersStore();

const loginData = ref({ email: '', password: '' });
const registerData = ref({ email: '', password: '', confirmPassword: '', role: 'user' });

const emailModel = computed(() => (isLogin.value ? loginData.value.email : registerData.value.email));
const passwordModel = computed(() => (isLogin.value ? loginData.value.password : registerData.value.password));

const BACKEND_URL = "http://localhost:8080/api/";

const submitForm = async () => {
  const url = isLogin.value ? `${BACKEND_URL}login` : `${BACKEND_URL}user`;
  const dataNeedToRegister = {
  email: registerData.value.email,
  password: registerData.value.password,
  role: registerData.value.role,
};
  const data = isLogin.value ? loginData.value : dataNeedToRegister;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const responseData = await response.json(); 
    console.log(responseData)
    if(isLogin.value)
    {
      alert('Вы успешно авторизовались')
        usersStore.auth(responseData.token);
      if (response.ok) {
        router.push('/');
      } else {
        const errorResponse = await response.json();
        alert(errorResponse.message || 'Ошибка при обработке запроса');
      }
    }
    else{
      alert('Вы успешно зарегистрировались')

      isLogin.value = true;

    }
    
  } catch (error) {
    console.error('Ошибка:', error);
  }
};
</script>

<template>
  <div class="flex flex-col items-center bg-gray-900 rounded-2xl w-11/12 md:w-2/5 p-6 m-auto mt-10 shadow-xl">
    <h2 class="text-2xl font-bold text-white mb-5">{{ isLogin ? 'Авторизация' : 'Регистрация' }}</h2>

    <form @submit.prevent="submitForm" class="w-full">
      <div class="mb-5">
        <label class="text-gray-300">Электронная почта</label>
        <input 
          v-if="isLogin" 
          type="email" 
          v-model="loginData.email" 
          class="w-full h-12 bg-slate-800 text-white rounded-xl p-3 mt-2" 
          placeholder="Введите email" 
        />
        
        <input 
          v-else 
          type="email" 
          v-model="registerData.email" 
          class="w-full h-12 bg-slate-800 text-white rounded-xl p-3 mt-2" 
          placeholder="Введите email" 
        />
      </div>

      <div class="mb-5">
        <label class="text-gray-300">Пароль</label>
        <input 
          v-if="isLogin" 
          type="password" 
          v-model="loginData.password" 
          class="w-full h-12 bg-slate-800 text-white rounded-xl p-3 mt-2" 
          placeholder="Введите пароль" 
        />
        <input 
          v-else 
          type="password" 
          v-model="registerData.password" 
          class="w-full h-12 bg-slate-800 text-white rounded-xl p-3 mt-2" 
          placeholder="Введите пароль" 
        />
      </div>

      <div v-if="!isLogin" class="mb-5">
        <label class="text-gray-300">Подтвердите пароль</label>
        <input 
          type="password" 
          v-model="registerData.confirmPassword" 
          class="w-full h-12 bg-slate-800 text-white rounded-xl p-3 mt-2" 
          placeholder="Подтвердите пароль" 
        />
      </div>

      <button 
        type="submit" 
        class="w-full h-12 bg-blue-600 text-white rounded-xl mt-5 hover:bg-blue-500 transition duration-200 ease-in-out">
        {{ isLogin ? 'Войти' : 'Зарегистрироваться' }}
      </button>
    </form>

    <p class="text-gray-300 mt-5">
      {{ isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?' }}
      <span @click="toggleAuthMode" class="text-blue-500 cursor-pointer hover:underline">
        {{ isLogin ? 'Регистрация' : 'Авторизация' }}
      </span>
    </p>
  </div>
</template>
