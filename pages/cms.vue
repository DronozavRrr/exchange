<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
const router = useRouter();
const all_users = ref([])
const all_pairs = ref([]);
const all_bids = ref([])
const all_exchange = ref([])
const usersState = useUsersStore(); 
const pairsState = usePairsStore();
const BACKEND_URL = "http://localhost:8080/api/";
const logout_click = () => {
  router.push('/');
};

const fetchUsers = async () => {
  try {
    let response = await fetch(`${BACKEND_URL}users`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });

    if (response.ok) {
      const users = await response.json();


      all_users.value = users;
    } else {
      console.error("Ошибка при получении данных юзеров");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};
const fetchPairs = async () => {
  try {
    let response = await fetch(`${BACKEND_URL}pairs`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });

    if (response.ok) {
      const pairs = await response.json();
      all_pairs.value = pairs;
    } else {
      console.error("Ошибка при получении данных пар");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};

const fetchBids = async () => {
  try {
    let response = await fetch(`${BACKEND_URL}bids`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });

    if (response.ok) {
      const bids = await response.json();
      all_bids.value = bids;
    } else {
      console.error("Ошибка при получении данных заявок");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};

const fetchExchange = async () => {
  try {
    let response = await fetch(`${BACKEND_URL}exchanges`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });

    if (response.ok) {
      const exchanges = await response.json();
      all_exchanges.value = exchanges;
    } else {
      console.error("Ошибка при получении данных обменов");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};



onMounted(()=>
{
  usersState.fetchCurrentUser();
  fetchUsers()
  fetchPairs()
  fetchBids()
  fetchExchange()
})
  </script>
  


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


