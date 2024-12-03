<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
const router = useRouter();
const all_users = ref([])
const all_pairs = ref([]);
const all_bids = ref([])
const all_exchanges = ref([])
const usersState = useUsersStore(); 

const isModalOpen = ref(false);
const userToEdit = ref(null);
const userEmail = ref('');
const userRole = ref('');



const filterEmail = ref('');
const filterRole = ref('');


const filterFirstCrypto = ref('');
const filterSecondCrypto = ref('');
const filterTypeFirstCrypto = ref('');
const filterTypeSecondCrypto = ref('');
const filterCourse = ref('');

const firstCrypto = ref('');
const secondCrypto = ref('');
const typeFirstCrypto = ref('');
const typeSecondCrypto = ref('');
const course = ref('');


const filterBidAmount = ref('');
const filterBidType = ref('');
const filterBidUserId = ref('');
const filterBidPairId = ref('');
const filterBidTo = ref('');



const filterExchangeAmount = ref('');
const filterExchangeUserId = ref('');
const filterExchangePairId = ref('');
const filterExchangeDateFrom = ref('');
const filterExchangeDateTo = ref('');


const filteredUsers = computed(() => {
  return all_users.value.filter(user => {
    // Фильтрация по email, если указано значение
    const matchesEmail = filterEmail.value
      ? user.email.toLowerCase().includes(filterEmail.value.toLowerCase())
      : true;

    // Фильтрация по роли, если выбрано значение
    const matchesRole = filterRole.value && filterRole.value !== 'Все'
      ? (filterRole.value === 'Администратор' && user.role === 'admin') || (filterRole.value === 'Пользователь' && user.role === 'user')
      : true;

    return matchesEmail && matchesRole;
  });
});

const filteredPairs = computed(() => {
  return all_pairs.value.filter(pair => {
    const matchesFirstCrypto = filterFirstCrypto.value
      ? pair.first_crypto.toLowerCase().includes(filterFirstCrypto.value.toLowerCase())
      : true;
    const matchesSecondCrypto = filterSecondCrypto.value
      ? pair.second_crypto.toLowerCase().includes(filterSecondCrypto.value.toLowerCase())
      : true;
    const matchesTypeFirstCrypto = filterTypeFirstCrypto.value
      ? pair.type_first_crypto === filterTypeFirstCrypto.value
      : true;
    const matchesTypeSecondCrypto = filterTypeSecondCrypto.value
      ? pair.type_second_crypto === filterTypeSecondCrypto.value
      : true;
    const matchesCourse = filterCourse.value
      ? pair.course == filterCourse.value
      : true;

    return matchesFirstCrypto && matchesSecondCrypto && matchesTypeFirstCrypto && matchesTypeSecondCrypto && matchesCourse;
  });
});


const exchangeFilters = reactive({
  amount: '',
  user_id: '',
  pair_id: '',
  dateFrom: '',
  dateTo: ''
});


const filteredExchanges = computed(() => {
  return all_exchanges.value.filter(exchange => {
    const matchesAmount = exchangeFilters.amount
      ? exchange.amount.toString().includes(exchangeFilters.amount)
      : true;

    const matchesUserId = exchangeFilters.user_id
      ? exchange.user_id === exchangeFilters.user_id
      : true;

    const matchesPairId = exchangeFilters.pair_id
      ? exchange.pair_id === exchangeFilters.pair_id
      : true;

    const exchangeDate = new Date(exchange.createdAt);
    const matchesDateFrom = exchangeFilters.dateFrom
      ? exchangeDate >= new Date(exchangeFilters.dateFrom)
      : true;

    const matchesDateTo = exchangeFilters.dateTo
      ? exchangeDate <= new Date(exchangeFilters.dateTo)
      : true;

    return matchesAmount && matchesUserId && matchesPairId && matchesDateFrom && matchesDateTo;
  });
});

