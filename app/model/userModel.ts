import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true,
        minLength: 3,
        maxLength: 15
    },
    email: {
        type: String,
         required: true,
        unique: true
    },
    password: {
        type: String,
         required: true,
         unique: true,
        minLength: 6,
        maxLength: 12}
});

const User = mongoose.model('User', userSchema);
export default User;