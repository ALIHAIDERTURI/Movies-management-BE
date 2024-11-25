const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: Number, required: true },  // Store the iTunes movie ID
  title: { type: String, required: true },
  imageUrl: { type: String, required: true },
  releaseDate: { type: String },
  genre: { type: String },
  price: { type: Number },
  description: { type: String },
  videoUrl: { type: String }, // Trailer URL
});

module.exports = mongoose.model('Favorite', favoriteSchema);
