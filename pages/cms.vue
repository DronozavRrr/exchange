<script setup>
import { useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';

import { logAction } from '@/utils/logger';
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

const bidFilters = ref({
  amount: '',
  type: '',    // Новый фильтр для типа заявки
  to: '',      // Новый фильтр для поля 'to'
  userId: '',
  pairId: '',
  dateFrom: '',
  dateTo: ''
});


const filteredBids = computed(() => {
  return all_bids.value.filter(bid => {
    const { amount, type, to, userId, pairId, dateFrom, dateTo } = bidFilters.value;

    const matchesAmount = amount
      ? bid.amount.toString().includes(amount)
      : true;

    const matchesType = type
      ? bid.type === type
      : true;

    const matchesTo = to
      ? bid.to.toLowerCase().includes(to.toLowerCase())
      : true;

    const matchesUserId = userId
      ? bid.user_id === userId
      : true;

    const matchesPairId = pairId
      ? bid.pair_id === pairId
      : true;

    const bidDate = new Date(bid.createdAt);
    const matchesDateFrom = dateFrom
      ? bidDate >= new Date(dateFrom)
      : true;

    const matchesDateTo = dateTo
      ? bidDate <= new Date(dateTo)
      : true;

    return matchesAmount && matchesType && matchesTo && matchesUserId && matchesPairId && matchesDateFrom && matchesDateTo;
  });
});

const availableBidUsers = computed(() => {
  return Array.from(new Set(
    all_bids.value
      .filter(bid => {
        const { amount, type, to, pairId, dateFrom, dateTo } = bidFilters.value;

        const matchesAmount = amount
          ? bid.amount.toString().includes(amount)
          : true;
        const matchesTypeFilter = type
          ? bid.type === type
          : true;
        const matchesToFilter = to
          ? bid.to.toLowerCase().includes(to.toLowerCase())
          : true;
        const matchesPairIdFilter = pairId
          ? bid.pair_id === pairId
          : true;
        const matchesDateFrom = dateFrom
          ? new Date(bid.createdAt) >= new Date(dateFrom)
          : true;
        const matchesDateTo = dateTo
          ? new Date(bid.createdAt) <= new Date(dateTo)
          : true;

        return matchesAmount && matchesTypeFilter && matchesToFilter && matchesPairIdFilter && matchesDateFrom && matchesDateTo;
      })
      .map(bid => bid.user_id)
  ));
});


const availableBidPairs = computed(() => {
  return Array.from(new Set(
    all_bids.value
      .filter(bid => {
        const { amount, type, to, userId, dateFrom, dateTo } = bidFilters.value;

        const matchesAmount = amount
          ? bid.amount.toString().includes(amount)
          : true;
        const matchesTypeFilter = type
          ? bid.type === type
          : true;
        const matchesToFilter = to
          ? bid.to.toLowerCase().includes(to.toLowerCase())
          : true;
        const matchesUserIdFilter = userId
          ? bid.user_id === userId
          : true;
        const matchesDateFrom = dateFrom
          ? new Date(bid.createdAt) >= new Date(dateFrom)
          : true;
        const matchesDateTo = dateTo
          ? new Date(bid.createdAt) <= new Date(dateTo)
          : true;

        return matchesAmount && matchesTypeFilter && matchesToFilter && matchesUserIdFilter && matchesDateFrom && matchesDateTo;
      })
      .map(bid => bid.pair_id)
  ));
});

watch(bidFilters, () => {
  if (bidFilters.value.userId && !availableBidUsers.value.includes(bidFilters.value.userId)) {
    bidFilters.value.userId = '';
  }

  if (bidFilters.value.pairId && !availableBidPairs.value.includes(bidFilters.value.pairId)) {
    bidFilters.value.pairId = '';
  }
}, { deep: true });

const isBidModalOpen = ref(false);
const bidToEdit = ref(null);
const bidAmount = ref('');
const bidType = ref('');
const bidTo = ref('');
const bidUserId = ref('');
const bidPairId = ref('');

const openBidModal = (bid = null) => {
  isBidModalOpen.value = true;
  if (bid) {
    bidToEdit.value = bid;
    bidAmount.value = bid.amount;
    bidType.value = bid.type;
    bidTo.value = bid.to;
    bidUserId.value = bid.user_id;
    bidPairId.value = bid.pair_id;
  } else {
    bidToEdit.value = null;
    bidAmount.value = '';
    bidType.value = '';
    bidTo.value = '';
    bidUserId.value = '';
    bidPairId.value = '';
  }
};


const saveBid = async () => {
  // Валидация данных на клиенте
  if (!bidAmount.value || bidAmount.value <= 0) {
    alert('Пожалуйста, введите корректную сумму заявки.');
    return;
  }
  if (bidType.value === '') {
    alert('Пожалуйста, выберите тип заявки.');
    return;
  }
  if (!bidTo.value) {
    alert('Пожалуйста, введите номер карты или адрес кошелька.');
    return;
  }
  if (!bidUserId.value) {
    alert('Пожалуйста, выберите пользователя.');
    return;
  }
  if (!bidPairId.value) {
    alert('Пожалуйста, выберите пару.');
    return;
  }

  try {
    if (bidToEdit.value) {
      const response = await fetch(`${BACKEND_URL}bid`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          _id: bidToEdit.value._id,
          amount: bidAmount.value,
          type: bidType.value,
          to: bidTo.value,
          user_id: bidUserId.value,
          pair_id: bidPairId.value
        })
      });

      if (response.ok) {
        const updatedBid = await response.json();
        const index = all_bids.value.findIndex(bid => bid._id === bidToEdit.value._id);
        all_bids.value[index] = updatedBid;
        isBidModalOpen.value = false;
        alert('Заявка успешно обновлена.');

        // Логирование действия на клиенте
        logAction('update_bid', { bidId: updatedBid._id, amount: updatedBid.amount });
      } else {
        console.error('Ошибка при редактировании заявки');
        alert('Ошибка при редактировании заявки.');
      }
    } else {
      const response = await fetch(`${BACKEND_URL}bid`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${usersState.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: bidAmount.value,
          type: bidType.value,
          to: bidTo.value,
          user_id: bidUserId.value,
          pair_id: bidPairId.value
        })
      });

      if (response.ok) {
        const newBid = await response.json();
        all_bids.value.push(newBid);
        isBidModalOpen.value = false;
        alert('Заявка успешно создана.');

        // Логирование действия на клиенте
        logAction('create_bid', { bidId: newBid._id, amount: newBid.amount });
      } else {
        console.error('Ошибка при создании заявки');
        alert('Ошибка при создании заявки.');
      }
    }
  } catch (error) {
    console.error('Ошибка при сохранении заявки:', error);
    alert('Произошла ошибка при сохранении заявки.');
  }
};

