# True Climate Weather Application

Hello all! My name is Sa'Cairo Bonner and this here is a responsive weather application built with HTML, CSS, and JavaScript that provides current weather conditions and a 5-day forecast. I had to come up with a website idea for my classroom project and ultimately fell upon revamping my previous weather app that I created two years prior but sadly consisted of broken URL links, poor structure, & lacklsuter API security.

## Features

### Core Features

- **Search Functionality**: Enter any city name to get weather data
- **Current Weather Display**: Shows temperature, weather condition, humidity, wind speed, and more
- **5-Day Forecast**: Daily forecast cards with high/low temperatures and weather icons
- **API Integration**: Uses OpenWeatherMap API for real-time weather data
- **Responsive Design**: Mobile-first design that works on all screen sizes

### Additional Features

- **Weather-based Backgrounds**: Background changes based on weather conditions
- **Geolocation**: Get weather for your current location with one click
- **Dark Theme**: Beautiful dark theme design for better viewing experience
- **Local Storage**: Remembers your last searched city

## Setup Instructions

1. **Get an API Key**:
   - Visit [OpenWeatherMap](https://home.openweathermap.org/users/sign_up)
   - Sign up for a free account
   - Get your API key

2. **Open the App**:
   - Simply open `index.html` in your web browser
   - The app will prompt you to enter your API key on first use

3. **Enter Your API Key**:
   - When you first open the app, you'll see a setup screen
   - Enter your OpenWeatherMap API key in the input field
   - Click "Save" to store it securely in your browser
   - Your API key is stored locally using the localstorage variable in javascript and thus never shared outside of your browser

## Usage

1. **First Time Setup**: Enter your OpenWeatherMap API key when prompted
2. **Search for Weather**: Enter a city name (e.g. Wellington, NZ / Wellington, New Zealand) and click the search button or press Enter
3. **Use Current Location**: Click the location button to get weather for your current position
4. **View Forecast**: Scroll down to see the 5-day forecast below the current weather

## Security Features

- **No API Key in Code**: Your API key is never stored in the source code
- **Local Storage**: API key is stored securely in your browser's localStorage
- **Client-Side Only**: All API calls are made directly from your browser
- **No Server Required**: The app runs entirely in your browser

## Browser Support

- Chrome (recommended)
- Firefox
- Safari (with webkit prefixes)
- Edge
- Mobile browsers

## API Limits

The free OpenWeatherMap API has limits:

- 1,000 calls per day
- 60 calls per minute

For development and personal use, this should be more than sufficient.

## File Structure

```text
TrueClimate/
├── index.html          # Main HTML structure
├── css/
│   └── styles.css      # CSS styling and responsive design
├── js/
│   └── script.js       # JavaScript functionality
└── README.md           # This file
```

## Technologies Used

- **HTML**: Semantic markup and accessibility
- **CSS**: Modern styling with flexbox, grid, and animations
- **JavaScript**: Modern JavaScript with classes and async/await
- **OpenWeatherMap API**: Weather data source
- **Font Awesome**: Icons

## Customization

You can easily customize the app by:

- Modifying colors in `styles.css`
- Adding new weather conditions
- Changing the forecast period
- Adding more weather details
