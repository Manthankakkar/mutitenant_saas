const token = localStorage.getItem('token');
if (!token) window.location = 'login.html';

const axiosInstance = axios.create({
  headers: { Authorization: 'Bearer ' + token }
});

async function load() {
  try {
    const [meRes, usersRes] = await Promise.all([
      axiosInstance.get('http://localhost:5000/api/users/me'),
      axiosInstance.get('http://localhost:5000/api/users')
    ]);

    const tenant = meRes.data.tenant;
    const user = meRes.data;

    document.getElementById('tenantTitle').innerText = `${tenant.name} — Dashboard`;
    document.getElementById('info').innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${user.name}</h5>
          <p class="card-text mb-1"><strong>Email:</strong> ${user.email}</p>
          <p class="card-text mb-1"><strong>Role:</strong> ${user.role}</p>
          <p class="card-text"><strong>Tenant:</strong> ${tenant.name}</p>

        </div>
      </div>
    `;

    
    const tbody = document.querySelector('#usersTable tbody');
    tbody.innerHTML = '';
    usersRes.data.forEach(u => {
      const row = document.createElement('tr');
      if (user.role === "admin") {
        
        row.innerHTML = `
          <td>${u.name}</td>
          <td>${u.email}</td>
          <td>${u.role}</td>
          <td>
            <button class="btn btn-sm btn-warning edit-btn" data-id="${u._id}">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${u._id}">Delete</button>
                      <!-- inside the <tr> for each user -->
<td>
  <button class="btn btn-sm btn-outline-primary video-call-btn" data-userid="${user._id}">
    <i class="bi bi-camera-video"></i> Call
  </button>
</td>
          </td>
        `;
      } else {
        row.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>
        <td>
  <button class="btn btn-sm btn-outline-primary video-call-btn" data-userid="${user._id}">
    <i class="bi bi-camera-video"></i> Join 
  </button>
</td>`;
      }

      tbody.appendChild(row);
    });

    
    const addBtn = document.querySelector('[data-bs-target="#addUserModal"]');
    addBtn.style.display = (user.role === "admin") ? "" : "none";

  } catch (err) {
    console.error(err);
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      window.location = 'login.html';
    } else {
      document.getElementById('info').innerHTML = `<div class="alert alert-danger">${err.message}</div>`;
    }
  }
}

document.getElementById('refreshBtn').addEventListener('click', load);
document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem("tenantName")
  localStorage.removeItem("tenantId"),
  localStorage.removeItem("UserId")
  window.location = 'login.html';
});


document.getElementById('addUserForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  try {
    await axiosInstance.post('http://localhost:5000/api/users', { name, email, password, role });
    document.getElementById('addUserForm').reset();
    bootstrap.Modal.getInstance(document.getElementById('addUserModal')).hide();
    await load();
  } catch (err) {
    alert(err.response?.data?.message || err.message);
  }
});


document.querySelector('#usersTable tbody').addEventListener('click', async (e) => {
  const id = e.target.dataset.id;
  if (!id) return;

 
  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`http://localhost:5000/api/users/${id}`);
        await load();
      } catch (err) {
        alert(err.response?.data?.message || err.message);
      }
    }
  }

 
  if (e.target.classList.contains('edit-btn')) {
    try {
      const userRes = await axiosInstance.get(`http://localhost:5000/api/users/${id}`);
      document.getElementById('name').value = userRes.data.name;
      document.getElementById('email').value = userRes.data.email;
      document.getElementById('role').value = userRes.data.role;
      document.getElementById('password').value = '';

      const modal = new bootstrap.Modal(document.getElementById('addUserModal'));
      modal.show();

      const form = document.getElementById('addUserForm');
      
      form.replaceWith(form.cloneNode(true));
      const newForm = document.getElementById('addUserForm');

      newForm.addEventListener('submit', async (ev) => {
        ev.preventDefault();
        try {
          await axiosInstance.put(`http://localhost:5000/api/users/${id}`, {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value
          });
          modal.hide();
          await load();
        } catch (err) {
          alert(err.response?.data?.message || err.message);
        }
      });

    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  }
});



load();





const cashfree = Cashfree({
  mode: "sandbox",
});

