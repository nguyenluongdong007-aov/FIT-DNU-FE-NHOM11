// Project: StayEasy - Developed by SlimexDev / Rimuru Scripter

import { API } from './api.js';
import { Utils } from './utils.js';

// --- SYSTEM STATES ---
let roomsList = [];
let usersList = [];
let roomModalInstance = null;

// --- INITIALIZE PORTAL & GUARDIAN CHECK ---
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Guard check: Immediately check if user is logged in and has role 'admin'
    const currentUser = Utils.getCurrentUser();
    
    if (!currentUser || currentUser.role !== 'admin') {
        // Display warning overlay and block rendering
        const overlay = document.getElementById('unauthorizedOverlay');
        if (overlay) {
            overlay.classList.remove('d-none');
            overlay.classList.add('d-flex');
        }
        
        // Redirect to homepage after 2.5 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2500);
        return; // stop execution
    }

    // --- REVEAL PORTAL FOR AUTHOZIED USER ---
    const adminContainer = document.getElementById('adminContainer');
    if (adminContainer) {
        adminContainer.classList.remove('d-none');
    }
    
    const adminName = document.getElementById('adminName');
    if (adminName) {
        adminName.textContent = currentUser.fullName || currentUser.username;
    }

    // 2. Dark Mode Setup
    Utils.initDarkMode();
    const darkToggle = document.getElementById('darkModeToggle');
    if (darkToggle) {
        darkToggle.addEventListener('click', () => {
            Utils.toggleDarkMode();
        });
    }

    // 3. Admin Logout Setup
    const logoutBtn = document.getElementById('adminLogoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Utils.clearCurrentUser();
            Utils.showToast('Đăng xuất thành công. Chuyển hướng...', 'info');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 500);
        });
    }

    // 4. Instantiate Bootstrap Modal
    try {
        roomModalInstance = new bootstrap.Modal(document.getElementById('roomModal'));
    } catch (e) {
        console.warn('Bootstrap room modal initialization delayed or handled implicitly.', e);
    }

    // 5. Fetch and Render Core Data
    await reloadAllData();

    // 6. Bind Tab switches to refresh tables
    bindTabRefreshEvents();

    // 7. Bind Room Form Submit & Trigger Actions
    bindRoomFormEvents();
});

// --- CORE REFRESH LOGIC ---
async function reloadAllData() {
    Utils.showSpinner();
    try {
        // Parallel fetching
        const [rooms, users] = await Promise.all([
            API.getRooms(),
            API.getUsers()
        ]);
        
        roomsList = rooms;
        usersList = users;
        
        renderRoomsTable();
        renderBookingsTable();
        renderUsersTable();
        
    } catch (error) {
        console.error(error);
        Utils.showToast('Lỗi tải dữ liệu cơ sở dữ liệu!', 'danger');
    } finally {
        Utils.hideSpinner();
    }
}

// --- TAB SWAP BINDINGS ---
function bindTabRefreshEvents() {
    const roomsTabBtn = document.getElementById('pills-rooms-tab');
    const bookingsTabBtn = document.getElementById('pills-bookings-tab');
    const usersTabBtn = document.getElementById('pills-users-tab');
    
    if (roomsTabBtn) {
        roomsTabBtn.addEventListener('click', async () => {
            await reloadAllData();
        });
    }
    
    if (bookingsTabBtn) {
        bookingsTabBtn.addEventListener('click', async () => {
            await reloadAllData();
        });
    }
    
    if (usersTabBtn) {
        usersTabBtn.addEventListener('click', async () => {
            await reloadAllData();
        });
    }
}

