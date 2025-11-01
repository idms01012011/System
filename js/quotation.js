// quotation.js
async function loadQuotationData() {
    try {
        showLoading(true);
        const quotations = await loadSheetData('quotation');
        renderQuotationTable(quotations);
        updateQuotationStats(quotations);
        updateQuotationSidebar(quotations);
    } catch (error) {
        console.error('Error loading quotation data:', error);
        showNotification('ไม่สามารถโหลดข้อมูลใบเสนอราคาได้', 'error');
    } finally {
        showLoading(false);
    }
}

function renderQuotationTable(quotations) {
    const tableBody = document.getElementById('quotation-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = quotations.map(quote => `
        <tr>
            <td>${quote['ลำดับ'] ? `QUOTE${String(quote['ลำดับ']).padStart(3, '0')}` : '-'}</td>
            <td>${quote['ชื่อลูกค้า'] || '-'}</td>
            <td>${quote['วันที่'] || '-'}</td>
            <td>${quote['วันที่หมดอายุ'] || '-'}</td>
            <td>${parseFloat(quote['ยอดรวม'] || 0).toFixed(2)} ฿</td>
            <td><span class="status-badge ${getQuotationStatus(quote)}">${getQuotationStatus(quote)}</span></td>
            <td>${quote['พนักงานขาย'] || '-'}</td>
            <td class="action-buttons">
                <button class="btn-edit" onclick="editQuotation(${JSON.stringify(quote).replace(/"/g, '&quot;')})">✏️</button>
                <button class="btn-del" onclick="deleteRow('${quote.id}','quotation')">🗑️</button>
                <button class="btn-pdf" onclick="generateQuotationPDF(${JSON.stringify(quote).replace(/"/g, '&quot;')})">📄</button>
            </td>
        </tr>
    `).join('');
}

function getQuotationStatus(quotation) {
    // สามารถปรับตามฟิลด์ที่เหมาะสมได้
    if (quotation['สถานะ']) return quotation['สถานะ'];
    
    const expiry = new Date(quotation['วันที่หมดอายุ']);
    const today = new Date();
    
    if (isNaN(expiry)) return 'draft';
    if (today > expiry) return 'expired';
    if (quotation['ยอดรวม']) return 'sent';
    
    return 'draft';
}

function updateQuotationStats(quotations) {
    const totalElement = document.getElementById('total-quotations');
    const pendingElement = document.getElementById('pending-quotations');
    const approvedElement = document.getElementById('approved-quotations');
    const totalValueElement = document.getElementById('total-quotation-value');

    if (totalElement) totalElement.textContent = quotations.length;
    
    if (pendingElement) {
        pendingElement.textContent = quotations.filter(quote => 
            getQuotationStatus(quote) === 'pending' || getQuotationStatus(quote) === 'sent'
        ).length;
    }
    
    if (approvedElement) {
        approvedElement.textContent = quotations.filter(quote => 
            getQuotationStatus(quote) === 'approved'
        ).length;
    }
    
    if (totalValueElement) {
        const totalValue = quotations.reduce((sum, quote) => 
            sum + (parseFloat(quote['ยอดรวม']) || 0), 0
        );
        totalValueElement.textContent = `${totalValue.toFixed(2)} ฿`;
    }
}

function updateQuotationSidebar(quotations) {
    // Today's stats
    const todayCreated = document.getElementById('today-created');
    const todaySent = document.getElementById('today-sent');
    const todayApproved = document.getElementById('today-approved');

    if (todayCreated) {
        const today = new Date().toISOString().split('T')[0];
        todayCreated.textContent = quotations.filter(quote => quote['วันที่'] === today).length;
    }

    if (todaySent) {
        const today = new Date().toISOString().split('T')[0];
        todaySent.textContent = quotations.filter(quote => 
            quote['วันที่'] === today && getQuotationStatus(quote) === 'sent'
        ).length;
    }

    if (todayApproved) {
        const today = new Date().toISOString().split('T')[0];
        todayApproved.textContent = quotations.filter(quote => 
            quote['วันที่'] === today && getQuotationStatus(quote) === 'approved'
        ).length;
    }

    // Expiring quotations
    const expiringList = document.getElementById('expiring-quotations');
    if (expiringList) {
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const expiring = quotations.filter(quote => {
            const expiry = new Date(quote['วันที่หมดอายุ']);
            return expiry <= nextWeek && expiry >= today && getQuotationStatus(quote) === 'sent';
        }).slice(0, 5);

        expiringList.innerHTML = expiring.map(quote => `
            <div class="expiring-item">
                <span class="quote-no">${quote['ลำดับ'] ? `QUOTE${String(quote['ลำดับ']).padStart(3, '0')}` : '-'}</span>
                <span class="quote-expiry">${quote['วันที่หมดอายุ']}</span>
            </div>
        `).join('');
    }
}

function createNewQuotation() {
    openSection('quotation', 'add');
}

function editQuotation(quotation) {
    openSection('quotation', 'edit', quotation);
}

function filterQuotations() {
    const statusFilter = document.getElementById('quotation-status').value;
    const periodFilter = document.getElementById('quotation-period').value;
    
    let filteredQuotations = currentData.quotation || [];

    if (statusFilter !== 'all') {
        filteredQuotations = filteredQuotations.filter(quote => 
            getQuotationStatus(quote) === statusFilter
        );
    }

    renderQuotationTable(filteredQuotations);
}

function searchQuotations() {
    const searchTerm = document.getElementById('quotation-search').value.toLowerCase();
    const filteredQuotations = (currentData.quotation || []).filter(quote =>
        (quote['ชื่อลูกค้า'] || '').toLowerCase().includes(searchTerm) ||
        (quote['ลำดับ']?.toString().includes(searchTerm))
    );

    renderQuotationTable(filteredQuotations);
}

function generateQuotationPDF(quotation) {
    // ใช้ฟังก์ชัน PDF generation จาก app.js
    previewPDF(quotation);
}

// Initialize quotation page
document.addEventListener('DOMContentLoaded', function() {
    loadQuotationData();
    window.onDataChanged = function(sheet) {
        if (sheet === 'quotation') {
            loadQuotationData();
        }
    };
});
