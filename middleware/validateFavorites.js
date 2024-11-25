const validateFavoriteInput = (req, res, next) => {
    const { userId, movie } = req.body;
  
    // Check if userId exists and is a valid ObjectId
    if (!userId || !mongoose.isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }
  
    // Check if movie object has required fields
    if (!movie || !movie.trackId || !movie.trackName) {
      return res.status(400).json({ message: 'Invalid or missing movie data' });
    }
  
    next(); // Proceed to the controller if all checks pass
  };
  