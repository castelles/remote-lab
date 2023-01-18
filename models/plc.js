const {mongoose} = require('../loaders/mongo');
const {Schema} = mongoose;
const {plcVerSchema} = require('./plcVersion');
const {deviceModels} = require('../utils/env');
const validator = require('validator');

function devSchema(models, msgType){
  return new Schema({
    model:{
      type: String,
      trim: true,
      uppercase: true,
      enum: {
        values: models,
        message: `{VALUE} is not a valid ${msgType} Device Model`
      },
      required: [true, 'Device Model is required']
    },
    port: {
      type: Number,
      min: [0, 'The minimum port number is 0'],
      required: true
    }
  }, {versionKey: false, _id: false});
};

function typeDevSchema(digitalModels, analogModels, ioMsg){
  return new Schema({
    digital:{
      type: [devSchema(digitalModels, `Digital ${ioMsg}`)],
      default: []
    },
    analog:{
      type: [devSchema(analogModels, `Analog ${ioMsg}`)],
      default: []
    }
  }, {versionKey: false, _id: false});
};

const devicesSchema = new Schema({
  input: {
    type: typeDevSchema(deviceModels.input.digital.models, deviceModels.input.analog.models, 'Input'),
    default: ()=>({})
  },
  output: {
    type: typeDevSchema(deviceModels.output.digital.models, deviceModels.output.analog.models, 'Output'),
    default: ()=>({})
  }
}, {versionKey: false, _id: false});

const plcSchema = new Schema({
  reference:{
    type: String,
    trim: true,
    unique: true,
    required: [true, 'PLC reference required'],
    maxlength: [256, 'PLC reference length cannot be greater than 64 characters (32 bytes)'],
    validate:{
      validator: v => validator.default.isHexadecimal(v),
      message: props => `${props.value} is not a valid PLC reference (hexadecimal)`
    }
  },
  name:{
    type: String,
    trim: true,
    maxlength: [72, 'PLC name length cannot be greater than 72 characters'],
    required: [true, 'PLC name is required']
  },
  version:{
    type: plcVerSchema,
    excludeIndexes: true,
    required: [true, 'PLC version description required']
  },
  devices:{
    type: devicesSchema,
    default: ()=>({})
  },
  createdAt:{
    type: Date,
    required: [true, 'PLC creation date is required']
  }
}, {versionKey: false, strictQuery: 'throw'});

module.exports = mongoose.model('plc', plcSchema);