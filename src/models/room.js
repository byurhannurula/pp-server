import mongoose, { Schema, Types } from 'mongoose'

const roomSchema = new Schema(
  {
    name: String,
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
