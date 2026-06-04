import { API } from './api.js';
import { Utils } from './utils.js';
let roomsList = [];
let currentUser = null;
let activeRoom = null;
let bookingModalInstance = null;
let loginModalInstance = null;
let registerModalInstance = null;
document.addEventListener('DOMContentLoaded', async () => {
    Utils.initDarkMode();
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            Utils.toggleDarkMode();
        });
    }
    try {
        bookingModalInstance = new bootstrap.Modal(document.getElementById('bookingModal'));
        loginModalInstance = new bootstrap.Modal(document.getElementById('loginModal'));
        registerModalInstance = new bootstrap.Modal(document.getElementById('registerModal'));
    } catch (e) {
        console.warn('Bootstrap modal initialization delayed or handled implicitly.', e);
    }
    checkSession();
    await fetchAndRenderRooms();
    bindFilterEvents();
    bindAuthEvents();
    bindBookingEvents();
});
function checkSession() {
    currentUser = Utils.getCurrentUser();   
    const authButtons = document.getElementById('authButtons');
    const userWelcome = document.getElementById('userWelcome');
    const sessionFullName = document.getElementById('sessionFullName');
    const adminBtn = document.getElementById('adminBtn');
    const logoutBtn = document.getElementById('logoutBtn');    
    if (currentUser) {
        if (authButtons) authButtons.classList.add('d-none');
        if (userWelcome) {
            userWelcome.classList.remove('d-none');
            userWelcome.classList.add('d-flex');
        }
        if (sessionFullName) sessionFullName.textContent = currentUser.fullName;
        if (currentUser.role === 'admin') {
            if (adminBtn) adminBtn.classList.remove('d-none');
        } else {
            if (adminBtn) adminBtn.classList.add('d-none');
        }
    } else {
        if (authButtons) authButtons.classList.remove('d-none');
        if (userWelcome) {
            userWelcome.classList.add('d-none');
            userWelcome.classList.remove('d-flex');
        }
        if (adminBtn) adminBtn.classList.add('d-none');
    }
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Utils.clearCurrentUser();
            Utils.showToast('Bạn đã đăng xuất khỏi hệ thống thành công.', 'info');
            checkSession();
            renderRooms(roomsList);
        });
    }
}
async function fetchAndRenderRooms() {
    Utils.showSpinner();
    try {
        roomsList = await API.getRooms();
        renderRooms(roomsList);
    } catch (error) {
        console.error(error);
        Utils.showToast('Lỗi khi lấy thông tin phòng nghỉ. Hãy tải lại trang.', 'danger');
    } finally {
        Utils.hideSpinner();
    }
}
function renderRooms(rooms) {
    const grid = document.getElementById('roomsGrid');
    const counter = document.getElementById('roomsCounter');
    const emptyState = document.getElementById('emptyRoomsState');
    if (!grid) return;
    grid.innerHTML = '';
    if (counter) counter.textContent = rooms.length;    
    if (rooms.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        return;
    } else {
        if (emptyState) emptyState.classList.add('d-none');
    }
    rooms.forEach(room => {
        const imageSrc = room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop';        
        const isMaintenance = room.status === 'Đang sửa';
        const buttonText = isMaintenance ? '<i class="bi bi-tools"></i> Đang Bảo Trì' : '<i class="bi bi-calendar-check"></i> Đặt Phòng Ngay';
        const statusBadgeColor = isMaintenance ? 'bg-danger' : 'bg-success';  
        const cardHtml = `
            <div class="col">
                <div class="room-card">
                    <div class="room-img-container">
                        <img src="${imageSrc}" alt="${room.roomName}" class="room-img" onerror="this.src='https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop'">
                        <span class="room-type-badge">${room.type}</span>
                        <span class="room-price-badge">${Utils.formatCurrency(room.price)}/đêm</span>
                    </div>
                    <div class="room-card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="room-title mb-0">${room.roomName}</h5>
                            <span class="badge ${statusBadgeColor} px-2 py-1 fs-8">${room.status}</span>
                        </div>
                        <p class="room-desc mb-3 text-truncate-3">${room.description || 'Chưa có mô tả thêm về phòng nghỉ.'}</p>                       
                        <div class="room-amenities d-flex justify-content-between">
                            <span><i class="bi bi-people-fill text-warning me-1"></i>Tối đa: ${room.maxGuests} người</span>
                            <span><i class="bi bi-check2-square text-success me-1"></i>Wifi Free</span>
                            <span><i class="bi bi-snow text-info me-1"></i>Điều hòa</span>
                        </div>                        
                        <button class="btn btn-primary-custom w-100 mt-auto book-btn" data-id="${room.id}" ${isMaintenance ? 'disabled' : ''}>
                            ${buttonText}
                        </button>
                    </div>
                </div>
            </div>
        `;
        grid.insertAdjacentHTML('beforeend', cardHtml);
    });
    document.querySelectorAll('.book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openBookingProcess(id);
        });
    });
}
function bindFilterEvents() {
    const filterPrice = document.getElementById('filterPrice');
    const priceVal = document.getElementById('priceVal');
    const filterGuests = document.getElementById('filterGuests');
    const filterType = document.getElementById('filterType');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');   
    function applyCombinedFilters() {
        const selectedPrice = parseInt(filterPrice.value) || 5000000;
        const selectedGuests = parseInt(filterGuests.value) || 0;
        const selectedType = filterType.value;
        if (selectedPrice >= 5000000) {
            priceVal.textContent = 'Tất cả';
        } else {
            priceVal.textContent = `≤ ${Utils.formatCurrency(selectedPrice)}`;
        }        
        const filteredList = roomsList.filter(room => {
            const matchPrice = room.price <= selectedPrice;
            const matchGuests = selectedGuests === 0 || room.maxGuests >= selectedGuests;
            const matchType = !selectedType || room.type === selectedType;
            return matchPrice && matchGuests && matchType;
        });
        renderRooms(filteredList);
    }
    if (filterPrice) {
        filterPrice.addEventListener('input', applyCombinedFilters);
    }
    if (filterGuests) {
        filterGuests.addEventListener('input', applyCombinedFilters);
        filterGuests.addEventListener('change', applyCombinedFilters);
    }
    if (filterType) {
        filterType.addEventListener('change', applyCombinedFilters);
    }
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', () => {
            if (filterPrice) filterPrice.value = 5000000;
            if (filterGuests) filterGuests.value = '';
            if (filterType) filterType.value = '';
            if (priceVal) priceVal.textContent = 'Tất cả';           
            renderRooms(roomsList);
            Utils.showToast('Đã xóa tất cả bộ lọc tìm kiếm.', 'info');
        });
    }
}
function bindAuthEvents() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();            
            const fullName = document.getElementById('regFullName').value.trim();
            const username = document.getElementById('regUsername').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const role = 'student';           
            if (!fullName || !username || !password) {
                Utils.showToast('Vui lòng điền đầy đủ các thông tin!', 'warning');
                return;
            } 
            Utils.showSpinner();
            try {
                await API.register({
                    fullName,
                    username,
                    password,
                    role,
                    bookings: []
                });                
                Utils.showToast('Đăng ký tài khoản thành công! Đang chuyển sang đăng nhập...', 'success');
                registerForm.reset();
                if (registerModalInstance) {
                    registerModalInstance.hide();
                }                
                setTimeout(() => {
                    if (loginModalInstance) {
                        loginModalInstance.show();
                    }
                }, 400);
                
            } catch (err) {
                Utils.showToast(err.message, 'danger');
            } finally {
                Utils.hideSpinner();
            }
        });
    }
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();            
            const username = document.getElementById('loginUsername').value.trim();
            const password = document.getElementById('loginPassword').value.trim();           
            if (!username || !password) {
                Utils.showToast('Tên đăng nhập và mật khẩu không được trống.', 'warning');
                return;
            }           
            Utils.showSpinner();
            try {
                const user = await API.login(username, password);
                Utils.setCurrentUser(user);
                Utils.showToast(`Chào mừng ${user.fullName} quay trở lại!`, 'success');
                loginForm.reset();
                
                if (loginModalInstance) {
                    loginModalInstance.hide();
                }
                checkSession();
            } catch (err) {
                Utils.showToast(err.message, 'danger');
            } finally {
                Utils.hideSpinner();
            }
        });
    }
}
function openBookingProcess(roomId) {
    currentUser = Utils.getCurrentUser();
    if (!currentUser) {
        Utils.showToast('Bạn phải đăng nhập hệ thống để thực hiện đặt phòng nghỉ!', 'warning');
        if (loginModalInstance) {
            loginModalInstance.show();
        }
        return;
    }
    activeRoom = roomsList.find(r => r.id === roomId);
    if (!activeRoom) {
        Utils.showToast('Không tìm thấy phòng nghỉ yêu cầu!', 'danger');
        return;
    }
    document.getElementById('bookRoomId').value = activeRoom.id;
    document.getElementById('bookRoomName').textContent = activeRoom.roomName;
    document.getElementById('bookRoomType').textContent = activeRoom.type;
    document.getElementById('bookRoomCapacity').textContent = `Tối đa: ${activeRoom.maxGuests} khách`;
    document.getElementById('bookRoomDesc').textContent = activeRoom.description || 'Chưa có thông tin mô tả.';
    document.getElementById('bookRoomPrice').textContent = `${Utils.formatCurrency(activeRoom.price)} / đêm`;
    const bookRoomImg = document.getElementById('bookRoomImg');
    if (bookRoomImg) {
        bookRoomImg.src = activeRoom.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=600&auto=format&fit=crop';
    }
    const checkInInput = document.getElementById('bookCheckIn');
    const checkOutInput = document.getElementById('bookCheckOut');
    const submitBtn = document.getElementById('submitBookingBtn');
    const summaryDiv = document.getElementById('calcSummary');
    const paymentMethodInput = document.getElementById('bookPaymentMethod');
    const qrContainer = document.getElementById('qrPaymentContainer'); 
    if (checkInInput) checkInInput.value = '';
    if (checkOutInput) checkOutInput.value = '';
    if (submitBtn) submitBtn.disabled = true;
    if (summaryDiv) summaryDiv.classList.add('d-none');
    if (paymentMethodInput) paymentMethodInput.value = 'Tiền mặt';
    if (qrContainer) qrContainer.classList.add('d-none');
    const bookingCode = 'SE' + Date.now().toString().slice(-6);
    const qrAddInfoSpan = document.getElementById('qrAddInfo');
    if (qrAddInfoSpan) qrAddInfoSpan.textContent = bookingCode;
    const today = new Date().toISOString().split('T')[0];
    if (checkInInput) checkInInput.min = today;
    if (bookingModalInstance) {
        bookingModalInstance.show();
    }
}
function bindBookingEvents() {
    const checkInInput = document.getElementById('bookCheckIn');
    const checkOutInput = document.getElementById('bookCheckOut');
    const paymentMethodInput = document.getElementById('bookPaymentMethod');
    const submitForm = document.getElementById('bookingSubmitForm');
    function validateAndCalculatePrice() {
        const checkInVal = checkInInput.value;
        const checkOutVal = checkOutInput.value;
        const paymentMethodVal = paymentMethodInput ? paymentMethodInput.value : 'Tiền mặt';
        const submitBtn = document.getElementById('submitBookingBtn');
        const summaryDiv = document.getElementById('calcSummary');
        const qrContainer = document.getElementById('qrPaymentContainer');
        if (!checkInVal || !checkOutVal) {
            if (submitBtn) submitBtn.disabled = true;
            if (summaryDiv) summaryDiv.classList.add('d-none');
            if (qrContainer) qrContainer.classList.add('d-none');
            return;
        }
        const nights = Utils.calculateNights(checkInVal, checkOutVal);
        if (nights <= 0) {
            Utils.showToast('Ngày trả phòng phải sau ngày nhận phòng ít nhất 1 ngày!', 'warning');
            if (submitBtn) submitBtn.disabled = true;
            if (summaryDiv) summaryDiv.classList.add('d-none');
            if (qrContainer) qrContainer.classList.add('d-none');
            checkOutInput.value = '';
            return;
        }
        const totalPrice = nights * activeRoom.price;
        document.getElementById('calcNights').textContent = `${nights} đêm`;
        document.getElementById('calcUnitPrice').textContent = `${Utils.formatCurrency(activeRoom.price)}/đêm`;
        document.getElementById('calcTotalPrice').textContent = Utils.formatCurrency(totalPrice);
        if (summaryDiv) summaryDiv.classList.remove('d-none');
        if (submitBtn) submitBtn.disabled = false;
        if (paymentMethodVal === 'Chuyển khoản') {
            const bookingCode = document.getElementById('qrAddInfo').textContent;
            const qrImgUrl = `https://img.vietqr.io/image/vietinbank-102886150648-compact2.jpg?amount=${totalPrice}&addInfo=${bookingCode}&accountName=NGUYEN%20LUONG%20DONG`;
            const vietQrImg = document.getElementById('vietQrImg');
            if (vietQrImg) vietQrImg.src = qrImgUrl;
            if (qrContainer) qrContainer.classList.remove('d-none');
        } else {
            if (qrContainer) qrContainer.classList.add('d-none');
        }
    }
    if (checkInInput) {
        checkInInput.addEventListener('change', () => {
            if (checkOutInput) {
                checkOutInput.min = checkInInput.value;
            }
            validateAndCalculatePrice();
        });
    }
    if (checkOutInput) {
        checkOutInput.addEventListener('change', validateAndCalculatePrice);
    }
    if (paymentMethodInput) {
        paymentMethodInput.addEventListener('change', validateAndCalculatePrice);
    }
    if (submitForm) {
        submitForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            currentUser = Utils.getCurrentUser();
            if (!currentUser || !activeRoom) {
                Utils.showToast('Lỗi tiến trình phiên làm việc. Hãy đăng nhập lại!', 'danger');
                if (bookingModalInstance) bookingModalInstance.hide();
                return;
            }
            const checkInVal = checkInInput.value;
            const checkOutVal = checkOutInput.value;
            const paymentMethodVal = paymentMethodInput ? paymentMethodInput.value : 'Tiền mặt';
            const bookingCode = document.getElementById('qrAddInfo').textContent;
            const nights = Utils.calculateNights(checkInVal, checkOutVal);
            const totalPrice = nights * activeRoom.price;
            const newBooking = {
                bookingId: bookingCode,
                roomId: activeRoom.id,
                roomName: activeRoom.roomName,
                checkInDate: checkInVal,
                checkOutDate: checkOutVal,
                totalNights: nights,
                totalPrice: totalPrice,
                paymentMethod: paymentMethodVal,
                paymentStatus: paymentMethodVal === 'Chuyển khoản' ? 'Chờ xác nhận chuyển khoản' : 'Thanh toán khi nhận phòng',
                status: 'Chờ xác nhận'
            };
            if (!currentUser.bookings) {
                currentUser.bookings = [];
            }
            currentUser.bookings.push(newBooking);
            Utils.showSpinner();
            try {
                const updatedUser = await API.updateUserBookings(currentUser.id, currentUser);
                Utils.setCurrentUser(updatedUser);
                Utils.showToast('Gửi yêu cầu đặt phòng thành công! Trạng thái đang chờ admin xác nhận.', 'success');
                if (bookingModalInstance) {
                    bookingModalInstance.hide();
                }
                
            } catch (err) {
                Utils.showToast(err.message, 'danger');
                currentUser.bookings.pop();
            } finally {
                Utils.hideSpinner();
            }
        });
    }
}
