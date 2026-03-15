// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is company owner
exports.isCompany = (req, res, next) => {
  if (req.user.role !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company owners can access this route',
    });
  }
  next();
};

// Check if user is lorry owner
exports.isLorryOwner = (req, res, next) => {
  if (req.user.role !== 'lorry') {
    return res.status(403).json({
      success: false,
      message: 'Only lorry owners can access this route',
    });
  }
  next();
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Only administrators can access this route',
    });
  }
  next();
};

// Check if user owns the resource
exports.checkOwnership = (Model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const resource = await Model.findById(req.params[paramName]);

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found',
        });
      }

      // Check ownership based on model field
      const ownerField = Model.modelName === 'Load' ? 'companyId' : 
                        Model.modelName === 'Lorry' ? 'ownerId' : 'userId';

      if (resource[ownerField].toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to modify this resource',
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Error checking ownership',
        error: error.message,
      });
    }
  };
};
