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
        pairsState.pair_id = trade_tokens.value[0]._id;
        pairsState.amount_first_crypto = amountToSend.value
        pairsState.type_first_crypto = trade_tokens.value[0].type_first_crypto
        pairsState.type_second_crypto = trade_tokens.value[0].type_second_crypto
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

const handleFirstCryptoChange = async (event) => {
  const selectedFirstCrypto = event.target.value;
  pairsState.first_crypto = selectedFirstCrypto; // Устанавливаем первую криптовалюту

  // Получаем возможные пары для выбранной первой криптовалюты
  await getTradeTokens(selectedFirstCrypto);

  if (trade_tokens.value.length > 0) {
    // Устанавливаем вторую криптовалюту и pair_id по умолчанию
    const defaultPair = trade_tokens.value[0];
    pairsState.second_crypto = defaultPair.second_crypto;
    pairsState.pair_id = defaultPair._id;
    pairsState.type_first_crypto = defaultPair.type_first_crypto;
    pairsState.course = defaultPair.course;

    pairsState.type_second_crypto = defaultPair.type_second_crypto;
    selectedSecondCrypto.value = defaultPair.second_crypto;

    console.log(`Selected pair ID: ${pairsState.pair_id}`);
  } else {
    // Если для первой криптовалюты нет пар
    pairsState.second_crypto = null;
    pairsState.pair_id = null;
    pairsState.course = null;
    selectedSecondCrypto.value = null;
  }
};

const handleSecondCryptoChange = (event) => {
  const selectedSecondCryptoValue = event.target.value;
  pairsState.second_crypto = selectedSecondCryptoValue;

  // Найти выбранную пару по second_crypto
  const selectedPair = trade_tokens.value.find(
    (token) => token.second_crypto === selectedSecondCryptoValue
  );

  if (selectedPair) {
    pairsState.pair_id = selectedPair._id;
    pairsState.course = selectedPair.course;
    pairsState.type_second_crypto = selectedPair.type_second_crypto;

    console.log(`Updated pair ID: ${pairsState.pair_id}`);
  } else {
    // Если выбранная пара не найдена
    pairsState.pair_id = null;
    pairsState.course = null;
  }
};

onMounted(async () => {
  // Загружаем пары при инициализации
  await fetchPairs();

  if (all_pairs.value.length > 0) {
    const defaultFirstCrypto = all_pairs.value[0].first_crypto;
    pairsState.first_crypto = defaultFirstCrypto;
    selectedPairId.value = defaultFirstCrypto;

    // Устанавливаем данные для первой пары
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