// --- TAB 1: CRUD ROOMS LOGIC ---
function renderRoomsTable() {
    const tableBody = document.getElementById('roomsTableBody');
    const totalCountLabel = document.getElementById('totalRoomsCount');
    const emptyState = document.getElementById('emptyRoomsTable');
    
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    if (totalCountLabel) {
        totalCountLabel.textContent = roomsList.length;
    }
    
    if (roomsList.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        return;
    } else {
        if (emptyState) emptyState.classList.add('d-none');
    }
    
    roomsList.forEach(room => {
        const imageSrc = room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=200&auto=format&fit=crop';
        
        const isMaintenance = room.status === 'Đang sửa';
        const statusBadge = isMaintenance 
            ? '<span class="badge bg-danger"><i class="bi bi-tools me-1"></i>Đang bảo trì</span>'
            : '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Trống</span>';
            
        const rowHtml = `
            <tr id="room_row_${room.id}">
                <td>
                    <img src="${imageSrc}" alt="${room.roomName}" class="rounded-3 shadow-sm" style="width: 70px; height: 50px; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=200&auto=format&fit=crop'">
                </td>
                <td class="fw-bold">${room.roomName}</td>
                <td><span class="badge bg-secondary">${room.type}</span></td>
                <td class="fw-semibold text-warning">${Utils.formatCurrency(room.price)}</td>
                <td><i class="bi bi-person text-muted me-1"></i>${room.maxGuests} khách</td>
                <td>${statusBadge}</td>
                <td class="text-center">
                    <div class="btn-group gap-2">
                        <button class="btn btn-sm btn-outline-warning rounded-pill px-3 edit-room-btn" data-id="${room.id}">
                            <i class="bi bi-pencil-fill me-1"></i> Sửa
                        </button>
                        <button class="btn btn-sm btn-outline-danger rounded-pill px-3 delete-room-btn" data-id="${room.id}">
                            <i class="bi bi-trash-fill me-1"></i> Xóa
                        </button>
                    </div>
                </td>
            </tr>
        `;
        
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    
    // Bind edit actions
    document.querySelectorAll('.edit-room-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            openRoomModal(id);
        });
    });
    
    // Bind delete actions
    document.querySelectorAll('.delete-room-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.getAttribute('data-id');
            deleteRoomProcess(id);
        });
    });
}

function openRoomModal(roomId = '') {
    const modalTitle = document.getElementById('roomModalTitle');
    const form = document.getElementById('roomForm');
    
    if (form) form.reset();
    
    if (!roomId) {
        // --- ADD MODE ---
        if (modalTitle) modalTitle.textContent = 'Thêm Phòng Lưu Trú Mới';
        document.getElementById('roomId').value = '';
    } else {
        // --- EDIT MODE ---
        if (modalTitle) modalTitle.textContent = 'Cập Nhật Thông Tin Phòng';
        const room = roomsList.find(r => r.id === roomId);
        
        if (room) {
            document.getElementById('roomId').value = room.id;
            document.getElementById('roomName').value = room.roomName;
            document.getElementById('roomType').value = room.type;
            document.getElementById('roomPrice').value = room.price;
            document.getElementById('roomMaxGuests').value = room.maxGuests;
            document.getElementById('roomImage').value = room.image || '';
            document.getElementById('roomStatus').value = room.status;
            document.getElementById('roomDescription').value = room.description || '';
        }
    }
    
    if (roomModalInstance) {
        roomModalInstance.show();
    }
}

function bindRoomFormEvents() {
    const addRoomBtn = document.getElementById('addRoomBtn');
    const roomForm = document.getElementById('roomForm');
    
    if (addRoomBtn) {
        addRoomBtn.addEventListener('click', () => {
            openRoomModal('');
        });
    }
    
    if (roomForm) {
        roomForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const id = document.getElementById('roomId').value;
            const roomName = document.getElementById('roomName').value.trim();
            const type = document.getElementById('roomType').value;
            const price = parseFloat(document.getElementById('roomPrice').value);
            const maxGuests = parseInt(document.getElementById('roomMaxGuests').value);
            const image = document.getElementById('roomImage').value.trim();
            const status = document.getElementById('roomStatus').value;
            const description = document.getElementById('roomDescription').value.trim();
            
            const roomData = {
                roomName,
                type,
                price,
                maxGuests,
                image,
                status,
                description
            };
            
            Utils.showSpinner();
            try {
                if (!id) {
                    // Create New Room
                    await API.addRoom(roomData);
                    Utils.showToast('Thêm phòng nghỉ thành công!', 'success');
                } else {
                    // Update Room
                    await API.updateRoom(id, roomData);
                    Utils.showToast('Cập nhật phòng nghỉ thành công!', 'success');
                }
                
                if (roomModalInstance) {
                    roomModalInstance.hide();
                }
                
                await reloadAllData();
                
            } catch (err) {
                Utils.showToast(err.message, 'danger');
            } finally {
                Utils.hideSpinner();
            }
        });
    }
}

