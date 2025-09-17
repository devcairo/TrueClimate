/*  Author: Sa'Cairo Bonner
   Create Date: 09/16/2025
   Class: ITN263
   Class Section: 601
   Assignment: Github project
   Purpose: To create a project of opur choosing and host it on github
   */

class WeatherApp {
    constructor() {
        this.apiKey = null; // Will be loaded from localStorage or user input for initial setup
        this.baseUrl = 'https://api.openweathermap.org/data/2.5';
        this.currentWeather = null;
        this.forecast = null;
        
        // Constants
        this.DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.FORECAST_DAYS = 7;
        this.API_KEY_STORAGE_KEY = 'weatherAppApiKey';
        this.LAST_CITY_STORAGE_KEY = 'lastSearchedCity';
        
        this.initializeApp();
    }

    initializeApp() {
        this.bindEvents();
        this.loadApiKey();
        this.loadLastSearchedCity();
    }

    bindEvents() {
        // API Key functionality
        const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
        const apiKeyInput = document.getElementById('apiKeyInput');
        
        saveApiKeyBtn.addEventListener('click', () => this.saveApiKey());
        apiKeyInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveApiKey();
            }
        });

        // Search functionality
        const searchBtn = document.getElementById('searchBtn');
        const cityInput = document.getElementById('cityInput');
        
        searchBtn.addEventListener('click', () => this.searchWeather());
        cityInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.searchWeather();
            }
        });

        // Location button
        const locationBtn = document.getElementById('locationBtn');
        locationBtn.addEventListener('click', () => this.getCurrentLocationWeather());

    }

    // DOM Utility Methods
    getElementById(id) {
        return document.getElementById(id);
    }

    toggleElementVisibility(elementId, isVisible) {
        const element = this.getElementById(elementId);
        if (isVisible) {
            element.classList.remove('hidden');
        } else {
            element.classList.add('hidden');
        }
    }

    setElementText(elementId, text) {
        this.getElementById(elementId).textContent = text;
    }

    setElementValue(elementId, value) {
        this.getElementById(elementId).value = value;
    }

    getElementValue(elementId) {
        return this.getElementById(elementId).value.trim();
    }

    // API Key Management
    loadApiKey() {
        const savedApiKey = localStorage.getItem(this.API_KEY_STORAGE_KEY);
        if (savedApiKey) {
            this.apiKey = savedApiKey;
            this.showSearchInterface();
        } else {
            this.showApiKeyInterface();
        }
    }

    saveApiKey() {
        const apiKey = this.getElementValue('apiKeyInput');
        
        if (!this.validateApiKey(apiKey)) {
            return;
        }

        this.apiKey = apiKey;
        localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
        this.showSearchInterface();
        this.hideError();
    }

    validateApiKey(apiKey) {
        if (!apiKey) {
            this.showError('Please enter a valid API key');
            return false;
        }

        if (apiKey.length < 20) { //API key length check as they tend to come in strings longer than 20 characters so here we'll check the length
            this.showError('API key appears to be too short. Please check and try again.');
            return false;
        }

        return true;
    }

    showApiKeyInterface() {
        this.toggleElementVisibility('apiKeySection', true);
        this.toggleElementVisibility('searchSection', false);
        this.toggleElementVisibility('currentWeather', false);
        this.toggleElementVisibility('forecastSection', false);
    }

    showSearchInterface() {
        this.toggleElementVisibility('apiKeySection', false);
        this.toggleElementVisibility('searchSection', true);
    }

    async searchWeather() {
        if (!this.validateApiKeyExists()) {
            return;
        }

        const city = this.getElementValue('cityInput');
        if (!this.validateCityInput(city)) {
            return;
        }

        this.showLoading();
        this.hideError();

        try {
            await this.fetchWeatherData(city);
            this.saveLastSearchedCity(city);
        } catch (error) {
            this.handleWeatherError(error);
        } finally {
            this.hideLoading();
        }
    }

    // Checking for API key existence
    validateApiKeyExists() {
        if (!this.apiKey) {
            this.showError('API key not found. Please refresh the page and enter your API key.');
            return false;
        }
        return true;
    }

    validateCityInput(city) {
        if (!city) {
            this.showError('Please enter a city name');
            return false;
        }
        return true;
    }

    // Centralized error handling
    handleWeatherError(error) {
        console.error('Error fetching weather data:', error);
        
        if (error.message.includes('401')) {
            this.showError('Invalid API key. Please check your key and try again.');
        } else if (error.message.includes('404')) {
            this.showError('City not found. Please try again.');
        } else if (error.message.includes('Failed to fetch')) {
            this.showError('Network error. Please check your connection and try again.');
        } else {
            this.showError('Unable to fetch weather data. Please try again.');
        }
    }

    async getCurrentLocationWeather() {
        if (!this.validateApiKeyExists()) {
            return;
        }

        if (!this.validateGeolocationSupport()) {
            return;
        }

        this.showLoading();
        this.hideError();

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    await this.fetchWeatherDataByCoords(latitude, longitude);
                } catch (error) {
                    this.handleWeatherError(error);
                } finally {
                    this.hideLoading();
                }
            },
            (error) => {
                this.hideLoading();
                this.handleGeolocationError(error);
            }
        );
    }

    validateGeolocationSupport() {
        if (!navigator.geolocation) {
            this.showError('Geolocation is not supported by this browser.');
            return false;
        }
        return true;
    }

    handleGeolocationError(error) {
        console.error('Geolocation error:', error);
        this.showError('Unable to access your location. Please search for a city instead.');
    }

    // Utility method to build API URLs
    buildWeatherUrls(query, isCoords = false) {
        const baseParams = `appid=${this.apiKey}&units=imperial`;
        const queryParam = isCoords ? `lat=${query.lat}&lon=${query.lon}` : `q=${query}`;
        
        return {
            current: `${this.baseUrl}/weather?${queryParam}&${baseParams}`,
            forecast: `${this.baseUrl}/forecast?${queryParam}&${baseParams}`
        };
    }

    // Utility method to fetch weather data from API
    async fetchWeatherFromApi(urls) {
        const [currentResponse, forecastResponse] = await Promise.all([
            fetch(urls.current),
            fetch(urls.forecast)
        ]);

        if (!currentResponse.ok || !forecastResponse.ok) {
            const currentError = await currentResponse.text();
            const forecastError = await forecastResponse.text();
            console.error('API Error - Current Weather:', currentError);
            console.error('API Error - Forecast:', forecastError);
            throw new Error('Failed to fetch weather data');
        }

        return {
            current: await currentResponse.json(),
            forecast: await forecastResponse.json()
        };
    }

    // Main weather data fetching method
    async fetchWeatherData(city) {
        this.logDebugInfo('City search', { city });
        const urls = this.buildWeatherUrls(city);
        this.logDebugInfo('API URLs', urls);
        
        const weatherData = await this.fetchWeatherFromApi(urls);
        this.processWeatherData(weatherData);
    }

    async fetchWeatherDataByCoords(lat, lon) {
        this.logDebugInfo('Coordinate search', { lat, lon });
        const urls = this.buildWeatherUrls({ lat, lon }, true);
        
        const weatherData = await this.fetchWeatherFromApi(urls);
        this.processWeatherData(weatherData);
    }

    // Process and display weather data
    processWeatherData(weatherData) {
        this.currentWeather = weatherData.current;
        this.forecast = weatherData.forecast;

        this.displayCurrentWeather();
        this.displayForecast();
        this.updateBackground(this.currentWeather.weather[0].main.toLowerCase());
    }

    // Debug logging utility
    logDebugInfo(context, data) {
        console.log(`Debug: ${context}`, data);
        if (context === 'City search') {
            console.log('Debug: API Key from app:', this.apiKey);
            console.log('Debug: API Key length:', this.apiKey?.length);
        }
    }

    displayCurrentWeather() {
        if (!this.currentWeather) return;

        const weather = this.currentWeather;
        
        // Update city name and date
        this.setElementText('cityName', `${weather.name}, ${weather.sys.country}`);
        this.setElementText('currentDate', this.formatDate(new Date()));
        
        // Update weather icon
        const weatherIcon = this.getElementById('weatherIcon');
        weatherIcon.src = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`;
        weatherIcon.alt = weather.weather[0].description;
        
        // Update weather description
        this.setElementText('weatherDescription', weather.weather[0].description);
        
        // Update temperature
        this.setElementText('temperature', `${Math.round(weather.main.temp)}°F`);
        
        // Update additional weather details
        this.setElementText('feelsLike', `${Math.round(weather.main.feels_like)}°F`);
        this.setElementText('humidity', `${weather.main.humidity}%`);
        this.setElementText('windSpeed', `${Math.round(weather.wind.speed * 3.6)} mph`);
        
        // Show current weather section
        this.toggleElementVisibility('currentWeather', true);
    }

    displayForecast() {
        if (!this.forecast) return;

        const forecastContainer = this.getElementById('forecastContainer');
        this.clearContainer(forecastContainer);

        const dailyForecasts = this.groupForecastByDay();
        const forecastCards = this.createForecastCards(dailyForecasts);
        
        forecastCards.forEach(card => forecastContainer.appendChild(card));
        
        // Show forecast section
        this.toggleElementVisibility('forecastSection', true);
    }

    // Grouping logic and data processing
    groupForecastByDay() {
        const dailyForecasts = {};
        
        this.forecast.list.forEach(item => {
            const date = new Date(item.dt * 1000);
            const dayKey = date.toDateString();
            
            if (!dailyForecasts[dayKey]) {
                dailyForecasts[dayKey] = {
                    maxTemp: item.main.temp_max,
                    minTemp: item.main.temp_min,
                    icon: item.weather[0].icon,
                    description: item.weather[0].description,
                    date: date
                };
            } else {
                // Update max/min temps
                dailyForecasts[dayKey].maxTemp = Math.max(
                    dailyForecasts[dayKey].maxTemp, 
                    item.main.temp_max
                );
                dailyForecasts[dayKey].minTemp = Math.min(
                    dailyForecasts[dayKey].minTemp, 
                    item.main.temp_min
                );
                
                // Here we're using the most recent weather description for the day
                if (item.dt > dailyForecasts[dayKey].date.getTime() / 1000) {
                    dailyForecasts[dayKey].description = item.weather[0].description;
                }
            }
        });
        
        return dailyForecasts;
    }

    // Create forecast cards
    createForecastCards(dailyForecasts) {
        const today = new Date();
        const cards = [];
        
        for (let i = 0; i < this.FORECAST_DAYS; i++) {
            const forecastDate = new Date(today);
            forecastDate.setDate(today.getDate() + i);
            const dayKey = forecastDate.toDateString();
            
            const dayForecast = dailyForecasts[dayKey];
            if (!dayForecast) continue;

            const card = this.createForecastCard(forecastDate, dayForecast, i === 0);
            cards.push(card);
        }
        
        return cards;
    }

    // Create individual forecast card
    createForecastCard(forecastDate, dayForecast, isToday) {
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        const dayName = isToday ? 'Today' : this.DAYS_OF_WEEK[forecastDate.getDay()];
        const icon = dayForecast.icon;
        const highTemp = Math.round(dayForecast.maxTemp);
        const lowTemp = Math.round(dayForecast.minTemp);
        
        card.innerHTML = `
            <div class="forecast-day">${dayName}</div>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" 
                 alt="${dayForecast.description}" 
                 class="forecast-icon"
                 title="${dayForecast.description}">
            <div class="forecast-temps">
                <span class="forecast-high">${highTemp}°</span>
                <span class="forecast-low">${lowTemp}°</span>
            </div>
        `;
        
        return card;
    }

    // Utility method to clear container
    clearContainer(container) {
        container.innerHTML = '';
    }

    updateBackground(weatherCondition) {
        // Remove existing weather classes
        document.body.className = document.body.className.replace(/clear|clouds|rain|snow|thunderstorm|mist|fog/g, '');
        
        // Add new weather class
        if (weatherCondition) {
            document.body.classList.add(weatherCondition);
        }
    }

    formatDate(date) {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
    }

    showLoading() {
        this.toggleElementVisibility('loadingSpinner', true);
        this.toggleElementVisibility('currentWeather', false);
        this.toggleElementVisibility('forecastSection', false);
    }

    hideLoading() {
        this.toggleElementVisibility('loadingSpinner', false);
    }

    showError(message) {
        this.setElementText('errorMessage', message);
    }

    hideError() {
        this.setElementText('errorMessage', '');
    }

    // Local Storage functionality
    saveLastSearchedCity(city) {
        localStorage.setItem(this.LAST_CITY_STORAGE_KEY, city);
    }

    loadLastSearchedCity() {
        const lastCity = localStorage.getItem(this.LAST_CITY_STORAGE_KEY);
        if (lastCity) {
            this.setElementValue('cityInput', lastCity);
            // Auto-searches for the last city when the page is loaded
            this.searchWeather();
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherApp();
});

// Some helpful console messages for debugging
console.log('Weather App loaded successfully!');
console.log('Enter your OpenWeatherMap API key in the app interface');
console.log('Get your free API key at: https://openweathermap.org/api');
console.log('Your API key is stored securely in your browser\'s localStorage');
