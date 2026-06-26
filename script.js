const cityInput = document.querySelector(".city-input");
const searchBtn = document.querySelector(".search-btn");

const notFoundSection = document.querySelector(".not-found");
const searchCitySection = document.querySelector(".search-city");
const weatherInfoSection = document.querySelector(".weather-info");
const forecastItemsContainer = document.querySelector(".forecast-items-container");

const countryTxt = document.querySelector(".country-txt");
const tempTxt = document.querySelector(".temp-txt");
const conditionTxt = document.querySelector(".condition-txt");
const humidityValueTxt = document.querySelector(".humidity-value");
const windValueTxt = document.querySelector(".wind-speed-value");
const weatherSummaryimg = document.querySelector(".weather-summary-img");
const currentDateTxt = document.querySelector(".current-date-txt");

const apiKey = '694eee379de926eaef625f4d9066cf7d';


searchBtn.addEventListener("click", () => {
    if (cityInput.value.trim() != "") {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = "";
        cityInput.blur();
    }
});

cityInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter" && cityInput.value.trim() != "") {
        updateWeatherInfo(cityInput.value.trim());
        cityInput.value = "";
        cityInput.blur();
    }
});

async function getFetchData(endpoint, city, locData) {
    const lat = locData.lat;
    const lon = locData.lon;
    const apiUrl = `https://api.openweathermap.org/data/2.5/${endpoint}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(apiUrl)
    return await response.json();
}

function getWeatherIcon(weatherId) {
    if (weatherId >= 200 && weatherId <= 232) {
        return "thunderstorm.svg";
    }
    if (weatherId >= 300 && weatherId <= 321) {
        return "drizzle.svg";
    }
    if (weatherId >= 500 && weatherId <= 531) {
        return "rain.svg";
    }
    if (weatherId >= 600 && weatherId <= 622) {
        return "snow.svg";
    }
    if (weatherId >= 701 && weatherId <= 781) {
        return "atmosphere.svg";
    }
    if (weatherId === 800) {
        return "clear.svg";
    }
    if (weatherId >= 801 && weatherId <= 804) {
        return "clouds.svg";
    }

    else return "atmosphere.svg";
    // Add more conditions for other weather types
}

async function updateWeatherInfo(city) {
    // Implementation for updating weather information
    const loc = `http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    const locResponse = await fetch(loc);
    const locData = await locResponse.json();
    if (locData.length === 0) {
        showDisplaySection(notFoundSection);
        return;
    }
    const lat = locData[0].lat;
    const lon = locData[0].lon;
    const ldata = { lat, lon };


    const weatherData = await getFetchData('weather', city, ldata);

    if (weatherData.cod != 200) {
        showDisplaySection(notFoundSection);
        return;
    }

    const {
        name: country,
        main: { temp, humidity },
        weather: [{ id, main }],
        wind: { speed }
    } = weatherData;

    countryTxt.textContent = country;
    tempTxt.textContent = Math.round(temp) + "°C";
    conditionTxt.textContent = main;
    humidityValueTxt.textContent = humidity + "%";
    windValueTxt.textContent = speed + " m/s";
    weatherSummaryimg.src = `assets/weather/${getWeatherIcon(id)}`;

    currentDateTxt.textContent = getCurrentDate();

    await updateForecastInfo(city, ldata);

    showDisplaySection(weatherInfoSection);
}

async function updateForecastInfo(city, ldata) {

    // Implementation for updating forecast information
    const forecastData = await getFetchData('forecast', city, ldata);

    const timeTaken = '12:00:00';
    const todate = new Date().toISOString().split('T')[0];
    forecastItemsContainer.innerHTML = "";
    forecastData.list.forEach(forecastWeather => {
        if (forecastWeather.dt_txt.includes(timeTaken) && !forecastWeather.dt_txt.includes(todate)) {
            updateForecastItem(forecastWeather);
        }
    }
    )

}

function updateForecastItem(weatherData) {
    const {
        dt_txt: date,
        weather: [{ id }],
        main: { temp }
    } = weatherData;
    const dateTaken = new Date(date);
    const dateOptions = { month: 'short', day: '2-digit' };

    const forecastItem = `
        <div class="forecast-item">
            <h5 class="forecast-item-date regular-txt">${dateTaken.toLocaleDateString('en-US', dateOptions)}</h5>
            <img src="assets/weather/${getWeatherIcon(id)}" alt="Icon" class="forecast-item-img">
            <h5 class="forecast-item-temp">${Math.round(temp)}°C</h5>
        </div>
    `
    forecastItemsContainer.insertAdjacentHTML("beforeend", forecastItem);

}

function getCurrentDate() {
    const date = new Date();
    const options = { weekday: 'short', month: 'short', day: '2-digit' };
    return date.toLocaleDateString('en-GB', options);
}

function showDisplaySection(section) {
    [weatherInfoSection, notFoundSection, searchCitySection].forEach(section => section.style.display = "none");

    section.style.display = "flex";
}