async function deleteRoomProcess(roomId) {
    // Pure standard JS Confirmation is required (NO SweetAlert2!)
    const confirmDelete = confirm('Bạn có chắc chắn muốn xóa phòng nghỉ này khỏi hệ thống không? Dữ liệu đã xóa không thể khôi phục.');
    if (!confirmDelete) return;
    
    Utils.showSpinner();
    try {
        await API.deleteRoom(roomId);
        Utils.showToast('Xóa phòng thành công!', 'success');
        await reloadAllData();
    } catch (err) {
        Utils.showToast(err.message, 'danger');
        Utils.hideSpinner();
    }
}

// --- TAB 2: AGGREGATE BOOKINGS & APPROVE ---
function renderBookingsTable() {
    const tableBody = document.getElementById('bookingsTableBody');
    const emptyState = document.getElementById('emptyBookingsTable');
    
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    // Aggregator: extract nested booking objects from all user profiles
    const bookingsList = [];
    
    usersList.forEach(user => {
        if (user.bookings && Array.isArray(user.bookings)) {
            user.bookings.forEach(booking => {
                bookingsList.push({
                    ...booking,
                    userId: user.id,
                    userFullName: user.fullName || 'Khách Vô Danh',
                    username: user.username
                });
            });
        }
    });
    
    // Sort bookings descending: latest requests first based on booking ID timestamp
    bookingsList.sort((a, b) => b.bookingId.localeCompare(a.bookingId));
    
    if (bookingsList.length === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        return;
    } else {
        if (emptyState) emptyState.classList.add('d-none');
    }
    
    bookingsList.forEach(book => {
        let statusBadge = '';
        let actionButtons = '';
        
        switch (book.status) {
            case 'Chờ xác nhận':
                statusBadge = '<span class="badge bg-warning text-dark"><i class="bi bi-clock-history me-1"></i>Chờ xác nhận</span>';
                actionButtons = `
                    <div class="btn-group gap-2 justify-content-center">
                        <button class="btn btn-sm btn-success rounded-pill px-3 approve-btn" data-id="${book.bookingId}" data-uid="${book.userId}">
                            <i class="bi bi-check2-circle me-1"></i>Xác nhận
                        </button>
                        <button class="btn btn-sm btn-danger rounded-pill px-3 reject-btn" data-id="${book.bookingId}" data-uid="${book.userId}">
                            <i class="bi bi-x-circle me-1"></i>Từ chối
                        </button>
                    </div>
                `;
                break;
            case 'Đã xác nhận':
                statusBadge = '<span class="badge bg-success"><i class="bi bi-check-lg me-1"></i>Đã xác nhận</span>';
                actionButtons = '<span class="text-success fw-semibold fs-7"><i class="bi bi-shield-fill-check me-1"></i>Đã phê duyệt</span>';
                break;
            case 'Từ chối':
                statusBadge = '<span class="badge bg-danger"><i class="bi bi-x-lg me-1"></i>Đã từ chối</span>';
                actionButtons = '<span class="text-danger fw-semibold fs-7"><i class="bi bi-shield-fill-x me-1"></i>Đã từ chối</span>';
                break;
            default:
                statusBadge = `<span class="badge bg-secondary">${book.status}</span>`;
                actionButtons = '<span class="text-muted fs-7">N/A</span>';
        }

        // Set default payment method if not defined in older records
        const payMethod = book.paymentMethod || 'Tiền mặt';
        const payStatus = book.paymentStatus || (payMethod === 'Chuyển khoản' ? 'Chờ xác nhận chuyển khoản' : 'Thanh toán khi nhận phòng');

        const payMethodBadge = payMethod === 'Chuyển khoản'
            ? '<span class="badge bg-info-subtle text-info border border-info px-2 py-0.5 fs-8 ms-1">Chuyển khoản VietQR</span>'
            : '<span class="badge bg-secondary-subtle text-secondary border border-secondary px-2 py-0.5 fs-8 ms-1">Tiền mặt</span>';
            
        const payStatusBadge = payStatus === 'Chờ xác nhận chuyển khoản'
            ? '<div class="text-warning fs-8 fw-semibold mt-1"><i class="bi bi-hourglass-split"></i> Chờ xác nhận CK</div>'
            : payStatus === 'Đã nhận tiền'
            ? '<div class="text-success fs-8 fw-semibold mt-1"><i class="bi bi-cash-coin"></i> Đã nhận tiền</div>'
            : payStatus === 'Hủy thanh toán'
            ? '<div class="text-danger fs-8 fw-semibold mt-1"><i class="bi bi-x-circle"></i> Đã hủy</div>'
            : '<div class="text-muted fs-8 fw-semibold mt-1"><i class="bi bi-wallet2"></i> Thanh toán khi nhận phòng</div>';
        
        const rowHtml = `
            <tr>
                <td>
                    <div class="fw-bold">${book.userFullName}</div>
                    <div class="text-muted fs-8">(@${book.username})</div>
                </td>
                <td class="fw-semibold">
                    <div>${book.roomName}</div>
                    <div class="text-muted fs-8 fw-normal">Mã đơn: <code class="text-accent">${book.bookingId}</code></div>
                </td>
                <td>
                    <div class="fs-7"><i class="bi bi-calendar-range text-warning me-1"></i>${book.checkInDate} <i class="bi bi-arrow-right mx-1"></i> ${book.checkOutDate}</div>
                </td>
                <td class="text-center fw-bold">${book.totalNights} đêm</td>
                <td>
                    <div class="fw-bold text-danger">${Utils.formatCurrency(book.totalPrice)}</div>
                    <div>${payMethodBadge}</div>
                </td>
                <td>
                    <div>${statusBadge}</div>
                    <div>${payStatusBadge}</div>
                </td>
                <td class="text-center">${actionButtons}</td>
            </tr>
        `;
        
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    
    // Bind action events
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.currentTarget.getAttribute('data-id');
            const userId = e.currentTarget.getAttribute('data-uid');
            updateBookingStatus(userId, bookingId, 'Đã xác nhận');
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.currentTarget.getAttribute('data-id');
            const userId = e.currentTarget.getAttribute('data-uid');
            updateBookingStatus(userId, bookingId, 'Từ chối');
        });
    });
}