const deleteBid = async (bidId) => {
  if (!confirm('Вы уверены, что хотите удалить эту заявку?')) return;

  try {
    const response = await fetch(`${BACKEND_URL}bid/id/${bidId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${usersState.token}` },
    });
    if (response.ok) {
      all_bids.value = all_bids.value.filter(bid => bid._id !== bidId);
      console.log('Заявка успешно удалена');
      alert('Заявка успешно удалена.');
    } else {
      console.error('Ошибка при удалении заявки');
      alert('Ошибка при удалении заявки.');
    }
  } catch (error) {
    console.error('Ошибка при подключении к серверу:', error);
    alert('Произошла ошибка при удалении заявки.');
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
            <label for="bid-amount" class="block text-sm font-medium mb-1">Сумма</label>
            <input
              id="bid-amount"
              v-model="bidFilters.amount"
              type="number"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите сумму"
            />
          </div>
          <div>
            <label for="bid-type" class="block text-sm font-medium mb-1">Тип</label>
            <select
              id="bid-type"
              v-model="bidFilters.type"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option value="fiat">Fiat</option>
              <option value="crypto">Crypto</option>
            </select>
          </div>
          <div>
            <label for="bid-to" class="block text-sm font-medium mb-1">Номер карты / Адрес кошелька</label>
            <input
              id="bid-to"
              v-model="bidFilters.to"
              type="text"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Введите номер карты или адрес кошелька"
            />
          </div>
          <div>
            <label for="bid-user_id" class="block text-sm font-medium mb-1">Пользователь</label>
            <select
              id="bid-user_id"
              v-model="bidFilters.userId"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option v-for="userId in availableBidUsers" :key="userId" :value="userId">
                {{ userId }}
              </option>
            </select>
          </div>
          <div>
            <label for="bid-pair_id" class="block text-sm font-medium mb-1">Пара</label>
            <select
              id="bid-pair_id"
              v-model="bidFilters.pairId"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Все</option>
              <option v-for="pairId in availableBidPairs" :key="pairId" :value="pairId">
                {{ pairId }}
              </option>
            </select>
          </div>
          <div>
            <label for="bid-date-from" class="block text-sm font-medium mb-1">Дата с</label>
            <input
              id="bid-date-from"
              v-model="bidFilters.dateFrom"
              type="date"
              class="w-full bg-gray-700 text-white border border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="bid-date-to" class="block text-sm font-medium mb-1">Дата по</label>
            <input
              id="bid-date-to"
              v-model="bidFilters.dateTo"
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
          @click="openBidModal()"
        >
          Создать заявку
        </button>
      </div>






      <h2 class="text-lg font-semibold mb-4">Заявки</h2>
        <div class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-gray-700">
              <tr>
                <th class="px-4 py-2 border-b border-gray-600">Сумма</th>
                <th class="px-4 py-2 border-b border-gray-600">Тип</th>
                <th class="px-4 py-2 border-b border-gray-600">Номер карты / Адрес кошелька</th>
                <th class="px-4 py-2 border-b border-gray-600">Пользователь</th>
                <th class="px-4 py-2 border-b border-gray-600">Пара</th>
                <th class="px-4 py-2 border-b border-gray-600">Создано</th>
                <th class="px-4 py-2 border-b border-gray-600">Обновлено</th>
                <th class="px-4 py-2 border-b border-gray-600">Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="bid in filteredBids"
                :key="bid._id"
                class="border-b border-gray-600"
              >
                <td class="px-4 py-2">{{ bid.amount }}</td>
                <td class="px-4 py-2">
                  {{ bid.type  }}
                </td>
                <td class="px-4 py-2">
                  {{ bid.to }}
                </td>
                <td class="px-4 py-2">
                  {{ bid.user_id }}
                </td>
                <td class="px-4 py-2">
                  {{ bid.pair_id }}
                </td>
                <td class="px-4 py-2">{{ new Date(bid.createdAt).toLocaleDateString() }}</td>
                <td class="px-4 py-2">{{ new Date(bid.updatedAt).toLocaleDateString() }}</td>
                <td class="px-4 py-2">
                  <button
                    @click="openBidModal(bid)"
                    class="bg-yellow-500 px-3 py-1 rounded-md hover:bg-yellow-400 transition"
                  >
                    Редактировать
                  </button>
                  <button
                    @click="deleteBid(bid._id)"
                    class="bg-red-600 px-3 py-1 rounded-md hover:bg-red-500 transition ml-2"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
        v-if="isBidModalOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
      >
        <div class="bg-white text-black p-6 rounded-md w-96">
          <h2 class="text-lg font-semibold mb-4">
            {{ bidToEdit ? 'Редактировать заявку' : 'Создать заявку' }}
          </h2>
          <input
            type="number"
            v-model="bidAmount"
            placeholder="Сумма"
            class="border px-3 py-2 w-full mb-4"
          />
          <label class="block text-sm font-medium mb-1">Тип</label>
          <select
            v-model="bidType"
            class="border px-3 py-2 w-full mb-4"
          >
            <option value="">Выберите тип</option>
            <option value="fiat">Fiat</option>
            <option value="crypto">Crypto</option>
          </select>

          <label class="block text-sm font-medium mb-1">Номер карты / Адрес кошелька</label>
          <input
            type="text"
            v-model="bidTo"
            placeholder="Введите номер карты или адрес кошелька"
            class="border px-3 py-2 w-full mb-4"
          />

          <label class="block text-sm font-medium mb-1">Пользователь</label>
          <select
            v-model="bidUserId"
            class="border px-3 py-2 w-full mb-4"
          >
            <option value="">Выберите пользователя</option>
            <option v-for="userId in availableBidUsers" :key="userId" :value="userId">
              {{ userId }}
            </option>
          </select>

          <label class="block text-sm font-medium mb-1">Пара</label>
          <select
            v-model="bidPairId"
            class="border px-3 py-2 w-full mb-4"
          >
            <option value="">Выберите пару</option>
            <option v-for="pairId in availableBidPairs" :key="pairId" :value="pairId">
              {{ pairId }}
            </option>
          </select>

          <div class="flex justify-end space-x-2">
            <button
              @click="isBidModalOpen = false"
              class="bg-gray-500 px-4 py-2 rounded-md"
            >
              Отмена
            </button>
            <button
              @click="saveBid"
              class="bg-blue-600 px-4 py-2 rounded-md"
            >
              Сохранить
            </button>
          </div>
        </div>
        </div>






        </div>
      </main>
      <logs />
    </div>

  </template>