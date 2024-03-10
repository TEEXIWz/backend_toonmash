import express,{ Router } from "express";
import { initializeApp } from "firebase/app";
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import multer from "multer";
import config from "../config/firebase.config"

export const router = express.Router();

initializeApp(config.firebaseConfig)

const storage = getStorage()

const upload = multer({ storage: multer.memoryStorage() })

router.post("/", upload.single("filename"), async (req, res) => {
    try {
        const dateTime = giveCurrentDateTime();

        const storageRef = ref(storage, `files/${dateTime+"_"+req.file!.originalname}`);

        // Create file metadata including the content type
        const metadata = {
            contentType: req.file!.mimetype,
        };

        // Upload the file in the bucket storage
        const snapshot = await uploadBytesResumable(storageRef, req.file!.buffer, metadata);
        //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel

        // Grab the public url
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('File successfully uploaded.');
        return res.send({
            message: 'file uploaded to firebase storage',
            name: req.file!.originalname,
            type: req.file!.mimetype,
            url: downloadURL
        })
    } catch (error) {
        return res.status(400).send(error)
    }
});

const giveCurrentDateTime = () => {
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    // const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const timetext = today.toTimeString()
    const time = timetext.split(' ')[0]
    const dateTime = date + '_' + time;
    return dateTime;
}