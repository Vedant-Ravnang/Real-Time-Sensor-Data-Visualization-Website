

# Real-Time Sensor Data Visualization Website for a Cubesat (Team celestra)

# Project Status - Ongoing 

## Overview:
This is a real-time web application that visualizes sensor data in reak time from an ESP32 board. The website features an animated stars background mathching the theme of space. Second page displayes the live Data from on INA sensor (Power management Board) and visualize it dynamically in live charts.In future it will also feature live 3D visualization of cubesat using mpu6050 sensor. Third Page uses NEO-6M GPS module to visualize live loaction of the satelltie on a 3D Globe made uisng Three.js and Webgl.Users can navigate interact with the globe.User can also Toggle between 3D view and 2d view which uses Leaflet and openstreetmaps to create a Map.The map will diaplay the location in 2d view.

## Key Features : ( Present )
- **Live WebSocket Data Streaming**: Real-time communication with an ESP32 board using WebSockets, ensuring instant updates from all the sensors 

- **Dynamic Line Charts**: Animated Chart.js graphs for current (mA), power (mW), and bus voltage (V)

- **Status Indicator**: Visual feedback on WebSocket connection status (Connected/Disconnected) with auto-reconnect and timeout-based disconnect detection.

- **3D Earth Model**: Showcases a detailed 3D model of the Earth with a Pin , allowing users to visualize the location of Gps Senssor along with interactive controls 

- **2D Map**: Showcases an interactive 2D map to see the live location in 2d view  


## Technologies Used:
- **Frontend**: HTML, CSS, JavaScript  
- **Charts**: Chart.js  
- **Map**: Leaflet.js and openstreetmaps  
- **3D Globe**: Three.js, WebGL
- **Communication**: WebSocket (ESP32 to Browser)  
- **Deployment**: Netlify

## Purpose:
This project demonstrates the power of IoT in space applications by visualizing real-time CubeSat sensor data through a web-based dashboard. It allows users to monitor power, motion, and location data live , making space telemetry accessible, interactive, and insightful.

