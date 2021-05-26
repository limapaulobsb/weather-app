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

searchButton.addEventListener('click', async () => {
  const cityName = searchInput.value;
  const data = await fetchWeatherData(cityName);
  console.log(data);
});
