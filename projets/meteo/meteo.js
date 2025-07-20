(() => {
  'use strict';

  const apiKey = 'Ffj3Rq1uOGdQScHjhAaT9UuxeA8b9Byc';
  const baseUrl = 'https://dataservice.accuweather.com';

  const form = document.getElementById('weatherForm');
  const input = document.getElementById('cityInput');
  const loader = document.querySelector('.loader');
  const card = document.querySelector('.card');
  const cityName = document.querySelector('.city-name');
  const weatherText = document.querySelector('.weather-text');
  const temperature = document.querySelector('.temperature');
  const weatherImg = document.querySelector('.weather-img');
  const logConsole = document.querySelector('.console-log');

  // Images day/night
  const dayImage = 'https://i.imgur.com/MbcC6II.jpg';
  const nightImage = 'https://i.imgur.com/PKf8NXh.jpg';

  // Helper: Log message to on-screen console
  function log(msg) {
    const time = new Date().toLocaleTimeString();
    const p = document.createElement('p');
    p.textContent = `[${time}] > ${msg}`;
    logConsole.appendChild(p);
    logConsole.scrollTop = logConsole.scrollHeight;
    console.log(`[KyotakaLog] ${msg}`);
  }

  // Show loader
  function showLoader(show) {
    loader.style.display = show ? 'block' : 'none';
  }

  // Update UI with weather data
  function updateUI({ cityDets, weather }) {
    cityName.textContent = cityDets.EnglishName.toLowerCase();
    weatherText.textContent = weather.WeatherText.toUpperCase();
    temperature.innerHTML = `${Math.round(weather.Temperature.Metric.Value)} <span>°C</span>`;
    weatherImg.src = weather.IsDayTime ? dayImage : nightImage;
    weatherImg.alt = weather.IsDayTime ? "Image du jour" : "Image de nuit";
    card.classList.add('show');
    log(`Weather mise à jour pour ${cityDets.EnglishName}`);
  }

  // Fetch city info from API
  async function getCity(city) {
    const url = `${baseUrl}/locations/v1/cities/search?apikey=${apiKey}&q=${encodeURIComponent(city)}`;
    log(`Recherche de la ville "${city}"...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur API recherche ville: ${res.status}`);
    const data = await res.json();
    if (!data.length) throw new Error('Aucune ville trouvée.');
    log(`Ville trouvée: ${data[0].EnglishName} (${data[0].Country.ID})`);
    return data[0];
  }

  // Fetch weather info from API
  async function getWeather(locationKey) {
    const url = `${baseUrl}/currentconditions/v1/${locationKey}?apikey=${apiKey}`;
    log(`Récupération météo pour clé: ${locationKey}...`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erreur API météo: ${res.status}`);
    const data = await res.json();
    if (!data.length) throw new Error('Aucune donnée météo disponible.');
    log('Weather reçue.');
    return data[0];
  }

  // Update city and weather data
  async function updateCity(city) {
    showLoader(true);
    card.classList.remove('show');
    try {
      const cityDets = await getCity(city);
      const weather = await getWeather(cityDets.Key);
      return { cityDets, weather };
    } finally {
      showLoader(false);
    }
  }

  // Handle form submit
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const city = input.value.trim();
    if (!city) {
      log('Champ ville vide.');
      return;
    }
    try {
      log(`Début mise à jour météo pour "${city}"`);
      const data = await updateCity(city);
      updateUI(data);
      input.value = '';
    } catch (err) {
      log(`Erreur: ${err.message}`);
      alert(`Erreur: ${err.message}`);
    }
  });

  // Auto-load Paris au démarrage
  updateCity('Paris').then(updateUI).catch(err => {
    log(`Erreur au chargement initial: ${err.message}`);
  });
})();