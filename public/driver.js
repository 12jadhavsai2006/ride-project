// Fetch and display rides for driver
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
        li.style.width = "350px";
        li.style.borderRadius = "8px";
        li.style.boxShadow = "0 0 5px gray";

        const statusText = r.status === "accepted" ? "Driver Assigned 🚗" : "Waiting ⏳";

        li.innerHTML = `
            <b>${r.pickup}</b> → <b>${r.drop}</b><br>
            Fare: ₹${r.fare}<br>
            Status: ${statusText}
        `;

        // Only show Accept button if pending
        if (r.status === "pending") {
            const btn = document.createElement("button");
            btn.textContent = "Accept 🚗";

            btn.onclick = async () => {
                await fetch(`/ride/${r._id}`, { method: "PUT" });
                getRides();
            };

            li.appendChild(btn);
        }

        list.appendChild(li);
    });
}

// Auto-load and refresh rides every 5 seconds
window.onload = getRides;
setInterval(getRides, 5000);