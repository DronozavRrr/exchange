<template>
    <div class="flex flex-col bg-gray-900 rounded-2xl w-11/12 md:w-3/5 p-6 m-auto mt-10 shadow-xl">
      <h2 class="text-2xl font-bold text-white mb-5">Правила обмена</h2>
      <ol class="list-decimal text-gray-300 ml-5">
        <li class="mb-3">Убедитесь, что вводите корректные данные перед началом обмена.</li>
        <li class="mb-3">Все транзакции необратимы. Проверяйте адреса криптовалютных кошельков.</li>
        <li class="mb-3">Вы несете ответственность за правильность предоставленных данных.</li>
        <li class="mb-3">В случае ошибки обратитесь в службу поддержки.</li>
        <li class="mb-3">Платформа оставляет за собой право изменить правила обмена.</li>
      </ol>
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
  