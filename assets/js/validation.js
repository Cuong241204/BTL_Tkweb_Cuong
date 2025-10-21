// Validation system for QLy Hiệu Thuốc
(function() {
  'use strict';

  // Validation rules and messages
  const ValidationRules = {
    // Common patterns
    patterns: {
      phone: /^(0[3|5|7|8|9])+([0-9]{8})$/,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      vietnameseName: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêô\s]+$/,
      drugCode: /^[A-Z]{2}\d{3}$/,
      employeeCode: /^NV\d{3}$/,
      customerCode: /^KH\d{3}$/,
      price: /^\d+(\.\d{1,2})?$/,
      quantity: /^\d+$/
    },

    // Error messages
    messages: {
      required: 'Trường này là bắt buộc',
      phone: 'Số điện thoại không hợp lệ (VD: 0901234567)',
      email: 'Email không hợp lệ',
      vietnameseName: 'Tên chỉ được chứa chữ cái và khoảng trắng',
      drugCode: 'Mã thuốc phải có định dạng TH001',
      employeeCode: 'Mã nhân viên phải có định dạng NV001',
      customerCode: 'Mã khách hàng phải có định dạng KH001',
      price: 'Giá tiền không hợp lệ',
      quantity: 'Số lượng phải là số nguyên dương',
      minLength: (min) => `Tối thiểu ${min} ký tự`,
      maxLength: (max) => `Tối đa ${max} ký tự`,
      min: (min) => `Giá trị tối thiểu là ${min}`,
      max: (max) => `Giá trị tối đa là ${max}`,
      date: 'Ngày không hợp lệ',
      futureDate: 'Ngày phải là tương lai',
      pastDate: 'Ngày phải là quá khứ'
    }
  };

  // Validation class
  class FormValidator {
    constructor(formId) {
      this.form = document.getElementById(formId) || document.querySelector(formId);
      this.errors = {};
      this.rules = {};
      
      if (this.form) {
        this.init();
      }
    }

    init() {
      // Add validation classes to form
      this.form.classList.add('validated-form');
      
      // Add real-time validation
      this.addRealTimeValidation();
    }

    // Add validation rule for a field
    addRule(fieldName, rules) {
      this.rules[fieldName] = rules;
    }

    // Validate single field
    validateField(fieldName, value) {
      const rules = this.rules[fieldName];
      if (!rules) return { valid: true };

      const errors = [];

      // Required validation
      if (rules.required && (!value || value.trim() === '')) {
        errors.push(ValidationRules.messages.required);
        return { valid: false, errors };
      }

      // Skip other validations if field is empty and not required
      if (!value || value.trim() === '') {
        return { valid: true };
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.message || 'Giá trị không hợp lệ');
      }

      // Length validation
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(ValidationRules.messages.minLength(rules.minLength));
      }

      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(ValidationRules.messages.maxLength(rules.maxLength));
      }

      // Numeric validation
      if (rules.min !== undefined && !isNaN(parseFloat(value)) && parseFloat(value) < rules.min) {
        errors.push(ValidationRules.messages.min(rules.min));
      }

      if (rules.max !== undefined && !isNaN(parseFloat(value)) && parseFloat(value) > rules.max) {
        errors.push(ValidationRules.messages.max(rules.max));
      }

      // Date validation
      if (rules.date) {
        const date = new Date(value);
        if (isNaN(date.getTime())) {
          errors.push(ValidationRules.messages.date);
        } else if (rules.futureDate && date <= new Date()) {
          errors.push(ValidationRules.messages.futureDate);
        } else if (rules.pastDate && date >= new Date()) {
          errors.push(ValidationRules.messages.pastDate);
        }
      }

      return { valid: errors.length === 0, errors };
    }

    // Validate entire form
    validate() {
      this.errors = {};
      let isValid = true;

      Object.keys(this.rules).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        const value = field.value;
        const result = this.validateField(fieldName, value);
        
        if (!result.valid) {
          this.errors[fieldName] = result.errors;
          isValid = false;
        }
      });

      this.displayErrors();
      return isValid;
    }

    // Display validation errors
    displayErrors() {
      // Clear previous errors
      this.clearErrors();

      Object.keys(this.errors).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        const errorContainer = this.createErrorContainer(fieldName);
        const errors = this.errors[fieldName];
        
        errors.forEach(error => {
          const errorElement = document.createElement('div');
          errorElement.className = 'validation-error';
          errorElement.textContent = error;
          errorContainer.appendChild(errorElement);
        });

        field.classList.add('error');
        
        // Insert error container after the field's parent div
        const fieldParent = field.closest('.field') || field.parentNode;
        if (fieldParent) {
          fieldParent.appendChild(errorContainer);
        } else {
          field.parentNode.insertBefore(errorContainer, field.nextSibling);
        }
      });
    }

    // Create error container
    createErrorContainer(fieldName) {
      const container = document.createElement('div');
      container.className = 'validation-errors';
      container.setAttribute('data-field', fieldName);
      return container;
    }

    // Clear all validation errors
    clearErrors() {
      // Remove error classes
      this.form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
      });

      // Remove error messages
      this.form.querySelectorAll('.validation-errors').forEach(container => {
        container.remove();
      });
    }

    // Add real-time validation
    addRealTimeValidation() {
      Object.keys(this.rules).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        // Validate on blur
        field.addEventListener('blur', () => {
          const value = field.value;
          const result = this.validateField(fieldName, value);
          
          if (!result.valid) {
            this.showFieldError(fieldName, result.errors[0]);
          } else {
            this.clearFieldError(fieldName);
            field.classList.add('success');
          }
        });

        // Clear error on focus
        field.addEventListener('focus', () => {
          this.clearFieldError(fieldName);
          field.classList.remove('error', 'success');
        });

        // Validate on input for better UX
        field.addEventListener('input', () => {
          const value = field.value;
          if (value.trim() === '') {
            this.clearFieldError(fieldName);
            field.classList.remove('error', 'success');
          }
        });
      });
    }

    // Show error for specific field
    showFieldError(fieldName, message) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      field.classList.add('error');
      field.classList.remove('success');
      
      // Remove existing error for this field
      this.clearFieldError(fieldName);
      
      // Add new error
      const errorContainer = this.createErrorContainer(fieldName);
      const errorElement = document.createElement('div');
      errorElement.className = 'validation-error';
      errorElement.textContent = message;
      errorContainer.appendChild(errorElement);
      
      // Insert error container after the field's parent div
      const fieldParent = field.closest('.field') || field.parentNode;
      if (fieldParent) {
        fieldParent.appendChild(errorContainer);
      } else {
        field.parentNode.insertBefore(errorContainer, field.nextSibling);
      }
    }

    // Clear error for specific field
    clearFieldError(fieldName) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      field.classList.remove('error', 'success');
      
      const errorContainer = this.form.querySelector(`.validation-errors[data-field="${fieldName}"]`);
      if (errorContainer) {
        errorContainer.remove();
      }
    }
  }

  // Specific form validators
  class BanHangValidator extends FormValidator {
    constructor() {
      super('banhang-form');
      this.setupBanHangRules();
    }

    setupBanHangRules() {
      // Search validation
      this.addRule('search', {
        minLength: 2,
        message: 'Tối thiểu 2 ký tự để tìm kiếm'
      });

      // Quantity validation
      this.addRule('quantity', {
        required: true,
        pattern: ValidationRules.patterns.quantity,
        min: 1,
        max: 999,
        message: 'Số lượng phải từ 1-999'
      });

      // Price validation
      this.addRule('price', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá tiền phải lớn hơn 0'
      });
    }
  }

  class KhachHangValidator extends FormValidator {
    constructor() {
      super('khachhang-form');
      this.setupKhachHangRules();
    }

    setupKhachHangRules() {
      // Name validation
      this.addRule('name', {
        required: true,
        pattern: ValidationRules.patterns.vietnameseName,
        minLength: 2,
        maxLength: 50,
        message: 'Tên khách hàng không hợp lệ'
      });

      // Phone validation
      this.addRule('phone', {
        required: true,
        pattern: ValidationRules.patterns.phone,
        message: ValidationRules.messages.phone
      });

      // Email validation (optional)
      this.addRule('email', {
        pattern: ValidationRules.patterns.email,
        message: ValidationRules.messages.email
      });

      // Address validation
      this.addRule('address', {
        maxLength: 200,
        message: 'Địa chỉ không được quá 200 ký tự'
      });
    }
  }

  class DuocPhamValidator extends FormValidator {
    constructor() {
      super('duocpham-form');
      this.setupDuocPhamRules();
    }

    setupDuocPhamRules() {
      // Drug code validation
      this.addRule('code', {
        required: true,
        pattern: ValidationRules.patterns.drugCode,
        message: ValidationRules.messages.drugCode
      });

      // Drug name validation
      this.addRule('name', {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Tên thuốc không hợp lệ'
      });

      // Active ingredient validation
      this.addRule('ingredient', {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Hoạt chất không hợp lệ'
      });

      // Manufacturer validation
      this.addRule('manufacturer', {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Nhà sản xuất không hợp lệ'
      });

      // Price validation
      this.addRule('price', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá tiền không hợp lệ'
      });
    }
  }


  class KhoValidator extends FormValidator {
    constructor() {
      super('kho-form');
      this.setupKhoRules();
    }

    setupKhoRules() {
      // Drug code validation
      this.addRule('drugCode', {
        required: true,
        pattern: ValidationRules.patterns.drugCode,
        message: ValidationRules.messages.drugCode
      });

      // Quantity validation
      this.addRule('quantity', {
        required: true,
        pattern: ValidationRules.patterns.quantity,
        min: 1,
        max: 9999,
        message: 'Số lượng không hợp lệ'
      });

      // Expiry date validation
      this.addRule('expiryDate', {
        required: true,
        date: true,
        futureDate: true,
        message: 'Hạn sử dụng phải là tương lai'
      });

      // Batch number validation
      this.addRule('batchNumber', {
        required: true,
        minLength: 3,
        maxLength: 20,
        message: 'Số lô không hợp lệ'
      });

      // Import price validation
      this.addRule('importPrice', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá nhập không hợp lệ'
      });

      // Selling price validation
      this.addRule('sellingPrice', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá bán không hợp lệ'
      });
    }
  }

  class NhanSuValidator extends FormValidator {
    constructor() {
      super('nhan-su-form');
      this.setupNhanSuRules();
    }

    setupNhanSuRules() {
      // Employee code validation
      this.addRule('employeeCode', {
        required: true,
        minLength: 3,
        maxLength: 20,
        message: 'Mã nhân viên phải từ 3-20 ký tự'
      });

      // Full name validation
      this.addRule('fullName', {
        required: true,
        pattern: ValidationRules.patterns.vietnameseName,
        minLength: 2,
        maxLength: 50,
        message: 'Họ tên không hợp lệ'
      });

      // Phone validation
      this.addRule('phone', {
        required: true,
        pattern: ValidationRules.patterns.phone,
        message: ValidationRules.messages.phone
      });

      // Email validation (optional)
      this.addRule('email', {
        pattern: ValidationRules.patterns.email,
        message: ValidationRules.messages.email
      });

      // Birth date validation
      this.addRule('birthDate', {
        required: true,
        date: true,
        pastDate: true,
        message: 'Ngày sinh không hợp lệ'
      });

      // Gender validation
      this.addRule('gender', {
        required: true,
        message: 'Vui lòng chọn giới tính'
      });

      // Position validation
      this.addRule('position', {
        required: true,
        message: 'Vui lòng chọn chức vụ'
      });

      // Base salary validation
      this.addRule('baseSalary', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 1000000,
        max: 100000000,
        message: 'Lương cơ bản phải từ 1,000,000 - 100,000,000₫'
      });

      // Address validation
      this.addRule('address', {
        maxLength: 200,
        message: 'Địa chỉ không được quá 200 ký tự'
      });

      // Start date validation
      this.addRule('startDate', {
        required: true,
        date: true,
        pastDate: true,
        message: 'Ngày bắt đầu không hợp lệ'
      });
    }
  }

  class ChamCongValidator extends FormValidator {
    constructor() {
      super('cham-cong-form');
      this.setupChamCongRules();
    }

    setupChamCongRules() {
      // Employee selection validation
      this.addRule('employeeId', {
        required: true,
        message: 'Vui lòng chọn nhân viên'
      });

      // Attendance date validation
      this.addRule('attendanceDate', {
        required: true,
        date: true,
        message: 'Ngày chấm công không hợp lệ'
      });

      // Check-in time validation
      this.addRule('checkIn', {
        required: true,
        message: 'Vui lòng nhập giờ vào'
      });

      // Check-out time validation (optional)
      this.addRule('checkOut', {
        message: 'Giờ ra không hợp lệ'
      });
    }
  }

  // Export validators
  window.FormValidator = FormValidator;
  window.BanHangValidator = BanHangValidator;
  window.KhachHangValidator = KhachHangValidator;
  window.DuocPhamValidator = DuocPhamValidator;
  window.KhoValidator = KhoValidator;
  window.NhanSuValidator = NhanSuValidator;
  window.ChamCongValidator = ChamCongValidator;
  window.ValidationRules = ValidationRules;

})();
