<template>
 <div class="flex flex-col md:flex-row items-center h-auto bg-gray-900 mt-10 rounded-2xl m-auto w-full md:w-11/12 p-6">
  <div class="h-1/5 w-full md:w-2/5 rounded-xl mt-10 m-auto">
          <b class="text-white">Отдаете</b>
          <select class="bg-slate-800 text-white w-full h-12 rounded-xl p-2">
            <option value="1">BTC</option>
            <option value="2">USDT</option>
            <option value="3">ETH</option>
          </select>
          <input 
            type="number" 
            placeholder="Введите сумму" 
            class="mt-5 bg-slate-800 text-white w-full h-12 rounded-xl p-2 mb-10"
          />
        </div>
        <img src="/swap.png" alt="Обмен" class="mt-5 size-10 h-auto rounded-full ">
        <div class="bg-gray-900 h-1/5 w-full md:w-2/5 rounded-xl mt-10 m-auto">
      <b class="text-white">Получаете</b>
      <select class="bg-slate-800 text-white w-full h-12 rounded-xl p-2">
            <option value="1">BTC</option>
            <option value="2">USDT</option>
            <option value="3">ETH</option>
          </select>
          <input 
            type="number" 
            placeholder="Сумма для получения" 
            class="mt-5 bg-slate-800 text-white w-full h-12 rounded-xl p-2 mb-10"
            readonly
          />
        </div>
      </div>
</template>