async function updateBookingStatus(userId, bookingId, newStatus) {
    const message = newStatus === 'Đã xác nhận' 
        ? 'Bạn có chắc chắn muốn XÁC NHẬN duyệt đơn đặt phòng nghỉ này không?' 
        : 'Bạn có chắc chắn muốn TỪ CHỐI đơn đặt phòng nghỉ này không?';
        
    const confirmAction = confirm(message);
    if (!confirmAction) return;
    
    Utils.showSpinner();
    try {
        // Find targeted user profile in database
        const user = usersList.find(u => u.id === userId);
        if (!user) {
            throw new Error('Không tìm thấy tài khoản sở hữu đơn đặt phòng!');
        }
        
        // Find nested booking object inside user records
        const booking = user.bookings.find(b => b.bookingId === bookingId);
        if (!booking) {
            throw new Error('Không tìm thấy bản ghi đơn phòng yêu cầu!');
        }
        
        // Update property state
        booking.status = newStatus;
        
        // If payment method is bank transfer, update payment status
        if (booking.paymentMethod === 'Chuyển khoản') {
            booking.paymentStatus = newStatus === 'Đã xác nhận' ? 'Đã nhận tiền' : 'Hủy thanh toán';
        }
        
        // Call MockAPI synchronization logic
        await API.updateUserBookings(userId, user);
        
        Utils.showToast(`Cập nhật đơn đặt phòng thành công: ${newStatus}!`, 'success');
        await reloadAllData();
        
    } catch (err) {
        Utils.showToast(err.message, 'danger');
        Utils.hideSpinner();
    }
}

