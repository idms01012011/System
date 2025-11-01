// rental.js
async function loadRentalData() {
    try {
        showLoading(true);
        const rentals = await loadSheetData('rental');
        renderRentalTable(rentals);
        updateRentalStats(rentals);
        updateRentalAlerts(rentals);
        updateRentalSidebar(rentals);
    } catch (error) {
        console.error('Error loading rental data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลการเช่าได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderRentalTable(rentals) {
    const tableBody = document.getElementById('rental-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = rentals.map(rental => `
        <tr>
            <td>${rental['ลำดับ'] ? `RENT${String(rental['ลำดับ']).padStart(3, '0')}` : '-'}</td>
            <td>${rental['ชื่อลูกค้า'] || '-'}</td>
            <td>${rental['ชื่อเครื่อง/สินค้า'] || '-'}</td>
            <td>${rental['วันที่เริ่มเช่า'] || '-'}</td>
            <td>${rental['วันที่สิ้นสุด'] || '-'}</td>
            <td>${calculateRentalPeriod(rental)}</td>
            <td>${parseFloat(rental['ยอดรวม'] || 0).toFixed(2)} ฿</td>
            <td><span class="status-badge ${getRentalStatus(rental)}">${getRentalStatus(rental)}</span></td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('rental','edit',${JSON.stringify(rental).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${rental.id}','rental')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function calculateRentalPeriod(rental) {
    const start = new Date(rental['วันที่เริ่มเช่า']);
    const end = new Date(rental['วันที่สิ้นสุด']);
    if (isNaN(start) || isNaN(end)) return '-';
    
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${diffDays} วัน`;
}

function getRentalStatus(rental) {
    const today = new Date();
    const start = new Date(rental['วันที่เริ่มเช่า']);
    const end = new Date(rental['วันที่สิ้นสุด']);
    
    if (isNaN(start) || isNaN(end)) return 'upcoming';
    
    if (today < start) return 'upcoming';
    if (today > end) return 'expired';
    if (today >= start && today <= end) return 'active';
    
    return 'completed';
}

function updateRentalStats(rentals) {
    const incomeElement = document.getElementById('total-rental-income');
    const activeElement = document.getElementById('active-rentals');
    const expiringElement = document.getElementById('expiring-soon');
    const totalElement = document.getElementById('total-rentals');

    if (incomeElement) {
        const totalIncome = rentals.reduce((sum, rental) => sum + (parseFloat(rental['ยอดรวม']) || 0), 0);
        incomeElement.textContent = `${totalIncome.toFixed(2)} ฿`;
    }

    if (activeElement) {
        activeElement.textContent = rentals.filter(rental => getRentalStatus(rental) === 'active').length;
    }

    if (expiringElement) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        expiringElement.textContent = rentals.filter(rental => {
            const end = new Date(rental['วันที่สิ้นสุด']);
            return end <= nextWeek && end >= today;
        }).length;
    }

    if (totalElement) totalElement.textContent = rentals.length;
}

function updateRentalAlerts(rentals) {
    const alertGrid = document.getElementById('rental-alerts');
    if (!alertGrid) return;

    const expiringSoon = rentals.filter(rental => {
        const end = new Date(rental['วันที่สิ้นสุด']);
        const today = new Date();
        const diffTime = end - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 7 && diffDays > 0;
    });

    const expired = rentals.filter(rental => getRentalStatus(rental) === 'expired');

    let alertsHTML = '';

    if (expired.length > 0) {
        alertsHTML += `
            <div class="alert-item urgent">
                <div class="alert-icon">🚨</div>
                <div class="alert-content">
                    <div class="alert-title">สัญญาเช่าหมดอายุ</div>
                    <div class="alert-message">มี ${expired.length} สัญญาที่หมดอายุแล้ว</div>
                </div>
            </div>
        `;
    }

    if (expiringSoon.length > 0) {
        alertsHTML += `
            <div class="alert-item warning">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <div class="alert-title">สัญญาใกล้หมดอายุ</div>
                    <div class="alert-message">มี ${expiringSoon.length} สัญญาที่จะหมดอายุภายใน 7 วัน</div>
                </div>
            </div>
        `;
    }

    alertGrid.innerHTML = alertsHTML || '<div class="alert-item success">ไม่มีสัญญาที่ต้องเตือน</div>';
}

function updateRentalSidebar(rentals) {
    // Today's stats
    const todayStarts = document.getElementById('today-starts');
    const todayEnds = document.getElementById('today-ends');
    const todayIncome = document.getElementById('today-income');

    if (todayStarts) {
        const today = new Date().toISOString().split('T')[0];
        todayStarts.textContent = rentals.filter(rental => rental['วันที่เริ่มเช่า'] === today).length;
    }

    if (todayEnds) {
        const today = new Date().toISOString().split('T')[0];
        todayEnds.textContent = rentals.filter(rental => rental['วันที่สิ้นสุด'] === today).length;
    }

    if (todayIncome) {
        const today = new Date().toISOString().split('T')[0];
        const todayRentals = rentals.filter(rental => 
            rental['วันที่เริ่มเช่า'] === today || rental['วันที่สิ้นสุด'] === today
        );
        const income = todayRentals.reduce((sum, rental) => sum + (parseFloat(rental['ยอดรวม']) || 0), 0);
        todayIncome.textContent = `${income.toFixed(2)} ฿`;
    }

    // Expiring rentals
    const expiringList = document.getElementById('expiring-rentals');
    if (expiringList) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expiring = rentals.filter(rental => {
            const end = new Date(rental['วันที่สิ้นสุด']);
            return end <= nextWeek && end >= today;
        }).slice(0, 5);

        expiringList.innerHTML = expiring.map(rental => `
            <div class="expiring-item">
                <span class="rental-customer">${rental['ชื่อลูกค้า']}</span>
                <span class="rental-end">${rental['วันที่สิ้นสุด']}</span>
            </div>
        `).join('');
    }
}

function filterRentals() {
    const statusFilter = document.getElementById('rental-status').value;
    const periodFilter = document.getElementById('rental-period').value;
    
    let filteredRentals = currentData.rental || [];

    if (statusFilter !== 'all') {
        filteredRentals = filteredRentals.filter(rental => 
            getRentalStatus(rental) === statusFilter
        );
    }

    // สามารถเพิ่มการกรองตามช่วงเวลาได้
    renderRentalTable(filteredRentals);
}

function searchRentals() {
    const searchTerm = document.getElementById('rental-search').value.toLowerCase();
    const filteredRentals = (currentData.rental || []).filter(rental =>
        (rental['ชื่อลูกค้า'] || '').toLowerCase().includes(searchTerm) ||
        (rental['ชื่อเครื่อง/สินค้า'] || '').toLowerCase().includes(searchTerm)
    );

    renderRentalTable(filteredRentals);
}

// Initialize rental page
document.addEventListener('DOMContentLoaded', function() {
    loadRentalData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'rental') {
            loadRentalData();
        }
    };
});
