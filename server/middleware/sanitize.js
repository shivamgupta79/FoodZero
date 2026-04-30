// server/middleware/sanitize.js

/**
 * Input sanitization middleware to prevent XSS attacks
 * Removes potentially dangerous HTML/script tags from user input
 */

function sanitizeString(str) {
  if (typeof str !== 'string') return str;
  
  // Remove HTML tags
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

function sanitizeObject(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const value = obj[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }
  
  return sanitized;
}

exports.sanitizeInput = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Validate input length to prevent DoS attacks
exports.validateInputLength = (req, res, next) => {
  const MAX_STRING_LENGTH = 10000; // 10KB
  const MAX_ARRAY_LENGTH = 1000;
  
  function checkLength(obj, path = '') {
    if (typeof obj === 'string' && obj.length > MAX_STRING_LENGTH) {
      return `Input too long at ${path || 'root'}`;
    }
    
    if (Array.isArray(obj)) {
      if (obj.length > MAX_ARRAY_LENGTH) {
        return `Array too long at ${path || 'root'}`;
      }
      for (let i = 0; i < obj.length; i++) {
        const error = checkLength(obj[i], `${path}[${i}]`);
        if (error) return error;
      }
    }
    
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const error = checkLength(obj[key], path ? `${path}.${key}` : key);
          if (error) return error;
        }
      }
    }
    
    return null;
  }
  
  const bodyError = checkLength(req.body);
  if (bodyError) {
    return res.status(400).json({ message: bodyError });
  }
  
  next();
};
