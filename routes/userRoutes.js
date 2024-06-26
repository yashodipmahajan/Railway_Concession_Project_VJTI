const express = require("express");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const {
  loginController,
  registerController,
  authController,
  authApplyController,
  geAllController,
  deleteAllNotificationController,
  authControllerAdmin,
  // applyDoctorController,
} = require("../controllers/userCtrl");
const { sendOTP } = require("../controllers/otpCtrl.js");
const authMiddleware = require("../middlewares/authMiddleware");
const { uploadImage } = require("../controllers/adminCtrl");
const railwayModel = require("../models/railwayModel");
const userModel = require("../models/userModels");
const keysecret = process.env.JWT_SECRET;
var bcrypt = require("bcryptjs");
//router onject
const router = express.Router();
dotenv.config();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);
router.post("/OTP", sendOTP);
//Auth || POST
router.post("/getUserData", authMiddleware, authController);
router.post("/checkUserAdmin", authMiddleware, authControllerAdmin);
//Register|| POST
router.post("/apply-form", authMiddleware, authApplyController);

// NOTIFICATION || post
router.post("/get-all-notification", authMiddleware, geAllController);

//email_otp_verfication || post
router.post("/otpverification", loginController);

// NOTIFICATION DELete || post
// for uploading images
// router.post("/store-image", async (req, res) => {
//   try {
//     const { image } = req.body;
//     if (!image) {
//       return res.status(400).json({ msg: "Please enter an icon url" });
//     }
//     let newImage = new railwayModel({
//       image,
//     });
//     newImage = await newImage.save();
//     res.json(newImage);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);
module.exports = router;

// // send email Link For reset Password
// router.post("/sendpasswordlink", async (req, res) => {
//   console.log(req.body);

//   const { email } = req.body;

//   if (!email) {
//     res.status(401).json({ status: 401, message: "Enter Your Email" });
//   }

//   try {
//     const userfind = await userModel.findOne({ email: email });

//     // token generate for reset password
//     // console.log("userfind", userfind);

//     const token = jwt.sign({ _id: userfind._id }, process.env.JWT_SECRET, {
//       // expiresIn: "120s",
//       expiresIn: "1d",
//     });
//     // console.log("token", token);
//     const setusertoken = await userModel.findByIdAndUpdate(
//       { _id: userfind._id },
//       { verifytoken: token },
//       { new: true }
//     );
//     // console.log("setusertoken", setusertoken);

//     if (setusertoken) {
//       const mailOptions = {
//         from: "rgnagrut_b20@ee.vjti.ac.in",
//         to: email,
//         subject: "Sending Email For password Reset",
//         text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`,
//       };

//       transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//           console.log("error", error);
//           res.status(401).json({ status: 401, message: "email not send" });
//         } else {
//           console.log("Email sent", info.response);
//           res
//             .status(201)
//             .json({ status: 201, message: "Email sent Succsfully" });
//         }
//       });
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, message: "invalid user" });
//   }
// });

// // verify user for forgot password time
// router.get("/forgotpassword/:id/:token", async (req, res) => {
//   const { id, token } = req.params;
//   // console.log(id, token);
//   try {
//     const validuser = await userModel.findOne({ _id: id, verifytoken: token });

//     const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

//     console.log(verifyToken);

//     if (validuser && verifyToken._id) {
//       res.status(201).json({ status: 201, validuser });
//     } else {
//       res.status(401).json({ status: 401, message: "user not exist" });
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, error });
//   }
// });

// // change password

// router.post("/:id/:token", async (req, res) => {
//   const { id, token } = req.params;

//   const { password } = req.body;
//   console.log(password);

//   try {
//     const validuser = await userModel.findOne({ _id: id, verifytoken: token });

//     const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

//     if (validuser && verifyToken._id) {
//       const salt = await bcrypt.genSalt(10);
//       const newpassword = await bcrypt.hash(password, salt);

//       const setnewuserpass = await userModel.findByIdAndUpdate(
//         { _id: id },
//         { password: newpassword }
//       );
//       // await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
//       // res.status(201).send({
//       //   success: true,
//       //   message: "Form applied sucessfully",
//       // });
//       setnewuserpass.save();
//       res.status(201).json({ status: 201, setnewuserpass });
//     } else {
//       res.status(401).json({ status: 401, message: "user not exist" });
//     }
//   } catch (error) {
//     res.status(401).json({ status: 401, error });
//   }
// });
// email configuration

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_ID,
    pass: process.env.PASSWORD_PASS,
  },
});

// send email Link For reset Password
router.post("/sendpasswordlink", async (req, res) => {
  // console.log(req.body);
  // const { email } = req.body;
  try {
    const email = req.body.email;
    const userfind = await userModel.findOne({ email: email });
    if (!email) {
      res.status(401).json({ status: 401, message: "Enter Your Email" });
    }
    // token generate for reset password
    // console.log("userfind", userfind);
    console.log(userfind);
    const token = jwt.sign({ _id: userfind._id }, process.env.JWT_SECRET, {
      expiresIn: "900s",
      // expiresIn: "1d",
    });
    // console.log("token", token);
    const setusertoken = await userModel.findByIdAndUpdate(
      { _id: userfind._id },
      { verifytoken: token },
      { new: true }
    );
    // console.log("setusertoken", setusertoken);
    const resetPasswordLink = `https://railway-concession-prod.onrender.com/forgotpassword/${userfind.id}/${setusertoken.verifytoken}`;

    if (setusertoken) {
      const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: "Vjti Railway Concession Password Reset",
        // text: `This Link Valid For 2 MINUTES http://localhost:3000/forgotpassword/${userfind.id}/${setusertoken.verifytoken} please reset your password`,
        text: `This Link Valid For 5 MINUTES ${resetPasswordLink} please reset your password`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log("error", error);
          res.status(401).json({ status: 401, message: "email not send" });
        } else {
          console.log("Email sent", info.response);
          res
            .status(201)
            .json({ status: 201, message: "Email sent Succsfully" });
        }
      });
    }
  } catch (error) {
    // catch (error) {
    //   res.status(401).json({ status: 401, message: "invalid hu me user" });
    // }
    console.log(error);
  }
});

// verify user for forgot password time
router.get("/forgotpassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;
  // console.log(id, token);
  try {
    const validuser = await userModel.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    console.log(verifyToken);

    if (validuser && verifyToken._id) {
      res.status(201).json({ status: 201, validuser });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});
// change password

router.post("/changepassword/:id/:token", async (req, res) => {
  const { id, token } = req.params;

  const { password } = req.body;

  try {
    const validuser = await userModel.findOne({ _id: id, verifytoken: token });

    const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

    if (validuser && verifyToken._id) {
      const newpassword = await bcrypt.hash(password, 12);

      const setnewuserpass = await userModel.findByIdAndUpdate(
        { _id: id },
        { password: newpassword }
      );

      setnewuserpass.save();
      res.status(201).json({ status: 201, setnewuserpass });
    } else {
      res.status(401).json({ status: 401, message: "user not exist" });
    }
  } catch (error) {
    res.status(401).json({ status: 401, error });
  }
});

// routes/otpRoutes.js
//route for sending the OTP code
const otpController = require("../controllers/otpCtrl");
router.post("/send-otp", otpController.sendOTP);

module.exports = router;
