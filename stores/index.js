import { defineStore } from 'pinia';
import usersState from './usersStore/state';
import usersActions from './usersStore/actions';
import usersGetters from './usersStore/getters';

import pairsState from './pairsStore/state';
import pairsActions from './pairsStore/actions';
import pairsGetters from './pairsStore/getters';

export const useUsersStore = defineStore('usersStore', {
  state: usersState,
  actions: usersActions,
  getters: usersGetters,
});

export const usePairsStore = defineStore('pairsStore', {
  state: pairsState,
  actions: pairsActions,
  getters: pairsGetters,
});
