# RiaTWA

## Environmental Variables Setup

The application uses environment variables to manage API keys and sensitive information.

1. Create a `.env` file in the root directory
2. Copy the variables from `.env.example` into your `.env` file
3. Replace the placeholder values with your actual API keys

Example:
```
VITE_WEATHER_API_KEY=your_openweathermap_api_key_here
```

**Important**: Never commit your `.env` file to version control.

**Note**: In Vite projects, environment variables must be prefixed with `VITE_` to be accessible in the browser.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```
