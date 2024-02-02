const mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the User schema     object
var userSchema = new Schema({
    name:{
          type: String,
          trim:true,
          required:true
    },
    email:{
          type: String,
          trim:true,
          required:true,
          uniquie:true
    },
    password:{
          type: String,
          required:true
    },
    photo:String,
    following: [{
          type: Schema.Types.ObjectId,
          ref: 'User'
        }],
        followers: [{
          type: Schema.Types.ObjectId,
          ref: 'User'
        }],
});

const User = mongoose.model("User", userSchema);

module.exports=User