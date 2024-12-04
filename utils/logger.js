// src/utils/logger.js
import { useUsersStore } from '~/stores';

export const logAction = async (action, details = {}) => {
  const usersState = useUsersStore();
  const token = usersState.token;

  if (!token) return; // Если пользователь не аутентифицирован, не отправляем лог

  try {
    await fetch('http://localhost:8080/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // Исправлено: используйте обратные кавычки
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