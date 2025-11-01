let itemCounter = 1;

function addItem() {
    const container = document.getElementById('itemsContainer');
    const newItem = document.createElement('div');
    newItem.className = 'item-section';
    newItem.innerHTML = `
        <div class="form-group">
            <label>รายละเอียดสินค้า:</label>
            <textarea class="item-description" rows="2" style="resize: vertical;"></textarea>
        </div>
        <div class="form-group">
            <label>จำนวน:</label>
            <input type="number" class="item-quantity" value="1" min="1">
        </div>
        <div class="form-group">
            <label>ราคาต่อหน่วย:</label>
            <input type="number" class="item-price" value="0" min="0" step="0.01">
        </div>
        <div class="form-group">
            <label>รวม:</label>
            <input type="number" class="item-total" readonly>
        </div>
        <button type="button" class="remove-btn" onclick="removeItem(this)">🗑️</button>
    `;
    container.appendChild(newItem);
    attachEventListeners(newItem);
    calculateTotals();
}

function removeItem(button) {
    const itemSection = button.closest('.item-section');
    if (document.querySelectorAll('.item-section').length > 1) {
        itemSection.remove();
        calculateTotals();
    } else {
        alert('ต้องมีรายการสินค้าอย่างน้อย 1 รายการ');
    }
}

function attachEventListeners(container = document) {
    const quantityInputs = container.querySelectorAll('.item-quantity');
    const priceInputs = container.querySelectorAll('.item-price');
    const discountInput = document.getElementById('discount');

    quantityInputs.forEach(input => {
        input.addEventListener('input', calculateItemTotal);
    });

    priceInputs.forEach(input => {
        input.addEventListener('input', calculateItemTotal);
    });

    if (discountInput) {
        discountInput.addEventListener('input', calculateTotals);
    }
}

function calculateItemTotal(event) {
    const row = event.target.closest('.item-section'); // ✅ แก้จาก item-row
    const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
    const price = parseFloat(row.querySelector('.item-price').value) || 0;
    const total = quantity * price;
    row.querySelector('.item-total').value = total.toFixed(2);
    calculateTotals();
}

