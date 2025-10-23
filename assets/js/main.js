/**
 * Hệ thống quản lý hiệu thuốc - JavaScript chính
 * Chức năng: Quản lý kho, bán hàng, khách hàng, nhân sự, dược phẩm
 * @author QLy Hiệu Thuốc
 * @version 1.0
 */
(function () {
  'use strict';

  // ========================================
  // CHỨC NĂNG GIAO DIỆN
  // ========================================

  /**
   * Khởi tạo chức năng chuyển đổi giao diện sáng/tối
   */
  function initTheme() {
    var themeToggle = document.getElementById('theme-toggle');
    var themeIcon = document.getElementById('theme-icon');
    var html = document.documentElement;
    
    // Lấy theme đã lưu hoặc mặc định là tối
    var savedTheme = localStorage.getItem('theme') || 'dark';
    html.setAttribute('data-theme', savedTheme);
    
    /**
     * Cập nhật icon dựa trên theme hiện tại
     */
    function updateIcon() {
      var currentTheme = html.getAttribute('data-theme');
      if (themeIcon) {
        themeIcon.innerHTML = currentTheme === 'light' 
          ? '<use href="assets/icons.svg#moon"/>' 
          : '<use href="assets/icons.svg#sun"/>';
      }
    }
    
    updateIcon();
    
    // Xử lý sự kiện click chuyển đổi theme
    if (themeToggle) {
      themeToggle.addEventListener('click', function() {
        var currentTheme = html.getAttribute('data-theme');
        var newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateIcon();
      });
    }
  }

  /**
   * Thiết lập link navigation đang hoạt động dựa trên đường dẫn hiện tại
   */
  try {
    // Lấy đường dẫn hiện tại và chuẩn hóa
    var path = location.pathname.replace(/\\/g, '/');
    var links = document.querySelectorAll('.nav-links a');
    
    // Duyệt qua tất cả các link navigation
    links.forEach(function (a) {
      var href = a.getAttribute('href');
      if (!href) return;
      
      // Chuẩn hóa đường dẫn href
      var normalized = href.replace(/\\/g, '/');
      
      // Kiểm tra xem có phải trang chủ không
      var isRootIndex = (path.endsWith('/') || path.endsWith('/index.html')) && (normalized === 'index.html' || normalized === './' || normalized === '/');
      
      // Kiểm tra xem link có khớp với đường dẫn hiện tại không
      var isSame = path.endsWith('/' + normalized) || isRootIndex;
      
      // Thêm class 'active' nếu link đang được chọn
      if (isSame) a.classList.add('active');
    });
  } catch (e) {
    console.warn('Lỗi khi thiết lập navigation:', e);
  }

  // Khởi tạo theme
  initTheme();

  // ========================================
  // CHỨC NĂNG LỌC BẢNG
  // ========================================

  /**
   * Thiết lập bộ lọc đơn giản cho bảng
   * @param {string} wrapperSelector - Selector của container bảng
   * @param {string} inputSelector - Selector của ô tìm kiếm
   */
  function attachTableFilter(wrapperSelector, inputSelector) {
    var input = document.querySelector(inputSelector);
    var table = document.querySelector(wrapperSelector + ' table');
    if (!input || !table) return;
    
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase();
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var text = tr.textContent.toLowerCase();
        tr.style.display = text.indexOf(q) !== -1 ? '' : 'none';
      });
    });
  }

  /**
   * Thiết lập bộ lọc nâng cao cho bảng với trạng thái
   * @param {string} wrapperSelector - Selector của container bảng
   * @param {string} inputSelector - Selector của ô tìm kiếm
   * @param {string} statusSelector - Selector của dropdown trạng thái
   */
  function attachAdvancedTableFilter(wrapperSelector, inputSelector, statusSelector) {
    var input = document.querySelector(inputSelector);
    var statusSelect = document.querySelector(statusSelector);
    var table = document.querySelector(wrapperSelector + ' table');
    if (!input || !table) return;

    /**
     * Thực hiện lọc bảng dựa trên từ khóa và trạng thái
     */
    function filterTable() {
      var searchTerm = input.value.toLowerCase();
      var statusFilter = statusSelect ? statusSelect.value : '';
      
      table.querySelectorAll('tbody tr').forEach(function (tr) {
        var text = tr.textContent.toLowerCase();
        var statusMatch = !statusFilter || tr.textContent.includes(statusFilter);
        var searchMatch = text.indexOf(searchTerm) !== -1;
        
        tr.style.display = (searchMatch && statusMatch) ? '' : 'none';
      });
    }

    input.addEventListener('input', filterTable);
    if (statusSelect) {
      statusSelect.addEventListener('change', filterTable);
    }
  }

  // ========================================
  // KHỞI TẠO BỘ LỌC CHO CÁC TRANG
  // ========================================
  
  // Khởi tạo bộ lọc cho các trang đã biết
  attachTableFilter('#kho-table', '#kho-search');
  attachTableFilter('#banhang-table', '#banhang-search');
  attachTableFilter('#khachhang-table', '#khachhang-search');
  attachTableFilter('#duocpham-table', '#duocpham-search');
  attachTableFilter('#taichinh-table', '#taichinh-search');
  attachAdvancedTableFilter('#nhan-su-table', '#nhan-su-search', '#nhan-su-status-filter');

  // ========================================
  // CHỨC NĂNG VALIDATION FORM
  // ========================================

  /**
   * Khởi tạo validation cho tất cả các form
   */
  function initFormValidation() {
    // Khởi tạo validator cho từng trang
    if (document.getElementById('banhang-form')) {
      window.banHangValidator = new BanHangValidator();
    }
    
    if (document.getElementById('khachhang-form')) {
      window.khachHangValidator = new KhachHangValidator();
    }
    
    if (document.getElementById('duocpham-form')) {
      window.duocPhamValidator = new DuocPhamValidator();
    }
    
    if (document.getElementById('kho-form')) {
      window.khoValidator = new KhoValidator();
    }

    if (document.getElementById('nhan-su-form')) {
      window.nhanSuValidator = new NhanSuValidator();
    }



    // Thêm validation cho tất cả form khi submit
    document.querySelectorAll('form').forEach(form => {
      form.addEventListener('submit', function(e) {
        const validator = getValidatorForForm(this);
        if (validator) {
          if (!validator.validate()) {
            e.preventDefault();
            showValidationSummary(validator.errors);
            return false;
          }
        }
      });
    });
  }

  /**
   * Lấy validator cho form cụ thể
   * @param {HTMLFormElement} form - Form element
   * @returns {Object|null} - Validator instance hoặc null
   */
  function getValidatorForForm(form) {
    const formId = form.id;
    switch(formId) {
      case 'banhang-form': return window.banHangValidator;
      case 'khachhang-form': return window.khachHangValidator;
      case 'duocpham-form': return window.duocPhamValidator;
      case 'kho-form': return window.khoValidator;
      case 'nhan-su-form': return window.nhanSuValidator;
      default: return null;
    }
  }

  /**
   * Hiển thị tóm tắt lỗi validation
   * @param {Object} errors - Object chứa các lỗi validation
   */
  function showValidationSummary(errors) {
    let summary = document.querySelector('.validation-summary');
    if (!summary) {
      summary = document.createElement('div');
      summary.className = 'validation-summary';
      document.querySelector('main .container').insertBefore(summary, document.querySelector('main .container').firstChild);
    }

    const title = document.createElement('div');
    title.className = 'validation-summary-title';
    title.textContent = 'Vui lòng kiểm tra lại thông tin:';

    const list = document.createElement('ul');
    list.className = 'validation-summary-list';

    Object.keys(errors).forEach(fieldName => {
      const field = document.querySelector(`[name="${fieldName}"]`);
      const fieldLabel = field ? (field.getAttribute('data-label') || fieldName) : fieldName;
      
      errors[fieldName].forEach(error => {
        const li = document.createElement('li');
        li.textContent = `${fieldLabel}: ${error}`;
        list.appendChild(li);
      });
    });

    summary.innerHTML = '';
    summary.appendChild(title);
    summary.appendChild(list);
    summary.classList.add('show');

    // Cuộn đến phần tóm tắt lỗi
    summary.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Tự động ẩn sau 5 giây
    setTimeout(() => {
      summary.classList.remove('show');
    }, 5000);
  }

  // Khởi tạo validation khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFormValidation);
  } else {
    initFormValidation();
  }

  // ========================================
  // QUẢN LÝ DỮ LIỆU
  // ========================================

  /**
   * Lấy dữ liệu từ localStorage
   * @param {string} key - Khóa lưu trữ
   * @returns {Array} - Mảng dữ liệu hoặc mảng rỗng
   */
  function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Lưu dữ liệu vào localStorage
   * @param {string} key - Khóa lưu trữ
   * @param {Array} data - Dữ liệu cần lưu
   */
  function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  /**
   * Khởi tạo dữ liệu mẫu nếu chưa tồn tại
   */
  function initSampleData() {
    // Khởi tạo dữ liệu kho
    if (!localStorage.getItem('khoData')) {
      const khoData = [
        { id: 1, code: 'TH001', name: 'Paracetamol 500mg', expiry: '12/2026', batch: 'PA202510', stock: 240, importPrice: 850, sellingPrice: 1200, status: 'Còn hàng' },
        { id: 2, code: 'TH002', name: 'Amoxicillin 500mg', expiry: '03/2026', batch: 'AMX0326', stock: 52, importPrice: 2100, sellingPrice: 3000, status: 'Sắp hết' },
        { id: 3, code: 'TH003', name: 'Vitamin C 1000mg', expiry: '08/2027', batch: 'VC1027', stock: 480, importPrice: 1900, sellingPrice: 2700, status: 'Còn hàng' }
      ];
      saveData('khoData', khoData);
    }

    // Khởi tạo dữ liệu khách hàng
    if (!localStorage.getItem('khachHangData')) {
      const khachHangData = [
        { id: 1, code: 'KH001', name: 'Nguyễn Văn Anh', phone: '0901 234 567', email: '', address: '', rank: 'VIP', totalSpent: 12400000, lastPurchase: '19/10/2025' },
        { id: 2, code: 'KH002', name: 'Nguyễn Thúy Hiền', phone: '0902 222 333', email: '', address: '', rank: 'Thường', totalSpent: 1250000, lastPurchase: '17/10/2025' },
        { id: 3, code: 'KH003', name: 'Đỗ Lan Hương', phone: '0902 222 456', email: '', address: '', rank: 'Thường', totalSpent: 5000000, lastPurchase: '15/10/2025' }
      ];
      saveData('khachHangData', khachHangData);
    }

    // Khởi tạo dữ liệu bán hàng (giỏ hàng)
    if (!localStorage.getItem('banHangData')) {
      saveData('banHangData', []);
    }

    // Khởi tạo dữ liệu dược phẩm
    if (!localStorage.getItem('duocPhamData')) {
      const duocPhamData = [
        { id: 1, code: 'DP001', name: 'Panadol', ingredient: 'Paracetamol', form: 'Viên nén', manufacturer: 'GSK', price: 120000 },
        { id: 2, code: 'DP002', name: 'Augmentin', ingredient: 'Amoxicillin/Clavulanate', form: 'Viên nén', manufacturer: 'GSK', price: 300000 },
        { id: 3, code: 'DP003', name: 'Bổ phế', ingredient: 'BBC', form: 'Siro', manufacturer: 'GSK', price: 270000 }
      ];
      saveData('duocPhamData', duocPhamData);
    }

    // Khởi tạo dữ liệu nhân sự
    if (!localStorage.getItem('nhanSuData')) {
      const nhanSuData = [
        { id: 1, employeeCode: 'NV001', fullName: 'Đinh Thị Vân', phone: '0901234567', email: 'van@example.com', birthDate: '1985-03-15', gender: 'Nữ', position: 'Dược sĩ', baseSalary: 12000000, address: 'Hà Nội', startDate: '2020-01-01', status: 'Đang làm' },
        { id: 2, employeeCode: 'NV002', fullName: 'Phạm Văn Được', phone: '0902345678', email: 'duoc@example.com', birthDate: '1988-07-20', gender: 'Nam', position: 'Thu ngân', baseSalary: 8000000, address: 'TP.HCM', startDate: '2021-03-15', status: 'Tạm nghỉ' },
        { id: 3, employeeCode: 'NV003', fullName: 'Lại Bá Đức', phone: '0372869968', email: 'duc1@example.com', birthDate: '2001-02-18', gender: 'Nam', position: 'Thu ngân', baseSalary: 10000000, address: 'Phú Thọ', startDate: '2021-03-15', status: 'Nghỉ việc' }
      ];
      saveData('nhanSuData', nhanSuData);
      console.log('Đã khởi tạo dữ liệu nhân sự mẫu');
    }

  }

  // ========================================
  // XỬ LÝ FORM SUBMISSION
  // ========================================

  /**
   * Xử lý form nhập hàng vào kho
   */
  function handleKhoForm() {
    const form = document.getElementById('kho-form');
    if (!form) {
      console.log('Không tìm thấy form kho');
      return;
    }

    console.log('Đã tìm thấy form kho, đang thiết lập event listener...');

    form.addEventListener('submit', function(e) {
      // Ngăn chặn hành vi submit mặc định của form
      e.preventDefault();
      console.log('Form kho được submit');
      
      // Kiểm tra validation trước khi xử lý dữ liệu
      const validator = window.khoValidator;
      if (validator && !validator.validate()) {
        console.log('Validation failed');
        return;
      }
      
      // Lấy dữ liệu từ form
      const formData = new FormData(form);
      
      // Tạo object dữ liệu mới cho kho
      const data = {
        id: Date.now(), // ID duy nhất dựa trên timestamp
        code: formData.get('drugCode'), // Mã thuốc
        name: 'Thuốc mới', // Tên thuốc sẽ được lấy từ database
        expiry: formData.get('expiryDate'), // Ngày hết hạn
        batch: formData.get('batchNumber'), // Số lô
        stock: parseInt(formData.get('quantity')), // Số lượng tồn kho
        importPrice: parseFloat(formData.get('importPrice')), // Giá nhập
        sellingPrice: parseFloat(formData.get('sellingPrice')), // Giá bán
        status: 'Còn hàng' // Trạng thái mặc định
      };

      console.log('Dữ liệu kho mới:', data);

      // Lấy dữ liệu kho hiện tại và thêm dữ liệu mới
      const khoData = getData('khoData');
      khoData.push(data);
      saveData('khoData', khoData);
      
      console.log('Đã lưu dữ liệu, đang cập nhật bảng...');
      
      // Cập nhật bảng hiển thị
      updateKhoTable();
      
      // Reset form về trạng thái ban đầu
      form.reset();
      
      // Hiển thị thông báo thành công
      showNotification('Nhập hàng thành công!', 'success');
    });
  }

  /**
   * Xử lý form thêm khách hàng
   */
  function handleKhachHangForm() {
    const form = document.getElementById('khachhang-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        id: Date.now(),
        code: 'KH' + String(Date.now()).slice(-3),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || '',
        address: formData.get('address') || '',
        rank: 'Thường',
        totalSpent: 0,
        lastPurchase: new Date().toLocaleDateString('vi-VN')
      };

      const khachHangData = getData('khachHangData');
      khachHangData.push(data);
      saveData('khachHangData', khachHangData);
      
      // Cập nhật bảng
      updateKhachHangTable();
      form.reset();
      
      // Hiển thị thông báo thành công
      showNotification('Thêm khách hàng thành công!', 'success');
    });
  }

  /**
   * Xử lý form bán hàng (thêm vào giỏ hàng)
   */
  function handleBanHangForm() {
    const form = document.getElementById('banhang-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const searchTerm = formData.get('search');
      const quantity = parseInt(formData.get('quantity'));
      const price = parseFloat(formData.get('price'));

      // Kiểm tra dữ liệu đầu vào
      if (!searchTerm || !quantity || !price) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
      }

      // Thêm vào giỏ hàng
      const cartData = getData('banHangData');
      const newItem = {
        id: Date.now(),
        code: 'TH' + String(Date.now()).slice(-3),
        name: searchTerm,
        quantity: quantity,
        price: price,
        total: quantity * price
      };
      
      cartData.push(newItem);
      saveData('banHangData', cartData);
      
      // Cập nhật bảng
      updateBanHangTable();
      form.reset();
      
      // Hiển thị thông báo thành công
      showNotification('Đã thêm vào giỏ hàng!', 'success');
    });
  }

  /**
   * Xử lý form thêm dược phẩm
   */
  function handleDuocPhamForm() {
    const form = document.getElementById('duocpham-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const data = {
        id: Date.now(),
        code: formData.get('code'),
        name: formData.get('name'),
        ingredient: formData.get('ingredient'),
        form: formData.get('form') || 'Viên nén',
        manufacturer: formData.get('manufacturer'),
        price: parseFloat(formData.get('price'))
      };

      const duocPhamData = getData('duocPhamData');
      duocPhamData.push(data);
      saveData('duocPhamData', duocPhamData);
      
      // Cập nhật bảng
      updateDuocPhamTable();
      form.reset();
      
      // Hiển thị thông báo thành công
      showNotification('Thêm dược phẩm thành công!', 'success');
    });
  }

  /**
   * Xử lý form thêm nhân viên
   */
  function handleNhanSuForm() {
    const form = document.getElementById('nhan-su-form');
    if (!form) {
      console.log('Không tìm thấy form nhân sự');
      return;
    }

    console.log('Đã tìm thấy form nhân sự, đang thiết lập event listener...');

    form.addEventListener('submit', function(e) {
      // Ngăn chặn hành vi submit mặc định của form
      e.preventDefault();
      console.log('Form nhân sự được submit');
      
      // Kiểm tra validation trước khi xử lý dữ liệu
      const validator = window.nhanSuValidator;
      if (validator && !validator.validate()) {
        console.log('Validation failed');
        return;
      }
      
      // Lấy dữ liệu từ form
      const formData = new FormData(form);
      
      // Tạo object dữ liệu nhân viên mới
      const data = {
        id: Date.now(), // ID duy nhất
        employeeCode: formData.get('employeeCode'), // Mã nhân viên
        fullName: formData.get('fullName'), // Họ tên đầy đủ
        phone: formData.get('phone'), // Số điện thoại
        email: formData.get('email') || '', // Email (không bắt buộc)
        birthDate: formData.get('birthDate'), // Ngày sinh
        gender: formData.get('gender'), // Giới tính
        position: formData.get('position'), // Chức vụ
        baseSalary: parseFloat(formData.get('baseSalary')), // Lương cơ bản
        address: formData.get('address') || '', // Địa chỉ (không bắt buộc)
        startDate: formData.get('startDate'), // Ngày bắt đầu làm việc
        status: formData.get('status') || 'Đang làm' // Trạng thái làm việc
      };

      console.log('Dữ liệu nhân viên mới:', data);

      // Lấy dữ liệu nhân sự hiện tại và thêm nhân viên mới
      const nhanSuData = getData('nhanSuData');
      nhanSuData.push(data);
      saveData('nhanSuData', nhanSuData);
      
      console.log('Đã lưu dữ liệu, đang cập nhật bảng...');
      
      // Cập nhật bảng danh sách và thống kê
      updateNhanSuTable();
      updateNhanSuStats();
      
      // Reset form về trạng thái ban đầu
      form.reset();
      
      // Hiển thị thông báo thành công
      showNotification('Thêm nhân viên thành công!', 'success');
    });
  }



  // ========================================
  // CẬP NHẬT BẢNG DỮ LIỆU
  // ========================================

  /**
   * Cập nhật bảng kho hàng
   */
  function updateKhoTable() {
    const table = document.querySelector('#kho-table tbody');
    if (!table) {
      console.log('Không tìm thấy bảng kho');
      return;
    }

    const data = getData('khoData');
    console.log('Dữ liệu kho:', data);
    
    // Kiểm tra nếu không có dữ liệu
    if (!data || data.length === 0) {
      console.log('Không có dữ liệu kho');
      table.innerHTML = '<tr><td colspan="9" style="text-align: center; padding: 20px;">Chưa có dữ liệu kho hàng</td></tr>';
      return;
    }
    
    table.innerHTML = data.map(item => {
      // Định dạng ngày hết hạn
      const expiryDate = item.expiry ? new Date(item.expiry).toLocaleDateString('vi-VN') : 'N/A';
      
      return `
        <tr>
          <td>${item.code || 'N/A'}</td>
          <td>${item.name || 'N/A'}</td>
          <td>${expiryDate}</td>
          <td>${item.batch || 'N/A'}</td>
          <td>${item.stock || 0}</td>
          <td>${item.importPrice ? item.importPrice.toLocaleString() + '₫' : 'N/A'}</td>
          <td>${item.sellingPrice ? item.sellingPrice.toLocaleString() + '₫' : 'N/A'}</td>
          <td><span class="badge ${item.status === 'Còn hàng' ? 'success' : 'warn'}">${item.status || 'N/A'}</span></td>
          <td>
            <button class="btn btn-ghost" onclick="deleteKhoItem(${item.id})">Xóa</button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Cập nhật bảng khách hàng
   */
  function updateKhachHangTable() {
    const table = document.querySelector('#khachhang-table tbody');
    if (!table) return;

    const data = getData('khachHangData');
    table.innerHTML = data.map(item => `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.phone}</td>
        <td><span class="badge ${item.rank === 'VIP' ? 'success' : ''}">${item.rank}</span></td>
        <td>${item.totalSpent.toLocaleString()}₫</td>
        <td>${item.lastPurchase}</td>
        <td>
          <button class="btn btn-ghost" onclick="deleteKhachHangItem(${item.id})">Xóa</button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Cập nhật bảng bán hàng (giỏ hàng)
   */
  function updateBanHangTable() {
    const table = document.querySelector('#banhang-table tbody');
    if (!table) return;

    const data = getData('banHangData');
    table.innerHTML = data.map(item => `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${item.price.toLocaleString()}₫</td>
        <td>${item.total.toLocaleString()}₫</td>
        <td><button class="btn btn-ghost" onclick="deleteBanHangItem(${item.id})">Xóa</button></td>
      </tr>
    `).join('');

    // Cập nhật tổng tiền
    const total = data.reduce((sum, item) => sum + item.total, 0);
    const totalElement = document.querySelector('.card .card[style*="min-width:260px"] .kpi-value');
    if (totalElement) {
      totalElement.textContent = total.toLocaleString() + '₫';
    }
  }

  /**
   * Cập nhật bảng dược phẩm
   */
  function updateDuocPhamTable() {
    const table = document.querySelector('#duocpham-table tbody');
    if (!table) return;

    const data = getData('duocPhamData');
    table.innerHTML = data.map(item => `
      <tr>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td>${item.ingredient}</td>
        <td>${item.form}</td>
        <td>${item.manufacturer}</td>
        <td>
          <button class="btn btn-ghost" onclick="deleteDuocPhamItem(${item.id})">Xóa</button>
        </td>
      </tr>
    `).join('');
  }

  /**
   * Cập nhật bảng nhân sự
   */
  function updateNhanSuTable() {
    // Tìm bảng danh sách nhân viên
    const table = document.querySelector('#nhan-su-table tbody');
    if (!table) {
      console.log('Không tìm thấy bảng nhân sự');
      return;
    }

    // Lấy dữ liệu nhân sự từ localStorage
    const data = getData('nhanSuData');
    console.log('Dữ liệu nhân sự:', data);
    
    // Kiểm tra nếu không có dữ liệu
    if (!data || data.length === 0) {
      console.log('Không có dữ liệu nhân sự');
      table.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Chưa có dữ liệu nhân viên</td></tr>';
      return;
    }
    
    // Tạo HTML cho từng dòng trong bảng
    table.innerHTML = data.map(item => `
      <tr>
        <td>${item.employeeCode || 'N/A'}</td> <!-- Mã nhân viên -->
        <td>${item.fullName || 'N/A'}</td> <!-- Họ tên -->
        <td>${item.position || 'N/A'}</td> <!-- Chức vụ -->
        <td>${item.phone || 'N/A'}</td> <!-- Số điện thoại -->
        <td>${item.baseSalary ? item.baseSalary.toLocaleString() + '₫' : 'N/A'}</td> <!-- Lương cơ bản (định dạng số) -->
        <td><span class="badge ${getStatusClass(item.status)}">${item.status || 'N/A'}</span></td> <!-- Trạng thái với màu sắc -->
        <td>${item.startDate ? new Date(item.startDate).toLocaleDateString('vi-VN') : 'N/A'}</td> <!-- Ngày bắt đầu (định dạng VN) -->
        <td>
          <button class="btn btn-ghost" onclick="deleteNhanSuItem(${item.id})">Xóa</button> <!-- Nút xóa -->
        </td>
      </tr>
    `).join('');
  }

  /**
   * Cập nhật thống kê nhân sự
   */
  function updateNhanSuStats() {
    // Lấy dữ liệu nhân sự
    const data = getData('nhanSuData');
    
    // Tính toán các thống kê
    const totalEmployees = data.length; // Tổng số nhân viên
    const activeEmployees = data.filter(item => item.status === 'Đang làm').length; // Nhân viên đang làm việc
    const onLeave = data.filter(item => item.status === 'Tạm nghỉ').length; // Nhân viên nghỉ phép
    const totalSalary = data.filter(item => item.status === 'Đang làm').reduce((sum, item) => sum + item.baseSalary, 0); // Tổng lương

    // Cập nhật các chỉ số hiển thị trên giao diện
    document.getElementById('total-employees').textContent = totalEmployees;
    document.getElementById('active-employees').textContent = activeEmployees;
    document.getElementById('on-leave').textContent = onLeave;
    document.getElementById('monthly-salary').textContent = totalSalary.toLocaleString() + '₫';
  }


  // ========================================
  // CÁC HÀM XÓA DỮ LIỆU
  // ========================================

  /**
   * Xóa mục trong kho hàng
   */
  window.deleteKhoItem = function(id) {
    if (confirm('Bạn có chắc muốn xóa mục này?')) {
      const data = getData('khoData');
      const newData = data.filter(item => item.id !== id);
      saveData('khoData', newData);
      updateKhoTable();
      showNotification('Đã xóa thành công!', 'success');
    }
  };


  /**
   * Xóa khách hàng
   */
  window.deleteKhachHangItem = function(id) {
    if (confirm('Bạn có chắc muốn xóa khách hàng này?')) {
      const data = getData('khachHangData');
      const newData = data.filter(item => item.id !== id);
      saveData('khachHangData', newData);
      updateKhachHangTable();
      showNotification('Đã xóa khách hàng!', 'success');
    }
  };

  /**
   * Xóa mục khỏi giỏ hàng
   */
  window.deleteBanHangItem = function(id) {
    if (confirm('Bạn có chắc muốn xóa mục này khỏi giỏ hàng?')) {
      const data = getData('banHangData');
      const newData = data.filter(item => item.id !== id);
      saveData('banHangData', newData);
      updateBanHangTable();
      showNotification('Đã xóa khỏi giỏ hàng!', 'success');
    }
  };

  /**
   * Xóa dược phẩm
   */
  window.deleteDuocPhamItem = function(id) {
    if (confirm('Bạn có chắc muốn xóa dược phẩm này?')) {
      const data = getData('duocPhamData');
      const newData = data.filter(item => item.id !== id);
      saveData('duocPhamData', newData);
      updateDuocPhamTable();
      showNotification('Đã xóa dược phẩm!', 'success');
    }
  };

  /**
   * Xóa nhân viên
   */
  window.deleteNhanSuItem = function(id) {
    // Hiển thị hộp thoại xác nhận trước khi xóa
    if (confirm('Bạn có chắc muốn xóa nhân viên này?')) {
      // Lấy dữ liệu nhân sự hiện tại
      const data = getData('nhanSuData');
      
      // Lọc ra nhân viên có ID khác với ID cần xóa
      const newData = data.filter(item => item.id !== id);
      
      // Lưu dữ liệu đã cập nhật
      saveData('nhanSuData', newData);
      
      // Cập nhật bảng và thống kê
      updateNhanSuTable();
      updateNhanSuStats();
      
      // Hiển thị thông báo thành công
      showNotification('Đã xóa nhân viên!', 'success');
    }
  };



  // ========================================
  // CÁC HÀM TIỆN ÍCH
  // ========================================

  /**
   * Lấy class CSS cho trạng thái nhân viên
   */
  function getStatusClass(status) {
    switch(status) {
      case 'Đang làm': return 'success';
      case 'Tạm nghỉ': return 'warning';
      case 'Nghỉ việc': return 'danger';
      default: return '';
    }
  }

  // ========================================
  // HỆ THỐNG THÔNG BÁO
  // ========================================

  /**
   * Hiển thị thông báo cho người dùng
   * @param {string} message - Nội dung thông báo
   * @param {string} type - Loại thông báo (success, error, warning, info)
   */
  function showNotification(message, type = 'info') {
    // Xóa tất cả thông báo cũ trước khi tạo mới
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Tạo element thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Tạo nội dung HTML cho thông báo
    notification.innerHTML = `
      <div class="notification-content">
        <span>${message}</span>
        <button onclick="this.parentElement.parentElement.remove()" class="btn btn-ghost" style="padding: 4px 8px; font-size: 12px; color: white; border: 1px solid rgba(255,255,255,0.3);">×</button>
      </div>
    `;
    
    // Thêm thông báo vào body
    document.body.appendChild(notification);
    
    // Tự động xóa thông báo sau 4 giây
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
          if (notification.parentElement) {
            notification.remove();
          }
        }, 300);
      }
    }, 4000);
  }

  // ========================================
  // KHỞI TẠO CÁC HÀNH ĐỘNG NÚT
  // ========================================

  /**
   * Khởi tạo các hành động cho các nút trong ứng dụng
   */
  function initButtonActions() {
    // Nút thanh toán
    const thanhToanBtn = document.querySelector('.btn-primary');
    if (thanhToanBtn && thanhToanBtn.textContent.includes('Thanh toán')) {
      thanhToanBtn.addEventListener('click', function() {
        const cartData = getData('banHangData');
        if (cartData.length === 0) {
          showNotification('Giỏ hàng trống!', 'error');
          return;
        }
        
        // Xóa giỏ hàng
        saveData('banHangData', []);
        updateBanHangTable();
        showNotification('Thanh toán thành công!', 'success');
      });
    }

    // Nút tạo hóa đơn
    const taoHoaDonBtn = document.querySelector('.btn-primary');
    if (taoHoaDonBtn && taoHoaDonBtn.textContent.includes('Tạo hóa đơn')) {
      taoHoaDonBtn.addEventListener('click', function() {
        showNotification('Chức năng tạo hóa đơn đang được phát triển!', 'info');
      });
    }

    // Nút nhập hàng
    const nhapHangBtn = document.querySelector('.btn-primary');
    if (nhapHangBtn && nhapHangBtn.textContent.includes('Nhập hàng')) {
      nhapHangBtn.addEventListener('click', function() {
        const form = document.getElementById('kho-form');
        if (form) {
          form.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // ========================================
  // CÁC HÀM TIỆN ÍCH NHÂN SỰ
  // ========================================

  /**
   * Cuộn đến form thêm nhân viên
   */
  window.scrollToEmployeeForm = function() {
    // Tìm form thêm nhân viên
    const form = document.getElementById('nhan-su-form');
    if (form) {
      // Cuộn mượt mà đến form
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  /**
   * Tính lương tổng cho nhân viên đang làm việc
   */
  window.calculateSalary = function() {
    const data = getData('nhanSuData');
    const activeEmployees = data.filter(item => item.status === 'Đang làm');
    const totalSalary = activeEmployees.reduce((sum, item) => sum + item.baseSalary, 0);
    
    document.getElementById('total-salary').textContent = totalSalary.toLocaleString() + '₫';
    document.getElementById('avg-work-days').textContent = '22'; // Giả định
    document.getElementById('avg-work-hours').textContent = '8h'; // Giả định
    
    showNotification('Đã tính lương thành công!', 'success');
  };

  /**
   * Xuất dữ liệu nhân viên ra file CSV
   */
  window.exportEmployeeData = function() {
    const data = getData('nhanSuData');
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Mã NV,Họ tên,Chức vụ,SĐT,Email,Lương cơ bản,Trạng thái,Ngày bắt đầu\n" +
      data.map(item => `${item.employeeCode},${item.fullName},${item.position},${item.phone},${item.email},${item.baseSalary},${item.status},${item.startDate}`).join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "danh_sach_nhan_vien.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Đã xuất dữ liệu nhân viên!', 'success');
  };

  /**
   * Xuất báo cáo lương (chức năng đang phát triển)
   */
  window.exportSalaryReport = function() {
    showNotification('Chức năng xuất bảng lương đang được phát triển!', 'info');
  };

  /**
   * Xem báo cáo chấm công (chức năng đang phát triển)
   */
  window.viewAttendanceReport = function() {
    showNotification('Chức năng báo cáo chấm công đang được phát triển!', 'info');
  };



  // ========================================
  // KHỞI TẠO ỨNG DỤNG CHÍNH
  // ========================================

  /**
   * Khởi tạo tất cả các chức năng của ứng dụng
   */
  function initApp() {
    // Xóa dữ liệu cũ nếu có (để test dữ liệu mới)
    localStorage.removeItem('nhanSuData'); // Xóa dữ liệu cũ để test dữ liệu mới
    
    // Khởi tạo dữ liệu mẫu nếu chưa có
    initSampleData();
    
    // Thiết lập xử lý cho các form
    handleKhoForm(); // Form nhập kho
    handleKhachHangForm(); // Form khách hàng
    handleBanHangForm(); // Form bán hàng
    handleDuocPhamForm(); // Form dược phẩm
    handleNhanSuForm(); // Form nhân sự
    
    // Khởi tạo các hành động cho nút
    initButtonActions();
    
    // Cập nhật tất cả bảng dữ liệu khi tải trang
    updateKhoTable(); // Bảng kho hàng
    updateKhachHangTable(); // Bảng khách hàng
    updateBanHangTable(); // Bảng bán hàng
    updateDuocPhamTable(); // Bảng dược phẩm
    updateNhanSuTable(); // Bảng nhân sự
    updateNhanSuStats(); // Thống kê nhân sự
  }

  // Khởi tạo ứng dụng khi DOM đã sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();



