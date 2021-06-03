import { Settings, DateTime } from './lib/luxon.min.js';

const FORECAST_PAGES = 5;
const ELEMENTS_PER_PAGE = 8;
const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const messageElem = document.querySelector('#message-container > p');
const forecastHeader = document.querySelector('section + header');
const forecastDataSection = document.getElementById('forecast-data');
const scrollButton = document.getElementById('scroll-button');
let areHidden = true;
let units, tempSymbol, speedUnit, mult;

function createForecastPages() {
  for (let index1 = 1; index1 <= FORECAST_PAGES; index1 += 1) {
    const newPageElem = document.createElement('ul');
    newPageElem.id = `forecast-page-${index1}`;
    forecastDataSection.appendChild(newPageElem);
    const pageElem = document.getElementById(`forecast-page-${index1}`);

    for (let index2 = 1; index2 <= ELEMENTS_PER_PAGE; index2 += 1) {
      const newDataElem = document.createElement('li');
      pageElem.appendChild(newDataElem);
    }
  }
}

const message = {
  show: (message) => {
    messageElem.innerText = message;
  },
  hide: () => {
    messageElem.innerText = '';
  },
};

function setUnits() {
  if (document.getElementById('celcius').checked) {
    units = 'metric';
    tempSymbol = '&deg;C';
    speedUnit = 'km/h';
    mult = 3.6;
  } else {
    units = 'imperial';
    tempSymbol = '&deg;F';
    speedUnit = 'mph';
    mult = 1;
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

function showCurrentData({ main, name, sys, weather, wind }) {
  const localDateTime = DateTime.now();
  const imgURL = `https://www.countryflags.io/${sys.country}/shiny/24.png`;
  const date = localDateTime.toLocaleString(DateTime.DATE_HUGE);
  const time = localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
  const temperature = Math.round(main.temp);
  const minTemp = `${Math.round(main.temp_min)} ${tempSymbol}`;
  const maxTemp = `${Math.round(main.temp_max)} ${tempSymbol}`;
  const descText =
    weather[0].description.charAt(0).toUpperCase() + weather[0].description.slice(1);
  const humidityText = `Humidity levels at: ${main.humidity}%`;
  const windSpeedText = `Winds at: ${Math.round(wind.speed * mult)} ${speedUnit}`;

  const cityNameElems = document.getElementsByClassName('city-name');
  cityNameElems[0].innerText = name;
  cityNameElems[1].innerText = name;
  const countryFlagImgs = document.getElementsByClassName('country-flag');
  countryFlagImgs[0].src = imgURL;
  countryFlagImgs[1].src = imgURL;
  document.getElementById('date').innerText = date;
  document.getElementById('time').innerText = time;
  document.getElementById('temperature').innerText = temperature;
  document.getElementById('min-temp').innerHTML = minTemp;
  document.getElementById('max-temp').innerHTML = maxTemp;
  document.getElementById('temp-symbol').innerHTML = tempSymbol;
  document.getElementById('weather-description').innerText = descText;
  document.getElementById('humidity').innerText = humidityText;
  document.getElementById('wind-speed').innerText = windSpeedText;

  const weatherDataElem = document.getElementById('current-data');
  weatherDataElem.style.display = 'flex';
}

function showForecastData({ list }) {
  const localDateTime = list.map((obj) => DateTime.fromSeconds(obj.dt));
  const dataElems = document.getElementsByTagName('li');

  for (let i = 0; i < list.length; i++) {
    const weekday = localDateTime[i].weekdayShort.toUpperCase();
    const day = localDateTime[i].day;
    const time = localDateTime[i].toLocaleString(DateTime.TIME_24_SIMPLE);
    const humidity = list[i].main.humidity;
    const windSpeed = Math.round(list[i].wind.speed * mult);
    const temperature = Math.round(list[i].main.temp);

    dataElems[i].innerHTML = `
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
        <span class="fs-smaaller">H: ${humidity}% W: ${windSpeed} ${speedUnit}</span>
      </div>
      <div>
        <span class="mr-med">${temperature} ${tempSymbol}</span>
        <img class="icon" src="./svg/sun.svg" alt="">
      </div>
    `;

    if (i === FORECAST_PAGES * ELEMENTS_PER_PAGE - 1) break;
  }

  forecastDataSection.style.display = 'flex';
}

async function loadWeatherData() {
  message.show('loading...');
  setUnits();
  const searchTerm = searchInput.value;
  const data = [
    fetchCurrentData(searchTerm, units),
    fetchForecastData(searchTerm, units),
  ];
  const result = await Promise.all(data);

  // console.log(result);

  let timeZoneOffset = result[0].timezone / 3600;
  if (timeZoneOffset > 0) timeZoneOffset = `+${timeZoneOffset}`;
  Settings.defaultZoneName = `UTC${timeZoneOffset}`;
  showCurrentData(result[0]);
  showForecastData(result[1]);
  message.hide();
}

const helpers = {
  show: () => {
    forecastHeader.style.top = 0;
    scrollButton.style.bottom = '10px';
    areHidden = false;
  },
  hide: () => {
    forecastHeader.style.top = '-100px';
    scrollButton.style.bottom = '-90px';
    areHidden = true;
  },
};

window.addEventListener('load', () => {
  Settings.defaultLocale = 'en-US';
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
  const FORECAST_HEADER_HEIGHT = 80;
  const targetOffset = forecastDataSection.offsetTop - FORECAST_HEADER_HEIGHT;

  if (window.pageYOffset >= targetOffset && areHidden) {
    helpers.show();
  } else if (window.pageYOffset < targetOffset && !areHidden) {
    helpers.hide();
  }
});

scrollButton.addEventListener('click', () => window.scroll(0, 0));
