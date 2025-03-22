// API key for OpenWeatherMap
const apiKey = '1e3e8f230b6064d27976e41163a82b77'; // Replace with your actual API key

// DOM elements
const container = document.querySelector('.container');
const searchBox = document.querySelector('.search-box');
const searchInput = document.querySelector('.search-box input');
const searchButton = document.querySelector('.search-box button');
const weatherBox = document.querySelector('.weather-box');
const weatherDetails = document.querySelector('.weather-details');
const notFoundError = document.querySelector('.not-found');
const forecastContainer = document.querySelector('.forecast-container');
const forecastBoxes = document.querySelector('.forecast-boxes');

// Function to get weather icon based on weather condition
function getWeatherIcon(code) {
  if (code >= 200 && code < 300) {
    return 'images/thunder.png';
  } else if ((code >= 300 && code < 400) || (code >= 500 && code < 600)) {
    return 'images/rain.png';
  } else if (code >= 600 && code < 700) {
    return 'images/snow.png';
  } else if (code >= 700 && code < 800) {
    return 'images/mist.png';
  } else if (code === 800) {
    return 'images/clear.png';
  } else if (code > 800) {
    return 'images/clouds.png';
  }
  return 'images/unknown.png';
}

// Function to format date
function formatDate(timestamp) {
  const date = new Date(timestamp * 1000);
  const options = { weekday: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Function to search for weather
async function searchWeather() {
  const city = searchInput.value.trim();
  
  if (city === '') {
    return;
  }
  
  try {
    // Reset display
    weatherBox.style.scale = 0;
    weatherDetails.style.scale = 0;
    forecastContainer.style.scale = 0;
    notFoundError.style.display = 'none';
    
    // Fetch current weather data
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    
    if (!currentResponse.ok) {
      throw new Error('City not found');
    }
    
    const currentData = await currentResponse.json();
    
    // Update current weather UI
    updateCurrentWeather(currentData);
    
    // Fetch forecast data
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`
    );
    
    if (!forecastResponse.ok) {
      throw new Error('Forecast data not available');
    }
    
    const forecastData = await forecastResponse.json();
    
    // Update forecast UI
    updateForecast(forecastData);
    
    // Show all weather content with animation
    weatherBox.classList.add('fadeIn');
    weatherDetails.classList.add('fadeIn');
    forecastContainer.classList.add('fadeIn');
    
  } catch (error) {
    console.error('Error fetching weather data:', error);
    notFoundError.style.display = 'block';
    notFoundError.classList.add('fadeIn');
  }
}

// Function to update current weather UI
function updateCurrentWeather(data) {
  const image = weatherBox.querySelector('img');
  const temperature = weatherBox.querySelector('.temperature');
  const description = weatherBox.querySelector('.description');
  const humidity = document.querySelector('.humidity span');
  const wind = document.querySelector('.wind span');
  
  // Set weather icon
  image.src = getWeatherIcon(data.weather[0].id);
  
  // Set temperature and description
  temperature.innerHTML = `${parseInt(data.main.temp)}<span>°C</span>`;
  description.textContent = data.weather[0].description;
  
  // Set humidity and wind speed
  humidity.textContent = `${data.main.humidity}%`;
  wind.textContent = `${parseInt(data.wind.speed)} km/h`;
}

// Function to update forecast UI
function updateForecast(data) {
  // Clear previous forecast
  forecastBoxes.innerHTML = '';
  
  // Filter forecast data to get one entry per day (noon)
  const dailyForecast = data.list.filter(item => {
    const date = new Date(item.dt * 1000);
    return date.getHours() === 12;
  }).slice(0, 5); // Get max 5 days
  
  // Create forecast boxes
  dailyForecast.forEach(day => {
    const forecastBox = document.createElement('div');
    forecastBox.classList.add('forecast-box');
    
    forecastBox.innerHTML = `
      <div class="date">${formatDate(day.dt)}</div>
      <img src="${getWeatherIcon(day.weather[0].id)}" alt="${day.weather[0].description}">
      <div class="temp">${parseInt(day.main.temp)}°C</div>
      <div class="desc">${day.weather[0].description}</div>
    `;
    
    forecastBoxes.appendChild(forecastBox);
  });
}

// Event listeners
searchButton.addEventListener('click', searchWeather);
searchInput.addEventListener('keypress', event => {
  if (event.key === 'Enter') {
    searchWeather();
  }
});

// Load default city on page load (optional)
window.addEventListener('load', () => {
  searchInput.value = 'London'; // Default city
  searchWeather();
});