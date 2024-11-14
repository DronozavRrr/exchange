<template>
    <div class="bg-slate-800 w-full md:w-4/5 m-auto min-h-full rounded-xl shadow-xl mt-14">
      <Header />
      <Banners />
      <Exchange />
      <Clientinfo />
      <History />
      <Footer />
    </div>
  </template>
  
  
  <script setup>
  const usersStore = useUsersStore();
  import { onMounted } from 'vue';
  onMounted(()=>
{
  usersStore.fetchCurrentUser();

})

</script>
