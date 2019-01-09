import mongoose, { Schema } from 'mongoose'
import { hash, compare } from 'bcrypt'

const userSchema = new Schema(
  {
    name: String,
    email: {
      type: String,
      validate: {
        validator: async email =>
          (await User.where({ email }).countDocuments()) === 0,
        message: () => `Email has already been taken!`,
      },
    },
    username: {
      type: String,
      validate: {
        validator: async username =>
          (await User.where({ username }).countDocuments()) === 0,
        message: () => `Username has already been taken!`,
      },
    },
    password: String,
  },
  {
    timestamps: true,
  },
)

userSchema.pre('save', async function() {
  if (this.isModified('password')) {
    this.password = await hash(this.password, 12)
  }
})

userSchema.methods.matchesPassword = function(password) {
  return compare(password, this.password)
}

const User = mongoose.model('User', userSchema)

export default User
