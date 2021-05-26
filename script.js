const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';

async function fetchWeatherData(cityName) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=metric&q=${cityName}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}


const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');

async function showData() {
  const searchTerm = searchInput.value;
  const data = await fetchWeatherData(searchTerm);

  const weatherDataElem = document.getElementById('weather-data');
  weatherDataElem.style.visibility = 'visible';

  const cityName = data.name;
  const temperature = data.main.temp;
  const weatherDescription = data.weather[0].description;
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;

  const locationElem = document.getElementById('location');
  const temperatureElem = document.getElementById('temperature');
  const degreeSymbolElem = document.getElementById('degree-symbol');
  const weatherDescElem = document.getElementById('weather-description');
  const humidityElem = document.getElementById('humidity');
  const windSpeedElem = document.getElementById('wind-speed');

  locationElem.innerText = cityName;
  temperatureElem.innerText = Math.floor(temperature);
  degreeSymbolElem.innerHTML = '&deg;C';
  weatherDescElem.innerText =
    weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1);
  humidityElem.innerText = `Humidity levels at: ${humidity}%`;
  windSpeedElem.innerText = `Winds at: ${Math.floor(windSpeed)} m/s`;

  console.log(data);
  console.log(data.weather[0].main);
  console.log(weatherDescription);
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
