import { Settings, DateTime } from './lib/luxon.min.js';

let units, tempSymbol, speedUnit;
const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';
const FORECAST_PAGES = 5;
const ELEMENTS_PER_PAGE = 8;

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const forecastDataElem = document.getElementById('weather-forecast-data');
const forecastHeaderElem = document.getElementById('forecast-header');
let headerIsHidden = true;

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

function returnDateTime(time, offset) {
  let timeZoneOffset = offset / 3600;
  if (timeZoneOffset > 0) timeZoneOffset = `+${timeZoneOffset}`;
  Settings.defaultZoneName = `UTC${timeZoneOffset}`;
  let date;
  if (isNaN(time)) {
    date = DateTime.now();
  } else {
    date = DateTime.fromSeconds(time);
  }
  return date;
}

async function showCurrentData() {
  const searchTerm = searchInput.value;
  const currentData = await fetchCurrentWeatherData(searchTerm, units);
  const localDateTime = returnDateTime('now', currentData.timezone);

  const cityName = currentData.name;
  const imgURL = `https://www.countryflags.io/${currentData.sys.country}/shiny/24.png`;
  const date = localDateTime.toLocaleString(DateTime.DATE_HUGE);
  const time = localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
  const temperature = currentData.main.temp;
  const weatherDesc = currentData.weather[0].description;
  const humidity = currentData.main.humidity;
  const windSpeed = currentData.wind.speed;

  const cityNameElem = document.getElementById('city-name');
  const countryFlagImg = document.getElementsByClassName('country-flag');
  const dateElem = document.getElementById('local-date');
  const timeElem = document.getElementById('local-time');
  const temperatureElem = document.getElementById('temperature');
  const tempSymbolElem = document.getElementById('temp-symbol');
  const weatherDescElem = document.getElementById('weather-description');
  const humidityElem = document.getElementById('humidity');
  const windSpeedElem = document.getElementById('wind-speed');

  cityNameElem.innerText = cityName;
  countryFlagImg[0].src = imgURL;
  dateElem.innerText = date;
  timeElem.innerText = time;
  temperatureElem.innerText = Math.round(temperature);
  tempSymbolElem.innerHTML = tempSymbol;
  weatherDescElem.innerText =
    weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);
  humidityElem.innerText = `Humidity levels at: ${humidity}%`;
  windSpeedElem.innerText = `Winds at: ${Math.round(windSpeed)} ${speedUnit}`;

  forecastHeaderElem.innerHTML = `
    <span class="mr-small fs-med">${cityName}</span>
    <img class="country-flag" src="${imgURL}" />
  `;

  const weatherDataElem = document.getElementById('current-weather-data');
  weatherDataElem.style.display = 'flex';

  console.log(currentData);
}

async function showForecastData() {
  const searchTerm = searchInput.value;
  const { city, list } = await fetchWeatherForecastData(searchTerm, units);

  const forecastDateTime = list.map((element) =>
    returnDateTime(element.dt, city.timezone)
  );

  const dataElements = document.getElementsByClassName('forecast-single');

  for (let i = 0; i < list.length; i++) {
    const weekday = forecastDateTime[i].weekdayShort.toUpperCase();
    const day = forecastDateTime[i].day;
    const time = forecastDateTime[i].toLocaleString(DateTime.TIME_24_SIMPLE);
    const humidity = list[i].main.humidity;
    const windSpeed = Math.round(list[i].wind.speed);
    const temperature = Math.round(list[i].main.temp);
    const imgURL = `http://openweathermap.org/img/wn/${list[i].weather[0].icon}@2x.png`;

    dataElements[i].innerHTML = `
      <div>
        <div class="forecast-date mr-med">
          <span class="fs-smaller">${weekday}</span>
          <span>${day}</span>
        </div>
        <span class="fs-smaller">${time}</span>
      </div>
      <span class="fs-smaller">H: ${humidity}% W: ${windSpeed} ${speedUnit}</span>
      <div>
        <span class="mr-small">${temperature} ${tempSymbol}</span>
        <img src="${imgURL}" />
      </div>
    `;

    if (i === FORECAST_PAGES * ELEMENTS_PER_PAGE - 1) break;
  }

  forecastDataElem.style.display = 'flex';

  console.log(list);
  console.log(forecastDateTime);
}

window.onload = function () {
  for (let index1 = 1; index1 <= FORECAST_PAGES; index1 += 1) {
    const newPageElem = document.createElement('div');
    newPageElem.id = `forecast-page${index1}`;
    forecastDataElem.appendChild(newPageElem);
    const pageElem = document.getElementById(`forecast-page${index1}`);

    for (let index2 = 1; index2 <= ELEMENTS_PER_PAGE; index2 += 1) {
      const newDataElem = document.createElement('div');
      newDataElem.className = 'forecast-single';
      pageElem.appendChild(newDataElem);
    }
  }
};

document.addEventListener('scroll', function () {
  const offset = forecastDataElem.offsetTop - 60;

  if (window.pageYOffset >= offset && headerIsHidden) {
    headerIsHidden = false;
    forecastHeaderElem.style.top = 0;
  } else if (
    window.pageYOffset < offset &&
    !headerIsHidden
  ) {
    headerIsHidden = true;
    forecastHeaderElem.style.top = '-60px';
  }
});

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
