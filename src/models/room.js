import mongoose, { Schema, Types } from 'mongoose'

const roomSchema = new Schema(
  {
    name: String,
    cardValues: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    users: {
      type: Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const Room = mongoose.model('Room', roomSchema)

export default Room
