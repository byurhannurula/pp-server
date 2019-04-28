import mongoose, { Schema } from 'mongoose'

const sessionSchema = new Schema(
  {
    name: String,
    cardSet: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    polls: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Poll',
      },
    ],
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Session = mongoose.model('Session', sessionSchema)

export default Session
