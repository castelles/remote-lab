const {mongoose} = require('../loaders/mongo');
const {Schema} = mongoose;
const validator = require('validator');
const {env} = require('../utils/env');


function ioSchema(io){
  return new Schema({
    digital:{
      type: Number,
      min: [0, `The minimum number of digital ${io} is 0`],
      max:  [env.PLC_MAX_PORTS, `The maximum number of digital ${io} is ${env.PLC_MAX_PORTS}`],
      default: 0
    },
    analog:{
      type: Number,
      min: [0, `The minimum number of analog ${io} is 0`],
      max:  [env.PLC_MAX_PORTS, `The maximum number of analog ${io} is ${env.PLC_MAX_PORTS}`],
      default: 0
    }
  }, {versionKey: false, _id: false});
}

const plcVerSchema = new Schema({
  release:{
    type: String,
    trim: true,
    unique: true,
    maxlength: [11, 'PLC version release length cannot be greater than 11 characters'],
    validate:{
      validator: v => validator.isSemVer(v),
      message: props => `${props.value} is not a valid semantic version`
    },
    required: [true, 'PLC version release is required']
  },
  input:{
    type: ioSchema('input'),
    default: ()=>({})
  },
  output:{
    type: ioSchema('output'),
    default: ()=>({})
  },
  createdAt:{
    type: Date,
    required: [true, 'PLC version creation date is required']
  }
}, {versionKey: false, strictQuery: 'throw'});

module.exports = {
  PlcVersion: mongoose.model('plc_version', plcVerSchema),
  plcVerSchema
};