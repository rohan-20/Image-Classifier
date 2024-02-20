/*import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { PORT, MONGODBURL } from './config.js';
import Image from './models/model.js';

const app = express();
app.use(express.json());
app.use(cors());


const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});
  
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));


mongoose.connect(MONGODBURL)
    .then(() => {
        console.log('Connected to database');
        app.listen(PORT, () => {
            console.log(`Listening on port: ${PORT}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { filename, path } = req.file;
      const newImage = new Image({
        filename,
        filepath: path,
      });
    
      await newImage.save();
    
      res.status(200).json({ message: 'Image uploaded successfully!' });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Error uploading image' });
      }
  });

app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).json({ success: false, message: 'Error fetching images' });
    }
});


app.delete('/images/:id', async (req, res) => {
  const imageId = req.params.id;

  try {
    // Find the image by ID
    const imageToDelete = await Image.findOneAndDelete({ _id: imageId });

    if (!imageToDelete) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    const imagePath = path.join(__dirname, 'uploads', imageToDelete.filename);
    fs.unlinkSync(imagePath);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});
*/
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import tf from '@tensorflow/tfjs-node';
import { PORT, MONGODBURL } from './config.js';
import Image from './models/model.js';
import Text from './models/textModel.js'

const app = express();
app.use(express.json());
app.use(cors());

app.use('/uploads', express.static('uploads'));

const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
});
  
const upload = multer({ storage: storage });

let customModel;

async function loadCustomModel() {
  try {
    customModel = await tf.loadLayersModel('file:///home/rohanxobruno/ImageRecognition/backend/model.json');
    console.log('Custom model loaded successfully');
  } catch (error) {
    console.error('Error loading the custom model:', error.message);
  }
}

loadCustomModel();

mongoose.connect(MONGODBURL)
  .then(() => {
    console.log('Connected to database');
    app.listen(PORT, () => {
      console.log(`Listening on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Preprocess the image (resize and normalize)
    const imageBuffer = fs.readFileSync(req.file.path);
    const image = tf.node.decodeImage(imageBuffer);
    const preprocessedImage = preprocessImage(image);

    // Use your TensorFlow.js custom model for prediction
    const prediction = customModel.predict(preprocessedImage);

    // Postprocess the prediction as needed
    const result = postprocessPrediction(prediction);

    // Save the uploaded image information to MongoDB using Mongoose
    const { filename, path } = req.file;
    const newImage = new Image({
      filename,
      filepath: path,
      classification: result,
    });

    await newImage.save();

    res.status(200).json({ message: 'Image uploaded successfully!', prediction: result });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Error uploading image' });
  }
});

function preprocessImage(image) {
  // Resize the image to match model input size
  const resizedImage = tf.image.resizeBilinear(image, [256, 256]);

  // Normalize the pixel values to the range [0, 1]
  const normalizedImage = resizedImage.div(255);

  // Expand the dimensions to match the model input shape
  return tf.expandDims(normalizedImage);
}

function postprocessPrediction(prediction) {
  // Convert the prediction tensor to a JSON object
  const result = prediction.dataSync()[0];
  
  return result > 0.5 ? 'Baby' : 'Dog';
}

app.get('/images', async (req, res) => {
  try {
    const images = await Image.find();
    res.json(images);
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ success: false, message: 'Error fetching images' });
  }
});

app.delete('/images/:id', async (req, res) => {
  const imageId = req.params.id;

  try {
    const imageToDelete = await Image.findOneAndDelete({ _id: imageId });

    if (!imageToDelete) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }

    const __filename = new URL(import.meta.url).pathname;
    const __dirname = path.dirname(__filename);
    const imagePath = path.join(__dirname, 'uploads', imageToDelete.filename);
    fs.unlinkSync(imagePath);

    res.json({ success: true, message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ success: false, message: 'Error deleting image' });
  }
});

app.post('/text', async (req, res) => {

  try{
    const newText = {
      text: req.body.text,
    };
  
    const text = await Text.create(newText);
  
    return res.status(200).send(text);
  } catch(error) {
    console.error('Error posting text', error);
    res.status(500).json({ success: false, message: 'Error posting text'});
  }
  
})