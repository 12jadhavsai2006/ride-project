// 🔥 Connect to socket
const socket = io();

// Fetch rides
async function getRides() {
    const res = await fetch("/rides");
    const rides = await res.json();

    const list = document.getElementById("rideList");
    list.innerHTML = "";

    rides.forEach(r => {
        const card = document.createElement("div");
        card.className = "ride-card";

        const statusClass = r.status === "accepted" ? "accepted" : "pending";
        const statusText = r.status === "accepted" ? "Driver Assigned 🚗" : "Waiting ⏳";

        card.innerHTML = `
            <div class="route">${r.pickup} → ${r.drop}</div>
            <div class="details">Fare: ₹${r.fare}</div>
            <div class="status ${statusClass}">${statusText}</div>
        `;

        if (r.status === "pending") {
            const btn = document.createElement("button");
            btn.textContent = "Accept Ride";

            btn.onclick = async () => {
                await fetch(`/ride/${r._id}`, { method: "PUT" });
            };

            card.appendChild(btn);
        }

        list.appendChild(card);
    });
}

// Initial load
window.onload = getRides;

// 🔥 REAL-TIME LISTENERS
socket.on("newRide", () => {
    console.log("New ride received ⚡");
    getRides();
});

socket.on("rideUpdated", () => {
    console.log("Ride updated ⚡");
    getRides();
});