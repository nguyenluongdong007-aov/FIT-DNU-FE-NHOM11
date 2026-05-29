// Project: StayEasy - Developed by SlimexDev / Rimuru Scripter

const BASE_URL = 'https://69f9a6e3c509a40d3aa2f039.mockapi.io/api/v1';

export const API = {
    // --- SYSTEM & AUTH MODULE ---
    
    /**
     * Fetch all users
     * @returns {Promise<Array>}
     */
    async getUsers() {
        const response = await fetch(`${BASE_URL}/users`);
        if (!response.ok) {
            throw new Error('Không thể lấy danh sách tài khoản');
        }
        return await response.json();
    },

    /**
     * Register a new user
     * @param {Object} userData 
     * @returns {Promise<Object>}
     */
    async register(userData) {
        // Fetch all users to check if username already exists
        const users = await this.getUsers();
        const usernameExists = users.some(u => u.username.toLowerCase() === userData.username.toLowerCase());
        
        if (usernameExists) {
            throw new Error('Tài khoản đã tồn tại trên hệ thống!');
        }

        // Set default role and empty bookings if not provided
        const finalUserData = {
            ...userData,
            role: userData.role || 'student',
            bookings: userData.bookings || []
        };

        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(finalUserData)
        });

        if (!response.ok) {
            throw new Error('Đăng ký tài khoản thất bại!');
        }

        return await response.json();
    },

    /**
     * Log in a user
     * @param {string} username 
     * @param {string} password 
     * @returns {Promise<Object>}
     */
    async login(username, password) {
        const users = await this.getUsers();
        const user = users.find(u => u.username === username && u.password === password);
        
        if (!user) {
            throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
        }

        return user;
    },

    // --- BOOKING MODULE ---

    /**
     * Synchronize bookings by updating the entire user record
     * @param {string} userId 
     * @param {Object} fullUserData 
     * @returns {Promise<Object>}
     */
    async updateUserBookings(userId, fullUserData) {
        const response = await fetch(`${BASE_URL}/users/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(fullUserData)
        });

        if (!response.ok) {
            throw new Error('Cập nhật thông tin đặt phòng thất bại!');
        }

        return await response.json();
    },

    // --- ROOM MODULE ---

    /**
     * Get list of all rooms
     * @returns {Promise<Array>}
     */
    async getRooms() {
        const response = await fetch(`${BASE_URL}/rooms`);
        if (!response.ok) {
            throw new Error('Không thể tải danh sách phòng!');
        }
        return await response.json();
    },

    /**
     * Get detailed info of a single room by ID
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    async getRoomById(id) {
        const response = await fetch(`${BASE_URL}/rooms/${id}`);
        if (!response.ok) {
            throw new Error('Không thể tải thông tin chi tiết phòng!');
        }
        return await response.json();
    },

    /**
     * Add a new room (Admin only)
     * @param {Object} roomData 
     * @returns {Promise<Object>}
     */
    async addRoom(roomData) {
        const response = await fetch(`${BASE_URL}/rooms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomData)
        });

        if (!response.ok) {
            throw new Error('Không thể thêm phòng mới!');
        }

        return await response.json();
    },

    /**
     * Update room details (Admin only)
     * @param {string} id 
     * @param {Object} roomData 
     * @returns {Promise<Object>}
     */
    async updateRoom(id, roomData) {
        const response = await fetch(`${BASE_URL}/rooms/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(roomData)
        });

        if (!response.ok) {
            throw new Error('Cập nhật thông tin phòng thất bại!');
        }

        return await response.json();
    },

    /**
     * Delete a room (Admin only)
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    async deleteRoom(id) {
        const response = await fetch(`${BASE_URL}/rooms/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Xóa phòng thất bại!');
        }

        return await response.json();
    }
};
