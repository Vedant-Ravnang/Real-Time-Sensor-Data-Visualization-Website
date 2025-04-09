function showContent(contentId) {
    // Hide both content sections
    document.getElementById("content1").style.display = "none";
    document.getElementById("content2").style.display = "none";

    // Show the selected content section
    document.getElementById(contentId).style.display = "block";
}

function showPage3Box() {
    
    const page3Box = document.getElementById("page3-box");
    if (page3Box) {
        page3Box.style.display = "block";
    }
}

function switchGraph(chartId) {

    document.getElementById('currentChart').style.display = 'none';
    document.getElementById('powerChart').style.display = 'none';
    document.getElementById('busVoltageChart').style.display = 'none';

    // Show the selected chart
    document.getElementById(chartId).style.display = 'block';
}


let currentChartIndex = 0;
const chartCanvases = [
    document.getElementById('currentChart'),
    document.getElementById('powerChart'),
    document.getElementById('busVoltageChart')
];

function showChart(index) {
    // Loop through all charts and show only the selected one
    chartCanvases.forEach((chart, i) => {
        chart.style.display = i === index ? 'block' : 'none';
    });
}

function nextChart() {
    currentChartIndex = (currentChartIndex + 1) % chartCanvases.length;
    showChart(currentChartIndex);
}

function prevChart() {
    currentChartIndex = (currentChartIndex - 1 + chartCanvases.length) % chartCanvases.length;
    showChart(currentChartIndex);
}


showChart(currentChartIndex);


document.addEventListener("DOMContentLoaded", showPage3Box);


let isGlobeVisible = true;
let map;
let globePinAdded = false;

function toggleGlobe() {
    
    const globeCanvas = document.getElementById("globe");
    const mapContainer = document.getElementById("map");

    if (isGlobeVisible) {
        // Hide the globe and show the map
        globeCanvas.style.display = "none";
        mapContainer.style.display = "block";

        
        if (!map) {
            map = L.map('map').setView([18.6605, 73.7183], 16);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(map);
        }

        // Add a marker to the map
        L.marker([18.6605, 73.7183]).addTo(map)
            .bindPopup("Live Location")
            .openPopup();

    } else {
        // Show the globe and hide the map
        globeCanvas.style.display = "block";
        mapContainer.style.display = "none";

        // Add a pin to the globe if the function is available
        if (typeof addPinToGlobe === "function") {
            addPinToGlobe(18.6605, 73.7183);
        } else {
            console.error("addPinToGlobe is not defined.");
        }
    }

    // Toggle the visibility state
    isGlobeVisible = !isGlobeVisible;
}

let ws; 
let lastReceivedTime = Date.now(); // Track last received data time
let reconnectDelay = 2000; // Delay for reconnecting WebSocket (2 seconds)


const ctx = document.getElementById('currentChart').getContext('2d');
const ctx1 = document.getElementById('powerChart').getContext('2d');
const ctx2 = document.getElementById('busVoltageChart').getContext('2d');

// Chart one (Current)
const currentChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [], 
        datasets: [{
            label: 'Current (mA)',
            data: [],
            borderColor: 'blue',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: 'white' } 
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (s)", 
                    color: "white",
                    font: { size: 16 }
                },
                ticks: { color: "white" } 
            },
            y: {
                title: {
                    display: true,
                    text: "Current (mA)", 
                    color: "white",
                    font: { size: 16 }
                },
                ticks: { color: "white" }, 
                grid: {
                    color: "rgba(255, 255, 255, 0.1)", 
                    lineWidth: 1.5,
                    drawBorder: false
                }
            }
        },
        animation: {
            duration: 800, // Animation duration
            easing: "easeInOutQuad" 
        }
    }
});

