
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const Announcement = require("./models/announcement");

app.use('/', express.static(path.join(__dirname, '../frontend')));

const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');
const superAdminRoutes = require("./routes/superadmin");
const announcementRoutes = require("./routes/announcementRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const videocallRoutes = require("./routes/videoConferenceRoutes");
const taskRoutes=require("./routes/taskRoutes")

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/videocall", videocallRoutes);  
app.use('/api/users', userRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/tasks",taskRoutes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

const PORT = process.env.PORT || 5000;
const MONGO = process.env.MONGO_URI;

mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });

const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("joinTenantRoom", (tenantId) => {
    if (!tenantId) {
      console.error("No tenantId provided by client");
      return;
    }
    socket.join(tenantId);
    console.log(`User ${socket.id} joined tenant room: ${tenantId}`);
  });

  socket.on("sendAnnouncement", async ({ tenantId, message, sender }) => {
    try {
       if (!tenantId || tenantId === "null" || !mongoose.Types.ObjectId.isValid(tenantId)) {
      console.error("Invalid or missing tenantId in sendAnnouncement:", tenantId);
      socket.emit("announcementError", "Invalid or missing tenant id");
      return;}
      const announcement = await Announcement.create({ tenant: tenantId, sender, message });
      io.to(tenantId).emit("recieveAnnouncement", announcement);
    } catch (err) {
      console.error("Announcement error:", err);
    }
  });

  //webrtc
  const userId = socket.handshake.query.userId; 
  if (userId) {
    socket.userId = userId;
    console.log(`Mapped user ${userId} to socket ${socket.id}`);
  }



io.on("connection", (socket) => {
  socket.on("join-room", ({ roomId }) => {
    socket.join(roomId);

    const clients = io.sockets.adapter.rooms.get(roomId);
    if (clients && clients.size === 2) {
      io.to(roomId).emit("ready", { roomId });
    }
  });

  socket.on("signal", ({ roomId, data }) => {
    socket.to(roomId).emit("signal", { from: socket.id, data });
  });
});




  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
  });
});


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
