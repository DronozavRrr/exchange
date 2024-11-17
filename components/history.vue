<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
const usersStore = useUsersStore();
const history = ref([])
const pair = ref({})
const BACKEND_URL = "http://localhost:8080/api/";
async function getHistory() {
    const response = await fetch(`${BACKEND_URL}exchanges`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${usersStore.token}`,
        },
    });

    if (!response.ok) {
        console.error("Failed to fetch exchanges:", response.status);
        return;
    }

    const data = await response.json();
    console.log("Data from API:", data);

    if (!Array.isArray(data) || data.length === 0) {
        console.warn("Data is not a valid array or is empty.");
        return;
    }

    for (let i = 0; i < data.length; i++) {
        const exchange = data[i];
        if (exchange.pair_id) {
            try {
                const pairData = await getCurrentPair(exchange.pair_id);
                exchange.first_crypto = pairData.first_crypto;
                exchange.second_crypto = pairData.second_crypto;
                exchange.course = parseFloat(pairData.course);
            } catch (error) {
                console.error(`Ошибка при загрузке данных пары для pair_id: ${exchange.pair_id}`, error);
                exchange.first_crypto = null;
                exchange.second_crypto = null;
                exchange.course = null;
            }
        } else {
            console.warn(`pair_id отсутствует для exchange: ${exchange._id}`);
        }
    }

    history.value = [...data].slice(0,4);
    console.log("Updated history:", history.value);
}


async function getCurrentPair(pairId) {
    const response = await fetch(`${BACKEND_URL}pair/id/${pairId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${usersStore.token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch pair data for id ${pairId}`);
    }
    return response.json();
}

 
onMounted(()=>
{
  getHistory();
})
</script>



<template>
  <div>
    <h2 class="mt-5 text-white text-center text-3xl font-bold mb-6">Последние обмены</h2>

    <div class="sm:flex block w-10/12 h-auto bg-slate-800 m-auto mt-5 p-6 rounded-2xl shadow-lg justify-between">
  
      <div v-for="exchange in history" :key="exchange._id" class="block w-3/5 sm:w-1/5 h-auto bg-gray-900 text-white p-4 rounded-2xl shadow-md transform transition duration-300 hover:scale-105 hover:shadow-xl m-auto">
  <div class="flex justify-between mb-3">
      <img src="/public/ready_swap.png" alt="transaction" class="w-1/6 h-1/6 filter-white" />
      <span class="text-sm text-gray-400">{{ new Date(exchange.createdAt).toLocaleTimeString() }}</span>
  </div>
  <p>Обмен</p>
  <h4  class="text-lg font-bold">
      {{ exchange.amount }} {{ exchange.first_crypto }}
  </h4>
  <p  class="text-gray-400">на</p>
  <h4  class="text-lg font-bold">
      {{ exchange.amount * exchange.course }} {{ exchange.second_crypto }}
  </h4>
</div>
  </div>
  </div>
</template>

<style>
.filter-white {
  filter: brightness(0) invert(1);
}
</style>