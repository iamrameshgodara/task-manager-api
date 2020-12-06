const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const taskSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
      trim: true
    },
    completed: {
      type: Boolean,
      default: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    }
  },
  { timestamps: true }
)

taskSchema.pre('save', function(next) {
  const task = this
  console.log('before saving task')
  next()
})

const Task = mongoose.model('Task', taskSchema)

module.exports = Task
