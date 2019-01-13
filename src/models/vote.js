import mongoose, { Schema } from 'mongoose'

const voteSchema = new Schema(
  {
    value: String,
  },
  {
    timestamps: true,
  },
)

const Vote = mongoose.model('Vote', voteSchema)

export default Vote
