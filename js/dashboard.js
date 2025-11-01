// dashboard.js
async function loadDashboardData() {
    try {
        showLoading(true);
        
        // โหลดข้อมูลจากทุก sheet
        const sheets = ['service', 'request', 'sales', 'rental', 'equipment', 'customers', 'sparepart'];
        const promises = sheets.map(sheet => loadSheetData(sheet));
        await Promise.all(promises);

        updateStats();
        updateCharts();
        updateRecentActivity();
        updateRecentTables();
        updateSystemStatus();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลได้', 'error');
    } finally {
        showLoading(false);
    }
}

function updateStats() {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    const stats = {
        service: currentData.service?.length || 0,
        request: currentData.request?.length || 0,
        sales: currentData.sales?.length || 0,
        customers: currentData.customers?.length || 0,
        equipment: currentData.equipment?.length || 0,
        sparepart: currentData.sparepart?.length || 0
    };

    statsContainer.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon">🔧</div>
            <div class="stat-content">
                <div class="stat-value">${stats.service}</div>
                <div class="stat-label">งานซ่อมทั้งหมด</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">📋</div>
            <div class="stat-content">
                <div class="stat-value">${stats.request}</div>
                <div class="stat-label">แจ้งซ่อมทั้งหมด</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
                <div class="stat-value">${stats.sales}</div>
                <div class="stat-label">การขายทั้งหมด</div>
            </div>
        </div>
        <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-content">
                <div class="stat-value">${stats.customers}</div>
                <div class="stat-label">ลูกค้าทั้งหมด</div>
            </div>
        </div>
    `;
}

function updateCharts() {
    // Service Chart
    const serviceCtx = document.getElementById('serviceChart')?.getContext('2d');
    if (serviceCtx) {
        new Chart(serviceCtx, {
            type: 'line',
            data: {
                labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                datasets: [{
                    label: 'งานซ่อม',
                    data: [12, 19, 3, 5, 2, 3],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    }

    // Status Chart
    const statusCtx = document.getElementById('statusChart')?.getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['เสร็จสิ้น', 'กำลังดำเนินการ', 'รอดำเนินการ'],
                datasets: [{
                    data: [60, 25, 15],
                    backgroundColor: ['#27ae60', '#3498db', '#f39c12']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }
}

function updateRecentActivity() {
    const activityContainer = document.getElementById('recent-activity');
    if (!activityContainer) return;

    const activities = [
        { icon: '🔧', title: 'งานซ่อมใหม่ #IDMS045', time: '2 นาทีที่แล้ว' },
        { icon: '💰', title: 'การขายใหม่ #SALE023', time: '5 นาทีที่แล้ว' },
        { icon: '👥', title: 'ลูกค้าใหม่ลงทะเบียน', time: '10 นาทีที่แล้ว' },
        { icon: '📋', title: 'แจ้งซ่อมใหม่ #REQ031', time: '15 นาทีที่แล้ว' }
    ];

    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        </div>
    `).join('');
}

function updateRecentTables() {
    // Recent Service Table
    const serviceTable = document.getElementById('recent-service');
    if (serviceTable && currentData.service) {
        const recentServices = currentData.service.slice(-5).reverse();
        serviceTable.innerHTML = `
            <tr>
                <th>เลขที่ใบงาน</th>
                <th>โรงพยาบาล</th>
                <th>สถานะ</th>
            </tr>
            ${recentServices.map(service => `
                <tr>
                    <td>${service['เลขที่ใบงาน'] || '-'}</td>
                    <td>${service['ชื่อโรงพยาบาล'] || '-'}</td>
                    <td><span class="status-badge pending">รอดำเนินการ</span></td>
                </tr>
            `).join('')}
        `;
    }

    // Recent Request Table
    const requestTable = document.getElementById('recent-request');
    if (requestTable && currentData.request) {
        const recentRequests = currentData.request.slice(-5).reverse();
        requestTable.innerHTML = `
            <tr>
                <th>ลูกค้า</th>
                <th>ชื่อเครื่อง</th>
                <th>วันที่แจ้ง</th>
            </tr>
            ${recentRequests.map(request => `
                <tr>
                    <td>${request['ลูกค้า'] || '-'}</td>
                    <td>${request['ชื่อเครื่อง'] || '-'}</td>
                    <td>${request['วันที่แจ้งซ่อม'] || '-'}</td>
                </tr>
            `).join('')}
        `;
    }
}

function updateSystemStatus() {
    const storageStatus = document.getElementById('storage-status');
    if (storageStatus) {
        storageStatus.textContent = '75% (ปกติ)';
    }

    const currentTime = document.getElementById('current-time');
    if (currentTime) {
        currentTime.textContent = new Date().toLocaleString('th-TH');
    }

    const lastUpdate = document.getElementById('last-update');
    if (lastUpdate) {
        lastUpdate.textContent = `อัพเดทล่าสุด: ${new Date().toLocaleString('th-TH')}`;
    }
}

function loadRecentActivity() {
    updateRecentActivity();
    showNotification('อัพเดทกิจกรรมล่าสุดเรียบร้อย', 'success');
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadDashboardData();
    
    // Auto-refresh every 30 seconds
    setInterval(loadDashboardData, 30000);
});
