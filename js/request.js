// request.js
async function loadRequestData() {
    try {
        showLoading(true);
        const requests = await loadSheetData('request');
        renderRequestTable(requests);
        updateRequestStats(requests);
        updateRequestSidebar(requests);
    } catch (error) {
        console.error('Error loading request data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลแจ้งซ่อมได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderRequestTable(requests) {
    const tableBody = document.getElementById('request-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = requests.map(request => `
        <tr>
            <td>${request['วันที่แจ้งซ่อม'] || '-'}</td>
            <td>${request['ลูกค้า'] || '-'}</td>
            <td>${request['ชื่อเครื่อง'] || '-'}</td>
            <td>${request['ยี่ห้อ'] || '-'}/${request['รุ่น'] || '-'}</td>
            <td>${(request['อาการที่แจ้ง'] || '').substring(0, 50)}${(request['อาการที่แจ้ง'] || '').length > 50 ? '...' : ''}</td>
            <td>${request['ชื่อช่าง'] || '-'}</td>
            <td><span class="status-badge ${getRequestStatus(request)}">${getRequestStatus(request)}</span></td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('request','edit',${JSON.stringify(request).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${request.id}','request')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getRequestStatus(request) {
    if (request['ชื่อช่าง'] && request['วันที่แจ้งซ่อม']) return 'in-progress';
    if (request['ชื่อช่าง']) return 'assigned';
    return 'new';
}

function updateRequestStats(requests) {
    const totalElement = document.getElementById('total-requests');
    const newElement = document.getElementById('new-requests');
    const assignedElement = document.getElementById('assigned-requests');
    const completedElement = document.getElementById('completed-requests');

    if (totalElement) totalElement.textContent = requests.length;
    if (newElement) newElement.textContent = requests.filter(r => getRequestStatus(r) === 'new').length;
    if (assignedElement) assignedElement.textContent = requests.filter(r => getRequestStatus(r) === 'assigned').length;
    if (completedElement) completedElement.textContent = requests.filter(r => getRequestStatus(r) === 'in-progress').length;

    // Quick stats
    const todayRequests = document.getElementById('today-requests');
    const pendingRequests = document.getElementById('pending-requests');
    const avgWaitTime = document.getElementById('avg-wait-time');

    if (todayRequests) {
        const today = new Date().toISOString().split('T')[0];
        todayRequests.textContent = requests.filter(r => r['วันที่แจ้งซ่อม'] === today).length;
    }

    if (pendingRequests) {
        pendingRequests.textContent = requests.filter(r => 
            getRequestStatus(r) === 'new' || getRequestStatus(r) === 'assigned'
        ).length;
    }

    if (avgWaitTime) {
        avgWaitTime.textContent = '24 ชม.'; // สามารถคำนวณตามจริงได้
    }
}

function updateRequestSidebar(requests) {
    const recentRequests = document.getElementById('recent-requests');
    if (!recentRequests) return;

    const recent = requests.slice(-5).reverse();
    recentRequests.innerHTML = recent.map(request => `
        <div class="request-item">
            <div class="request-customer">${request['ลูกค้า']}</div>
            <div class="request-equipment">${request['ชื่อเครื่อง']}</div>
            <div class="request-time">${request['วันที่แจ้งซ่อม']}</div>
        </div>
    `).join('');
}

function quickAddRequest() {
    const customer = document.getElementById('quick-customer').value;
    const phone = document.getElementById('quick-phone').value;
    const equipment = document.getElementById('quick-equipment').value;
    const issue = document.getElementById('quick-issue').value;

    if (!customer || !equipment) {
        showNotification('กรุณากรอกชื่อลูกค้าและชื่อเครื่อง', 'error');
        return;
    }

    const newRequest = {
        'ลำดับ': generateNextSequence('request'),
        'วันที่แจ้งซ่อม': new Date().toISOString().split('T')[0],
        'ลูกค้า': customer,
        'ชื่อเครื่อง': equipment,
        'อาการที่แจ้ง': issue
    };

    // ใช้ฟังก์ชัน openSection เพื่อบันทึกข้อมูล
    openSection('request', 'add');
    
    // กรอกข้อมูลในฟอร์ม
    setTimeout(() => {
        const form = document.getElementById('entity-form');
        if (form) {
            form.querySelector('[name="ลูกค้า"]').value = customer;
            form.querySelector('[name="ชื่อเครื่อง"]').value = equipment;
            form.querySelector('[name="อาการที่แจ้ง"]').value = issue;
            if (phone) form.querySelector('[name="เบอร์โทร"]').value = phone;
        }
    }, 100);

    // ล้างฟอร์มด่วน
    document.getElementById('quick-customer').value = '';
    document.getElementById('quick-phone').value = '';
    document.getElementById('quick-equipment').value = '';
    document.getElementById('quick-issue').value = '';

    showNotification('เพิ่มแจ้งซ่อมด่วนเรียบร้อย', 'success');
}

function searchRequests() {
    const searchTerm = document.getElementById('request-search').value.toLowerCase();
    const statusFilter = document.getElementById('request-status-filter').value;
    
    let filteredRequests = currentData.request || [];

    if (searchTerm) {
        filteredRequests = filteredRequests.filter(request =>
            (request['ลูกค้า'] || '').toLowerCase().includes(searchTerm) ||
            (request['ชื่อเครื่อง'] || '').toLowerCase().includes(searchTerm)
        );
    }

    if (statusFilter) {
        filteredRequests = filteredRequests.filter(request => 
            getRequestStatus(request) === statusFilter
        );
    }

    renderRequestTable(filteredRequests);
}

function filterRequests() {
    searchRequests();
}

// Initialize request page
document.addEventListener('DOMContentLoaded', function() {
    loadRequestData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'request') {
            loadRequestData();
        }
    };
});
