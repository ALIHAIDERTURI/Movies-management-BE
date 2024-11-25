// const express = require('express');
// const { fetchMovies, toggleFavorites, getFavorites } = require('../controllers/moviesController');
// const requireAuth = require('../middleware/requireAuth');
// const router = express.Router();

// // Public route to fetch movies from iTunes API
// router.get('/', fetchMovies);

// // Protected route for fetching user-specific favorites
// router.get('/favorites', requireAuth, getFavorites);

// // Protected route to toggle favorite (add/remove)
// router.post('/toggleFavorites/:id', requireAuth, toggleFavorites);

// module.exports = router;

const express = require('express');
const router = express.Router();
const moviesController = require('../controllers/moviesController');
const requireAuth = require('../middleware/requireAuth');

// Public route: Fetch movies (paginated)
router.get('/', moviesController.fetchMovies);

// Protected route: Add or remove movie from favorites
router.post('/toggleFavorites/:id', requireAuth, moviesController.toggleFavorites);

// Protected route: Get all favorites of the authenticated user
router.get('/favorites', requireAuth, moviesController.getFavorites);

module.exports = router;

