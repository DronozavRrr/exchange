// src/utils/logger.js
import { useUsersStore } from '~/stores';

export const logAction = async (action, details = {}) => {
  const usersState = useUsersStore();
  const token = usersState.token;

  if (!token) return; 

  try {
    await fetch('http://localhost:8080/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        action,
        details
      })
    });
  } catch (error) {
    console.error('Не удалось отправить лог:', error);
  }
};