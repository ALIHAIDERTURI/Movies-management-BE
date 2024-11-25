const mongoose = require('mongoose');
const axios = require('axios');
const User = require('../models/userModel.js');
const Favorite = require('../models/moviesModel.js'); // Movie model for local storage
const { ObjectId } = mongoose.Types; // Import ObjectId for type checking
const dotenv = require('dotenv');

dotenv.config();

// Fetch movie details from iTunes API by movieId (or term)
exports.getMovieFromiTunesAPI = async (movieId) => {
  try {
    const response = await axios.get(`${process.env.ITUNES_API_URL}`, {
      params: {
        term: movieId, // Using the movieId as the search term
        country: 'au',
        media: 'movie',
        limit: 1, // Fetch only one result
      },
    });

    // console.log('iTunes API Response:', response.data);

    if (response.data.results && response.data.results.length > 0) {
      const movie = response.data.results[0]; // Get first matching result
      return {
        id: movie.trackId,
        title: movie.trackName,
        imageUrl: movie.artworkUrl100 || '',
        releaseDate: movie.releaseDate,
        genre: movie.primaryGenreName,
        price: movie.collectionPrice,
        description: movie.longDescription,
        videoUrl: movie.previewUrl, // Trailer URL
      };
    }

    console.log('No movie found with search term:', movieId);
    return null;
  } catch (error) {
    console.error('Error fetching movie from iTunes API:', error.message);
    return null;
  }
};

// Fetch Movies from iTunes API with pagination
exports.fetchMovies = async (req, res) => {
  const { term = 'star', page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const response = await axios.get(process.env.ITUNES_API_URL, {
      params: { term, country: 'au', media: 'movie', limit, offset },
    });

    const totalResults = response.data.resultCount || 0;
    const totalPages = Math.ceil(totalResults / limit);
    const movies = response.data.results;

    const user = req.user || null; // Include user info if authenticated

    res.status(200).json({ movies, totalPages, user });
  } catch (err) {
    console.error('Error fetching movies:', err.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
};

exports.toggleFavorites = async (req, res) => {
  try {
    // Extract userId from the authenticated token (populated by middleware)
    const userId = req.user.id; // req.user should be set by the requireAuth middleware
    const { id: movieId } = req.params; // Extract movieId from URL parameters

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    // Check if the movie already exists in the favorites
    const existingFavorite = await Favorite.findOne({ userId, movieId });

    let movieDetails = {};
    if (!existingFavorite) {
      // If the movie is not in favorites, fetch its details from iTunes API
      movieDetails = await this.getMovieFromiTunesAPI(movieId);
      if (!movieDetails) {
        return res.status(404).json({ message: 'Movie not found in external database' });
      }
    }

    // If the movie is already a favorite, remove it (unfavorite)
    if (existingFavorite) {
      await Favorite.deleteOne({ userId, movieId });
      await User.updateOne(
        { _id: userId },
        { $pull: { favorites: existingFavorite._id } } // Pull the ObjectId of the favorite
      );
      return res.status(200).json({ message: 'Favorite removed' });
    }

    // If the movie is not a favorite, add it to favorites
    const { title, imageUrl, releaseDate, genre, price, description, videoUrl } = movieDetails;
    const newFavorite = new Favorite({
      userId,
      movieId,
      title,
      imageUrl,
      releaseDate,
      genre,
      price,
      description,
      videoUrl,
    });

    // Save the new favorite and update the user model with the ObjectId of the new favorite
    await newFavorite.save();
    await User.updateOne(
      { _id: userId },
      { $push: { favorites: newFavorite._id } } // Push the ObjectId of the favorite
    );

    return res.status(201).json({ message: 'Favorite added', favorite: newFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const userId = req.user._id; // Assuming the user is authenticated and their ID is in req.user
    const user = await User.findById(userId).populate('favorites');

    // Check if the user exists and favorites are populated
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.favorites || user.favorites.length === 0) {
      return res.status(404).json({ error: 'No valid favorite movies found' });
    }

    // Send the populated favorites array
    return res.status(200).json(user.favorites);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return res.status(500).json({ error: 'Error fetching favorites' });
  }
};

