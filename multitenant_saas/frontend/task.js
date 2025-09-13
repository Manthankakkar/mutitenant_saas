const tasksTableBody = document.querySelector("#tasksTable tbody");
const taskForm = document.getElementById("taskForm");
const assignedUserSelect = document.getElementById("assignedUser");
const uploadForm = document.getElementById("uploadForm");
const uploadTaskId = document.getElementById("uploadTaskId");
const attachmentFile = document.getElementById("attachmentFile");

const token=localStorage.getItem("token")
const axiosInstance = axios.create({
  headers: { Authorization: 'Bearer ' + token }
});

async function loadUsersForTasks() {
  const res = await axiosInstance.get("http://localhost:5000/api/users");
  assignedUserSelect.innerHTML = `<option value="">Assign to...</option>`;
  res.data.forEach(u => {
    assignedUserSelect.innerHTML += `<option value="${u._id}">${u.name} (${u.email})</option>`;
  });
}


async function loadTasks() {
  const res = await axiosInstance.get("http://localhost:5000/api/tasks");
  tasksTableBody.innerHTML = "";
  res.data.forEach(task => {
    let attachmentsHTML = task.attachments.map(a => `
      <a href="${a.fileUrl}" target="_blank">${a.fileName}</a>
    `).join(", ");

    tasksTableBody.innerHTML += `
      <tr>
        <td>${task.title}</td>
        <td>${task.assignedTo?.name || "Unassigned"}</td>
        <td>${new Date(task.deadline).toLocaleDateString()}</td>
        <td>${task.priority}</td>
        <td>${task.status}</td>
        <td>${attachmentsHTML || "-"}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="openUploadModal('${task._id}')">Upload</button>
          <button class="btn btn-sm btn-success" onclick="markTaskDone('${task._id}')">Done</button>
        </td>
      </tr>
    `;
  });
}

taskForm.addEventListener("submit", async e => {
  e.preventDefault();
  const body = {
    title: document.getElementById("taskTitle").value,
    description: document.getElementById("taskDesc").value,
    deadline: document.getElementById("taskDeadline").value,
    assignedTo: document.getElementById("assignedUser").value || null,
    priority:document.getElementById("priority").value || null
  };
  await axiosInstance.post("http://localhost:5000/api/tasks", body);
  taskForm.reset();
  loadTasks();
});


function openUploadModal(taskId) {
  uploadTaskId.value = taskId;
  attachmentFile.value = "";
  const modal = new bootstrap.Modal(document.getElementById("uploadModal"));
  modal.show();
}


uploadForm.addEventListener("submit", async e => {
  e.preventDefault();
  const formData = new FormData();
  formData.append("file", attachmentFile.files[0]);
  await axiosInstance.post(`http://localhost:5000/api/tasks/${uploadTaskId.value}/upload`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  const modal = bootstrap.Modal.getInstance(document.getElementById("uploadModal"));
  modal.hide();
  loadTasks();
});

async function markTaskDone(taskId) {
  await axiosInstance.put(`http://localhost:5000/api/tasks/${taskId}`, { status: "done" });
  loadTasks();
}


loadUsersForTasks();
loadTasks();