// --- TAB 3: ACCOUNT MANAGEMENT LOGIC ---
function renderUsersTable() {
    const tableBody = document.getElementById('usersTableBody');
    if (!tableBody) return;
    tableBody.innerHTML = '';
    
    const loggedInUser = Utils.getCurrentUser();
    
    usersList.forEach(user => {
        const bookingsCount = user.bookings ? user.bookings.length : 0;
        const roleBadge = user.role === 'admin' 
            ? '<span class="badge bg-primary"><i class="bi bi-shield-fill text-white me-1"></i>Admin</span>'
            : '<span class="badge bg-info"><i class="bi bi-mortarboard-fill text-white me-1"></i>Student</span>';
        
        const isSelf = loggedInUser && loggedInUser.id === user.id;
        
        let actionButtons = '';
        if (isSelf) {
            actionButtons = '<span class="text-muted fs-8 fw-semibold"><i class="bi bi-person-check-fill me-1"></i>Tài khoản hiện tại</span>';
        } else {
            const toggleRoleLabel = user.role === 'admin' ? 'Hạ vai trò' : 'Nâng vai trò';
            const toggleRoleClass = user.role === 'admin' ? 'btn-outline-info' : 'btn-outline-primary';
            
            actionButtons = `
                <div class="btn-group gap-2 justify-content-center">
                    <button class="btn btn-sm ${toggleRoleClass} rounded-pill px-3 change-role-btn" data-id="${user.id}" data-role="${user.role}">
                        <i class="bi bi-person-gear me-1"></i>${toggleRoleLabel}
                    </button>
                    <button class="btn btn-sm btn-outline-danger rounded-pill px-3 delete-user-btn" data-id="${user.id}">
                        <i class="bi bi-person-x me-1"></i>Xóa
                    </button>
                </div>
            `;
        }
        
        const rowHtml = `
            <tr>
                <td class="fw-bold">${user.fullName || 'Chưa cập nhật'}</td>
                <td><code class="text-accent">@${user.username}</code></td>
                <td><code class="text-muted">${user.password}</code></td>
                <td>${roleBadge}</td>
                <td class="text-center fw-bold">${bookingsCount}</td>
                <td class="text-center">${actionButtons}</td>
            </tr>
        `;
        tableBody.insertAdjacentHTML('beforeend', rowHtml);
    });
    
    // Bind toggle role buttons
    document.querySelectorAll('.change-role-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            const currentRole = e.currentTarget.getAttribute('data-role');
            const newRole = currentRole === 'admin' ? 'student' : 'admin';
            updateUserRole(userId, newRole);
        });
    });
    
    // Bind delete account buttons
    document.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.getAttribute('data-id');
            deleteUserProcess(userId);
        });
    });
}

async function updateUserRole(userId, newRole) {
    const confirmAction = confirm(`Bạn có chắc chắn muốn thay đổi vai trò của tài khoản này thành [${newRole.toUpperCase()}] không?`);
    if (!confirmAction) return;
    
    Utils.showSpinner();
    try {
        const user = usersList.find(u => u.id === userId);
        if (!user) throw new Error('Không tìm thấy tài khoản!');
        
        user.role = newRole;
        
        await API.updateUserBookings(userId, user);
        Utils.showToast('Cập nhật vai trò người dùng thành công!', 'success');
        await reloadAllData();
    } catch (err) {
        Utils.showToast(err.message, 'danger');
        Utils.hideSpinner();
    }
}

async function deleteUserProcess(userId) {
    const confirmAction = confirm('Bạn có chắc chắn muốn XÓA TÀI KHOẢN này không? Toàn bộ đơn đặt phòng của tài khoản này sẽ bị xóa khỏi hệ thống.');
    if (!confirmAction) return;
    
    Utils.showSpinner();
    try {
        const response = await fetch(`https://69f9a6e3c509a40d3aa2f039.mockapi.io/api/v1/users/${userId}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Xóa tài khoản thất bại!');
        
        Utils.showToast('Xóa tài khoản người dùng thành công!', 'success');
        await reloadAllData();
    } catch (err) {
        Utils.showToast(err.message, 'danger');
        Utils.hideSpinner();
    }
}
