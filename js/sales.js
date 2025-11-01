// sales.js
async function loadSalesData() {
    try {
        showLoading(true);
        const sales = await loadSheetData('sales');
        renderSalesTable(sales);
        updateSalesStats(sales);
        updateSalesCharts(sales);
        updateSalesSidebar(sales);
    } catch (error) {
        console.error('Error loading sales data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลการขายได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderSalesTable(sales) {
    const tableBody = document.getElementById('sales-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = sales.map(sale => `
        <tr>
            <td>${sale['วันที่'] || '-'}</td>
            <td>${sale['ลำดับ'] ? `SALE${String(sale['ลำดับ']).padStart(3, '0')}` : '-'}</td>
            <td>${sale['ชื่อลูกค้า'] || '-'}</td>
            <td>${sale['ชื่อเครื่อง/สินค้า'] || '-'}</td>
            <td>${sale['จำนวน'] || '1'}</td>
            <td>${parseFloat(sale['ยอดรวม'] || 0).toFixed(2)} ฿</td>
            <td>${sale['พนักงานขาย'] || '-'}</td>
            <td><span class="status-badge completed">เสร็จสิ้น</span></td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="openSection('sales','edit',${JSON.stringify(sale).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${sale.id}','sales')">🗑️</button>
            </td>
        </tr>
    `).join('');
}

function updateSalesStats(sales) {
    const revenueElement = document.getElementById('total-revenue');
    const totalSalesElement = document.getElementById('total-sales');
    const avgSaleElement = document.getElementById('avg-sale');
    const topSellerElement = document.getElementById('top-seller');

    if (revenueElement) {
        const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale['ยอดรวม']) || 0), 0);
        revenueElement.textContent = `${totalRevenue.toFixed(2)} ฿`;
    }

    if (totalSalesElement) totalSalesElement.textContent = sales.length;

    if (avgSaleElement) {
        const avgSale = sales.length > 0 ? 
            sales.reduce((sum, sale) => sum + (parseFloat(sale['ยอดรวม']) || 0), 0) / sales.length : 0;
        avgSaleElement.textContent = `${avgSale.toFixed(2)} ฿`;
    }

    if (topSellerElement) {
        const sellerSales = {};
        sales.forEach(sale => {
            const seller = sale['พนักงานขาย'];
            if (seller) {
                sellerSales[seller] = (sellerSales[seller] || 0) + 1;
            }
        });

        const topSeller = Object.entries(sellerSales).sort(([,a], [,b]) => b - a)[0];
        topSellerElement.textContent = topSeller ? topSeller[0] : '-';
    }
}

function updateSalesCharts(sales) {
    // Revenue Chart
    const revenueCtx = document.getElementById('revenueChart')?.getContext('2d');
    if (revenueCtx) {
        new Chart(revenueCtx, {
            type: 'bar',
            data: {
                labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.'],
                datasets: [{
                    label: 'รายได้ (บาท)',
                    data: [150000, 180000, 220000, 190000, 250000, 280000],
                    backgroundColor: '#27ae60'
                }]
            }
        });
    }

    // Product Sales Chart
    const productCtx = document.getElementById('productSalesChart')?.getContext('2d');
    if (productCtx) {
        new Chart(productCtx, {
            type: 'pie',
            data: {
                labels: ['เครื่องมือแพทย์', 'อะไหล่', 'บริการซ่อม', 'อื่นๆ'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#3498db', '#e74c3c', '#f39c12', '#9b59b6']
                }]
            }
        });
    }
}

function updateSalesSidebar(sales) {
    // Today's sales
    const todayCount = document.getElementById('today-count');
    const todaySales = document.getElementById('today-sales');
    const salesTarget = document.getElementById('sales-target');

    if (todayCount) {
        const today = new Date().toISOString().split('T')[0];
        const todayData = sales.filter(sale => sale['วันที่'] === today);
        todayCount.textContent = todayData.length;
    }

    if (todaySales) {
        const today = new Date().toISOString().split('T')[0];
        const todayRevenue = sales.filter(sale => sale['วันที่'] === today)
            .reduce((sum, sale) => sum + (parseFloat(sale['ยอดรวม']) || 0), 0);
        todaySales.textContent = `${todayRevenue.toFixed(2)} ฿`;
    }

    if (salesTarget) {
        salesTarget.textContent = '50000 ฿'; // เป้าหมาย
    }

    // Leaderboard
    const leaderboard = document.getElementById('sales-leaderboard');
    if (leaderboard) {
        const sellerStats = {};
        sales.forEach(sale => {
            const seller = sale['พนักงานขาย'];
            const amount = parseFloat(sale['ยอดรวม']) || 0;
            if (seller) {
                if (!sellerStats[seller]) {
                    sellerStats[seller] = { count: 0, total: 0 };
                }
                sellerStats[seller].count++;
                sellerStats[seller].total += amount;
            }
        });

        const sortedSellers = Object.entries(sellerStats)
            .sort(([,a], [,b]) => b.total - a.total)
            .slice(0, 5);

        leaderboard.innerHTML = sortedSellers.map(([name, stats], index) => `
            <div class="leaderboard-item">
                <span class="rank">${index + 1}</span>
                <span class="seller-name">${name}</span>
                <span class="seller-sales">${stats.total.toFixed(2)} ฿</span>
            </div>
        `).join('');
    }

    // Top products
    const topProducts = document.getElementById('top-products');
    if (topProducts) {
        const productStats = {};
        sales.forEach(sale => {
            const product = sale['ชื่อเครื่อง/สินค้า'];
            const quantity = parseInt(sale['จำนวน']) || 1;
            if (product) {
                productStats[product] = (productStats[product] || 0) + quantity;
            }
        });

        const sortedProducts = Object.entries(productStats)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);

        topProducts.innerHTML = sortedProducts.map(([product, count]) => `
            <div class="product-item">
                <span class="product-name">${product}</span>
                <span class="product-count">${count} ขาย</span>
            </div>
        `).join('');
    }
}

function filterSales() {
    const dateRange = document.getElementById('date-range').value;
    const sellerFilter = document.getElementById('seller-filter').value;
    
    let filteredSales = currentData.sales || [];

    // สามารถเพิ่มการกรองตามวันที่ได้
    if (sellerFilter) {
        filteredSales = filteredSales.filter(sale => 
            sale['พนักงานขาย'] === sellerFilter
        );
    }

    renderSalesTable(filteredSales);
}

function searchSales() {
    const searchTerm = document.getElementById('sales-search').value.toLowerCase();
    const filteredSales = (currentData.sales || []).filter(sale =>
        (sale['ชื่อลูกค้า'] || '').toLowerCase().includes(searchTerm) ||
        (sale['ชื่อเครื่อง/สินค้า'] || '').toLowerCase().includes(searchTerm) ||
        (sale['พนักงานขาย'] || '').toLowerCase().includes(searchTerm)
    );

    renderSalesTable(filteredSales);
}

// Initialize sales page
document.addEventListener('DOMContentLoaded', function() {
    loadSalesData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'sales') {
            loadSalesData();
        }
    };
});
