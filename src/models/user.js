import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
    },
    password: String,
    avatar: String,
    createdRooms: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Room',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)

export default User
