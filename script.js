const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

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

async function showCurrentData() {
  const searchTerm = searchInput.value;
  const currentData = await fetchCurrentWeatherData(searchTerm, units);

  const weatherDataElem = document.getElementById('weather-data');

  weatherDataElem.style.visibility = 'visible';

  const cityName = currentData.name;
  const countryCode = currentData.sys.country;
  const temperature = currentData.main.temp;
  const weatherDesc = currentData.weather[0].description;
  const humidity = currentData.main.humidity;
  const windSpeed = currentData.wind.speed;

  const cityNameElem = document.getElementById('city-name');
  const countryFlagImg = document.getElementById('country-flag');
  const temperatureElem = document.getElementById('temperature');
  const tempSymbolElem = document.getElementById('temp-symbol');
  const weatherDescElem = document.getElementById('weather-description');
  const humidityElem = document.getElementById('humidity');
  const windSpeedElem = document.getElementById('wind-speed');

  cityNameElem.innerText = cityName;
  countryFlagImg.src = `https://www.countryflags.io/${countryCode}/shiny/24.png`;
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
  console.log(forecastData);
}

searchButton.addEventListener('click', () => {
  setUnits();
  showCurrentData();
  showForecastData();
});

searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    setUnits();
    showCurrentData();
    showForecastData();
  }
});
