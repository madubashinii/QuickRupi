export const lenderValidations = {
  personalDetails: {
    title: (value) => !value ? "Title is required" : null,
    
    firstName: (value) => {
      if (!value) return "First name is required";
      if (value.length < 2) return "First name must be at least 2 characters";
      if (!/^[a-zA-Z\s\-']+$/.test(value)) return "First name can only contain letters";
      return null;
    },
    
    lastName: (value) => {
      if (!value) return "Last name is required";
      if (value.length < 2) return "Last name must be at least 2 characters";
      if (!/^[a-zA-Z\s\-']+$/.test(value)) return "Last name can only contain letters";
      return null;
    },
    
    nicNumber: (value) => {
      if (!value) return "NIC number is required";
      const cleanNIC = value.replace(/\s/g, '').toUpperCase();
      const isValid = /^[0-9]{9}[VX]$/.test(cleanNIC) || /^[0-9]{12}$/.test(cleanNIC);
      return isValid ? null : "Please enter a valid NIC number";
    },
    
    dateOfBirth: (value) => {
      if (!value) return "Date of birth is required";
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return "Please use mm/dd/yyyy format";
      
      const date = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - date.getFullYear();
      
      if (isNaN(date.getTime())) return "Please enter a valid date";
      if (age < 18) return "You must be at least 18 years old";
      if (age > 100) return "Please enter a valid date of birth";
      
      return null;
    },
    
    gender: (value) => !value ? "Gender is required" : null,
  },

  contactDetails: {
    permanentAddress: (value) => {
      if (!value) return "Permanent address is required";
      if (value.length < 10) return "Address must be at least 10 characters";
      return null;
    },
    
    mobileNumber: (value) => {
      if (!value) return "Mobile number is required";
      const cleanNumber = value.replace(/\D/g, '');
      const isValid = /^(7[0-9]|0[1-9])[0-9]{7,8}$/.test(cleanNumber);
      return isValid ? null : "Please enter a valid mobile number";
    },
    
    email: (value) => {
      if (!value) return "Email address is required";
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      return isValid ? null : "Please enter a valid email address";
    },
  },

  employmentDetails: {
    employmentStatus: (value) => !value ? "Employment status is required" : null,
  },

  accountInformation: {
    username: (value) => {
      if (!value) return "Username is required";
      if (value.length < 3) return "Username must be at least 3 characters";
      if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) return "Username must start with a letter and contain only letters, numbers, and underscores";
      return null;
    },
    
    password: (value) => {
      if (!value) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
      
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumbers = /\d/.test(value);
      
      if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
        return "Password must contain uppercase, lowercase letters and numbers";
      }
      
      return null;
    },
    
    confirmPassword: (value, allValues) => {
      if (!value) return "Please confirm your password";
      return value === allValues.password ? null : "Passwords do not match";
    },
    
    accepted: (value) => !value ? "You must agree to the terms and conditions" : null,
    
    humanVerified: (value) => !value ? "Please confirm you are human" : null,
  }
};

// Helper functions
export const validateForm = (formData, formType) => {
  const errors = {};
  const validations = lenderValidations[formType];
  
  if (!validations) return { isValid: false, errors: { general: "Validation error" } };

  Object.keys(validations).forEach(field => {
    const validator = validations[field];
    const value = formData[field];
    const error = validator(value, formData);
    if (error) errors[field] = error;
  });

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateField = (fieldName, value, formType, allValues = {}) => {
  const validator = lenderValidations[formType]?.[fieldName];
  return validator ? validator(value, allValues) : null;
};

// Formatting helpers
export const formatNIC = (nic) => nic ? nic.replace(/\s/g, '').toUpperCase() : '';

export const formatMobileNumber = (number) => {
  const digits = number?.replace(/\D/g, '') || '';
  return digits.startsWith('7') ? '0' + digits : digits;
};

export const formatDate = (dateString) => {
  const cleaned = dateString?.replace(/[^\d\/]/g, '') || '';
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 4) return cleaned.slice(0, 2) + '/' + cleaned.slice(2);
  return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4) + '/' + cleaned.slice(4, 8);
};

export const VALIDATION_TYPES = {
  PERSONAL_DETAILS: 'personalDetails',
  CONTACT_DETAILS: 'contactDetails', 
  EMPLOYMENT_DETAILS: 'employmentDetails',
  ACCOUNT_INFORMATION: 'accountInformation'
};