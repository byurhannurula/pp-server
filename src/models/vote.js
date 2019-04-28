import mongoose, { Schema } from 'mongoose'

const voteSchema = new Schema(
  {
    value: Number,
    poll: {
      type: Schema.Types.ObjectId,
      ref: 'Poll',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  },
)

const Vote = mongoose.model('Vote', voteSchema)

export default Vote