function calculateTotals() {
    const itemTotals = document.querySelectorAll('.item-total');
    let subtotal = 0;

    itemTotals.forEach(input => {
        subtotal += parseFloat(input.value) || 0;
    });

    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const afterDiscount = subtotal - discount;
    const vat = afterDiscount * 0.07;
    const grandTotal = afterDiscount + vat;

    document.getElementById('subtotal').textContent = `฿${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('vat').textContent = `฿${vat.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
    document.getElementById('grandTotal').textContent = `฿${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}`;
}

function convertToThaiText(number) {
    const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const tens = ['', '', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ'];
    const units = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

    if (number === 0) return 'ศูนย์บาทถ้วน';
    if (number < 0) return 'จำนวนเงินไม่ถูกต้อง';

    let result = '';
    let integerPart = Math.floor(number);
    let decimalPart = Math.round((number - integerPart) * 100);

    // Convert integer part
    if (integerPart > 0) {
        result = convertIntegerToThai(integerPart) + 'บาท';
    }

    // Handle decimal part (satang)
    if (decimalPart > 0) {
        result += convertIntegerToThai(decimalPart) + 'สตางค์';
    } else {
        result += 'ถ้วน';
    }

    return result;
}

function convertIntegerToThai(number) {
    if (number === 0) return '';
    
    const ones = ['', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
    const tens = ['', '', 'ยี่สิบ', 'สามสิบ', 'สี่สิบ', 'ห้าสิบ', 'หกสิบ', 'เจ็ดสิบ', 'แปดสิบ', 'เก้าสิบ'];
    
    let result = '';
    let numStr = number.toString();
    let length = numStr.length;
    
    for (let i = 0; i < length; i++) {
        let digit = parseInt(numStr[i]);
        let position = length - i;
        
        if (digit === 0) continue;
        
        if (position === 7) { // ล้าน
            result += ones[digit] + 'ล้าน';
        } else if (position === 6) { // แสน
            result += ones[digit] + 'แสน';
        } else if (position === 5) { // หมื่น
            result += ones[digit] + 'หมื่น';
        } else if (position === 4) { // พัน
            result += ones[digit] + 'พัน';
        } else if (position === 3) { // ร้อย
            result += ones[digit] + 'ร้อย';
        } else if (position === 2) { // สิบ
            if (digit === 1) {
                result += 'สิบ';
            } else if (digit === 2) {
                result += 'ยี่สิบ';
            } else {
                result += ones[digit] + 'สิบ';
            }
        } else if (position === 1) { // หน่วย
            if (length > 1 && digit === 1) {
                result += 'เอ็ด';
            } else {
                result += ones[digit];
            }
        }
    }
    
    return result;
}

function generatePDFContent() {
    const quotationNo = document.getElementById('quotationNo').value;
    const quotationDate = new Date(document.getElementById('quotationDate').value).toLocaleDateString('th-TH');
    const companyName = document.getElementById('companyName').value;
    const companyAddress = document.getElementById('companyAddress').value;
    const customerName = document.getElementById('customerName').value;
    const customerAddress = document.getElementById('customerAddress').value;
    const customerPhone = document.getElementById('customerPhone').value;
    const salesName = document.getElementById('salesName').value;
    const salesPhone = document.getElementById('salesPhone').value;
    const salesEmail = document.getElementById('salesEmail').value;
    const notes = document.getElementById('notes').value;

    // Get items
    const items = document.querySelectorAll('.item-section');
    let itemsHTML = '';
    let itemIndex = 1;

    items.forEach(item => {
        const description = item.querySelector('.item-description').value;
        const quantity = item.querySelector('.item-quantity').value;
        const price = parseFloat(item.querySelector('.item-price').value);
        const total = parseFloat(item.querySelector('.item-total').value);

        itemsHTML += `
            <tr>
                <td style="text-align: center; padding: 10px; border: 1px solid #ccc;">${itemIndex}</td>
                <td style="padding: 10px; border: 1px solid #ccc;">${description}</td>
                <td style="text-align: center; padding: 10px; border: 1px solid #ccc;">${quantity}</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #ccc;">${price.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
                <td style="text-align: right; padding: 10px; border: 1px solid #ccc;">${total.toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            </tr>
        `;
        itemIndex++;
    });

    // Calculate totals
    const subtotal = parseFloat(document.getElementById('subtotal').textContent.replace(/[฿,]/g, '')) || 0;
    const discount = parseFloat(document.getElementById('discount').value) || 0;
    const afterDiscount = subtotal - discount;
    const vat = parseFloat(document.getElementById('vat').textContent.replace(/[฿,]/g, '')) || 0;
    const grandTotal = parseFloat(document.getElementById('grandTotal').textContent.replace(/[฿,]/g, '')) || 0;

    const amountInThai = convertToThaiText(grandTotal);
    const noteLines = notes.split('\n').filter(line => line.trim()).map(line => `<div style="margin-bottom: 5px;">${line}</div>`).join('');

    // Determine PRICE EXCLUDE VAT display
    const priceExcludeVatDisplay = (afterDiscount === 0 || afterDiscount === subtotal) ? '-' : afterDiscount.toLocaleString('th-TH', {minimumFractionDigits: 2});
    const canvas = document.getElementById('signCompany');
    const signatureDataURL = canvas.toDataURL('image/png');
    return `
        <div style="position: relative; min-height: 100vh; padding: 20px;">
            <!-- Logo positioned absolutely in top-left -->
            <div style="position: absolute; top: 5px; left: 20px; z-index: 10;">
                <img src="${logoBase64}" alt="iDMS Logo" style="width: 100px; height: 100px;" />
            </div>

            <!-- Header with proper margin to avoid logo overlap -->
            <div style="text-align: center; margin: 50px 120px;">
                <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">QUOTATION</h1>
                <h2 style="color: #4f46e5; font-size: 20px; margin: 5px 0;">ใบเสนอราคา</h2>
                <div style="font-size: 12px; color: #666; margin-top: 10px;">
                    ${companyName}<br>
                    ${companyAddress}
                </div>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <strong>เรียน:</strong> ${customerName}<br>
                    <strong>ที่อยู่:</strong> ${customerAddress}<br>
                    <strong>โทรศัพท์:</strong> ${customerPhone}
                </div>
                <div style="text-align: right;">
                    <strong>QUOTATION NO:</strong> ${quotationNo}<br>
                    <strong>DATE:</strong> ${quotationDate}
                </div>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                <thead>
                    <tr style="background-color: #f8f9fa;">
                        <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">ลำดับ<br>ITEM</th>
                        <th style="padding: 10px; border: 1px solid #ccc;">รายละเอียด<br>DESCRIPTION</th>
                        <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">จำนวน<br>QUANTITY</th>
                        <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">ราคาต่อหน่วย<br>UNIT PRICE</th>
                        <th style="padding: 10px; border: 1px solid #ccc; text-align: center;">จำนวนเงิน<br>AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>

            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div>
                    <strong>หมายเหตุ:</strong><br>
                    ${noteLines}
                </div>
                <div style="text-align: right; min-width: 200px;">
                    <div style="margin-bottom: 5px;"><strong>SUBTOTAL:</strong> ${subtotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</div>
                    ${discount > 0 ? `<div style="margin-bottom: 5px;"><strong>SPECIAL DISCOUNT:</strong> ${discount.toLocaleString('th-TH', {minimumFractionDigits: 2})}</div>` : ''}
                    <div style="margin-bottom: 5px;"><strong>PRICE EXCLUDE VAT:</strong> ${priceExcludeVatDisplay}</div>
                    <div style="margin-bottom: 5px;"><strong>VAT 7%:</strong> ${vat.toLocaleString('th-TH', {minimumFractionDigits: 2})}</div>
                    <div style="border-top: 2px solid #4f46e5; padding-top: 5px; font-size: 18px; color: #4f46e5;"><strong>TOTAL:</strong> ${grandTotal.toLocaleString('th-TH', {minimumFractionDigits: 2})}</div>
                </div>
            </div>

            <div style="text-align: center; margin-bottom: 30px; font-size: 16px; color: #666;">
                ( ${amountInThai} )
            </div>

            <!-- Signature Section -->
            <div style="display: flex; justify-content: space-between; margin-top: 50px;">
                <!-- Left side - Company representative -->
                <div style="text-align: center; width: 45%;">
                    <div style="margin-bottom: 20px;">ขอแสดงความนับถือ</div>
                    <div style="margin-bottom: 10px;">
                        <img src="${signatureDataURL}" alt="ลายเซ็น" style="max-height: 80px;" />
                    </div>
                    <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto 5px;"></div>
                    <div style="font-size: 14px;">
                        <strong>${salesName}</strong><br>
                        โทร: ${salesPhone}<br>
                        E-mail: ${salesEmail}
                    </div>
                </div>


                <!-- Right side - Customer signature -->
                <div style="text-align: center; width: 45%;">
                    <div style="margin-bottom: 20px;">ลายเซ็นลูกค้า</div>
                    <div style="margin-bottom: 110px;"></div>
                    <div style="border-bottom: 1px solid #000; width: 200px; margin: 0 auto 5px;"></div>
                    <div style="font-size: 14px;">
                        ${customerName}<br>
                        <div style="margin-top: 10px;">
                            วันที่: _________________________________
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function previewPDF() {
    const pdfContent = generatePDFContent();
    document.getElementById('pdfContent').innerHTML = pdfContent;
    document.getElementById('pdfPreview').style.display = 'block';
}

function closePDFPreview() {
    document.getElementById('pdfPreview').style.display = 'none';
}

function downloadPDFFromPreview() {
    generatePDF();
}

function generatePDF() {
    const { jsPDF } = window.jspdf;
    const element = document.getElementById('pdfContent');
    
    if (!element.innerHTML.trim()) {
        // Generate content if preview hasn't been shown
        const pdfContent = generatePDFContent();
        element.innerHTML = pdfContent;
    }

    // Configure html2canvas options
    const options = {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.offsetWidth,
        height: element.offsetHeight
    };

    html2canvas(element, options).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 0;
        
        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        
        // Generate filename
        const quotationNo = document.getElementById('quotationNo').value || 'QUOTE';
        const customerName = document.getElementById('customerName').value || 'Customer';
        const filename = `Quotation_${quotationNo}_${customerName}.pdf`;
        
        pdf.save(filename);
    }).catch(error => {
        console.error('Error generating PDF:', error);
        alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    });
}
// -----------------------------
// ✍️ ฟังก์ชันสำหรับลายเซ็น
// -----------------------------
// -----------------------------
// ✍️ ฟังก์ชันสำหรับลายเซ็น (แก้ไขใหม่)
// -----------------------------
let isDrawing = false;
let ctx = null;

function resizeCanvas() {
    const canvas = document.getElementById('signCompany');
    if (!canvas) return;
    // กำหนดขนาด canvas ตามขนาด element จริง
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

function initSignaturePad() {
    const canvas = document.getElementById('signCompany');
    if (!canvas) return;

    resizeCanvas(); // เรียกครั้งแรกตอน init
    ctx = canvas.getContext('2d');
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Desktop events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Mobile/Touch events (เพิ่ม { passive: false })
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing, { passive: false });
    canvas.addEventListener('touchcancel', stopDrawing, { passive: false });

    // ปรับ canvas ใหม่เมื่อขนาดหน้าจอเปลี่ยน
    window.addEventListener('resize', resizeCanvas);
}

function startDrawing(e) {
    isDrawing = true;
    ctx.beginPath();
    const pos = getPosition(e);
    ctx.moveTo(pos.x, pos.y);
    e.preventDefault();
}

function stopDrawing(e) {
    if (isDrawing) {
        ctx.closePath();
        isDrawing = false;
    }
    e.preventDefault();
}

function draw(e) {
    if (!isDrawing) return;
    const pos = getPosition(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    e.preventDefault();
}

function getPosition(e) {
    const rect = e.target.getBoundingClientRect();
    let x, y;

    if (e.touches && e.touches.length > 0) {
        x = e.touches[0].clientX - rect.left;
        y = e.touches[0].clientY - rect.top;
    } else {
        x = e.clientX - rect.left;
        y = e.clientY - rect.top;
    }
    return { x, y };
}

function clearCanvas(id) {
    const canvas = document.getElementById(id);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// ✅ เรียก initSignaturePad ตอน DOM โหลดเสร็จ
document.addEventListener('DOMContentLoaded', function() {
    attachEventListeners();
    calculateTotals();
    initSignaturePad();

    // Set current date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('quotationDate').value = today;
});
