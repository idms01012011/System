// sparepart.js
async function loadSparepartData() {
    try {
        showLoading(true);
        const spareparts = await loadSheetData('sparepart');
        renderSparepartTable(spareparts);
        updateSparepartStats(spareparts);
        updateSparepartAlerts(spareparts);
        updateSparepartSidebar(spareparts);
    } catch (error) {
        console.error('Error loading sparepart data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลอะไหล่ได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderSparepartTable(spareparts) {
    const tableBody = document.getElementById('sparepart-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = spareparts.map(item => `
        <tr>
            <td>${createImageElement(item['รูปภาพอะไหล่']).outerHTML}</td>
            <td>${item['ชื่ออะไหล่'] || '-'}</td>
            <td>${item['ยี่ห้อ'] || '-'}/${item['รุ่น'] || '-'}</td>
            <td>${item['รหัส'] || '-'}</td>
            <td>${item['ประเภท'] || '-'}</td>
            <td><span class="status-badge ${getStockStatusClass(item)}">${getStockStatus(item)}</span></td>
            <td>${item['จำนวน'] || '0'}</td>
            <td>${parseFloat(item['ราคาขาย'] || 0).toFixed(2)} ฿</td>
            <td>${parseFloat(item['ราคาต้นทุน'] || 0).toFixed(2)} ฿</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('sparepart','edit',${JSON.stringify(item).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${item.id}','sparepart')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getStockStatus(item) {
    const quantity = parseInt(item['จำนวน']) || 0;
    if (quantity === 0) return 'หมดสต็อก';
    if (quantity <= 5) return 'สต็อกต่ำ';
    return 'มีในสต็อก';
}

function getStockStatusClass(item) {
    const status = getStockStatus(item);
    const statusMap = {
        'มีในสต็อก': 'completed',
        'สต็อกต่ำ': 'pending',
        'หมดสต็อก': 'urgent'
    };
    return statusMap[status] || 'pending';
}

function updateSparepartStats(spareparts) {
    const totalElement = document.getElementById('total-spareparts');
    const inStockElement = document.getElementById('in-stock');
    const lowStockElement = document.getElementById('low-stock');
    const stockValueElement = document.getElementById('stock-value');

    if (totalElement) totalElement.textContent = spareparts.length;
    
    if (inStockElement) {
        inStockElement.textContent = spareparts.filter(item => 
            getStockStatus(item) === 'มีในสต็อก'
        ).length;
    }
    
    if (lowStockElement) {
        lowStockElement.textContent = spareparts.filter(item => 
            getStockStatus(item) === 'สต็อกต่ำ'
        ).length;
    }
    
    if (stockValueElement) {
        const totalValue = spareparts.reduce((sum, item) => 
            sum + (parseFloat(item['ราคาต้นทุน']) || 0) * (parseInt(item['จำนวน']) || 0), 0
        );
        stockValueElement.textContent = `${totalValue.toFixed(2)} ฿`;
    }
}

function updateSparepartAlerts(spareparts) {
    const alertGrid = document.getElementById('stock-alerts');
    if (!alertGrid) return;

    const lowStockItems = spareparts.filter(item => getStockStatus(item) === 'สต็อกต่ำ');
    const outOfStockItems = spareparts.filter(item => getStockStatus(item) === 'หมดสต็อก');

    let alertsHTML = '';

    if (outOfStockItems.length > 0) {
        alertsHTML += `
            <div class="alert-item urgent">
                <div class="alert-icon">🚨</div>
                <div class="alert-content">
                    <div class="alert-title">อะไหล่หมดสต็อก</div>
                    <div class="alert-message">มี ${outOfStockItems.length} รายการที่หมดสต็อก</div>
                </div>
            </div>
        `;
    }

    if (lowStockItems.length > 0) {
        alertsHTML += `
            <div class="alert-item warning">
                <div class="alert-icon">⚠️</div>
                <div class="alert-content">
                    <div class="alert-title">อะไหล่สต็อกต่ำ</div>
                    <div class="alert-message">มี ${lowStockItems.length} รายการที่สต็อกต่ำ</div>
                </div>
            </div>
        `;
    }

    alertGrid.innerHTML = alertsHTML || '<div class="alert-item success">ไม่มีอะไหล่ที่ต้องเตือน</div>';
}

function updateSparepartSidebar(spareparts) {
    // Stock statistics
    const totalStockValue = document.getElementById('total-stock-value');
    const lowStockCount = document.getElementById('low-stock-count');
    const outOfStockCount = document.getElementById('out-of-stock-count');

    if (totalStockValue) {
        const totalValue = spareparts.reduce((sum, item) => 
            sum + (parseFloat(item['ราคาต้นทุน']) || 0) * (parseInt(item['จำนวน']) || 0), 0
        );
        totalStockValue.textContent = `${totalValue.toFixed(2)} ฿`;
    }

    if (lowStockCount) {
        lowStockCount.textContent = spareparts.filter(item => 
            getStockStatus(item) === 'สต็อกต่ำ'
        ).length;
    }

    if (outOfStockCount) {
        outOfStockCount.textContent = spareparts.filter(item => 
            getStockStatus(item) === 'หมดสต็อก'
        ).length;
    }

    // Low stock items
    const lowStockList = document.getElementById('low-stock-items');
    if (lowStockList) {
        const lowStockItems = spareparts.filter(item => 
            getStockStatus(item) === 'สต็อกต่ำ'
        ).slice(0, 5);

        lowStockList.innerHTML = lowStockItems.map(item => `
            <div class="stock-item">
                <span class="item-name">${item['ชื่ออะไหล่']}</span>
                <span class="item-quantity">${item['จำนวน']} ชิ้น</span>
            </div>
        `).join('');
    }
}

function filterSpareparts() {
    const statusFilter = document.getElementById('stock-status').value;
    const categoryFilter = document.getElementById('sparepart-category').value;
    
    let filteredSpareparts = currentData.sparepart || [];

    if (statusFilter !== 'all') {
        filteredSpareparts = filteredSpareparts.filter(item => 
            getStockStatus(item) === statusFilter
        );
    }

    if (categoryFilter) {
        filteredSpareparts = filteredSpareparts.filter(item => 
            item['ประเภท'] === categoryFilter
        );
    }

    renderSparepartTable(filteredSpareparts);
}

function searchSpareparts() {
    const searchTerm = document.getElementById('sparepart-search').value.toLowerCase();
    const filteredSpareparts = (currentData.sparepart || []).filter(item =>
        (item['ชื่ออะไหล่'] || '').toLowerCase().includes(searchTerm) ||
        (item['ยี่ห้อ'] || '').toLowerCase().includes(searchTerm) ||
        (item['รุ่น'] || '').toLowerCase().includes(searchTerm) ||
        (item['รหัส'] || '').toLowerCase().includes(searchTerm)
    );

    renderSparepartTable(filteredSpareparts);
}

// Initialize sparepart page
document.addEventListener('DOMContentLoaded', function() {
    loadSparepartData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'sparepart') {
            loadSparepartData();
        }
    };
});
