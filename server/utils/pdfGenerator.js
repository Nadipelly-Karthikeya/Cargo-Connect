const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

exports.generateLoadInvoice = (load, company, lorry) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50 });
      const fileName = `invoice-${load._id}-${Date.now()}.pdf`;
      const filePath = path.join(__dirname, '../uploads', fileName);

      doc.pipe(fs.createWriteStream(filePath));

      // Header
      doc.fillColor('#1e40af')
         .fontSize(28)
         .text('CARGO CONNECT', 50, 50);

      doc.fillColor('#000000')
         .fontSize(10)
         .text('Enterprise Logistics Platform', 50, 85);

      // Invoice Title
      doc.fontSize(20)
         .text('LOAD INVOICE', 400, 50);

      doc.fontSize(10)
         .text(`Invoice #: ${load._id}`, 400, 80)
         .text(`Date: ${new Date(load.createdAt).toLocaleDateString()}`, 400, 95);

      // Horizontal line
      doc.moveTo(50, 120)
         .lineTo(550, 120)
         .stroke();

      // Company Details
      doc.fontSize(12)
         .fillColor('#1e40af')
         .text('BILLED TO:', 50, 140);

      doc.fillColor('#000000')
         .fontSize(10)
         .text(company.companyName, 50, 160)
         .text(`GST: ${company.gstNumber}`, 50, 175)
         .text(`Email: ${company.email || 'N/A'}`, 50, 190)
         .text(`Phone: ${company.phone || 'N/A'}`, 50, 205);

      // Load Details
      doc.fontSize(12)
         .fillColor('#1e40af')
         .text('LOAD DETAILS:', 50, 240);

      doc.fillColor('#000000')
         .fontSize(10)
         .text(`Pickup: ${load.pickupLocation.city}, ${load.pickupLocation.state}`, 50, 260)
         .text(`Drop: ${load.dropLocation.city}, ${load.dropLocation.state}`, 50, 275)
         .text(`Goods Type: ${load.goodsType}`, 50, 290)
         .text(`Weight: ${load.weight} tons`, 50, 305)
         .text(`Distance: ${load.distance} km`, 50, 320)
         .text(`Status: ${load.status}`, 50, 335);

      // Vehicle Details (if assigned)
      if (lorry) {
        doc.fontSize(12)
           .fillColor('#1e40af')
           .text('VEHICLE DETAILS:', 320, 240);

        doc.fillColor('#000000')
           .fontSize(10)
           .text(`Vehicle: ${lorry.vehicleNumber}`, 320, 260)
           .text(`Type: ${lorry.vehicleType}`, 320, 275)
           .text(`Driver: ${lorry.driverName}`, 320, 290)
           .text(`Contact: ${lorry.driverPhone}`, 320, 305);
      }

      // Horizontal line
      doc.moveTo(50, 360)
         .lineTo(550, 360)
         .stroke();

      // Cost Breakdown
      doc.fontSize(12)
         .fillColor('#1e40af')
         .text('COST BREAKDOWN:', 50, 380);

      const baseAmount = load.estimatedCost / 1.18;
      const gst = load.estimatedCost - baseAmount;

      doc.fillColor('#000000')
         .fontSize(10)
         .text('Base Amount:', 50, 410)
         .text(`₹${baseAmount.toFixed(2)}`, 450, 410);

      doc.text('GST (18%):', 50, 430)
         .text(`₹${gst.toFixed(2)}`, 450, 430);

      // Horizontal line
      doc.moveTo(50, 450)
         .lineTo(550, 450)
         .stroke();

      // Total
      doc.fontSize(14)
         .fillColor('#1e40af')
         .text('TOTAL AMOUNT:', 50, 470);

      doc.fontSize(16)
         .text(`₹${load.estimatedCost.toFixed(2)}`, 450, 470);

      // Footer
      doc.fontSize(8)
         .fillColor('#666666')
         .text('This is a system-generated invoice. No signature required.', 50, 700, { align: 'center' })
         .text('For queries, contact: support@cargoconnect.com', 50, 715, { align: 'center' });

      doc.end();

      doc.on('finish', () => {
        resolve(fileName);
      });

      doc.on('error', (err) => {
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
