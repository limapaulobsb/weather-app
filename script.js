const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

async function fetchWeatherData(searchTerm, units) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=${units}&q=${searchTerm}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function showData() {
  const searchTerm = searchInput.value;
  let units, tempSymbol, speedUnit;

  if (document.getElementById('celcius').checked) {
    units = 'metric';
    tempSymbol = '&deg;C';
    speedUnit = 'm/s';
  } else {
    units = 'imperial';
    tempSymbol = '&deg;F';
    speedUnit = 'mph';
  }

  const data = await fetchWeatherData(searchTerm, units);

  const weatherDataElem = document.getElementById('weather-data');
  weatherDataElem.style.visibility = 'visible';

  const cityName = data.name;
  const countryCode = data.sys.country;
  const temperature = data.main.temp;
  const weatherDesc = data.weather[0].description;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

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

  console.log(data);
  console.log(data.weather[0].main);
  console.log(weatherDesc);
  console.log(temperature);
  console.log(data.main.feels_like);
  console.log(data.main.temp_min);
  console.log(data.main.temp_max);
  console.log(humidity);
  console.log(windSpeed);
  console.log(data.clouds.all);
  console.log(data.sys.country);
  console.log(data.sys.sunrise);
  console.log(data.sys.sunset);
  console.log(data.timezone);
  console.log(cityName);
}

searchButton.addEventListener('click', () => showData());

searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    showData();
  }
});