document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    const res = await axios.post(
      "http://localhost:5000/api/payments/create-order",
      {
        id: "123",
        name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("res is", res);
    console.log("res.data is ", res.data);

    const { payment_session_id, order_id } = res.data;
    let checkoutOptions = {
      paymentSessionId: payment_session_id,
      redirectTarget: "_modal", 
    };

    await cashfree
      .checkout(checkoutOptions)
      .then(async () => {
        if (order_id) {
          const verifyRes = await axios.post(
            "http://localhost:5000/api/payments/verify-payment",
            { order_id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const divparent = document.getElementById("divparent");
          const paymentmsgdiv = document.getElementById("paymentmsgdiv");

          if (verifyRes.data.message) {
            alert("Payment done successfully ");

           
            if (verifyRes.data.isPremium) {
              paymentmsgdiv.innerHTML = "Premium User ";
            } else {
              paymentmsgdiv.innerHTML = "Subscribe to become premium user";
            }

            divparent.appendChild(paymentmsgdiv);
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (err) {
    console.error(err);
  }
});


async function checkUserStatus() {
  try {
    const res = await axios.get("http://localhost:5000/api/users/status", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const divparent = document.getElementById("divparent");
    const paymentmsgdiv = document.getElementById("paymentmsgdiv");

    if (res.data.isPremium) {
      paymentmsgdiv.innerHTML = "Premium User ⭐ ";
      const premium=res.data.isPremium
      localStorage.setItem("premium","true")
    } else {
      paymentmsgdiv.innerHTML = "Subscribe to become premium user";
      localStorage.setItem("premium","false")

    }

    divparent.appendChild(paymentmsgdiv);
  } catch (err) {
    console.error("Error fetching user status:", err);
  }
}


window.onload = checkUserStatus;

const premiumuser=localStorage.getItem("premium")


if (premiumuser){
const socket = io("http://localhost:5000");

let localStream;
let peerConnection;
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

async function initLocalStream() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    document.getElementById("localVideo").srcObject = localStream;
  } catch (err) {
    console.error("Error accessing media devices:", err);
  }
}

function createPeerConnection(roomId) {
  peerConnection = new RTCPeerConnection(config);

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("signal", { roomId, data: { candidate: event.candidate } });
    }
  };

  peerConnection.ontrack = (event) => {
    document.getElementById("remoteVideo").srcObject = event.streams[0];
  };

  if (localStream) {
    localStream.getTracks().forEach((track) => peerConnection.addTrack(track, localStream));
  }

  return peerConnection;
}


socket.on("ready", async ({ roomId }) => {
  
  if (window.isCaller) {
    peerConnection = createPeerConnection(roomId);

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    socket.emit("signal", { roomId, data: { offer } });
  }
});

socket.on("signal", async ({ from, data }) => {
  if (!peerConnection) {
    peerConnection = createPeerConnection(window.currentRoom);
  }

  if (data.offer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    socket.emit("signal", { roomId: window.currentRoom, data: { answer } });
  }

  if (data.answer) {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
  }

  if (data.candidate) {
    try {
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    } catch (err) {
      console.error("Error adding ICE candidate", err);
    }
  }
});

document.querySelector("#usersTable tbody").addEventListener("click", async (e) => {
  if (e.target.classList.contains("video-call-btn") && e.target.innerText.includes("Call")) {
    const premiumuser = localStorage.getItem("premium") === "true";
    if (!premiumuser) {
      alert("Subscription is required to access premium features");
      return;
    }

    const roomId = prompt("Enter Room ID to create:");
    if (!roomId) return;

    window.currentRoom = roomId;
    window.isCaller = true;

    await initLocalStream();
    socket.emit("join-room", { roomId });
  }
});

document.querySelector("#usersTable tbody").addEventListener("click", async (e) => {
  if (e.target.classList.contains("video-call-btn") && e.target.innerText.includes("Join")) {
    
    

    const roomId = prompt("Enter Room ID to join:");
    if (!roomId) return;

    window.currentRoom = roomId;
    window.isCaller = false;

    await initLocalStream();
    socket.emit("join-room", { roomId });
  }
});
}




document.addEventListener("DOMContentLoaded", async () => {
  const customizationForm = document.getElementById("customizationForm");
  const token = localStorage.getItem("token");

 
  if (token) {
    try {
      const res = await axios.get("http://localhost:5000/api/tenants/customization", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const { branding, theme } = res.data;
      applyCustomization(branding, theme);
    } catch (err) {
      console.error("Failed to load customization", err);
    }
  }

  
  if (customizationForm) {
    customizationForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!token) {
        alert("You must be logged in!");
        return;
      }

      const payload = {
        logoUrl: document.getElementById("logoUrl").value,
        primaryColor: document.getElementById("primaryColor").value,
        secondaryColor: document.getElementById("secondaryColor").value,
        theme: document.getElementById("theme").value
      };

      try {
        const res = await axios.put("http://localhost:5000/api/tenants/customize", payload, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert("Customization updated successfully!");

        
        applyCustomization(payload, payload.theme);

      
        const modal = bootstrap.Modal.getInstance(document.getElementById("customizationModal"));
        modal.hide();

      } catch (err) {
        console.error(err);
        alert(err.response?.data?.message || "Error updating customization");
      }
    });
  }
});

function applyCustomization(branding, theme) {
  if (branding.logoUrl) {
    const logo = document.getElementById("appLogo");
    if (logo) logo.src = branding.logoUrl;
  }

  if (branding.primaryColor) {
    document.documentElement.style.setProperty("--primary", branding.primaryColor);
  }
  if (branding.secondaryColor) {
    document.documentElement.style.setProperty("--secondary", branding.secondaryColor);
  }

  if (theme === "dark") {
    document.body.classList.add("bg-dark", "text-light");
  } else {
    document.body.classList.remove("bg-dark", "text-light");
  }
}








const taskbutton=document.getElementById("taskbutton")
taskbutton.addEventListener("click",()=>{
  window.location.href="task.html"
})



const userSearchInput = document.getElementById("userSearch");
const assignedUserContainer = document.getElementById("assignedUserSelect");

userSearchInput.addEventListener("input", async () => {
  const query = userSearchInput.value.trim();
  if (query.length < 1) {
    assignedUserContainer.innerHTML = `<div class="text-muted">Type to search users...</div>`;
    return;
  }
  await loadUsersForTasks(query);
});


async function loadUsersForTasks(search = "") {
  try {
    const res = await axiosInstance.get(`http://localhost:5000/api/users?q=${search}`);
    
    assignedUserContainer.innerHTML = "";

    if (res.data.length === 0) {
      assignedUserContainer.innerHTML = `<div class="text-muted">No users found</div>`;
      return;
    }

    res.data.forEach(u => {
      const userDiv = document.createElement("div");
      userDiv.className = "list-group-item list-group-item-action";
      userDiv.textContent = `${u.name} (${u.email})`;


      

      userDiv.addEventListener("click", () => {
        console.log("Selected user:", u);
        
      });

      assignedUserContainer.appendChild(userDiv);
    });
  } catch (err) {
    console.error("Error loading users:", err);
  }
}
