let map = L.map('map').setView([19.0760, 72.8777], 10);

// Map tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

// Handle form
document.getElementById("rideForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const pickup = document.getElementById("pickup").value;
    const drop = document.getElementById("drop").value;

    // Convert to coordinates using free API
    const pickupRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`);
    const pickupData = await pickupRes.json();

    const dropRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${drop}`);
    const dropData = await dropRes.json();

    if (pickupData.length === 0 || dropData.length === 0) {
        alert("Location not found ❌");
        return;
    }

    const pLat = pickupData[0].lat;
    const pLon = pickupData[0].lon;

    const dLat = dropData[0].lat;
    const dLon = dropData[0].lon;

    // Add markers
    L.marker([pLat, pLon]).addTo(map).bindPopup("Pickup").openPopup();
    L.marker([dLat, dLon]).addTo(map).bindPopup("Drop");

    // Zoom to fit both points
    const group = L.featureGroup([
        L.marker([pLat, pLon]),
        L.marker([dLat, dLon])
    ]);
    map.fitBounds(group.getBounds());
});