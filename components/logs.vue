<!-- src/components/Logs.vue -->
<template>
    <div class="bg-gray-800 p-6 rounded-md mb-6">
      <h2 class="text-lg font-semibold mb-4">Логи Действий Пользователей</h2>
      
      <!-- Фильтры -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div>
          <label for="log-user" class="block text-sm font-medium mb-1">Пользователь</label>
          <select v-model="filterUserId" id="log-user" class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2">
            <option value="">Все</option>
            <option v-for="user in allUsers" :key="user._id" :value="user._id">{{ user.email  || 'not email' }}</option>
          </select>
        </div>
        <div>
          <label for="log-action" class="block text-sm font-medium mb-1">Действие</label>
          <input
            v-model="filterAction"
            id="log-action"
            type="text"
            class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
            placeholder="Введите действие"
          />
        </div>
        <div>
          <label for="log-date-from" class="block text-sm font-medium mb-1">Дата с</label>
          <input
            v-model="filterDateFrom"
            id="log-date-from"
            type="date"
            class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
          />
        </div>
        <div>
          <label for="log-date-to" class="block text-sm font-medium mb-1">Дата по</label>
          <input
            v-model="filterDateTo"
            id="log-date-to"
            type="date"
            class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2"
          />
        </div>
      </div>
  
      <button
        class="mb-4 bg-blue-600 px-4 py-2 rounded-md hover:bg-blue-500 transition duration-200"
        @click="fetchLogs"
      >
        Применить Фильтры
      </button>
  
      <!-- Таблица логов -->
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-gray-700">
            <tr>
              <th class="px-4 py-2 border-b border-gray-600">Пользователь</th>
              <th class="px-4 py-2 border-b border-gray-600">Действие</th>
              <th class="px-4 py-2 border-b border-gray-600">Детали</th>
              <th class="px-4 py-2 border-b border-gray-600">Время</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="log in logs" :key="log._id" class="border-b border-gray-600">
              <td class="px-4 py-2">{{ log.userId
              ||'not email' }}</td>
              <td class="px-4 py-2">{{ log.action }}</td>
              <td class="px-4 py-2">
                <pre class="whitespace-pre-wrap">{{ formatDetails(log.details) }}</pre>
              </td>
              <td class="px-4 py-2">{{ formatDate(log.timestamp) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Пагинация -->
      <div class="mt-4 flex justify-center items-center space-x-2">
        <button
          @click="goToPage(currentPage - 1)"
          :disabled="currentPage === 1"
          class="bg-gray-700 px-3 py-1 rounded-md hover:bg-gray-600 transition"
        >
          Назад
        </button>
        <span>Страница {{ currentPage }} из {{ totalPages }}</span>
        <button
          @click="goToPage(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="bg-gray-700 px-3 py-1 rounded-md hover:bg-gray-600 transition"
        >
          Вперед
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed, watch } from 'vue';
  import { useUsersStore } from '~/stores';
  import { useRouter } from 'vue-router';
  
  const usersState = useUsersStore();
  const router = useRouter();
  
  const logs = ref([]);
  const totalLogs = ref(0);
  const currentPage = ref(1);
  const logsPerPage = ref(50);
  
  // Фильтры
  const filterUserId = ref('');
  const filterAction = ref('');
  const filterDateFrom = ref('');
  const filterDateTo = ref('');
  
  // Получение всех пользователей для фильтрации
  const allUsers = ref([]);
  
  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}users`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${usersState.token}` }
      });
  
      if (response.ok) {
        allUsers.value = await response.json();
      } else {
        console.error('Ошибка при получении пользователей');
      }
    } catch (error) {
      console.error('Ошибка при подключении к серверу:', error);
    }
  };
  
  // Функция для получения логов
  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.value,
        limit: logsPerPage.value,
        userId: filterUserId.value,
        action: filterAction.value,
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value
      });
  
      const response = await fetch(`http://localhost:8080/api/logs?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        }
      });
  
      if (response.ok) {
        const data = await response.json();
        logs.value = data.logs;
        totalLogs.value = data.total;
      } else {
        console.error('Ошибка при получении логов');
        alert('Ошибка при получении логов.');
      }
    } catch (error) {
      console.error('Ошибка при подключении к серверу:', error);
      alert('Произошла ошибка при получении логов.');
    }
  };
  
  // Пагинация
  const totalPages = computed(() => Math.ceil(totalLogs.value / logsPerPage.value));
  
  const goToPage = (page) => {
    if (page < 1 || page > totalPages.value) return;
    currentPage.value = page;
    fetchLogs();
  };
  
  // Форматирование даты
  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };
  
  // Форматирование деталей
  const formatDetails = (details) => {
    return JSON.stringify(details, null, 2);
  };
  
  // Проверка прав доступа при монтировании
  onMounted(() => {

      fetchAllUsers();
      fetchLogs();
    
  });
  
  // Наблюдатель за фильтрами
  watch([filterUserId, filterAction, filterDateFrom, filterDateTo], () => {
    currentPage.value = 1;
    fetchLogs();
  }, { deep: true });
  </script>
  
  <style scoped>
  /* Добавьте стили по вашему усмотрению */
  </style>
  