/*Created By Md Mustakim Sarkar on 05/12/2022 for generating pdf using template */
/*Modified to use PDFKit - pure JavaScript, no Chromium/Puppeteer needed */
const PDFDocument = require('pdfkit');
const { Readable } = require("stream");
const cheerio = require('cheerio'); // For parsing HTML

module.exports = {
    /*Created By Md Mustakim Sarkar on 19/12/2022 , this function takes html template, returns a pdf stream data */
    generatePDFStream: async (html, orientation = "portrait") => {
        try {
            // Parse HTML to extract data
            const $ = cheerio.load(html);

            // Create a new PDF document
            const doc = new PDFDocument({
                size: 'A4',
                layout: orientation === 'landscape' ? 'landscape' : 'portrait',
                margins: {
                    top: 50,
                    bottom: 50,
                    left: 50,
                    right: 50
                }
            });

            // Create a stream to collect PDF data
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));

            // Header - Company Logo/Name
            doc.fontSize(20).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
            doc.moveDown(0.5);

            const logoText = $('.title').first().text() || 'Ralba Technologies';
            doc.fontSize(14).font('Helvetica').text(logoText, { align: 'center' });
            doc.moveDown(1);

            // Extract user name and transaction ID - safer approach without :contains()
            let userName = 'Customer';
            let transactionId = 'N/A';

            $('p').each((i, elem) => {
                const text = $(elem).text();
                if (text.startsWith('Hi ') && text.includes(',')) {
                    userName = text.replace('Hi ', '').replace(',', '').trim();
                }
                if (text.includes('Transaction ID')) {
                    const match = text.match(/Transaction ID\s*:\s*([^,]+)/);
                    if (match) transactionId = match[1].trim();
                }
            });

            doc.fontSize(11).font('Helvetica').text(`Hi ${userName},`, { align: 'left' });
            doc.fontSize(10).text('Your order has been successfully placed.', { align: 'left' });
            if (transactionId !== 'N/A' && transactionId !== '0') {
                doc.text(`Transaction ID: ${transactionId}`, { align: 'left' });
            }
            doc.moveDown(1);

            // Shipping Address and Store Details (side by side)
            const leftColumn = doc.x;
            const rightColumn = doc.page.width / 2 + 20;
            const currentY = doc.y;

            // Shipping Address (left) - safer extraction
            doc.fontSize(11).font('Helvetica-Bold').text('Shipping Address:', leftColumn, currentY);
            doc.fontSize(9).font('Helvetica');

            $('h5').each((i, elem) => {
                const headingText = $(elem).text();
                if (headingText.includes('Your Shipping Address')) {
                    const addressPara = $(elem).parent().find('p').first();
                    const addressHTML = addressPara.html() || '';
                    const addressLines = addressHTML.split('<br>').map(line =>
                        $('<div>').html(line).text().trim()
                    ).filter(line => line.length > 0);

                    addressLines.forEach(line => {
                        doc.text(line, leftColumn, doc.y, { width: 200 });
                    });
                }
            });

            // Store Details (right) - safer extraction
            const storeY = currentY;
            doc.fontSize(11).font('Helvetica-Bold').text('Store Details:', rightColumn, storeY);
            doc.fontSize(9).font('Helvetica');

            $('h5').each((i, elem) => {
                const headingText = $(elem).text();
                if (headingText.includes('Store Details')) {
                    const storePara = $(elem).parent().find('p').first();
                    const storeHTML = storePara.html() || '';
                    const storeLines = storeHTML.split('<br>').map(line =>
                        $('<div>').html(line).text().trim()
                    ).filter(line => line.length > 0);

                    storeLines.forEach(line => {
                        doc.text(line, rightColumn, doc.y, { width: 200 });
                    });
                }
            });

            doc.moveDown(6);

            // Products Table Header
            const tableTop = doc.y;
            doc.fontSize(10).font('Helvetica-Bold');
            doc.text('PRODUCT', 50, tableTop, { width: 150 });
            doc.text('NAME', 200, tableTop, { width: 150 });
            doc.text('QTY', 350, tableTop, { width: 80, align: 'center' });
            doc.text('PRICE', 430, tableTop, { width: 100, align: 'right' });

            doc.moveTo(50, tableTop + 15).lineTo(530, tableTop + 15).stroke();
            doc.moveDown(0.5);

            // Products - safer extraction without :contains()
            doc.fontSize(9).font('Helvetica');
            $('table.order-detail tr').each((i, row) => {
                if (i === 0) return; // Skip header

                const $row = $(row);
                const productName = $row.find('h5').first().text().trim();

                // Extract quantity - safer approach
                let qty = '';
                $row.find('h5').each((j, h5) => {
                    const h5Text = $(h5).text();
                    if (h5Text.includes('QTY:')) {
                        qty = h5Text.replace('QTY:', '').trim();
                    } else if (h5Text.includes('Left Eye')) {
                        qty = h5Text.trim();
                    }
                });

                const price = $row.find('h5 b').text().trim();

                if (productName && !productName.includes('Subtotal') && price) {
                    const y = doc.y;
                    doc.text(productName, 50, y, { width: 140 });
                    doc.text(qty, 350, y, { width: 80, align: 'center' });
                    doc.text(price, 430, y, { width: 100, align: 'right' });
                    doc.moveDown(0.8);
                }
            });

            doc.moveDown(0.5);
            doc.moveTo(50, doc.y).lineTo(530, doc.y).stroke();
            doc.moveDown(0.5);

            // Totals - safer extraction without :contains()
            doc.fontSize(10).font('Helvetica');
            let subtotal = '$0.00', tax = '$0.00', shipping = '$0.00', total = '$0.00', discount = '$0.00';

            $('tr.pad-left-right-space').each((i, row) => {
                const $row = $(row);
                const label = $row.find('p').text().toLowerCase();
                const value = $row.find('b').text().trim();

                if (label.includes('subtotal')) subtotal = value;
                else if (label.includes('tax')) tax = value;
                else if (label.includes('discount')) discount = value;
                else if (label.includes('shipping')) shipping = value;
                else if (label.includes('total') && !label.includes('subtotal')) total = value;
            });

            // doc.text('Subtotal:', 350, doc.y);
            // doc.text(subtotal, 430, doc.y, { width: 100, align: 'right' });
            // doc.moveDown(0.5);

            // doc.text('TAX:', 350, doc.y);
            // doc.text(tax, 430, doc.y, { width: 100, align: 'right' });
            // doc.moveDown(0.5);

            // doc.text('Shipping:', 350, doc.y);
            // doc.text(shipping, 430, doc.y, { width: 100, align: 'right' });
            // doc.moveDown(0.5);

            // doc.fontSize(11).font('Helvetica-Bold');
            // doc.text('Total:', 350, doc.y);
            // doc.text(total, 430, doc.y, { width: 100, align: 'right' });


            const labelX = 350;
            const valueX = 430;
            const rowGap = 12;

            // Subtotal
            let y = doc.y;
            doc.text('Subtotal:', labelX, y);
            doc.text(subtotal, valueX, y, { width: 100, align: 'right' });

            // Discount
            y += rowGap;
            doc.text('Discount:', labelX, y);
            doc.text(discount, valueX, y, { width: 100, align: 'right', color: 'green' });

            // Tax
            y += rowGap;
            doc.text('TAX:', labelX, y);
            doc.text(tax, valueX, y, { width: 100, align: 'right' });

            // Shipping
            y += rowGap;
            doc.text('Shipping:', labelX, y);
            doc.text(shipping, valueX, y, { width: 100, align: 'right' });

            // Total (bold)
            y += rowGap;
            doc.fontSize(11).font('Helvetica-Bold');
            doc.text('Total:', labelX, y);
            doc.text(total, valueX, y, { width: 100, align: 'right' });

            // Move cursor below totals
            doc.y = y + rowGap;


            // Footer
            doc.fontSize(8).font('Helvetica').text(
                'Copyright © 2025 Ralba Technologies. All rights reserved.',
                50,
                doc.page.height - 50,
                { align: 'center', width: doc.page.width - 100 }
            );

            // Finalize the PDF
            doc.end();

            // Wait for the PDF to be fully generated
            return new Promise((resolve, reject) => {
                doc.on('end', () => {
                    const pdfBuffer = Buffer.concat(chunks);
                    const stream = new Readable();
                    stream.push(pdfBuffer);
                    stream.push(null);
                    resolve(stream);
                });
                doc.on('error', reject);
            });

        } catch (error) {
            console.error("Error generating PDF with PDFKit:", error);
            throw error;
        }
    }
}
