import mongoose, { Schema, Types } from 'mongoose'

const storySchema = new Schema(
  {
    topic: String,
    creator: {
      type: Types.ObjectId,
      ref: 'User',
    },
    room: {
      type: Types.ObjectId,
      ref: 'Room',
    },
    startTime: Date,
    endTime: Date,
    result: Number,
  },
  {
    timestamps: true,
  },
)

const Story = mongoose.model('Story', storySchema)

export default Story