// Chart two (Power)
const powerChart = new Chart(ctx1, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Power (mW)',
            data: [],
            borderColor: 'blue',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: 'white' } 
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (s)", 
                    color: "white",
                    font: { size: 16 }
                },
                ticks: { color: "white" }
            },
            y: {
                title: {
                    display: true,
                    text: "Power (mW)", 
                    color: "white",
                    font: { size: 16 }
                },
                ticks: { color: "white" },
                grid: {
                    color: "rgba(255, 255, 255, 0.1)", 
                    lineWidth: 1.5,
                    drawBorder: false
                }
            }
        },
        animation: {
            duration: 800,
            easing: "easeInOutQuad"
        }
    }
});

// Chart three (Bus Voltage)
const busVoltageChart = new Chart(ctx2, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Bus Voltage (V)',
            data: [],
            borderColor: 'blue',
            borderWidth: 2,
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: { color: 'white' } 
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (s)", 
                    color: "white",
                    font: { size: 16 }
                },
                ticks: { color: "white" }
            },
            y: {
                title: {
                    display: true,
                    text: "Bus Voltage (V)", 
                    color: "white",
                    font: { size: 16 }
                },
                ticks: { color: "white" },
                grid: {
                    color: "rgba(255, 255, 255, 0.1)", 
                    lineWidth: 1.5,
                    drawBorder: false
                }
            }
        },
        animation: {
            duration: 800,
            easing: "easeInOutQuad"
        }
    }
});

// Function to update charts with new data
function updateCharts(currentValue, powerValue, voltageValue) {
    const timeLabel = new Date().toLocaleTimeString(); // Get current time for X-axis

    function addData(chart, value) {
        // Limit data points to 20 for better visualization
        if (chart.data.labels.length > 20) {
            chart.data.labels.shift();
            chart.data.datasets[0].data.shift();
        }
        if (!isNaN(value)) { // Only add valid numerical values
            chart.data.labels.push(timeLabel);
            chart.data.datasets[0].data.push(value);
            chart.update();
        }
    }

    addData(currentChart, currentValue);
    addData(powerChart, powerValue);
    addData(busVoltageChart, voltageValue);
}

// Function to establish WebSocket connection
function connectWebSocket() {
    ws = new WebSocket("wss://your-websocket-server-url/ws");

    ws.onopen = function () {
        document.getElementById("statusIndicator").innerText = "Connected";
        document.getElementById("statusIndicator").style.backgroundColor = "green";
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);
        lastReceivedTime = Date.now(); // Update last received time

        // Update UI elements with received data
        document.getElementById("busVoltage").innerText = "Bus Voltage: " + data.busVoltage + " V";
        document.getElementById("current").innerText = "Current: " + data.current + " mA";
        document.getElementById("power").innerText = "Power: " + data.power + " mW";
        document.getElementById("shuntVoltage").innerText = "Shunt Voltage: " + data.shuntVoltage + " mV";
        document.getElementById("loadVoltage").innerText = "Load Voltage: " + data.loadVoltage + " V";

        // Update charts with new data
        updateCharts(data.current, data.power, data.busVoltage);
    };

    ws.onerror = function () {
        console.error("WebSocket Error"); // Log WebSocket errors
    };

    ws.onclose = function () {
        document.getElementById("statusIndicator").innerText = "Disconnected";
        document.getElementById("statusIndicator").style.backgroundColor = "red";
        console.log("WebSocket closed. Reconnecting in " + (reconnectDelay / 1000) + " seconds...");
        setTimeout(connectWebSocket, reconnectDelay); // Attempt reconnection
    };
}

// Periodically check if data is received every 3 seconds
setInterval(() => {
    let timeSinceLastData = Date.now() - lastReceivedTime;
    if (timeSinceLastData > 3000) { // If no data received for 3 seconds
        console.log("No data received for 3 seconds, marking as disconnected...");
        document.getElementById("statusIndicator").innerText = "Disconnected";
        document.getElementById("statusIndicator").style.backgroundColor = "red";
        ws.close(); // Close WebSocket connection
    }
}, 3000);

// Start WebSocket connection
connectWebSocket();
