// models/Agreement.js
import { Schema, model } from 'mongoose';

const signatureSchema = new Schema({
  email: { type: String, required: true },
  type: {
    type: String,
    enum: ['typed', 'image', 'drawn'],
    required: true
  },
  value: { type: String, required: true }, 
  signedAt: { type: Date, default: Date.now } 
});

const agreementSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  creatorEmail: { type: String, required: true },
  inviteeEmails: [{ type: String }],
  signedBy: [signatureSchema],
  status: {
    type: String,
    enum: ['pending', 'partially-signed', 'fully-signed'], 
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

export default model('Agreement', agreementSchema);
