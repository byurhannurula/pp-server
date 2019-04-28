import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    name: String,
    bio: String,
    email: String,
    password: String,
    googleId: String,
    githubId: String,
    avatar: String,
    sessions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Session',
      },
    ],
    socialLinks: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  },
)

const User = mongoose.model('User', userSchema)

export default User