// Вычисляемые свойства для доступных опций фильтров (умные фильтры)
const availableExchangeUsers = computed(() => {
  return Array.from(new Set(
    all_exchanges.value
      .filter(exchange => {
        // Применяем все фильтры кроме user_id
        const matchesAmount = exchangeFilters.amount
          ? exchange.amount.toString().includes(exchangeFilters.amount)
          : true;
        const matchesPairId = exchangeFilters.pair_id
          ? exchange.pair_id === exchangeFilters.pair_id
          : true;
        const matchesDateFrom = exchangeFilters.dateFrom
          ? new Date(exchange.createdAt) >= new Date(exchangeFilters.dateFrom)
          : true;
        const matchesDateTo = exchangeFilters.dateTo
          ? new Date(exchange.createdAt) <= new Date(exchangeFilters.dateTo)
          : true;
        return matchesAmount && matchesPairId && matchesDateFrom && matchesDateTo;
      })
      .map(exchange => exchange.user_id)
  ));
});

const availableExchangePairs = computed(() => {
  return Array.from(new Set(
    all_exchanges.value
      .filter(exchange => {
        // Применяем все фильтры кроме pair_id
        const matchesAmount = exchangeFilters.amount
          ? exchange.amount.toString().includes(exchangeFilters.amount)
          : true;
        const matchesUserId = exchangeFilters.user_id
          ? exchange.user_id === exchangeFilters.user_id
          : true;
        const matchesDateFrom = exchangeFilters.dateFrom
          ? new Date(exchange.createdAt) >= new Date(exchangeFilters.dateFrom)
          : true;
        const matchesDateTo = exchangeFilters.dateTo
          ? new Date(exchange.createdAt) <= new Date(exchangeFilters.dateTo)
          : true;
        return matchesAmount && matchesUserId && matchesDateFrom && matchesDateTo;
      })
      .map(exchange => exchange.pair_id)
  ));
});

// Watcher для сброса фильтров, если опции больше не доступны
watch(exchangeFilters, () => {
  if (exchangeFilters.user_id && !availableExchangeUsers.value.includes(exchangeFilters.user_id)) {
    exchangeFilters.user_id = '';
  }
  if (exchangeFilters.pair_id && !availableExchangePairs.value.includes(exchangeFilters.pair_id)) {
    exchangeFilters.pair_id = '';
  }
}, { deep: true });

const getUserEmail = (userId) => {
  const user = all_users.value.find(user => user._id === userId);
  return user ? user.email : 'Неизвестно';
};

const getPairName = (pairId) => {
  const pair = all_pairs.value.find(pair => pair._id === pairId);
  return pair ? `${pair.first_crypto} / ${pair.second_crypto}` : 'Неизвестно';
};

// **Обработчики для умных фильтров**

watch([filterExchangeAmount, filterExchangeUserId, filterExchangePairId, filterExchangeDateFrom, filterExchangeDateTo], () => {
  // Проверка и сброс зависимых фильтров, если текущий выбор больше не доступен
  if (filterExchangeUserId.value && !availableExchangeUsers.value.includes(filterExchangeUserId.value)) {
    filterExchangeUserId.value = '';
  }

  if (filterExchangePairId.value && !availableExchangePairs.value.includes(filterExchangePairId.value)) {
    filterExchangePairId.value = '';
  }
}, { immediate: true });

const isExchangeModalOpen = ref(false);
const exchangeToEdit = ref(null);
const exchangeAmount = ref('');
const exchangeUserId = ref('');
const exchangePairId = ref('');



const openExchangeModal = (exchange = null) => {
  isExchangeModalOpen.value = true;
  if (exchange) {
    exchangeToEdit.value = exchange;
    exchangeAmount.value = exchange.amount;
    exchangeUserId.value = exchange.user_id;
    exchangePairId.value = exchange.pair_id;
  } else {
    exchangeToEdit.value = null;
    exchangeAmount.value = '';
    exchangeUserId.value = '';
    exchangePairId.value = '';
  }
};

