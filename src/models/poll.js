import mongoose, { Schema } from 'mongoose'

const pollSchema = new Schema(
  {
    topic: String,
    description: String,
    result: Number,
    session: {
      type: Schema.Types.ObjectId,
      ref: 'Session',
    },
    votes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Vote',
      },
    ],
  },
  {
    timestamps: true,
  },
)

const Poll = mongoose.model('Poll', pollSchema)

export default Poll
