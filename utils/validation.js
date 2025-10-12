// Required field validator
export const validatePersonalDetails = (form) => {
  const errors = [];

  // Only validate required fields
  if (!form.firstName?.trim()) {
    errors.push("First name is required");
  }

  if (!form.lastName?.trim()) {
    errors.push("Last name is required");
  }

  if (!form.nic?.trim()) {
    errors.push("NIC number is required");
  } else if (!validateNIC(form.nic)) {
    errors.push("Please enter a valid NIC number");
  }

  if (!form.email?.trim()) {
    errors.push("Email address is required");
  } else if (!validateEmail(form.email)) {
    errors.push("Please enter a valid email address");
  }

  if (!form.mobile?.trim()) {
    errors.push("Mobile number is required");
  } else if (!validatePhone(form.mobile)) {
    errors.push("Please enter a valid 10-digit mobile number");
  }

  if (!form.address?.trim()) {
    errors.push("Permanent address is required");
  }

  return errors;
};

// Individual field validators for real-time validation
export const validateField = (fieldName, value, formData = {}) => {
  const errors = {};
  
  switch (fieldName) {
    case 'email':
      if (!value.trim()) {
        errors.email = "Email is required";
      } else if (!validateEmail(value)) {
        errors.email = "Please enter a valid email";
      }
      break;
      
    case 'mobile':
      if (!value.trim()) {
        errors.mobile = "Mobile number is required";
      } else if (!validatePhone(value)) {
        errors.mobile = "Please enter a valid 10-digit number";
      }
      break;
      
    case 'nic':
      if (!value.trim()) {
        errors.nic = "NIC number is required";
      } else if (!validateNIC(value)) {
        errors.nic = "Please enter a valid NIC number";
      }
      break;
      
    case 'firstName':
      if (!value.trim()) {
        errors.firstName = "First name is required";
      }
      break;
      
    case 'lastName':
      if (!value.trim()) {
        errors.lastName = "Last name is required";
      }
      break;
      
    case 'address':
      if (!value.trim()) {
        errors.address = "Permanent address is required";
      }
      break;
  }
  
  return errors;
};

// Basic validators
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\D/g, ''));
};

export const validateNIC = (nic) => {
  // Sri Lankan NIC validation
  const oldNicRegex = /^[0-9]{9}[vVxX]$/;
  const newNicRegex = /^[0-9]{12}$/;
  const cleanNIC = nic.replace(/\s/g, '');
  return oldNicRegex.test(cleanNIC) || newNicRegex.test(cleanNIC);
};