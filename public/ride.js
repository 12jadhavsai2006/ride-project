// ==========================
// ride.js - User Dashboard
// ==========================

// MAP SETUP
let map = L.map('map').setView([19.0760, 72.8777], 10); // Mumbai default

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

let markers = [];

// ===== BOOK RIDE =====
document.getElementById("rideForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const pickup = document.getElementById("pickup").value;
    const drop = document.getElementById("drop").value;

    // Get coordinates
    const pRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${pickup}`);
    const dRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${drop}`);
    const pData = await pRes.json();
    const dData = await dRes.json();

    if (!pData.length || !dData.length) {
        alert("Location not found ❌");
        return;
    }

    const pLat = parseFloat(pData[0].lat);
    const pLon = parseFloat(pData[0].lon);
    const dLat = parseFloat(dData[0].lat);
    const dLon = parseFloat(dData[0].lon);

    // Clear old markers
    markers.forEach(m => map.removeLayer(m));
    markers = [];

    // Add markers
    const pickupMarker = L.marker([pLat, pLon]).addTo(map).bindPopup("📍 Pickup").openPopup();
    const dropMarker = L.marker([dLat, dLon]).addTo(map).bindPopup("🏁 Drop");
    markers.push(pickupMarker, dropMarker);

    map.fitBounds(L.featureGroup([pickupMarker, dropMarker]).getBounds());

    // Calculate fare
    const distance = getDistance(pLat, pLon, dLat, dLon);
    const fare = Math.round(distance * 10);

    document.getElementById("fare").innerText = `Distance: ${distance.toFixed(2)} km | Fare: ₹${fare}`;

    // Send to server
    await fetch("/ride", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pickup, drop, fare })
    });

    // Refresh rides
    getRides();
});

// ===== DISTANCE FUNCTION =====
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ===== FETCH USER RIDES =====
async function getRides() {
    const res = await fetch("/rides");
    const rides = await res.json();

    const list = document.getElementById("rideList");
    list.innerHTML = "";

    rides.forEach(r => {
        const li = document.createElement("li");
        li.style.background = "white";
        li.style.margin = "10px auto";
        li.style.padding = "10px";
        li.style.width = "300px";
        li.style.borderRadius = "8px";
        li.style.boxShadow = "0 0 5px gray";

        const statusText = r.status === "accepted" ? "Driver Assigned 🚗" : "Ride Booked ⏳";

        li.innerHTML = `
            <b>${r.pickup}</b> → <b>${r.drop}</b><br>
            Fare: ₹${r.fare}<br>
            Status: ${statusText}
        `;

        // Delete button
        const btn = document.createElement("button");
        btn.textContent = "Delete ❌";
        btn.onclick = async () => {
            await fetch(`/ride/${r._id}`, { method: "DELETE" });
            getRides();
        };

        li.appendChild(btn);
        list.appendChild(li);
    });
}

// Auto-refresh every 3 seconds for live updates
setInterval(getRides, 3000);
window.onload = getRides;