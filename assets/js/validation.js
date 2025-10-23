(function() {
  'use strict';

  /**
   * Đối tượng chứa các quy tắc validation và thông báo lỗi
   */
  const ValidationRules = {
    /**
     * Các pattern regex để kiểm tra định dạng dữ liệu
     */
    patterns: {
      phone: /^(0[3|5|7|8|9])+([0-9]{8})$/, // Số điện thoại Việt Nam (10 số, bắt đầu bằng 0)
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email hợp lệ
      vietnameseName: /^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔưăâêô\s]+$/, // Tên tiếng Việt
      drugCode: /^[A-Z]{2}\d{3}$/, // Mã thuốc: 2 chữ cái + 3 số (VD: TH001)
      employeeCode: /^NV\d{3}$/, // Mã nhân viên: NV + 3 số (VD: NV001)
      customerCode: /^KH\d{3}$/, // Mã khách hàng: KH + 3 số (VD: KH001)
      price: /^\d+(\.\d{1,2})?$/, // Giá tiền: số nguyên hoặc số thập phân (tối đa 2 chữ số sau dấu phẩy)
      quantity: /^\d+$/ // Số lượng: chỉ chấp nhận số nguyên dương
    },

    /**
     * Các thông báo lỗi validation
     */
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

  /**
   * Lớp FormValidator - Lớp chính để xử lý validation cho các form
   */
  class FormValidator {
    /**
     * Khởi tạo validator cho form
     * @param {string} formId - ID của form cần validation
     */
    constructor(formId) {
      this.form = document.getElementById(formId) || document.querySelector(formId);
      this.errors = {}; // Lưu trữ các lỗi validation
      this.rules = {}; // Lưu trữ các quy tắc validation cho từng field
      
      if (this.form) {
        this.init();
      }
    }

    /**
     * Khởi tạo các chức năng validation cho form
     */
    init() {
      // Thêm class CSS để đánh dấu form đã được validation
      this.form.classList.add('validated-form');
      
      // Thêm validation real-time (kiểm tra ngay khi người dùng nhập)
      this.addRealTimeValidation();
    }

    /**
     * Thêm quy tắc validation cho một field
     * @param {string} fieldName - Tên field cần validation
     * @param {object} rules - Các quy tắc validation
     */
    addRule(fieldName, rules) {
      this.rules[fieldName] = rules;
    }

    /**
     * Kiểm tra validation cho một field cụ thể
     * @param {string} fieldName - Tên field cần kiểm tra
     * @param {string} value - Giá trị cần kiểm tra
     * @returns {object} - Kết quả validation 
     */
    validateField(fieldName, value) {
      const rules = this.rules[fieldName];
      if (!rules) return { valid: true };

      const errors = [];

      // Kiểm tra trường bắt buộc
      if (rules.required && (!value || value.trim() === '')) {
        errors.push(ValidationRules.messages.required);
        return { valid: false, errors };
      }

      // Bỏ qua các validation khác nếu field trống và không bắt buộc
      if (!value || value.trim() === '') {
        return { valid: true };
      }

      // Kiểm tra pattern (regex)
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.message || 'Giá trị không hợp lệ');
      }

      // Kiểm tra độ dài tối thiểu
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(ValidationRules.messages.minLength(rules.minLength));
      }

      // Kiểm tra độ dài tối đa
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(ValidationRules.messages.maxLength(rules.maxLength));
      }

      // Kiểm tra giá trị số tối thiểu
      if (rules.min !== undefined && !isNaN(parseFloat(value)) && parseFloat(value) < rules.min) {
        errors.push(ValidationRules.messages.min(rules.min));
      }

      // Kiểm tra giá trị số tối đa
      if (rules.max !== undefined && !isNaN(parseFloat(value)) && parseFloat(value) > rules.max) {
        errors.push(ValidationRules.messages.max(rules.max));
      }

      // Kiểm tra ngày tháng
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

    /**
     * Kiểm tra validation cho toàn bộ form
     * @returns {boolean} - true nếu form hợp lệ, false nếu có lỗi
     */
    validate() {
      this.errors = {};
      let isValid = true;

      // Duyệt qua tất cả các field có quy tắc validation
      Object.keys(this.rules).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        const value = field.value;
        const result = this.validateField(fieldName, value);
        
        // Nếu field không hợp lệ, lưu lỗi và đánh dấu form không hợp lệ
        if (!result.valid) {
          this.errors[fieldName] = result.errors;
          isValid = false;
        }
      });

      // Hiển thị các lỗi validation
      this.displayErrors();
      return isValid;
    }

    /**
     * Hiển thị các lỗi validation lên giao diện
     */
    displayErrors() {
      // Xóa các lỗi cũ trước khi hiển thị lỗi mới
      this.clearErrors();

      // Duyệt qua tất cả các field có lỗi
      Object.keys(this.errors).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        // Tạo container chứa thông báo lỗi
        const errorContainer = this.createErrorContainer(fieldName);
        const errors = this.errors[fieldName];
        
        // Tạo element hiển thị từng lỗi
        errors.forEach(error => {
          const errorElement = document.createElement('div');
          errorElement.className = 'validation-error';
          errorElement.textContent = error;
          errorContainer.appendChild(errorElement);
        });

        // Thêm class CSS để đánh dấu field có lỗi
        field.classList.add('error');
        
        // Chèn container lỗi vào DOM
        const fieldParent = field.closest('.field') || field.parentNode;
        if (fieldParent) {
          fieldParent.appendChild(errorContainer);
        } else {
          field.parentNode.insertBefore(errorContainer, field.nextSibling);
        }
      });
    }

    /**
     * Tạo container chứa thông báo lỗi cho field
     * @param {string} fieldName - Tên field
     * @returns {HTMLElement} - Container element
     */
    createErrorContainer(fieldName) {
      const container = document.createElement('div');
      container.className = 'validation-errors';
      container.setAttribute('data-field', fieldName);
      return container;
    }

    /**
     * Xóa tất cả các lỗi validation khỏi giao diện
     */
    clearErrors() {
      // Xóa class CSS lỗi khỏi các field
      this.form.querySelectorAll('.error').forEach(field => {
        field.classList.remove('error');
      });

      // Xóa tất cả thông báo lỗi khỏi DOM
      this.form.querySelectorAll('.validation-errors').forEach(container => {
        container.remove();
      });
    }

    /**
     * Thêm validation real-time (kiểm tra ngay khi người dùng nhập liệu)
     */
    addRealTimeValidation() {
      Object.keys(this.rules).forEach(fieldName => {
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        if (!field) return;

        // Kiểm tra validation khi người dùng rời khỏi field (blur)
        field.addEventListener('blur', () => {
          const value = field.value;
          const result = this.validateField(fieldName, value);
          
          if (!result.valid) {
            // Hiển thị lỗi đầu tiên nếu có lỗi
            this.showFieldError(fieldName, result.errors[0]);
          } else {
            // Xóa lỗi và đánh dấu field hợp lệ
            this.clearFieldError(fieldName);
            field.classList.add('success');
          }
        });

        // Xóa lỗi khi người dùng focus vào field
        field.addEventListener('focus', () => {
          this.clearFieldError(fieldName);
          field.classList.remove('error', 'success');
        });

        // Xóa lỗi khi người dùng bắt đầu nhập liệu (để cải thiện UX)
        field.addEventListener('input', () => {
          const value = field.value;
          if (value.trim() === '') {
            this.clearFieldError(fieldName);
            field.classList.remove('error', 'success');
          }
        });
      });
    }

    /**
     * Hiển thị lỗi cho một field cụ thể
     * @param {string} fieldName - Tên field
     * @param {string} message - Thông báo lỗi
     */
    showFieldError(fieldName, message) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      // Đánh dấu field có lỗi
      field.classList.add('error');
      field.classList.remove('success');
      
      // Xóa lỗi cũ của field này
      this.clearFieldError(fieldName);
      
      // Tạo và hiển thị lỗi mới
      const errorContainer = this.createErrorContainer(fieldName);
      const errorElement = document.createElement('div');
      errorElement.className = 'validation-error';
      errorElement.textContent = message;
      errorContainer.appendChild(errorElement);
      
      // Chèn container lỗi vào DOM
      const fieldParent = field.closest('.field') || field.parentNode;
      if (fieldParent) {
        fieldParent.appendChild(errorContainer);
      } else {
        field.parentNode.insertBefore(errorContainer, field.nextSibling);
      }
    }

    /**
     * Xóa lỗi cho một field cụ thể
     * @param {string} fieldName - Tên field
     */
    clearFieldError(fieldName) {
      const field = this.form.querySelector(`[name="${fieldName}"]`);
      if (!field) return;

      // Xóa các class CSS lỗi
      field.classList.remove('error', 'success');
      
      // Xóa container lỗi khỏi DOM
      const errorContainer = this.form.querySelector(`.validation-errors[data-field="${fieldName}"]`);
      if (errorContainer) {
        errorContainer.remove();
      }
    }
  }

  /**
   * Validator cho form Bán Hàng
   * Kế thừa từ FormValidator và thiết lập các quy tắc riêng cho bán hàng
   */
  class BanHangValidator extends FormValidator {
    constructor() {
      super('banhang-form');
      this.setupBanHangRules();
    }

    /**
     * Thiết lập các quy tắc validation cho form bán hàng
     */
    setupBanHangRules() {
      // Validation cho ô tìm kiếm
      this.addRule('search', {
        minLength: 2,
        message: 'Tối thiểu 2 ký tự để tìm kiếm'
      });

      // Validation cho số lượng
      this.addRule('quantity', {
        required: true,
        pattern: ValidationRules.patterns.quantity,
        min: 1,
        max: 999,
        message: 'Số lượng phải từ 1-999'
      });

      // Validation cho giá tiền
      this.addRule('price', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá tiền phải lớn hơn 0'
      });
    }
  }

  /**
   * Validator cho form Khách Hàng
   * Kế thừa từ FormValidator và thiết lập các quy tắc riêng cho khách hàng
   */
  class KhachHangValidator extends FormValidator {
    constructor() {
      super('khachhang-form');
      this.setupKhachHangRules();
    }

    /**
     * Thiết lập các quy tắc validation cho form khách hàng
     */
    setupKhachHangRules() {
      // Validation cho tên khách hàng
      this.addRule('name', {
        required: true,
        pattern: ValidationRules.patterns.vietnameseName,
        minLength: 2,
        maxLength: 50,
        message: 'Tên khách hàng không hợp lệ'
      });

      // Validation cho số điện thoại
      this.addRule('phone', {
        required: true,
        pattern: ValidationRules.patterns.phone,
        message: ValidationRules.messages.phone
      });

      // Validation cho email (không bắt buộc)
      this.addRule('email', {
        pattern: ValidationRules.patterns.email,
        message: ValidationRules.messages.email
      });

      // Validation cho địa chỉ
      this.addRule('address', {
        maxLength: 200,
        message: 'Địa chỉ không được quá 200 ký tự'
      });
    }
  }

  /**
   * Validator cho form Dược Phẩm
   * Kế thừa từ FormValidator và thiết lập các quy tắc riêng cho dược phẩm
   */
  class DuocPhamValidator extends FormValidator {
    constructor() {
      super('duocpham-form');
      this.setupDuocPhamRules();
    }

    /**
     * Thiết lập các quy tắc validation cho form dược phẩm
     */
    setupDuocPhamRules() {
      // Validation cho mã thuốc
      this.addRule('code', {
        required: true,
        pattern: ValidationRules.patterns.drugCode,
        message: ValidationRules.messages.drugCode
      });

      // Validation cho tên thuốc
      this.addRule('name', {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Tên thuốc không hợp lệ'
      });

      // Validation cho hoạt chất
      this.addRule('ingredient', {
        required: true,
        minLength: 2,
        maxLength: 100,
        message: 'Hoạt chất không hợp lệ'
      });

      // Validation cho nhà sản xuất
      this.addRule('manufacturer', {
        required: true,
        minLength: 2,
        maxLength: 50,
        message: 'Nhà sản xuất không hợp lệ'
      });

      // Validation cho giá tiền
      this.addRule('price', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá tiền không hợp lệ'
      });
    }
  }


  /**
   * Validator cho form Kho
   * Kế thừa từ FormValidator và thiết lập các quy tắc riêng cho quản lý kho
   */
  class KhoValidator extends FormValidator {
    constructor() {
      super('kho-form');
      this.setupKhoRules();
    }

    /**
     * Thiết lập các quy tắc validation cho form kho
     */
    setupKhoRules() {
      // Validation cho mã thuốc
      this.addRule('drugCode', {
        required: true,
        pattern: ValidationRules.patterns.drugCode,
        message: ValidationRules.messages.drugCode
      });

      // Validation cho số lượng
      this.addRule('quantity', {
        required: true,
        pattern: ValidationRules.patterns.quantity,
        min: 1,
        max: 9999,
        message: 'Số lượng không hợp lệ'
      });

      // Validation cho hạn sử dụng
      this.addRule('expiryDate', {
        required: true,
        date: true,
        futureDate: true,
        message: 'Hạn sử dụng phải là tương lai'
      });

      // Validation cho số lô
      this.addRule('batchNumber', {
        required: true,
        minLength: 3,
        maxLength: 20,
        message: 'Số lô không hợp lệ'
      });

      // Validation cho giá nhập
      this.addRule('importPrice', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá nhập không hợp lệ'
      });

      // Validation cho giá bán
      this.addRule('sellingPrice', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 0,
        message: 'Giá bán không hợp lệ'
      });
    }
  }

  /**
   * Validator cho form Nhân Sự
   * Kế thừa từ FormValidator và thiết lập các quy tắc riêng cho quản lý nhân sự
   */
  class NhanSuValidator extends FormValidator {
    constructor() {
      super('nhan-su-form');
      this.setupNhanSuRules();
    }

    /**
     * Thiết lập các quy tắc validation cho form nhân sự
     */
    setupNhanSuRules() {
      // Validation cho mã nhân viên
      this.addRule('employeeCode', {
        required: true,
        minLength: 3,
        maxLength: 20,
        message: 'Mã nhân viên phải từ 3-20 ký tự'
      });

      // Validation cho họ tên
      this.addRule('fullName', {
        required: true,
        pattern: ValidationRules.patterns.vietnameseName,
        minLength: 2,
        maxLength: 50,
        message: 'Họ tên không hợp lệ'
      });

      // Validation cho số điện thoại
      this.addRule('phone', {
        required: true,
        pattern: ValidationRules.patterns.phone,
        message: ValidationRules.messages.phone
      });

      // Validation cho email (không bắt buộc)
      this.addRule('email', {
        pattern: ValidationRules.patterns.email,
        message: ValidationRules.messages.email
      });

      // Validation cho ngày sinh
      this.addRule('birthDate', {
        required: true,
        date: true,
        pastDate: true,
        message: 'Ngày sinh không hợp lệ'
      });

      // Validation cho giới tính
      this.addRule('gender', {
        required: true,
        message: 'Vui lòng chọn giới tính'
      });

      // Validation cho chức vụ
      this.addRule('position', {
        required: true,
        message: 'Vui lòng chọn chức vụ'
      });

      // Validation cho lương cơ bản
      this.addRule('baseSalary', {
        required: true,
        pattern: ValidationRules.patterns.price,
        min: 1000000,
        max: 100000000,
        message: 'Lương cơ bản phải từ 1,000,000 - 100,000,000₫'
      });

      // Validation cho địa chỉ
      this.addRule('address', {
        maxLength: 200,
        message: 'Địa chỉ không được quá 200 ký tự'
      });

      // Validation cho ngày bắt đầu làm việc
      this.addRule('startDate', {
        required: true,
        date: true,
        pastDate: true,
        message: 'Ngày bắt đầu không hợp lệ'
      });
    }
  }



  /**
   * Xuất các validator ra global scope để có thể sử dụng trong các file khác
   */
  window.FormValidator = FormValidator;
  window.BanHangValidator = BanHangValidator;
  window.KhachHangValidator = KhachHangValidator;
  window.DuocPhamValidator = DuocPhamValidator;
  window.KhoValidator = KhoValidator;
  window.NhanSuValidator = NhanSuValidator;
  window.ValidationRules = ValidationRules;

})();
