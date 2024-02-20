import mongoose from "mongoose";

const textSchema = new mongoose.Schema({
    text: String,
});

const Text = mongoose.model('Text', textSchema);

export default Text;