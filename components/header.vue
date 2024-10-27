<script setup>
import { useUsersStore } from '~/stores';
import { useRouter } from 'vue-router';

const usersStore = useUsersStore();
const router = useRouter();

const logout_click = async () => {
  usersStore.logout(); 
  await router.push('/login');
};
</script>

<template>
    <header class="sm:flex block justify-between border-b border-gray-700 px-8 py-6">
        <div class="sm:flex block items-center gap-4">
          <img src="/logo.png" alt="Logo" >
          <div>
            <h2 class="text-xl font-bold uppercase text-white hover:text-gray-400">GavrilovExChange</h2>
            <p class="text-gray-300">Ваш лучший обменник</p>
          </div>
        </div>
        <ul class="sm:flex block items-center sm:gap-10">
          <li class="flex items-center gap-3 cursor-pointer ">
            <img src="/rules.png" alt="">
            <b class="text-gray-300 hover:text-gray-400">Правила обмена</b>
          </li>
          <li class="flex items-center gap-3 cursor-pointer ">
            <img src="/contact.png" alt="">
            <b class="text-gray-300 hover:text-gray-400">Контакты</b>
          </li>
          <li v-if="usersStore.isLogin" class="flex items-center gap-3 cursor-pointer ">
            <img src="/profile.png" alt="">
            <b class="text-gray-300 hover:text-gray-400">Профиль</b>
          </li>
          <li v-if="!usersStore.isLogin" class="flex items-center gap-3 cursor-pointer hover:text-gray-400">
            <img src="/login.png" alt="login">
            <b class="text-gray-300"> <a href="/login">Логин</a></b>
          </li>
          <li v-if="usersStore.isLogin" @click="logout_click" class="flex items-center gap-3 cursor-pointer hover:text-gray-400">
            <img src="/logout.png" alt="">
            <b class="text-gray-300">Выйти</b>
          </li>
        </ul>
    </header>
</template>
