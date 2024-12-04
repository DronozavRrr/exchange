<script setup>
import { ref, onMounted } from 'vue';
import { useUsersStore } from '~/stores';
import { usePairsStore } from '~/stores';
const usersState = useUsersStore();
const pairsState = usePairsStore();

const BACKEND_URL = "http://localhost:8080/api/";

const toNeed = ref('')
const responseData = ref(null); // Состояние для хранения данных из респонса

const createdBid = ref(null); // Для хранения информации о созданной заявке
const email = ref('')

const submitForm = async () => {
  const dataNeedToRegister = {
    amount: pairsState.amount_first_crypto * 1,
    type: pairsState.type_second_crypto,
    to: toNeed.value,
    email: email.value,
    user_id: usersState.user._id,
    pair_id: pairsState.pair_id,
  };

  console.log("Данные для отправки:", dataNeedToRegister);

  try {
    const response = await fetch(BACKEND_URL + "bid", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${usersState.token}`,
      },
      body: JSON.stringify(dataNeedToRegister),
    });

    const jsonResponse = await response.json();

    if (response.ok) {
      console.log("Заявка успешно создана:", jsonResponse);
      responseData.value = jsonResponse; // Сохраняем данные ответа
    } else {
      console.error("Ошибка при создании заявки:", jsonResponse);
      alert(jsonResponse.message || "Ошибка при создании заявки");
    }
  } catch (error) {
    console.error("Ошибка:", error);
  }
};




onMounted(async () => {
});
</script>




<template>
  <div class="block h-auto bg-gray-900 mt-10 w-full md:w-3/5 rounded-2xl m-auto p-6">
    <template v-if="responseData">
      <h2 class="text-white text-center text-2xl font-bold mb-4">
        Ваша заявка успешно создана!
      </h2>
      <div class="bg-green-800 text-white p-4 rounded-lg mb-6">
        <p><strong>ID заявки:</strong> {{ responseData.bid._id }}</p>
        <p><strong>На:</strong> {{ responseData.bid.to }}</p>
        <p><strong>Количество:</strong> {{ responseData.bid.amount }}</p>
        <p><strong>Пара ID:</strong> {{ responseData.bid.pair_id }}</p>
      </div>
    </template>

    <template v-else>
      <h2 class="text-white text-center text-2xl font-bold mb-4">
        Обмен {{ pairsState.first_crypto }} на {{ pairsState.second_crypto }}
      </h2>

      <div class="bg-slate-800 text-white p-4 rounded-lg mb-6">
        <p class="text-lg mb-2">
          Обмен по курсу:
          <span class="font-bold">
            1 {{ pairsState.first_crypto }} = {{ pairsState.course }} {{ pairsState.second_crypto }}
          </span>
        </p>
        <p class="text-sm text-gray-400">
          Курс обмена фиксируется после поступления криптовалюты. При изменении курса более чем на 0.1% он будет пересчитан на актуальный.
        </p>
      </div>

      <div class="relative mb-6">
        <input
          type="email"
          v-model="email"
          placeholder="Введите Ваш e-mail"
          class="bg-slate-800 text-white w-full h-12 rounded-xl p-4 pl-12"
        />
        <span class="absolute left-4 top-3 text-gray-400">@</span>
      </div>

      <div v-if="pairsState.type_second_crypto === 'fiat'" class="relative mb-6">
        <input
          type="text"
          v-model="toNeed"
          placeholder="Номер карты"
          class="bg-slate-800 text-white w-full h-12 rounded-xl p-4 pl-12"
        />
      </div>

      <div v-else class="relative mb-6">
        <input
          type="text"
          v-model="toNeed"
          placeholder="Адрес кошелька"
          class="bg-slate-800 text-white w-full h-12 rounded-xl p-4 pl-12"
        />
      </div>

      <button
        @click="submitForm"
        class="mt-6 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl"
      >
        Создать заявку
      </button>
    </template>
  </div>
</template>
