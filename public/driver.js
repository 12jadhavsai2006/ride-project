// 🔥 Connect to socket
const socket = io();

// Fetch rides
async function getRides() {
    const res = await fetch("/rides");
    const rides = await res.json();

    const list = document.getElementById("rideList");
    list.innerHTML = "";

    rides.forEach(r => {
        const li = document.createElement("li");

        const statusText = r.status === "accepted"
            ? "Driver Assigned 🚗"
            : "Waiting ⏳";

        li.innerHTML = `
            <b>${r.pickup}</b> → <b>${r.drop}</b><br>
            Fare: ₹${r.fare}<br>
            Status: ${statusText}
        `;

        if (r.status === "pending") {
            const btn = document.createElement("button");
            btn.textContent = "Accept 🚗";

            btn.onclick = async () => {
                await fetch(`/ride/${r._id}`, { method: "PUT" });
            };

            li.appendChild(btn);
        }

        list.appendChild(li);
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