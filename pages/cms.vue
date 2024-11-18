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
          <h2 class="text-lg font-semibold mb-4">Фильтры</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="email" class="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="text"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите email"
              />
            </div>
            <div>
              <label for="role" class="block text-sm font-medium mb-1">Роль</label>
              <select
                id="role"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option value="admin">Администратор</option>
                <option value="user">Пользователь</option>
              </select>
            </div>
          </div>
          <button
            class="mt-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-200"
          >
            Применить фильтры
          </button>
        </div>
  
        <div class="bg-gray-800 p-4 rounded-md">
          <h2 class="text-lg font-semibold mb-4">Данные</h2>
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
                <tr class="border-b border-gray-600">
                  <td class="px-4 py-2">test@mail.ru</td>
                  <td class="px-4 py-2">Администратор</td>
                  <td class="px-4 py-2">
                    <button class="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-400 transition">
                      Редактировать
                    </button>
                    <button class="bg-red-600 px-3 py-1 rounded-md hover:bg-red-500 transition ml-2">
                      Удалить
                    </button>
                  </td>
                </tr>
                <tr class="border-b border-gray-600">
                  <td class="px-4 py-2">test123@mail.ru</td>
                  <td class="px-4 py-2">Пользователь</td>
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