<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
const usersStore = useUsersStore();
const history = ref([])
const pair = ref({})
async function getHistory() 
{
  const BACKEND_URL = "http://localhost:8080/api/";
  const response = await fetch(BACKEND_URL+"exchanges",
    {
      method: 'GET',
      headers: 
      {
        Authorization: `Bearer ${usersStore.token}`,
      }
    }
  )
  history.value = await response.json();
  history.value.slice(0,4)
  console.log("обмены - ")
  console.log(history.value)
}
async function getCurrentPair(id) 
{
  let response_pairs = await fetch(BACKEND_URL+"pair/id/"+id,
    {
      method: 'GET',
      headers: 
      {
        Authorization: `Bearer ${usersStore.token}`,
      }
    }
  )
  return response_pairs.json()
}


  // const BACKEND_URL = "http://localhost:8080/api/";
  // let response_users = await fetch(BACKEND_URL+"user/"+elem.user_id,
  //   {
  //     method: 'GET',
  //     headers: 
  //     {
  //       Authorization: `Bearer ${usersStore.token}`,
  //     }
  //   }
  // )
 



onMounted(()=>
{
  getHistory();
})
</script>



<template>
    <div>
      <h2 class="mt-5 text-white text-center text-3xl font-bold mb-6">Последние обмены</h2>

      <div class="sm:flex block w-10/12 h-auto bg-slate-800 m-auto mt-5 p-6 rounded-2xl shadow-lg justify-between">
    
        <div v-for="exchange in history.value" :key="exchange.id" class="w-3/5 sm:w-1/5 h-auto bg-gray-900 text-white p-4 rounded-2xl shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl m-auto">
          <div class="flex justify-between mb-3">
            <img src="/ready_swap.png" alt="transaction" class="w-1/6 h-1/6 filter-white" />
            <span class="text-sm text-gray-400">08:42</span>
          </div>
          <p>Обмен</p>
          <h4 class="text-lg font-bold">{{exchange.amount}} {{getCurrentPair(exchange.pair_id.first_crypto)}}</h4>
          <p class="text-gray-400">на</p>
          <h4 class="text-lg font-bold">{{exchange.amount * getCurrentPair(exchange.pair_id.course)}} {{getCurrentPair(exchange.pair_id.second_crypto)}}</h4>
        </div>
    </div>
    </div>
</template>

<style>
.filter-white {
  filter: brightness(0) invert(1);
}
</style>