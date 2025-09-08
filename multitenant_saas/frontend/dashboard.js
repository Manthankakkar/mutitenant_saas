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
          </td>
        `;
      } else {
        row.innerHTML = `<td>${u.name}</td><td>${u.email}</td><td>${u.role}</td>`;
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




//   const socket = io("http://localhost:5000");
//   const tenantId = localStorage.getItem("userid"); // dynamically set this from logged-in user

//   // Join tenant room
//   socket.emit("joinTenantRoom", tenantId);

//   // Send announcement (admin only)
//   function sendAnnouncement(message) {
//     const sender = "Tenant Admin"; // set dynamically
//     socket.emit("sendAnnouncement", { tenantId, message, sender });
//   }

//   // Receive announcements
//   socket.on("receiveAnnouncement", (data) => {
//     console.log("New announcement:", data);
//     // You can display in UI
//     const announcementsDiv = document.getElementById("announcements");
//     const msgEl = document.createElement("p");
//     msgEl.textContent = `${data.sender}: ${data.message}`;
//     announcementsDiv.appendChild(msgEl);
//   });


// <div id="announcements"></div>




// Initial load
load();
