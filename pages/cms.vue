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
                <option v-for="role in availableRoles" :key="role" :value="role">{{ role }}</option>

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
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите first_crypto"
              />
            </div>
            <div>
              <label for="type" class="block text-sm font-medium mb-1">type_first_crypto</label>
              <select
                id="type1"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option value="crypto1">crypto</option>
                <option value="fiat1">fiat</option>
              </select>
            </div>


            <div>
              <label  class="block text-sm font-medium mb-1">second_crypto</label>
              <input
                type="text"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Введите second_crypto"
              />
            </div>
            <div>
              <label for="type" class="block text-sm font-medium mb-1">type_second_crypto</label>
              <select
                id="type2"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option value="crypto2">crypto</option>
                <option value="fiat2">fiat</option>
              </select>
            </div>

            <div>
              <label for="type" class="block text-sm font-medium mb-1">course</label>
              <select
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
          >
            Создать пару
          </button>
        </div>
            <h2 class="text-lg font-semibold mb-4">Пары</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full text-left text-sm">
              <thead class="bg-gray-700">
                <tr>
                  <th class="px-4 py-2 border-b border-gray-600">first_crypto</th>
                  <th class="px-4 py-2 border-b border-gray-600">type_first_crypto</th>
                  <th class="px-4 py-2 border-b border-gray-600">second_crypto</th>
                  <th class="px-4 py-2 border-b border-gray-600">type_second_crypto</th>
                  <th class="px-4 py-2 border-b border-gray-600">course</th>
                  <th class="px-4 py-2 border-b border-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="pair in all_pairs" :key="pair._id" class="border-b border-gray-600">
                  <td class="px-4 py-2">{{ pair.first_crypto }}</td>
                  <td class="px-4 py-2">{{ pair.type_first_crypto }}</td>
                  <td class="px-4 py-2">{{ pair.second_crypto }}</td>
                  <td class="px-4 py-2">{{ pair.type_second_crypto }}</td>
                  <td class="px-4 py-2">{{ pair.course }}</td>
 
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






          <div class="bg-gray-800 p-4 rounded-md mb-6">
          <h2 class="text-lg font-semibold mb-4">Фильтры для обменов</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label for="amount" class="block text-sm font-medium mb-1">amount</label>
              <select
                id="amount"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option  value="">Все</option>
                <option v-for="amount in all_exchanges" :key="amount._id" value="admin">{{ amount.amount }}</option>
              </select>
            </div>
            <div>
              <label for="user_id" class="block text-sm font-medium mb-1">user_id</label>
              <select
                id="user_id"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option v-for="user_id in all_exchanges" :key="user_id._id" value="admin">{{ user_id.user_id }}</option>
              </select>
            </div>
            <div>
              <label for="pair_id" class="block text-sm font-medium mb-1">pair_id</label>
              <select
                id="pair_id"
                class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Все</option>
                <option v-for="pair_id in all_exchanges" :key="pair_id._id" value="admin">{{ pair_id.pair_id }}</option>
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
                <tr v-for="exchange in all_exchanges" :key="exchange._id" class="border-b border-gray-600">
                  <td class="px-4 py-2">{{ exchange.amount }}</td>
                  <td class="px-4 py-2">{{ exchange.user_id }}</td>
                  <td class="px-4 py-2">{{ exchange.pair_id }}</td>
                  <td class="px-4 py-2">{{ new Date(exchange.createdAt).toLocaleDateString() }}</td>
                  <td class="px-4 py-2">{{ new Date(exchange.updatedAt).toLocaleDateString() }}</td>
 
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