const saveExchange = async () => {
  try {
    if (exchangeToEdit.value) {
      // **Обновление обмена (PUT запрос)**
      const response = await fetch(`${BACKEND_URL}exchange`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: exchangeToEdit.value._id,
          amount: exchangeAmount.value,
          user_id: exchangeUserId.value,
          pair_id: exchangePairId.value
        })
      });

      if (response.ok) {
        const updatedExchange = await response.json();
        const index = all_exchanges.value.findIndex(exchange => exchange._id === exchangeToEdit.value._id);
        all_exchanges.value[index] = updatedExchange;
        isExchangeModalOpen.value = false;
      } else {
        console.error('Ошибка при редактировании обмена');
      }
    } else {
      // **Создание нового обмена (POST запрос)**
      const response = await fetch(`${BACKEND_URL}exchange`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: exchangeAmount.value,
          user_id: exchangeUserId.value,
          pair_id: exchangePairId.value
        })
      });

      if (response.ok) {
        const newExchange = await response.json();
        all_exchanges.value.push(newExchange);
        isExchangeModalOpen.value = false;
      } else {
        console.error('Ошибка при создании обмена');
      }
    }
  } catch (error) {
    console.error('Ошибка при сохранении обмена:', error);
  }
};

const deleteExchange = async (exchangeId) => {
  try {
    const response = await fetch(`${BACKEND_URL}exchange/id/${exchangeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${usersState.token}` },
    });
    if (response.ok) {
      all_exchanges.value = all_exchanges.value.filter(exchange => exchange._id !== exchangeId);
      console.log('Обмен успешно удален');
    } else {
      console.error('Ошибка при удалении обмена');
    }
  } catch (error) {
    console.error('Ошибка при подключении к серверу:', error);
  }
};


const availableRoles = computed(() => {
  const rolesSet = new Set(all_users.value
    .filter(user => user.email.toLowerCase().includes(filterEmail.value.toLowerCase())) // Фильтрация по email
    .map(user => user.role));
  return Array.from(rolesSet).map(role => role === 'admin' ? 'Администратор' : 'Пользователь');
});

const openEditModal = (user) => {
  isModalOpen.value = true;
  userToEdit.value = user;
  userEmail.value = user.email;
  userRole.value = user.role;
};

const BACKEND_URL = "http://localhost:8080/api/";
const logout_click = () => {
  router.push('/');
};


const openModal = (user = null) => {
  isModalOpen.value = true;
  if (user) {

    userToEdit.value = user;
    userEmail.value = user.email;
    userRole.value = user.role;
  } else {

    userToEdit.value = null;
    userEmail.value = '';
    userRole.value = 'user';
  }
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

const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${BACKEND_URL}user/${userId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${usersState.token}` }
    });
    if (response.ok) {
      all_users.value = all_users.value.filter(user => user._id !== userId);
      console.log("Пользователь успешно удален");
    } else {
      console.error("Ошибка при удалении пользователя");
    }
  } catch (error) {
    console.error("Ошибка при подключении к серверу:", error);
  }
};


const saveUser = async () => {
  try {
    if (userToEdit.value) {
      const response = await fetch(`${BACKEND_URL}user`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: userToEdit.value._id,
          email: userEmail.value,
          role: userRole.value
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        const index = all_users.value.findIndex(user => user._id === userToEdit.value._id);
        all_users.value[index] = updatedUser;
        isModalOpen.value = false;
      } else {
        console.error('Ошибка при редактировании пользователя');
      }
    } else {
      const response = await fetch(`${BACKEND_URL}user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userEmail.value,
          password: 'defaultPassword', 
          role: userRole.value
        })
      });

      if (response.ok) {
        const newUser = await response.json();
        all_users.value.push(newUser);
        isModalOpen.value = false;
      } else {
        console.error('Ошибка при создании пользователя');
      }
    }
  } catch (error) {
    console.error('Ошибка при подключении к серверу:', error);
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

const isPairModalOpen = ref(false);
const pairToEdit = ref(null);

const openPairModal = (pair = null) => {
  isPairModalOpen.value = true;
  if (pair) {
    pairToEdit.value = pair;
    firstCrypto.value = pair.first_crypto;
    secondCrypto.value = pair.second_crypto;
    typeFirstCrypto.value = pair.type_first_crypto;
    typeSecondCrypto.value = pair.type_second_crypto;
    course.value = pair.course;
  } else {
    pairToEdit.value = null;
    firstCrypto.value = '';
    secondCrypto.value = '';
    typeFirstCrypto.value = '';
    typeSecondCrypto.value = '';
    course.value = '';
  }
};

const savePair = async () => {
  try {
    if (pairToEdit.value) {
      // **Обновление пары (PUT запрос)**
      const response = await fetch(`${BACKEND_URL}pair`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: pairToEdit.value._id,
          first_crypto: firstCrypto.value,
          second_crypto: secondCrypto.value,
          type_first_crypto: typeFirstCrypto.value,
          type_second_crypto: typeSecondCrypto.value,
          course: course.value
        })
      });

      if (response.ok) {
        const updatedPair = await response.json();
        const index = all_pairs.value.findIndex(pair => pair._id === pairToEdit.value._id);
        all_pairs.value[index] = updatedPair;
        isPairModalOpen.value = false;
      } else {
        console.error('Ошибка при редактировании пары');
      }
    } else {
      // **Создание новой пары (POST запрос)**
      const response = await fetch(`${BACKEND_URL}pair`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          first_crypto: firstCrypto.value,
          second_crypto: secondCrypto.value,
          type_first_crypto: typeFirstCrypto.value,
          type_second_crypto: typeSecondCrypto.value,
          course: course.value
        })
      });

      if (response.ok) {
        const newPair = await response.json();
        all_pairs.value.push(newPair);
        isPairModalOpen.value = false;
      } else {
        console.error('Ошибка при создании пары');
      }
    }
  } catch (error) {
    console.error('Ошибка при сохранении пары:', error);
  }
};

