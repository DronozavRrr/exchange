<template>
  <div class="block h-auto bg-gray-900 mt-10 w-3/5 rounded-2xl m-auto p-6">
      <h2 class="text-white text-center text-2xl font-bold mb-4">Обмен Tether (TRC-20) USDT на Тинькофф RUB</h2>

      <div class="bg-slate-800 text-white p-4 rounded-lg mb-6">
          <p class="text-lg mb-2">Обмен по курсу: <span class="font-bold">1 USDT = 96.75 RUB</span></p>
          <p class="text-sm text-gray-400">
              Курс обмена фиксируется после <span class="text-blue-400">поступления криптовалюты</span>.
              При изменении курса более чем на 0.1% он будет пересчитан на актуальный.
          </p>
      </div>

      <div class="flex justify-between items-center mb-6">
          <div class="flex items-center">
              <p class="text-white text-lg font-semibold mr-2">Tether (TRC-20) USDT</p>
              <span class="text-white text-xl font-bold">79 999.98 USDT</span>
          </div>
          <div class="flex items-center">
              <p class="text-white text-lg font-semibold mr-2">Тинькофф RUB</p>
              <span class="text-white text-xl font-bold">7 739 606.07 RUB</span>
          </div>
      </div>

      <div class="relative mb-6">
          <input
            type="email"
            placeholder="Введите Ваш e-mail"
            class="bg-slate-800 text-white w-full h-12 rounded-xl p-4 pl-12"
          />
          <span class="absolute left-4 top-3 text-gray-400">@</span>
      </div>

      <div class="relative mb-6">
          <input
            type="text"
            placeholder="Номер карты Тинькофф"
            class="bg-slate-800 text-white w-full h-12 rounded-xl p-4 pl-12"
          />
          <span class="absolute left-4 top-3 text-gray-400">
              <img src="https://cdn-icons-png.flaticon.com/512/179/179457.png" class="w-6 h-6" alt="card-icon"/>
          </span>
      </div>

      <div class="relative mb-6">
          <input
            type="text"
            placeholder="Имя получателя"
            class="bg-slate-800 text-white w-full h-12 rounded-xl p-4 pl-12"
          />
          <span class="absolute left-4 top-3 text-gray-400">*</span>
      </div>

      <!-- Соглашение -->
      <div class="flex flex-col text-white mb-4">
          <label class="inline-flex items-center">
            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600" />
            <span class="ml-2">Я согласен с <a href="#" class="text-blue-400 underline">условиями и правилами сервиса</a></span>
          </label>
          <label class="inline-flex items-center mt-2 ">
            <input type="checkbox" class="form-checkbox h-4 w-4 text-blue-600" />
            <span class="ml-2">Я согласен с <a href="#" class="text-blue-400 underline">условиями AML / CTF & KYC</a></span>
          </label>
      </div>
  </div>
</template>
