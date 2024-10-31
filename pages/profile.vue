<script setup>
import { useRouter } from 'vue-router';
import { useUsersStore } from '~/stores';

const usersStore = useUsersStore();
const router = useRouter();

const logout_click = () => {
  router.push('/');
};


if (!usersStore.user) {
  usersStore.fetchCurrentUser();
}
</script>

<template>
  <div class="flex flex-col items-center bg-gray-900 rounded-2xl w-11/12 md:w-2/5 p-6 m-auto mt-10 shadow-xl">
    <h2 class="text-2xl font-bold text-white mb-5">Профиль</h2>
    <p class="text-gray-300 mb-2"><strong>Электронная почта:</strong> {{ usersStore.user?.email }}</p>
    <p class="text-gray-300 mb-4"><strong>Роль:</strong> {{ usersStore.user?.role }}</p>
    <button
      @click="logout_click"
      class="w-full h-12 bg-red-600 text-white rounded-xl mt-5 hover:bg-red-500 transition duration-200 ease-in-out"
    >
      Выйти
    </button>
  </div>
</template>
