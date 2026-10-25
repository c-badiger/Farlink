export const validateRegistration = (data) => {
  const errors = [];
  const { full_name, email, phone, password, role, buyer_type, farm_name, district, taluk, village } = data;

  if (!full_name || full_name.trim().length < 2) {
    errors.push('Full name must be at least 2 characters.');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('Valid email address is required.');
  }

  if (!phone || phone.trim().length < 10) {
    errors.push('Valid 10-digit phone number is required.');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters.');
  }

  if (!role || !['farmer', 'buyer'].includes(role)) {
    errors.push('Role must be either "farmer" or "buyer". (Admin cannot be self-registered)');
  }

  if (role === 'buyer' && buyer_type && !['individual', 'retailer', 'wholesaler'].includes(buyer_type)) {
    errors.push('Buyer type must be "individual", "retailer", or "wholesaler".');
  }

  if (role === 'farmer') {
    if (!farm_name || farm_name.trim().length < 2) {
      errors.push('Farm or holding name is required for farmers.');
    }
    if (!district || district.trim().length < 2) {
      errors.push('Karnataka District is required.');
    }
    if (!taluk || taluk.trim().length < 2) {
      errors.push('Taluk is required.');
    }
    if (!village || village.trim().length < 2) {
      errors.push('Village is required.');
    }
  }

  return { isValid: errors.length === 0, errors };
};

export const validateProduct = (data) => {
  const errors = [];
  const { category_id, title_en, title_kn, description, price_per_unit, available_quantity, min_order_quantity, harvest_date, location_district, location_taluk, location_village } = data;

  if (!category_id || isNaN(category_id)) {
    errors.push('Valid category is required.');
  }
  if (!title_en || title_en.trim().length < 3) {
    errors.push('English title is required (minimum 3 characters).');
  }
  if (!title_kn || title_kn.trim().length < 3) {
    errors.push('Kannada title is required (minimum 3 characters).');
  }
  if (!description || description.trim().length < 10) {
    errors.push('Description is required (minimum 10 characters).');
  }
  if (price_per_unit === undefined || isNaN(price_per_unit) || Number(price_per_unit) <= 0) {
    errors.push('Price per unit must be a positive number.');
  }
  if (available_quantity === undefined || isNaN(available_quantity) || Number(available_quantity) <= 0) {
    errors.push('Available quantity must be greater than zero.');
  }
  if (min_order_quantity !== undefined && (isNaN(min_order_quantity) || Number(min_order_quantity) <= 0)) {
    errors.push('Minimum order quantity must be greater than zero.');
  }
  if (!harvest_date) {
    errors.push('Harvest date is required.');
  }
  if (!location_district || location_district.trim().length < 2) {
    errors.push('District is required.');
  }
  if (!location_taluk || location_taluk.trim().length < 2) {
    errors.push('Taluk is required.');
  }
  if (!location_village || location_village.trim().length < 2) {
    errors.push('Village is required.');
  }

  return { isValid: errors.length === 0, errors };
};
