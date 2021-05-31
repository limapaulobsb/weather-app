import { Settings, DateTime } from './lib/luxon.min.js';

const FORECAST_PAGES = 5;
const ELEMENTS_PER_PAGE = 8;
const FORECAST_HEADER_HEIGHT = 60;
const FORECAST_HEADER_OFFSET = -100;
const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';

const forecastDataSection = document.getElementById('forecast-data');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const forecastHeader = document.querySelector('section + header');
const scrollButton = document.getElementById('scroll-button');
let areHidden = true;
let units, tempSymbol, speedUnit;

function createForecastPages() {
  for (let index1 = 1; index1 <= FORECAST_PAGES; index1 += 1) {
    const newPageElem = document.createElement('div');
    newPageElem.id = `forecast-page${index1}`;
    forecastDataSection.appendChild(newPageElem);
    const pageElem = document.getElementById(`forecast-page${index1}`);

    for (let index2 = 1; index2 <= ELEMENTS_PER_PAGE; index2 += 1) {
      const newDataElem = document.createElement('div');
      newDataElem.className = 'forecast-single';
      pageElem.appendChild(newDataElem);
    }
  }
}

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

async function fetchCurrentData(searchTerm, units) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?appid=${API_KEY}&units=${units}&q=${searchTerm}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

async function fetchForecastData(searchTerm, units) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?appid=${API_KEY}&units=${units}&q=${searchTerm}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

function setTimezone(offset) {
  let timeZoneOffset = offset / 3600;
  if (timeZoneOffset > 0) timeZoneOffset = `+${timeZoneOffset}`;
  Settings.defaultZoneName = `UTC${timeZoneOffset}`;
}

function showCurrentData(currentData) {
  const localDateTime = DateTime.now();

  const cityName = currentData.name;
  const imgURL = `https://www.countryflags.io/${currentData.sys.country}/shiny/24.png`;
  const date = localDateTime.toLocaleString(DateTime.DATE_HUGE);
  const time = localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
  const temperature = currentData.main.temp;
  const weatherDesc = currentData.weather[0].description;
  const humidity = currentData.main.humidity;
  const windSpeed = currentData.wind.speed;

  const cityNameElems = document.getElementsByClassName('city-name');
  const countryFlagImgs = document.getElementsByClassName('country-flag');

  const dateElem = document.getElementById('date');
  const timeElem = document.getElementById('time');
  const temperatureElem = document.getElementById('temperature');
  const tempSymbolElem = document.getElementById('temp-symbol');
  const weatherDescElem = document.getElementById('weather-description');
  const humidityElem = document.getElementById('humidity');
  const windSpeedElem = document.getElementById('wind-speed');

  cityNameElems[0].innerText = cityName;
  cityNameElems[1].innerText = cityName;
  countryFlagImgs[0].src = imgURL;
  countryFlagImgs[1].src = imgURL;

  dateElem.innerText = date;
  timeElem.innerText = time;
  temperatureElem.innerText = Math.round(temperature);
  tempSymbolElem.innerHTML = tempSymbol;
  weatherDescElem.innerText =
    weatherDesc.charAt(0).toUpperCase() + weatherDesc.slice(1);
  humidityElem.innerText = `Humidity levels at: ${humidity}%`;
  windSpeedElem.innerText = `Winds at: ${Math.round(windSpeed)} ${speedUnit}`;

  const weatherDataElem = document.getElementById('current-data');
  weatherDataElem.style.display = 'flex';
}

function showForecastData({ list }) {
  const localtDateTime = list.map((e) => DateTime.fromSeconds(e.dt));
  const dataElements = document.getElementsByClassName('forecast-single');

  for (let i = 0; i < list.length; i++) {
    const weekday = localtDateTime[i].weekdayShort.toUpperCase();
    const day = localtDateTime[i].day;
    const time = localtDateTime[i].toLocaleString(DateTime.TIME_24_SIMPLE);
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
        <div>
          <span class="fs-smaller">${time}</span>
        </div>
      </div>
      <div>
        <span class="fs-smaller">H: ${humidity}% W: ${windSpeed} ${speedUnit}</span>
      </div>
      <div>
        <span class="mr-small">${temperature} ${tempSymbol}</span>
        <img src="${imgURL}" />
      </div>
    `;

    if (i === FORECAST_PAGES * ELEMENTS_PER_PAGE - 1) break;
  }

  forecastDataSection.style.display = 'flex';
}

async function loadWeatherData() {
  setUnits();
  const searchTerm = searchInput.value;

  const data = [
    fetchCurrentData(searchTerm, units),
    fetchForecastData(searchTerm, units),
  ];
  const result = await Promise.all(data);

  setTimezone(result[0].timezone);
  showCurrentData(result[0]);
  showForecastData(result[1]);
}

const toggleHelpers = {
  show: function () {
    forecastHeader.style.top = 0;
    scrollButton.style.bottom = '10px';
    areHidden = false;
  },
  hide: function () {
    forecastHeader.style.top = `${FORECAST_HEADER_OFFSET}px`;
    scrollButton.style.bottom = `${FORECAST_HEADER_OFFSET + 10}px`;
    areHidden = true;
  },
};

window.addEventListener('load', () => {
  createForecastPages();
});

searchInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    loadWeatherData();
  }
});

searchButton.addEventListener('click', () => {
  loadWeatherData();
});

document.addEventListener('scroll', () => {
  const targetOffset = forecastDataSection.offsetTop - FORECAST_HEADER_HEIGHT;

  if (window.pageYOffset >= targetOffset && areHidden) {
    toggleHelpers.show();
  } else if (window.pageYOffset < targetOffset && !areHidden) {
    toggleHelpers.hide();
  }
});

scrollButton.addEventListener('click', () => window.scroll(0, 0));
