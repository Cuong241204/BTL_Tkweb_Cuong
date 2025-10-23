/**
 * Hệ thống xác thực đơn giản
 * @author QLy Hiệu Thuốc
 * @version 1.0
 */
(function() {
  'use strict';

  /**
   * Khởi tạo hệ thống đăng nhập
   */
  function initAuth() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const formData = new FormData(form);
      const username = formData.get('username');
      const password = formData.get('password');
      
      // Kiểm tra thông tin đăng nhập
      if (username === 'admin' && password === '123') {
        // Lưu trạng thái đăng nhập
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('username', username);
        
        // Hiển thị thông báo thành công
        showSuccessMessage('Đăng nhập thành công!');
        
        // Chuyển hướng về trang chủ sau 1 giây
        setTimeout(() => {
          window.location.href = '../index.html';
        }, 1000);
      } else {
        showErrorMessage('Tên đăng nhập hoặc mật khẩu không đúng!');
      }
    });
  }

  /**
   * Hiển thị thông báo thành công
   */
  function showSuccessMessage(message) {
    showNotification(message, 'success');
  }

  /**
   * Hiển thị thông báo lỗi
   */
  function showErrorMessage(message) {
    showNotification(message, 'error');
  }

  /**
   * Hiển thị thông báo
   */
  function showNotification(message, type = 'info') {
    // Xóa thông báo cũ
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
        <span>${message}</span>
      </div>
    `;
    
    // Thêm vào body
    document.body.appendChild(notification);
    
    // Tự động ẩn sau 3 giây
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  }

  /**
   * Kiểm tra trạng thái đăng nhập
   */
  function checkAuthStatus() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const username = localStorage.getItem('username');
    
    if (isLoggedIn === 'true' && username) {
      // Cập nhật giao diện nếu đã đăng nhập
      updateUIForLoggedInUser(username);
    } else {
      // Cập nhật giao diện nếu chưa đăng nhập
      updateUIForGuest();
    }
  }

  /**
   * Cập nhật giao diện cho người dùng đã đăng nhập
   */
  function updateUIForLoggedInUser(username) {
    // Hiển thị thông tin người dùng
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      userInfo.style.display = 'flex';
      userInfo.querySelector('.username').textContent = username;
    }
    
    // Ẩn nút đăng nhập
    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
      loginBtn.style.display = 'none';
    }
  }

  /**
   * Cập nhật giao diện cho người dùng chưa đăng nhập
   */
  function updateUIForGuest() {
    // Ẩn thông tin người dùng
    const userInfo = document.querySelector('.user-info');
    if (userInfo) {
      userInfo.style.display = 'none';
    }
    
    // Hiển thị nút đăng nhập
    const loginBtn = document.querySelector('#login-btn');
    if (loginBtn) {
      loginBtn.style.display = 'flex';
    }
  }

  /**
   * Đăng xuất
   */
  function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    
    // Cập nhật giao diện cho guest ngay lập tức
    updateUIForGuest();
    
    // Hiển thị thông báo
    showSuccessMessage('Đã đăng xuất thành công!');
    
    // Reload trang để đảm bảo trạng thái được cập nhật
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  // Xuất hàm logout ra global scope
  window.logout = logout;

  // Khởi tạo khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initAuth();
      checkAuthStatus();
    });
  } else {
    initAuth();
    checkAuthStatus();
  }

})();
