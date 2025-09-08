// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const path = require('path');
// const superAdminRoutes=require("./routes/superadmin")

// dotenv.config();
// const app = express();
// app.use(express.json());
// app.use(cors());

// // Serve frontend static
// app.use('/', express.static(path.join(__dirname, '../frontend')));

// // Routes
// const authRoutes = require('./routes/auth');
// const tenantRoutes = require('./routes/tenants');
// const userRoutes = require('./routes/users');

// app.use('/api/auth', authRoutes);
// app.use('/api/tenants', tenantRoutes);
// app.use('/api/users', userRoutes);
// app.use("/api/superadmin",superAdminRoutes)

// const PORT = process.env.PORT || 5000;
// const MONGO = process.env.MONGO_URI ;

// mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => {
//     console.log('MongoDB connected');
//     app.listen(PORT, () => console.log('Server running on port', PORT));
//   })
//   .catch(err => {
  //     console.error('Mongo connection error', err);
  //     process.exit(1);
  //   });

  
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());
const Announcement=require("./models/announcement")

app.use('/', express.static(path.join(__dirname, '../frontend')));


const authRoutes = require('./routes/auth');
const tenantRoutes = require('./routes/tenants');
const userRoutes = require('./routes/users');
const superAdminRoutes = require("./routes/superadmin");
const announcementRoutes = require("./routes/announcementRoutes");

app.use('/api/auth', authRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/users', userRoutes);
app.use("/api/superadmin", superAdminRoutes);
app.use("/api/announcements", announcementRoutes);



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
    try{
  const announcement = await Announcement.create({ tenant: tenantId, sender, message });
  io.to(tenantId).emit("receiveAnnouncement", announcement);
}catch (err) {
      console.error("Announcement error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
