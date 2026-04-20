/**
 * 🕌 Prayer Times Module
 * Загружает расписание с GitHub (Namaz Chelyabinsk)
 */

const PrayerTimes = {
  // Raw-ссылка на твой JSON
  apiUrl: 'https://raw.githubusercontent.com/daniilnizamov7-star/Namaz/main/api/prayer-data.json',
  
  // Ключи для localStorage
  cacheKey: 'prayer_cache_v1',
  
  // Соответствие ключей
  keys: {
    fajr: 'fajr',
    dhuhr: 'dhuhr',
    asr: 'asr',
    maghrib: 'maghrib',
    isha: 'isha'
  },

  /**
   * Найти данные на сегодня
   */
  getToday(data) {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Ищем день в расписании
    const entry = data.schedule.find(item => item.d === currentDay);
    
    if (entry) {
      console.log(`✅ Найдено расписание на ${currentDay} ${data.monthName}`);
      return entry;
    }
    
    // Если не нашли — берём первый день (запасной вариант)
    console.warn('⚠️ День не найден, используем первый день месяца');
    return data.schedule[0];
  },

  /**
   * Обновить интерфейс
   */
  renderUI(times) {
    const elements = {
      'fajr-time': times.fajr,
      'dhuhr-time': times.dhuhr,
      'asr-time': times.asr,
      'maghrib-time': times.maghrib,
      'isha-time': times.isha
    };

    for (const [id, time] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el) {
        // Плавное обновление
        el.style.transition = 'opacity 0.2s';
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = time;
          el.style.opacity = '1';
        }, 100);
      }
    }
    
    // Подсветка следующего намаза
    this.highlightNext(times);
  },

  /**
   * Подсветить ближайший намаз
   */
  highlightNext(times) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { id: 'fajr-time', time: times.fajr },
      { id: 'dhuhr-time', time: times.dhuhr },
      { id: 'asr-time', time: times.asr },
      { id: 'maghrib-time', time: times.maghrib },
      { id: 'isha-time', time: times.isha }
    ];

    // Убираем старую подсветку
    document.querySelectorAll('.prayer-time').forEach(el => {
      el.classList.remove('next-prayer');
    });

    // Находим следующий
    for (const p of prayers) {
      const [h, m] = p.time.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      
      if (prayerMinutes > nowMinutes) {
        const el = document.getElementById(p.id);
        if (el) el.classList.add('next-prayer');
        break;
      }
    }
  },

  /**
   * Загрузить и показать расписание
   */
  async init() {
    try {
      // Пробуем загрузить с GitHub
      const response = await fetch(this.apiUrl + '?t=' + Date.now()); // ?t=... чтобы не кэшировалось
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      const data = await response.json();
      const today = this.getToday(data);
      
      // Кэшируем в localStorage
      localStorage.setItem(this.cacheKey, JSON.stringify({
        date: new Date().toDateString(),
        data: today
      }));
      
      // Обновляем UI
      this.renderUI(today);
      
    } catch (error) {
      console.error('❌ Ошибка загрузки:', error);
      
      // Пробуем загрузить из кэша
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const { date, data } = JSON.parse(cached);
        // Если кэш сегодня — показываем
        if (date === new Date().toDateString()) {
          console.log('✅ Загружено из кэша');
          this.renderUI(data);
          return;
        }
      }
      
      // Если ничего не вышло — показываем запасное
      console.warn('⚠️ Используем запасное расписание');
      this.renderUI({
        fajr: '04:05',
        dhuhr: '13:20',
        asr: '18:24',
        maghrib: '20:04',
        isha: '21:44'
      });
    }
  }
};

// Автозапуск
document.addEventListener('DOMContentLoaded', () => {
  PrayerTimes.init();
});
