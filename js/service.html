// service.js
let currentServicePage = 1;
const servicesPerPage = 10;

async function loadServiceData() {
    try {
        showLoading(true);
        const services = await loadSheetData('service');
        renderServiceTable(services);
        updateServiceStats(services);
        updateServiceCharts(services);
    } catch (error) {
        console.error('Error loading service data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลงานซ่อมได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderServiceTable(services) {
    const tableBody = document.getElementById('service-table-body');
    if (!tableBody) return;

    const startIndex = (currentServicePage - 1) * servicesPerPage;
    const paginatedServices = services.slice(startIndex, startIndex + servicesPerPage);

    tableBody.innerHTML = paginatedServices.map(service => `
        <tr>
            <td>${service['เลขที่ใบงาน'] || '-'}</td>
            <td>${service['วันที่เปิดงาน'] || '-'}</td>
            <td>${service['ชื่อโรงพยาบาล'] || '-'}</td>
            <td>${service['ชื่อเครื่อง'] || '-'}</td>
            <td>${service['ยี่ห้อ'] || '-'}/${service['รุ่น'] || '-'}</td>
            <td>${(service['อาการที่แจ้งเสีย'] || '').substring(0, 50)}${(service['อาการที่แจ้งเสีย'] || '').length > 50 ? '...' : ''}</td>
            <td><span class="status-badge pending">รอดำเนินการ</span></td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('service','edit',${JSON.stringify(service).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${service.id}','service')">🗑️</button>
                <button class="btn-pdf" onclick="previewPDF(${JSON.stringify(service).replace(/"/g, '&quot;')})">📄</button>
            </td>
        </tr>
    `).join('');

    updateServicePagination(services.length);
}

function updateServicePagination(totalServices) {
    const pagination = document.getElementById('service-pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(totalServices / servicesPerPage);
    
    let paginationHTML = '';
    if (currentServicePage > 1) {
        paginationHTML += `<button onclick="changeServicePage(${currentServicePage - 1})">← ก่อนหน้า</button>`;
    }
    
    paginationHTML += `<span>หน้า ${currentServicePage} จาก ${totalPages}</span>`;
    
    if (currentServicePage < totalPages) {
        paginationHTML += `<button onclick="changeServicePage(${currentServicePage + 1})">ถัดไป →</button>`;
    }
    
    pagination.innerHTML = paginationHTML;
}

function changeServicePage(page) {
    currentServicePage = page;
    loadServiceData();
}

function updateServiceStats(services) {
    // อัพเดทสถิติใน dashboard
    const totalElement = document.getElementById('total-services');
    const pendingElement = document.getElementById('pending-services');
    const completedElement = document.getElementById('completed-services');
    const urgentElement = document.getElementById('urgent-services');

    if (totalElement) totalElement.textContent = services.length;
    if (pendingElement) pendingElement.textContent = services.filter(s => !s['วันที่ปิดงาน']).length;
    if (completedElement) completedElement.textContent = services.filter(s => s['วันที่ปิดงาน']).length;
    if (urgentElement) urgentElement.textContent = services.filter(s => s['ประเภทงาน'] === 'เร่งด่วน').length;

    // อัพเดทสถิติใน sidebar
    const todayNew = document.getElementById('today-new');
    const todayCompleted = document.getElementById('today-completed');
    const todayWaiting = document.getElementById('today-waiting');

    if (todayNew) todayNew.textContent = services.filter(s => 
        s['วันที่เปิดงาน'] === new Date().toISOString().split('T')[0]
    ).length;

    if (todayCompleted) todayCompleted.textContent = services.filter(s => 
        s['วันที่ปิดงาน'] === new Date().toISOString().split('T')[0]
    ).length;

    if (todayWaiting) todayWaiting.textContent = services.filter(s => 
        !s['วันที่ปิดงาน'] && s['อาการที่แจ้งเสีย']?.includes('รออะไหล่')
    ).length;
}

function updateServiceCharts(services) {
    // Weekly Service Chart
    const weeklyCtx = document.getElementById('weeklyServiceChart')?.getContext('2d');
    if (weeklyCtx) {
        new Chart(weeklyCtx, {
            type: 'bar',
            data: {
                labels: ['ส.1', 'ส.2', 'ส.3', 'ส.4', 'ส.5', 'ส.6', 'ส.7'],
                datasets: [{
                    label: 'งานซ่อม',
                    data: [5, 8, 6, 10, 7, 4, 3],
                    backgroundColor: '#3498db'
                }]
            }
        });
    }

    // Service Status Chart
    const statusCtx = document.getElementById('serviceStatusChart')?.getContext('2d');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'pie',
            data: {
                labels: ['เสร็จสิ้น', 'กำลังซ่อม', 'รอดำเนินการ', 'รออะไหล่'],
                datasets: [{
                    data: [40, 25, 20, 15],
                    backgroundColor: ['#27ae60', '#3498db', '#f39c12', '#e74c3c']
                }]
            }
        });
    }
}

function searchServices() {
    const searchTerm = document.getElementById('service-search').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;

    let filteredServices = currentData.service || [];

    if (searchTerm) {
        filteredServices = filteredServices.filter(service => 
            (service['เลขที่ใบงาน'] || '').toLowerCase().includes(searchTerm) ||
            (service['ชื่อโรงพยาบาล'] || '').toLowerCase().includes(searchTerm) ||
            (service['ชื่อเครื่อง'] || '').toLowerCase().includes(searchTerm)
        );
    }

    renderServiceTable(filteredServices);
}

function filterServices() {
    searchServices();
}

function exportServiceData() {
    const services = currentData.service || [];
    if (services.length === 0) {
        showNotification('ไม่มีข้อมูลให้ส่งออก', 'warning');
        return;
    }

    const csv = convertToCSV(services, schemas.service);
    downloadCSV(csv, 'service_data.csv');
    showNotification('ส่งออกข้อมูลงานซ่อมเรียบร้อย', 'success');
}

// Initialize service page
document.addEventListener('DOMContentLoaded', function() {
    loadServiceData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'service') {
            loadServiceData();
        }
    };
});
