const API_KEY = 'd3d6d3e42626a9197b7d1fd4072ddd88';

async function getWeatherData(searchTerm) {
  try {
    const response = await fetch(
      `http://api.openweathermap.org/data/2.5/weather?q=${searchTerm}&appid=${API_KEY}`
    );
    return await response.json();
  } catch (error) {
    console.log(error);
  }
}

const searchButton = document.getElementById('search-button');
const searchInput = document.getElementById('search-input');

searchButton.addEventListener('click', async () => {
  const searchTerm = searchInput.value;
  const data = await getWeatherData(searchTerm);
  console.log(data);
});
