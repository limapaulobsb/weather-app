import { Settings, DateTime } from './lib/luxon.min.js';

const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';

let units, tempSymbol, speedUnit;

function setUnits() {
  if (document.getElementById('celcius').checked) {
    units = 'metric';
    tempSymbol = '&deg;C';
    speedUnit = 'm/s';
  } else {
    units = 'imperial';
    tempSymbol = '&deg;F';
    speedUnit = 'mph';
  }
}

async function fetchCurrentWeatherData(searchTerm, units) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=${units}&q=${searchTerm}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function fetchWeatherForecastData(searchTerm, units) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=${units}&q=${searchTerm}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

function returnDateTime(time, offset, format) {
  let timeZoneOffset = offset / 3600;
  if (timeZoneOffset > 0) timeZoneOffset = `+${timeZoneOffset}`;
  Settings.defaultZoneName = `UTC${timeZoneOffset}`;
  let date;
  if (isNaN(time)) {
    date = DateTime.now();
  } else {
    date = DateTime.fromSeconds(time);
  }
  if (format) return date.toLocaleString(DateTime[format]);
  return date;
}

const searchInput = document.getElementById('search-input');

const searchButton = document.getElementById('search-button');

async function showCurrentData() {
  const searchTerm = searchInput.value;
  const currentData = await fetchCurrentWeatherData(searchTerm, units);

  const weatherDataElem = document.getElementById('weather-data');
  weatherDataElem.style.visibility = 'visible';

  const countryCode = currentData.sys.country;
  const cityName = currentData.name;

  const localDateTime = returnDateTime(
    'now',
    currentData.timezone,
    'DATETIME_MED'
  );

  const temperature = currentData.main.temp;
  const weatherDesc = currentData.weather[0].description;
  const humidity = currentData.main.humidity;
  const windSpeed = currentData.wind.speed;

  const countryFlagImg = document.getElementById('country-flag');
  const cityNameElem = document.getElementById('city-name');
  const localDateTimeElem = document.getElementById('local-datetime');
  const temperatureElem = document.getElementById('temperature');
  const tempSymbolElem = document.getElementById('temp-symbol');
  const weatherDescElem = document.getElementById('weather-description');
  const humidityElem = document.getElementById('humidity');
  const windSpeedElem = document.getElementById('wind-speed');

  countryFlagImg.src = `https://www.countryflags.io/${countryCode}/shiny/24.png`;
  cityNameElem.innerText = cityName;
  localDateTimeElem.innerText = localDateTime;
  temperatureElem.innerText = Math.round(temperature);
  tempSymbolElem.innerHTML = tempSymbol;
  weatherDescElem.innerText =
    weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);
  humidityElem.innerText = `Humidity levels at: ${humidity}%`;
  windSpeedElem.innerText = `Winds at: ${Math.round(windSpeed)} ${speedUnit}`;

  console.log(currentData);
}

async function showForecastData() {
  const searchTerm = searchInput.value;
  const forecastData = await fetchWeatherForecastData(searchTerm, units);

  const dt = forecastData.list.map((element) => {
    return element.dt_txt;
  });

  const localDate = forecastData.list.map((element) =>
    returnDateTime(element.dt, forecastData.city.timezone)
  );

  console.log(forecastData);
  console.log(dt);
  console.log(localDate);
}

searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    setUnits();
    showCurrentData();
    showForecastData();
  }
});

searchButton.addEventListener('click', () => {
  setUnits();
  showCurrentData();
  showForecastData();
});
