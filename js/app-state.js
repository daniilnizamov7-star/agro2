/**
 * 🕌 AppState Manager
 * Запоминает мечеть и роль пользователя.
 * При повторном запуске восстанавливает сессию без лишних кликов.
 */

const AppState = {
  STORAGE_KEY: 'mosque_app_state_v1',

  // Дефолтное состояние
  defaults: {
    activeMosque: null, // 'central', 'nur', etc.
    role: null,         // 'member', 'imam', 'muezzin', 'admin'
    isFirstLaunch: true,
    visitedMosques: []  // список мечетей, куда заходил пользователь
  },

  // Загрузить состояние
  load() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? { ...this.defaults, ...JSON.parse(saved) } : { ...this.defaults };
    } catch {
      return { ...this.defaults };
    }
  },

  // Сохранить состояние
  save(state) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
  },

  // Установить активную мечеть и роль
  setActive(mosqueSlug, role) {
    const state = this.load();
    state.activeMosque = mosqueSlug;
    state.role = role;
    state.isFirstLaunch = false;

    if (!state.visitedMosques.includes(mosqueSlug)) {
      state.visitedMosques.push(mosqueSlug);
    }

    this.save(state);
    return state;
  },

  // Получить текущую роль для мечети
  getRole(mosqueSlug) {
    const state = this.load();
    if (state.activeMosque === mosqueSlug) return state.role;
    return 'member'; // дефолт для гостей
  },

  // Сбросить (для отладки или выхода)
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    window.location.reload();
  }
};

// Экспортируем
if (typeof module !== 'undefined') module.exports = AppState;
