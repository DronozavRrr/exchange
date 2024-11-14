<template>
    <div class="bg-slate-800 w-full md:w-4/5 m-auto min-h-full rounded-xl ">

        
        
        
        
        
        
        
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
import { onMounted } from 'vue';
const router = useRouter();
const usersStore = useUsersStore();
onMounted(()=>
{
  usersStore.fetchCurrentUser();

})
const logout_click = () => {
  router.push('/');
};

  </script>
  