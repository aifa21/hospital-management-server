const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fs = require("fs-extra");
const fileUpload = require("express-fileupload");
require("dotenv").config();
const app = express();
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xu8lv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const port = 5000;

app.get("/", (req, res) => {
  res.send("hello world");
});
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("doctors"));
app.use(fileUpload());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log("database connected");
  const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
  const prescriptionCollection = client.db("doctorsPortal").collection("prescriptions");
 

  const doctorCollection = client.db("doctorsPortal").collection("doctors");
  // POST

  app.post("/addAppointment", (req, res) => {
    const appointment = req.body;
    console.log(appointment);
    appointmentsCollection.insertOne(appointment).then((result) => {
      res.send(result.insertCount > 0);
    });
  });

  app.post("/addPrescription", (req, res) => {
    const prescription = req.body;
    console.log(prescription);
    prescriptionCollection.insertOne(prescription).then((result) => {
      res.send(result.insertCount > 0);
    });
  });

  app.post("/appointmentsByDate", (req, res) => {
    const date = req.body;
    const email=req.body.email;

    // console.log(date);
    doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
       const filter={date:date.date} 
       if(doctors.length===0){
         filter.email=email;
       }
      
    appointmentsCollection.find( filter)
      .toArray((err, documents) => {
        res.send(documents);
      })
  })
});
// is Doctor
app.post("/isDoctor", (req, res) => {
  const email = req.body.email;
  console.log("email",email);
  doctorCollection.find({ email: email })
      .toArray((err, doctors) => {
          res.send(doctors.length > 0);
      })
})
  // add doctors
  app.post("/addDoctors", (req, res) => {
    const doctors = req.body;
    console.log(doctors);
    doctorCollection.insertOne(doctors).then((result) => {
      res.send(result.insertCount > 0);
    });
  });
 
  
  //get the information from database
  app.get("/appointments", (req, res) => {
    appointmentsCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/prescription", (req, res) => {
    prescriptionCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/addDoctors", (req, res) => {
    doctorCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/addAdmins", (req, res) => {
    adminCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
});

app.listen(port);
