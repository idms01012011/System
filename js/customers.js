// customers.js
async function loadCustomersData() {
    try {
        showLoading(true);
        const customers = await loadSheetData('customers');
        renderCustomersTable(customers);
        updateCustomerStats(customers);
        updateCustomerCharts(customers);
        updateCustomerSidebar(customers);
    } catch (error) {
        console.error('Error loading customers data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลลูกค้าได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderCustomersTable(customers) {
    const tableBody = document.getElementById('customers-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer['ชื่อลูกค้า'] || '-'}</td>
            <td>${customer['ที่อยู่'] || '-'}</td>
            <td>${customer['เบอร์โทร'] || '-'}</td>
            <td>${customer['Email'] || '-'}</td>
            <td><span class="status-badge ${getCustomerType(customer)}">${getCustomerType(customer)}</span></td>
            <td><span class="status-badge active">ใช้งาน</span></td>
            <td>${customer['วันที่สมัคร'] || new Date().toISOString().split('T')[0]}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('customers','edit',${JSON.stringify(customer).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${customer.id}','customers')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function getCustomerType(customer) {
    // กำหนดประเภทลูกค้าตามเงื่อนไขที่เหมาะสม
    const totalPurchases = (currentData.sales || []).filter(sale => 
        sale['ชื่อลูกค้า'] === customer['ชื่อลูกค้า']
    ).length;
    
    if (totalPurchases > 10) return 'vip';
    if (totalPurchases > 5) return 'corporate';
    return 'regular';
}

function updateCustomerStats(customers) {
    const totalElement = document.getElementById('total-customers');
    const vipElement = document.getElementById('vip-customers');
    const newThisMonthElement = document.getElementById('new-this-month');
    const avgSpendingElement = document.getElementById('avg-spending');

    if (totalElement) totalElement.textContent = customers.length;
    if (vipElement) vipElement.textContent = customers.filter(c => getCustomerType(c) === 'vip').length;
    
    const thisMonth = new Date().getMonth();
    if (newThisMonthElement) {
        newThisMonthElement.textContent = customers.filter(c => {
            const joinDate = new Date(c['วันที่สมัคร'] || new Date());
            return joinDate.getMonth() === thisMonth;
        }).length;
    }

    if (avgSpendingElement) {
        const sales = currentData.sales || [];
        const customerSpending = customers.map(customer => {
            const customerSales = sales.filter(sale => sale['ชื่อลูกค้า'] === customer['ชื่อลูกค้า']);
            return customerSales.reduce((sum, sale) => sum + (parseFloat(sale['ยอดรวม']) || 0), 0);
        }).filter(spending => spending > 0);
        
        const avgSpending = customerSpending.length > 0 ? 
            customerSpending.reduce((a, b) => a + b, 0) / customerSpending.length : 0;
        
        avgSpendingElement.textContent = `${avgSpending.toFixed(2)} ฿`;
    }
}

function updateCustomerCharts(customers) {
    // New Customers Chart
    const newCustomersCtx = document.getElementById('newCustomersChart')?.getContext('2d');
    if (newCustomersCtx) {
        new Chart(newCustomersCtx, {
            type: 'line',
            data: {
                labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                datasets: [{
                    label: 'ลูกค้าใหม่',
                    data: [15, 22, 18, 25, 20, 28],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true
                }]
            }
        });
    }

    // Customer Type Chart
    const customerTypeCtx = document.getElementById('customerTypeChart')?.getContext('2d');
    if (customerTypeCtx) {
        const types = {
            regular: customers.filter(c => getCustomerType(c) === 'regular').length,
            vip: customers.filter(c => getCustomerType(c) === 'vip').length,
            corporate: customers.filter(c => getCustomerType(c) === 'corporate').length
        };

        new Chart(customerTypeCtx, {
            type: 'doughnut',
            data: {
                labels: ['ปกติ', 'VIP', 'องค์กร'],
                datasets: [{
                    data: [types.regular, types.vip, types.corporate],
                    backgroundColor: ['#3498db', '#e74c3c', '#27ae60']
                }]
            }
        });
    }
}

function updateCustomerSidebar(customers) {
    // Today's new customers
    const todayNew = document.getElementById('today-new-customers');
    const activeCustomers = document.getElementById('active-customers');
    const recentPurchase = document.getElementById('recent-purchase');

    if (todayNew) {
        const today = new Date().toISOString().split('T')[0];
        todayNew.textContent = customers.filter(c => c['วันที่สมัคร'] === today).length;
    }

    if (activeCustomers) {
        activeCustomers.textContent = customers.length; // สามารถปรับตามเงื่อนไขได้
    }

    if (recentPurchase) {
        const sales = currentData.sales || [];
        const recentSale = sales[sales.length - 1];
        recentPurchase.textContent = recentSale ? `${parseFloat(recentSale['ยอดรวม'] || 0).toFixed(2)} ฿` : '0 ฿';
    }

    // Top customers
    const topCustomersList = document.getElementById('top-customers-list');
    if (topCustomersList) {
        const sales = currentData.sales || [];
        const customerTotals = {};
        
        sales.forEach(sale => {
            const customer = sale['ชื่อลูกค้า'];
            const amount = parseFloat(sale['ยอดรวม']) || 0;
            customerTotals[customer] = (customerTotals[customer] || 0) + amount;
        });

        const topCustomers = Object.entries(customerTotals)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        topCustomersList.innerHTML = topCustomers.map(([name, total]) => `
            <div class="customer-item">
                <span class="customer-name">${name}</span>
                <span class="customer-total">${total.toFixed(2)} ฿</span>
            </div>
        `).join('');
    }
}

function filterCustomers() {
    const typeFilter = document.getElementById('customer-type').value;
    const statusFilter = document.getElementById('customer-status').value;
    
    let filteredCustomers = currentData.customers || [];

    if (typeFilter !== 'all') {
        filteredCustomers = filteredCustomers.filter(customer => 
            getCustomerType(customer) === typeFilter
        );
    }

    renderCustomersTable(filteredCustomers);
}

function searchCustomers() {
    const searchTerm = document.getElementById('customer-search').value.toLowerCase();
    const filteredCustomers = (currentData.customers || []).filter(customer =>
        (customer['ชื่อลูกค้า'] || '').toLowerCase().includes(searchTerm) ||
        (customer['เบอร์โทร'] || '').includes(searchTerm) ||
        (customer['Email'] || '').toLowerCase().includes(searchTerm)
    );

    renderCustomersTable(filteredCustomers);
}

// Initialize customers page
document.addEventListener('DOMContentLoaded', function() {
    loadCustomersData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'customers' || sheet === 'sales') {
            loadCustomersData();
        }
    };
});