const deletePair = async (pairId) => {
  try {
    const response = await fetch(`${BACKEND_URL}pair/id/${pairId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${usersState.token}` },
    });
    if (response.ok) {
      all_pairs.value = all_pairs.value.filter(pair => pair._id !== pairId);
      console.log('Пара успешно удалена');
    } else {
      console.error('Ошибка при удалении пары');
    }
  } catch (error) {
    console.error('Ошибка при подключении к серверу:', error);
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
    <div class="bg-gray-900 text-white min-h-screen flex flex-col">
      <header class="bg-gray-800 py-4 px-6 flex justify-between items-center">
        <h1 class="text-xl font-bold">Панель управления</h1>
        <button
          @click="logout_click"
          class="bg-red-600 px-4 py-2 rounded-md hover:bg-red-500 transition duration-200"
        >
          Выйти
        </button>
      </header>
  
      <main class="flex-grow p-6">
        <div class="bg-gray-800 p-4 rounded-md mb-6">
          <h2 class="text-lg font-semibold mb-4">Фильтры для пользователей</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="email" class="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                v-model="filterEmail"
                type="text"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите email"
              />
            </div>
            <div>
              <label for="role" class="block text-sm font-medium mb-1">Роль</label>
              <select
                v-model="filterRole"  
                id="role"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option v-for="role in availableRoles" :key="role" :value="role">{{ role}}</option>

              </select>
            </div>
          </div>

          <button
          @click="openModal()"
            class="mt-4 bg-green-600 px-4 py-2 rounded-md ml-2 hover:bg-blue-500 transition duration-200"
          >
            Создать пользователя
          </button>
        </div>




        
  
        <div class="bg-gray-800 p-6 rounded-md ">
          <h2 class="text-lg font-semibold mb-4">Пользователи</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-4 py-2 border-b border-gray-600">Email</th>
                  <th class="px-4 py-2 border-b border-gray-600">Роль</th>
                  <th class="px-4 py-2 border-b border-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in filteredUsers" :key="user._id" class="border-b border-gray-600">
                  <td class="px-4 py-2">{{ user.email }}</td>
                  <td class="px-4 py-2">{{ user.role }}</td>
                  <td class="px-4 py-2">
                    <button @click="openModal(user)" class="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-400 transition">
                      Редактировать
                    </button>
                    <button @click="deleteUser(user._id)" class="bg-red-600 px-3 py-1 rounded-md hover:bg-red-500 transition ml-2">
                      Удалить
                    </button>
                  </td>
                </tr>
                
              </tbody>
              
            </table>

            <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white text-black p-6 rounded-md w-96">
        <h2 class="text-lg font-semibold mb-4">{{ userToEdit ? 'Редактировать пользователя' : 'Создать пользователя' }}</h2>
        <input type="text" v-model="userEmail" placeholder="Email" class="border px-3 py-2 w-full mb-4">
        <select v-model="userRole" class="border px-3 py-2 w-full mb-4">
          <option value="admin">Администратор</option>
          <option value="user">Пользователь</option>
        </select>
        <div class="flex justify-end space-x-2">
          <button @click="isModalOpen = false" class="bg-gray-500 px-4 py-2 rounded-md">Отмена</button>
          <button @click="saveUser" class="bg-blue-600 px-4 py-2 rounded-md">Сохранить</button>
        </div>
      </div>
    </div>




            <div class="bg-gray-800 p-6 rounded-md mb-6">
          <h2 class="text-lg font-semibold mb-4">Фильтры для пар</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label  class="block text-sm font-medium mb-1">first_crypto</label>
              <input
                type="text"
                v-model="filterFirstCrypto"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите first_crypto"
              />
            </div>
            <div>
              <label for="type" class="block text-sm font-medium mb-1">type_first_crypto</label>
              <select
              v-model="filterTypeFirstCrypto"
                id="type1"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option value="crypto">crypto</option>
                <option value="fiat">fiat</option>
              </select>
            </div>


            <div>
              <label  class="block text-sm font-medium mb-1">second_crypto</label>
              <input
              v-model="filterSecondCrypto"
                type="text"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите second_crypto"
              />
            </div>
            <div>
              <label for="type" class="block text-sm font-medium mb-1">type_second_crypto</label>
              <select
              v-model="filterTypeSecondCrypto"
                id="type2"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option value="crypto">crypto</option>
                <option value="fiat">fiat</option>
              </select>
            </div>

            <div>
              <label for="type" class="block text-sm font-medium mb-1">course</label>
              <select
              v-model="filterCourse"
                id="type2"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

              >
                <option value="">Все</option>
                <option v-for="course in all_pairs" :key="course._id" value="crypto2">{{ course.course }}</option>
              </select>
            </div>
          </div>
          <button
            class="mt-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-200"
          >
            Применить фильтры
          </button>

          <button
            class="mt-4 bg-green-600 px-4 py-2 rounded-md ml-2 hover:bg-blue-500 transition duration-200"
            @click="openPairModal()"
          >
            Создать пару
          </button>
        </div>
        <div class="bg-gray-800 p-6 rounded-md mb-6">
    <h2 class="text-lg font-semibold mb-4">Пары</h2>
    <div class="overflow-x-auto">
      <table class="min-w-full text-left text-sm">
        <thead class="bg-gray-700">
          <tr>
            <th class="px-4 py-2 border-b border-gray-600">Первая валюта</th>
            <th class="px-4 py-2 border-b border-gray-600">Тип первой валюты</th>
            <th class="px-4 py-2 border-b border-gray-600">Вторая валюта</th>
            <th class="px-4 py-2 border-b border-gray-600">Тип второй валюты</th>
            <th class="px-4 py-2 border-b border-gray-600">Курс</th>
            <th class="px-4 py-2 border-b border-gray-600">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="pair in filteredPairs"
            :key="pair._id"
            class="border-b border-gray-600"
          >
            <td class="px-4 py-2">{{ pair.first_crypto }}</td>
            <td class="px-4 py-2">{{ pair.type_first_crypto }}</td>
            <td class="px-4 py-2">{{ pair.second_crypto }}</td>
            <td class="px-4 py-2">{{ pair.type_second_crypto }}</td>
            <td class="px-4 py-2">{{ pair.course }}</td>
            <td class="px-4 py-2">
              <button
                @click="openPairModal(pair)"
                class="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-400 transition"
              >
                Редактировать
              </button>
              <button
                @click="deletePair(pair._id)"
                class="bg-red-600 px-3 py-1 rounded-md hover:bg-red-500 transition ml-2"
              >
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
          </div>
          <div
    v-if="isPairModalOpen"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
  >
    <div class="bg-white text-black p-6 rounded-md w-96">
      <h2 class="text-lg font-semibold mb-4">
        {{ pairToEdit ? 'Редактировать пару' : 'Создать пару' }}
      </h2>
      <input
        type="text"
        v-model="firstCrypto"
        placeholder="Первая валюта"
        class="border px-3 py-2 w-full mb-4"
      />
      <select
        v-model="typeFirstCrypto"
        class="border px-3 py-2 w-full mb-4"
      >
        <option value="">Выберите тип первой валюты</option>
        <option value="crypto">crypto</option>
        <option value="fiat">fiat</option>
      </select>

      <input
        type="text"
        v-model="secondCrypto"
        placeholder="Вторая валюта"
        class="border px-3 py-2 w-full mb-4"
      />
      <select
        v-model="typeSecondCrypto"
        class="border px-3 py-2 w-full mb-4"
      >
        <option value="">Выберите тип второй валюты</option>
        <option value="crypto">crypto</option>
        <option value="fiat">fiat</option>
      </select>

      <input
        type="number"
        v-model="course"
        placeholder="Курс"
        class="border px-3 py-2 w-full mb-4"
      />

      <div class="flex justify-end space-x-2">
        <button
          @click="isPairModalOpen = false"
          class="bg-gray-500 px-4 py-2 rounded-md"
        >
          Отмена
        </button>
        <button
          @click="savePair"
          class="bg-blue-600 px-4 py-2 rounded-md"
        >
          Сохранить
        </button>
      </div>
    </div>
  </div>





  <div class="bg-gray-800 p-4 rounded-md mb-6">
        <h2 class="text-lg font-semibold mb-4">Фильтры для обменов</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label for="exchange-amount" class="block text-sm font-medium mb-1">Сумма</label>
            <input
              id="exchange-amount"
              v-model="exchangeFilters.amount"
              type="number"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сумму"
            />
          </div>
          <div>
            <label for="exchange-user_id" class="block text-sm font-medium mb-1">Пользователь</label>
            <select
              id="exchange-user_id"
              v-model="exchangeFilters.user_id"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option v-for="userId in availableExchangeUsers" :key="userId" :value="userId">
                {{ getUserEmail(userId) }}
              </option>
            </select>
          </div>
          <div>
            <label for="exchange-pair_id" class="block text-sm font-medium mb-1">Пара</label>
            <select
              id="exchange-pair_id"
              v-model="exchangeFilters.pair_id"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option v-for="pairId in availableExchangePairs" :key="pairId" :value="pairId">
                {{ getPairName(pairId) }}
              </option>
            </select>
          </div>
          <div>
            <label for="exchange-date-from" class="block text-sm font-medium mb-1">Дата с</label>
            <input
              id="exchange-date-from"
              v-model="exchangeFilters.dateFrom"
              type="date"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="exchange-date-to" class="block text-sm font-medium mb-1">Дата по</label>
            <input
              id="exchange-date-to"
              v-model="exchangeFilters.dateTo"
              type="date"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          class="mt-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-200"
        >
          Применить фильтры
        </button>

        <button
          class="mt-4 bg-green-600 px-4 py-2 rounded-md ml-2 hover:bg-green-500 transition duration-200"
          @click="openExchangeModal()"
        >
          Создать обмен
        </button>
      </div>







            <h2 class="text-lg font-semibold mb-4">Обмены</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-4 py-2 border-b border-gray-600">amount</th>
                  <th class="px-4 py-2 border-b border-gray-600">user_id</th>
                  <th class="px-4 py-2 border-b border-gray-600">pair_id</th>
                  <th class="px-4 py-2 border-b border-gray-600">createdAt</th>
                  <th class="px-4 py-2 border-b border-gray-600">updatedAt</th>
                  <th class="px-4 py-2 border-b border-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="exchange in filteredExchanges" :key="exchange._id" class="border-b border-gray-600">
                  <td class="px-4 py-2">{{ exchange.amount }}</td>
                  <td class="px-4 py-2">{{ exchange.user_id }}</td>
                  <td class="px-4 py-2">{{ exchange.pair_id }}</td>
                  <td class="px-4 py-2">{{ new Date(exchange.createdAt).toLocaleDateString() }}</td>
                  <td class="px-4 py-2">{{ new Date(exchange.updatedAt).toLocaleDateString() }}</td>
 
                  <td class="px-4 py-2">
                    <button @click="openExchangeModal(exchange)" class="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-400 transition">
                      Редактировать
                    </button>
                    <button  @click="deleteExchange(exchange._id)" class="bg-red-600 px-3 py-1 rounded-md hover:bg-red-500 transition ml-2">
                      Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div
        v-if="isExchangeModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div class="bg-white text-black p-6 rounded-md w-96">
          <h2 class="text-lg font-semibold mb-4">
            {{ exchangeToEdit ? 'Редактировать обмен' : 'Создать обмен' }}
          </h2>
          <input
            type="number"
            v-model="exchangeAmount"
            placeholder="Сумма"
            class="border px-3 py-2 w-full mb-4"
          />
          <label class="block text-sm font-medium mb-1">Пользователь</label>
          <select
            v-model="exchangeUserId"
            class="border px-3 py-2 w-full mb-4"
          >
            <option value="">Выберите пользователя</option>
            <option v-for="user in all_users" :key="user._id" :value="user._id">{{ user.email }}</option>
          </select>

          <label class="block text-sm font-medium mb-1">Пара</label>
          <select
            v-model="exchangePairId"
            class="border px-3 py-2 w-full mb-4"
          >
            <option value="">Выберите пару</option>
            <option v-for="pair in all_pairs" :key="pair._id" :value="pair._id">
              {{ pair.first_crypto }} / {{ pair.second_crypto }}
            </option>
          </select>

          <div class="flex justify-end space-x-2">
            <button
              @click="isExchangeModalOpen = false"
              class="bg-gray-500 px-4 py-2 rounded-md"
            >
              Отмена
            </button>
            <button
              @click="saveExchange"
              class="bg-blue-600 px-4 py-2 rounded-md"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>









          <div class="bg-gray-800 p-4 rounded-md mb-6">
          <h2 class="text-lg font-semibold mb-4">Фильтры для заявок</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="amount" class="block text-sm font-medium mb-1">amount</label>
              <select
                id="amount"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option  value="">Все</option>
                <option v-for="amount in all_bids" :key="amount._id" value="admin">{{ amount.amount }}</option>
              </select>
            </div>
            <div>
              <label for="type" class="block text-sm font-medium mb-1">type</label>
              <select
                id="type"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option  value="fiat">fiat</option>
                <option  value="crypto">crypto</option>
              </select>
            </div>
            <div>
              <label for="user_id" class="block text-sm font-medium mb-1">user_id</label>
              <select
                id="user_id"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option v-for="user_id in all_bids" :key="user_id._id" value="admin">{{ user_id.user_id }}</option>
              </select>
            </div>
            <div>
              <label for="pair_id" class="block text-sm font-medium mb-1">pair_id</label>
              <select
                id="pair_id"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option v-for="pair_id in all_bids" :key="pair_id._id" value="admin">{{ pair_id.pair_id }}</option>
              </select>
            </div>

            <div>
              <label for="to" class="block text-sm font-medium mb-1">to</label>
              <input
                type="text"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="to card/wallet"
              />
            </div>
          </div>
          <button
            class="mt-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-200"
          >
            Применить фильтры
          </button>

          <button
            class="mt-4 bg-green-600 px-4 py-2 rounded-md ml-2 hover:bg-blue-500 transition duration-200"
          >
            Создать заявку
          </button>
        </div>






            <h2 class="text-lg font-semibold mb-4">Заявки</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-4 py-2 border-b border-gray-600">amount</th>
                  <th class="px-4 py-2 border-b border-gray-600">type</th>
                  <th class="px-4 py-2 border-b border-gray-600">to</th>
                  <th class="px-4 py-2 border-b border-gray-600">user_id</th>
                  <th class="px-4 py-2 border-b border-gray-600">pair_id</th>
                  <th class="px-4 py-2 border-b border-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="bid in all_bids" :key="bid._id" class="border-b border-gray-600">
                  <td class="px-4 py-2">{{ bid.amount }}</td>
                  <td class="px-4 py-2">{{ bid.type }}</td>
                  <td class="px-4 py-2">{{ bid.to }}</td>
                  <td class="px-4 py-2">{{ bid.user_id}}</td>
                  <td class="px-4 py-2">{{ bid.pair_id }}</td>
 
                  <td class="px-4 py-2">
                    <button class="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-400 transition">
                      Редактировать
                    </button>
                    <button class="bg-red-600 px-3 py-1 rounded-md hover:bg-red-500 transition ml-2">
                      Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>






        </div>
      </main>
    </div>
  </template>