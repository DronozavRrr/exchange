<script setup>
import { ref, onMounted } from 'vue';
import { useUsersStore } from '~/stores';

const BACKEND_URL = "http://localhost:8080/api/";
const all_pairs = ref([]);
const trade_tokens = ref([]);
const selectedPairId = ref(null);
const selectedSecondCrypto = ref(null); 

const usersState = useUsersStore(); 
const pairsState = usePairsStore();
const amountToSend = ref(0); 
const convertedAmount = ref(0); 


const fetchPairs = async () => {
  try {
    let response = await fetch(`${BACKEND_URL}pairs`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });

    if (response.ok) {
      const pairs = await response.json();

      const uniquePairs = [];
      const seenFirstCrypto = new Set();

      pairs.forEach(pair => {
        if (!seenFirstCrypto.has(pair.first_crypto)) {
          uniquePairs.push(pair);
          seenFirstCrypto.add(pair.first_crypto);
        }
      });

      all_pairs.value = uniquePairs;
    } else {
      console.error("Ошибка при получении данных пар");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};

const getTradeTokens = async (first_crypto) => {
  try {
    const response = await fetch(`${BACKEND_URL}pair/name/${first_crypto}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });
    if (response.ok) {
      trade_tokens.value = await response.json();

      if (trade_tokens.value.length > 0) {
        pairsState.second_crypto = trade_tokens.value[0].second_crypto;
        selectedSecondCrypto.value = trade_tokens.value[0].second_crypto;
        pairsState.course = trade_tokens.value[0].course; // Установка course
        console.log(`Initial course: ${pairsState.course}`);
      } else {
        pairsState.second_crypto = null;
        selectedSecondCrypto.value = null;
        pairsState.course = null;
      }
      
    } else {
      console.error("Ошибка при получении данных токенов");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};


const handleFirstCryptoChange = (event) => {
  
  const selectedId = event.target.value;
  selectedPairId.value = selectedId; 
  

  pairsState.first_crypto = selectedId;
  getTradeTokens(selectedId);
};
const handleSecondCryptoChange = (event) => {
  pairsState.second_crypto = selectedSecondCrypto.value;
  console.log(`Selected second crypto: ${pairsState.second_crypto}`);


  const selectedToken = trade_tokens.value.find(token => token.second_crypto === selectedSecondCrypto.value);
  console.log("tutau - ")
  console.log(selectedToken.course)
  if (selectedToken) {
    pairsState.course = selectedToken.course;
    pairsState.type_second_crypto= selectedToken.type_second_crypto;
    console.log(`Selected course: ${pairsState.course}`);
  }
};
watch(amountToSend, (newAmount) => 
{
  
  pairsState.amount_first_crypto = amountToSend;
  console.log(`курс - ${pairsState.amount_first_crypto}`)
  if (trade_tokens.value.length > 0) 
  {
    const exchangeRate = trade_tokens.value[0].course; 
    convertedAmount.value = newAmount * exchangeRate; 

  } else {
    convertedAmount.value = 0; 
  }
});

onMounted(async () => {
  await fetchPairs();

  if (all_pairs.value.length > 0) {
    const defaultFirstCrypto = all_pairs.value[0].first_crypto;
    selectedPairId.value = defaultFirstCrypto;
    pairsState.first_crypto = defaultFirstCrypto;
    
    await getTradeTokens(defaultFirstCrypto);
  }
});
</script>

<template>
  <div class="flex flex-col md:flex-row items-center h-auto bg-gray-900 mt-10 rounded-2xl m-auto w-full md:w-11/12 p-6">
    <div class="h-1/5 w-full md:w-2/5 rounded-xl mt-10 m-auto">
      <b class="text-white">Отдаете</b>
      <select 
        class="bg-slate-800 text-white w-full h-12 rounded-xl p-2"
        @change="handleFirstCryptoChange" 
      >
        <option v-for="pair in all_pairs" :key="pair.id" :value="pair.first_crypto">{{ pair.first_crypto }}</option>
      </select>
      <input 
        type="number" 
        placeholder="Введите сумму" 
        class="mt-5 bg-slate-800 text-white w-full h-12 rounded-xl p-2 mb-10"
        v-model="amountToSend" 
      />
    </div>
    
    <img src="/swap.png" alt="Обмен" class="mt-5 size-10 h-auto rounded-full ">

    <div class="bg-gray-900 h-1/5 w-full md:w-2/5 rounded-xl mt-10 m-auto">
      <b class="text-white">Получаете</b>
      <select 
  class="bg-slate-800 text-white w-full h-12 rounded-xl p-2" 
  v-model="selectedSecondCrypto" 
  @change="handleSecondCryptoChange"
>
  <option v-for="token in trade_tokens" :key="token.id" :value="token.second_crypto">
    {{ token.second_crypto }}
  </option>
</select>
      <input 
        type="number" 
        placeholder="Сумма для получения" 
        class="mt-5 bg-slate-800 text-white w-full h-12 rounded-xl p-2 mb-10"
        readonly
        :value="convertedAmount" 
      />
    </div>
  </div>
</template>

