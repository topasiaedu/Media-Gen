/**
 * Validation Utilities
 * Reusable validation functions for forms and user input
 */

/**
 * Email validation regex pattern
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation patterns
 */
const PASSWORD_PATTERNS = {
  minLength: /.{8,}/,
  hasLowercase: /[a-z]/,
  hasUppercase: /[A-Z]/,
  hasNumber: /\d/,
  hasSpecialChar: /[^a-zA-Z\d]/,
};

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Validate email address
 */
export const validateEmail = (email: string): ValidationResult => {
  if (!email.trim()) {
    return { isValid: false, message: "Email is required" };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: "Please enter a valid email address" };
  }
  
  return { isValid: true };
};

/**
 * Validate password strength (simplified for internal use)
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, message: "Password is required" };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: "Password must be at least 6 characters" };
  }
  
  return { isValid: true };
};

/**
 * Validate password confirmation
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: "Please confirm your password" };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: "Passwords do not match" };
  }
  
  return { isValid: true };
};

/**
 * Validate name (first name, last name)
 */
export const validateName = (name: string, fieldName: string = "Name"): ValidationResult => {
  if (!name.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  if (name.trim().length < 2) {
    return { isValid: false, message: `${fieldName} must be at least 2 characters` };
  }
  
  if (name.trim().length > 50) {
    return { isValid: false, message: `${fieldName} must be less than 50 characters` };
  }
  
  return { isValid: true };
};

/**
 * Get password strength score and label (simplified for internal use)
 */
export const getPasswordStrength = (password: string): {
  score: number;
  label: string;
  color: string;
} => {
  if (password.length < 6) {
    return { score: 1, label: "Too Short", color: "bg-red-500" };
  }
  if (password.length < 8) {
    return { score: 3, label: "Good", color: "bg-blue-500" };
  }
  return { score: 5, label: "Strong", color: "bg-green-500" };
};

/**
 * Validate required field
 */
export const validateRequired = (value: string, fieldName: string = "Field"): ValidationResult => {
  if (!value.trim()) {
    return { isValid: false, message: `${fieldName} is required` };
  }
  return { isValid: true };
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/\s+/g, " ");
};

/**
 * Check if string contains only letters and spaces
 */
export const isAlphaWithSpaces = (value: string): boolean => {
  return /^[a-zA-Z\s]*$/.test(value);
};

/**
 * Validate phone number (basic US format)
 */
export const validatePhoneNumber = (phone: string): ValidationResult => {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  
  if (!phone.trim()) {
    return { isValid: false, message: "Phone number is required" };
  }
  
  if (!phoneRegex.test(phone)) {
    return { isValid: false, message: "Please enter a valid phone number" };
  }
  
  return { isValid: true };
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phone;
}; 