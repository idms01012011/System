// equipment.js
async function loadEquipmentData() {
    try {
        showLoading(true);
        const equipment = await loadSheetData('equipment');
        renderEquipmentTable(equipment);
        updateEquipmentStats(equipment);
        updateEquipmentSidebar(equipment);
    } catch (error) {
        console.error('Error loading equipment data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลอุปกรณ์ได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderEquipmentTable(equipment) {
    const tableBody = document.getElementById('equipment-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = equipment.map(item => `
        <tr>
            <td>${createImageElement(item['รูปภาพเครื่อง']).outerHTML}</td>
            <td>${item['ชื่อเครื่อง'] || '-'}</td>
            <td>${item['ประเภท'] || '-'}</td>
            <td>${item['ยี่ห้อ'] || '-'}/${item['รุ่น'] || '-'}</td>
            <td>${item['หมายเลขเครื่อง/รหัส'] || '-'}</td>
            <td><span class="status-badge ${getStatusClass(item['สถานะ'])}">${item['สถานะ'] || 'พร้อมใช้งาน'}</span></td>
            <td>${item['จำนวน'] || '1'}</td>
            <td>${parseFloat(item['ราคา'] || 0).toFixed(2)} ฿</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('equipment','edit',${JSON.stringify(item).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${item.id}','equipment')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getStatusClass(status) {
    const statusMap = {
        'พร้อมใช้งาน': 'completed',
        'ไม่พร้อมใช้งาน': 'pending',
        'อยู่ระหว่างซ่อม': 'in-progress',
        'จำหน่ายแล้ว': 'urgent'
    };
    return statusMap[status] || 'pending';
}

function updateEquipmentStats(equipment) {
    const totalElement = document.getElementById('total-equipment');
    const availableElement = document.getElementById('available-equipment');
    const maintenanceElement = document.getElementById('maintenance-equipment');
    const totalValueElement = document.getElementById('total-value');

    if (totalElement) totalElement.textContent = equipment.length;
    
    if (availableElement) {
        availableElement.textContent = equipment.filter(item => 
            item['สถานะ'] === 'พร้อมใช้งาน'
        ).length;
    }
    
    if (maintenanceElement) {
        maintenanceElement.textContent = equipment.filter(item => 
            item['สถานะ'] === 'อยู่ระหว่างซ่อม'
        ).length;
    }
    
    if (totalValueElement) {
        const totalValue = equipment.reduce((sum, item) => 
            sum + (parseFloat(item['ราคา']) || 0) * (parseInt(item['จำนวน']) || 1), 0
        );
        totalValueElement.textContent = `${totalValue.toFixed(2)} ฿`;
    }
}

function updateEquipmentSidebar(equipment) {
    // Statistics
    const statTotal = document.getElementById('stat-total');
    const statAvailable = document.getElementById('stat-available');
    const statMaintenance = document.getElementById('stat-maintenance');
    const statUnavailable = document.getElementById('stat-unavailable');

    if (statTotal) statTotal.textContent = equipment.length;
    if (statAvailable) {
        statAvailable.textContent = equipment.filter(item => item['สถานะ'] === 'พร้อมใช้งาน').length;
    }
    if (statMaintenance) {
        statMaintenance.textContent = equipment.filter(item => item['สถานะ'] === 'อยู่ระหว่างซ่อม').length;
    }
    if (statUnavailable) {
        statUnavailable.textContent = equipment.filter(item => 
            item['สถานะ'] === 'ไม่พร้อมใช้งาน'
        ).length;
    }

    // Maintenance needed
    const maintenanceNeeded = document.getElementById('maintenance-needed');
    if (maintenanceNeeded) {
        const maintenanceItems = equipment.filter(item => 
            item['สถานะ'] === 'อยู่ระหว่างซ่อม'
        ).slice(0, 5);

        maintenanceNeeded.innerHTML = maintenanceItems.map(item => `
            <div class="maintenance-item">
                <span class="equipment-name">${item['ชื่อเครื่อง']}</span>
                <span class="maintenance-status">ต้องการซ่อม</span>
            </div>
        `).join('');
    }

    // Categories
    const categoriesList = document.getElementById('equipment-categories');
    if (categoriesList) {
        const categories = [...new Set(equipment.map(item => item['ประเภท']).filter(Boolean))];
        categoriesList.innerHTML = categories.map(category => `
            <div class="category-item">
                <span class="category-name">${category}</span>
                <span class="category-count">${equipment.filter(item => item['ประเภท'] === category).length}</span>
            </div>
        `).join('');
    }
}

function filterEquipment() {
    const statusFilter = document.getElementById('equipment-status').value;
    const categoryFilter = document.getElementById('equipment-category').value;
    
    let filteredEquipment = currentData.equipment || [];

    if (statusFilter !== 'all') {
        filteredEquipment = filteredEquipment.filter(item => 
            item['สถานะ'] === statusFilter
        );
    }

    if (categoryFilter) {
        filteredEquipment = filteredEquipment.filter(item => 
            item['ประเภท'] === categoryFilter
        );
    }

    renderEquipmentTable(filteredEquipment);
}

function searchEquipment() {
    const searchTerm = document.getElementById('equipment-search').value.toLowerCase();
    const filteredEquipment = (currentData.equipment || []).filter(item =>
        (item['ชื่อเครื่อง'] || '').toLowerCase().includes(searchTerm) ||
        (item['ยี่ห้อ'] || '').toLowerCase().includes(searchTerm) ||
        (item['รุ่น'] || '').toLowerCase().includes(searchTerm) ||
        (item['หมายเลขเครื่อง/รหัส'] || '').toLowerCase().includes(searchTerm)
    );

    renderEquipmentTable(filteredEquipment);
}

// Initialize equipment page
document.addEventListener('DOMContentLoaded', function() {
    loadEquipmentData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'equipment') {
            loadEquipmentData();
        }
    };
});
