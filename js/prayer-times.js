/**
 * 🕌 Prayer Times Module
 * Загружает расписание с GitHub (Namaz Chelyabinsk)
 */

const PrayerTimes = {
  // 🔗 Raw-ссылка на твой prayer-data.json
  apiUrl: 'https://raw.githubusercontent.com/daniilnizamov7-star/Namaz/main/api/prayer-data.json',
  
  // Ключи для localStorage
  cacheKey: 'prayer_cache_v1',

  /**
   * Найти данные на сегодня
   */
  getToday(data) {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth(); // 0-11
    
    // Месяцы для сравнения
    const monthNames = [
      'янв', 'фев', 'мар', 'апр', 'май', 'июн',
      'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'
    ];
    
    const todayMonthStr = monthNames[currentMonth];
    const todayStr = `${currentDay} ${todayMonthStr}`;
    
    // Ищем по дате (например, "20 апр")
    const entry = data.schedule?.find(item => {
      const itemDate = item.date?.trim();
      return itemDate === todayStr;
    });
    
    if (entry) {
      console.log(`✅ Найдено расписание на ${todayStr} (${data.monthName?.trim()})`);
      return entry;
    }
    
    console.warn(`⚠️ Дата ${todayStr} не найдена в расписании`);
    return null;
  },

  /**
   * Обновить интерфейс
   */
  renderUI(times) {
    if (!times) {
      console.warn('⚠️ Нет данных для отображения');
      return;
    }
    
    const elements = {
      'fajr-time': times.fajr?.trim(),
      'dhuhr-time': times.dhuhr?.trim(),
      'asr-time': times.asr?.trim(),
      'maghrib-time': times.maghrib?.trim(),
      'isha-time': times.isha?.trim()
    };

    for (const [id, time] of Object.entries(elements)) {
      const el = document.getElementById(id);
      if (el && time) {
        el.style.transition = 'opacity 0.2s';
        el.style.opacity = '0';
        setTimeout(() => {
          el.textContent = time;
          el.style.opacity = '1';
        }, 100);
      }
    }
    
    this.highlightNext(times);
  },

  /**
   * Подсветить ближайший намаз
   */
  highlightNext(times) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    
    const prayers = [
      { id: 'fajr-time', time: times.fajr?.trim() },
      { id: 'dhuhr-time', time: times.dhuhr?.trim() },
      { id: 'asr-time', time: times.asr?.trim() },
      { id: 'maghrib-time', time: times.maghrib?.trim() },
      { id: 'isha-time', time: times.isha?.trim() }
    ];

    document.querySelectorAll('.prayer-time').forEach(el => {
      el.classList.remove('next-prayer');
    });

    for (const p of prayers) {
      if (!p.time) continue;
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
      const response = await fetch(this.apiUrl + '?t=' + Date.now());
      if (!response.ok) throw new Error('HTTP ' + response.status);
      
      const data = await response.json();
      const today = this.getToday(data);
      
      if (today) {
        localStorage.setItem(this.cacheKey, JSON.stringify({
          date: new Date().toDateString(),
          data: today
        }));
        
        this.renderUI(today);
      } else {
        // Пробуем кэш
        const cached = localStorage.getItem(this.cacheKey);
        if (cached) {
          const { date, data: cachedData } = JSON.parse(cached);
          if (date === new Date().toDateString()) {
            console.log('✅ Загружено из кэша');
            this.renderUI(cachedData);
            return;
          }
        }
        
        // Запасные данные
        this.renderUI({
          fajr: '04:00',
          dhuhr: '13:20',
          asr: '18:28',
          maghrib: '20:08',
          isha: '21:48'
        });
      }
      
    } catch (error) {
      console.error('❌ Ошибка загрузки расписания:', error);
      
      const cached = localStorage.getItem(this.cacheKey);
      if (cached) {
        const { data: cachedData } = JSON.parse(cached);
        this.renderUI(cachedData);
        return;
      }
      
      this.renderUI({
        fajr: '04:00',
        dhuhr: '13:20',
        asr: '18:28',
        maghrib: '20:08',
        isha: '21:48'
      });
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PrayerTimes.init();
});
