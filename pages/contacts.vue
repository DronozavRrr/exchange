<template>
    <div class="flex flex-col items-center bg-gray-900 rounded-2xl w-11/12 md:w-2/5 p-6 m-auto mt-10 shadow-xl">
      <h2 class="text-2xl font-bold text-white mb-5">Контакты</h2>
      <p class="text-gray-300 mb-2"><strong>Телефон:</strong> +7 (123) 456-7890</p>
      <p class="text-gray-300 mb-2"><strong>Email:</strong> support@gavrilovexchange.com</p>
      <p class="text-gray-300"><strong>Адрес:</strong> Москва, ул. Примерная, 10</p>
      <button
      @click="logout_click"
      class="w-full h-12 bg-red-600 text-white rounded-xl mt-5 hover:bg-red-500 transition duration-200 ease-in-out"
    >
    Назад
    </button>
    </div>
    
  </template>
  
  <script setup>
import { useRouter } from 'vue-router';
const router = useRouter();
const logout_click = () => {
  router.push('/');
};

  </script>
  