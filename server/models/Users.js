import { Schema, model } from 'mongoose';

const userSchema = new Schema({
    fullName: String,
    email: { type: String, unique: true },
    password: String,
});

export default model('User', userSchema);
