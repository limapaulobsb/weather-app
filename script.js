import { Settings, DateTime } from './lib/luxon.min.js';

const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';
const ELEMENTS_PER_PAGE = 8;
const pageElems = document.getElementsByTagName('ul');
const pagesNumber = pageElems.length;
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const messageElem = document.querySelector('#message-container > p');
const forecastHeader = document.querySelector('section + header');
const scrollBackButton = document.getElementById('scroll-back');
const forecastDataContainer = document.querySelector('#forecast-data > div:first-child');
const scrollUpButton = document.getElementById('scroll-up');
const scrollDownButton = document.getElementById('scroll-down');

let areHidden = true;
let units, tempSymbol, speedUnit, mult;

function createForecastSingles() {
  for (const element of pageElems) {
    for (let i = 1; i <= ELEMENTS_PER_PAGE; i++) {
      const newDataElem = document.createElement('li');
      element.appendChild(newDataElem);
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

function getSourcePath(time, sunrise, sunset, weather) {
  let dayOrNight = 'night';
  const sunriseTime = DateTime.fromSeconds(sunrise).toLocaleString(
    DateTime.TIME_24_SIMPLE
  );
  const sunsetTime = DateTime.fromSeconds(sunset).toLocaleString(DateTime.TIME_24_SIMPLE);
  if (time >= sunriseTime && time < sunsetTime) dayOrNight = 'day';
  return `./svg/${dayOrNight}/${weather.toLowerCase()}.svg`;
}

function showCurrentData({ main, name, sys, weather, wind }) {
  const localDateTime = DateTime.now();
  const flagURL = `https://www.countryflags.io/${sys.country}/shiny/24.png`;
  const date = localDateTime.toLocaleString(DateTime.DATE_HUGE);
  const time = localDateTime.toLocaleString(DateTime.TIME_24_SIMPLE);
  const temperature = Math.round(main.temp);
  const iconPath = getSourcePath(time, sys.sunrise, sys.sunset, weather[0].main);
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
  countryFlagImgs[0].src = flagURL;
  countryFlagImgs[1].src = flagURL;
  document.getElementById('date').innerText = date;
  document.getElementById('time').innerText = time;
  document.getElementById('temperature').innerText = temperature;
  document.querySelector('.icon-large').src = iconPath;
  document.getElementById('min-temp').innerHTML = minTemp;
  document.getElementById('max-temp').innerHTML = maxTemp;
  document.getElementById('temp-symbol').innerHTML = tempSymbol;
  document.getElementById('weather-description').innerText = descText;
  document.getElementById('humidity').innerText = humidityText;
  document.getElementById('wind-speed').innerText = windSpeedText;

  const weatherDataElem = document.getElementById('current-data');
  weatherDataElem.style.display = 'flex';
}

function showForecastData({ city, list }) {
  const localDateTime = list.map((obj) => DateTime.fromSeconds(obj.dt));
  const dataElems = document.getElementsByTagName('li');

  for (let i = 0; i < list.length; i++) {
    const weekday = localDateTime[i].weekdayShort.toUpperCase();
    const day = localDateTime[i].day;
    const time = localDateTime[i].toLocaleString(DateTime.TIME_24_SIMPLE);
    const humidity = list[i].main.humidity;
    const windSpeed = Math.round(list[i].wind.speed * mult);
    const temperature = Math.round(list[i].main.temp);
    const iconPath = getSourcePath(
      time,
      city.sunrise,
      city.sunset,
      list[i].weather[0].main
    );

    dataElems[i].innerHTML = `
      <div>
        <div class="forecast-date mr-med">
          <span>${weekday}</span>
          <span>${day}</span>
        </div>
        <div class="forecast-time">
          <span>${time}</span>
        </div>
      </div>
      <div>
        <span>H: ${humidity}% W: ${windSpeed} ${speedUnit}</span>
      </div>
      <div>
        <span class="mr-med">${temperature} ${tempSymbol}</span>
        <img class="icon" src=${iconPath} alt="">
      </div>
    `;

    if (i === pagesNumber * ELEMENTS_PER_PAGE - 1) break;
  }

  const forecastDataSection = document.getElementById('forecast-data');
  forecastDataSection.style.display = 'flex';
}

async function loadWeatherData(searchTerm) {
  message.show('loading...');
  setUnits();

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
    scrollBackButton.style.bottom = '10px';
    areHidden = false;
  },
  hide: () => {
    forecastHeader.style.top = '-100px';
    scrollBackButton.style.bottom = '-90px';
    areHidden = true;
  },
};

window.addEventListener('load', () => {
  Settings.defaultLocale = 'en-US';
  createForecastSingles();
});

searchInput.addEventListener('keyup', (event) => {
  if (event.key === 'Enter') {
    loadWeatherData(searchInput.value);
  }
});

searchButton.addEventListener('click', () => {
  loadWeatherData(searchInput.value);
});

document.addEventListener('scroll', () => {
  const FORECAST_HEADER_HEIGHT = 80;
  const targetOffset = forecastDataContainer.offsetTop - FORECAST_HEADER_HEIGHT;

  if (window.pageYOffset >= targetOffset && areHidden) {
    helpers.show();
  } else if (window.pageYOffset < targetOffset && !areHidden) {
    helpers.hide();
  }
});

scrollBackButton.addEventListener('click', () => window.scroll(0, 0));

scrollUpButton.addEventListener('click', () => {
  forecastDataContainer.scrollBy(0, -forecastDataContainer.offsetHeight);
});

scrollDownButton.addEventListener('click', () => {
  forecastDataContainer.scrollBy(0, forecastDataContainer.offsetHeight);
});

forecastDataContainer.addEventListener('scroll', () => {
  scrollDownButton.style.opacity = 1;
  scrollUpButton.style.opacity = 1;

  const scrollLimit = forecastDataContainer.offsetHeight * (pagesNumber - 1);

  if (forecastDataContainer.scrollTop === scrollLimit) {
    scrollDownButton.style.opacity = 0.5;
  } else if (forecastDataContainer.scrollTop === 0) {
    scrollUpButton.style.opacity = 0.5;
  }
});
