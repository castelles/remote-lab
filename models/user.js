const {roles} = require('../utils/env');
const {mongoose} = require('../loaders/mongo');
const {Schema} = mongoose;
const {usernameReg, emailReg, passReg} = require('../utils/verify');

const userSchema = new Schema({
  name:{
    type: String,
    trim: true,
    maxlength: [72, 'User name length cannot be greater than 72 characters'],
    required: [true, 'User name is required']
  },
  username:{
    type: String,
    trim: true,
    unique: true,
    validate:{
      validator: v => usernameReg.test(v),
      message: props => `${props.value} is not a valid username`
    },
    required: [true, 'User username is required']
  },
  email:{
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    maxlength: [256, 'User email must not exceed 256 characters'],
    validate:{
      validator: v => emailReg.test(v),
      message: props => `${props.value} is not a valid email`
    },
    required: [true, 'User email is required']
  },
  password:{
    type: String,
    minlength: [8, 'User password must be at least 8 characters'],
    maxlength: [72, 'User password must not exceed 72 characters'],
    validate:{
      validator: v => passReg.test(v),
      message: props => `${props.value} is not a valid password`
    },
    required: [true, 'User password is required']
  },
  role:{
    type: String,
    trim: true,
    uppercase: true,
    enum: {
      values: roles,
      message: '{VALUE} is not a valid role'
    },
    required: [true, 'User role is required']
  },
  createdAt:{
    type: Date,
    required: [true, 'User creation date is required']
  },
}, {versionKey: false});

module.exports = mongoose.model('user', userSchema);