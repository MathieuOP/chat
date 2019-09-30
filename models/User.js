const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
    }
},
{
    timestamps: true,
    collection: 'user',
    versionKey: false,
});

const User = mongoose.model('User', userSchema);
module.exports = User;