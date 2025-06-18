const style = document.createElement('style');
style.innerHTML = `
@import url('https://fonts.googleapis.com/css?family=Roboto:300,400&display=swap');
body {
    font-family: 'Roboto', Arial, sans-serif;
    background: #f7f7f9;
    margin: 0;
    padding: 0;
}
form#letterheadForm {
    background: #fff;
    max-width: 400px;
    margin: 40px auto 20px auto;
    padding: 24px 32px 16px 32px;
    border-radius: 10px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.08);
    font-weight: 300;
}
form#letterheadForm label {
    display: block;
    margin-bottom: 14px;
    color: #222;
    font-size: 15px;
    font-weight: 300;
}
form#letterheadForm input[type="text"],
form#letterheadForm input[type="date"],
form#letterheadForm input[type="file"] {
    width: 100%;
    padding: 7px 10px;
    margin-top: 4px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-family: inherit;
    font-size: 15px;
    font-weight: 300;
    background: #fafbfc;
    box-sizing: border-box;
}
button {
    display: block;
    margin: 20px auto 0 auto;
    padding: 10px 28px;
    background: #1976d2;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 16px;
    font-family: inherit;
    font-weight: 400;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(25,118,210,0.08);
    transition: background 0.2s;
}
button:hover {
    background: #125ea8;
}
`;
document.head.appendChild(style);

document.addEventListener("DOMContentLoaded", () => {
    function random8Hex() {
        let hex = '';
        for (let i = 0; i < 8; i++) {
            hex += Math.floor(Math.random() * 16).toString(16);
        }
        return hex.toUpperCase();
    }

    const form = document.createElement("form");
    form.id = "letterheadForm";
    form.innerHTML = `
    <label>Company Name: <input type="text" id="companyName" placeholder="Enter Company Name"></label><br>    
    <label>Manager Name: <input type="text" id="managerName" required></label><br>
    <label>From Date: <input type="date" id="date_1" value="20XX-XX-XX" required></label><br>
    <label>To Date: <input type="date" id="date_2" value="20XX-XX-XX" required></label><br>
    <label>Bank Name: <input type="text" id="bank_name" value="Bank Name" required></label><br>
    <label>Account Number: <input type="text" id="account_number" required></label><br>
    <label>Employee Name: <input type="text" id="employeeName" required></label><br>
    <label>Employee ID: <input type="text" id="employeeId" required></label><br>
    <label>Company Logo: <input type="file" id="companyStamp" accept="image/*"></label><br>
    <label>Signature Image: <input type="file" id="signatureImg" accept="image/*"></label><br>
    `;
    document.body.insertBefore(form, document.body.firstChild);

    // Generate QR code, show in DOM, and call callback with QR image data URL
    function generateQR(employeeId, employeeName, callback) {
        const qrText = document.getElementById("qrText");
        const qrImage = document.getElementById("qrImage");
        const imgBox = document.getElementById("imgBox");
        qrText.value = `ID: ${employeeId}, Name: ${employeeName}`;
        if (qrText.value.length > 0) {
            qrImage.onload = function () {
                imgBox.classList.add("show-img");
                imgBox.style.display = "block";
                if (callback) callback(qrImage.src);
            };
            qrImage.src =
                "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=" +
                encodeURIComponent(qrText.value);
        } else {
            qrText.classList.add("error");
            setTimeout(() => {
                qrText.classList.remove("error");
            }, 1000);
        }
    }

    function generateLetterhead() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        doc.setDrawColor(166, 159, 151);
        doc.setLineWidth(.75);
        doc.rect(7, 7, pageWidth - 21, pageHeight - 21, 'S');

        const managerName = document.getElementById("managerName").value;
        const account_number = document.getElementById("account_number").value;
        if (!account_number) {
            alert("Please enter an account number.");
            return;
        }
        const companyName = document.getElementById("companyName").value || "Company Name";
        const employeeName = document.getElementById("employeeName").value;
        const employeeId = document.getElementById("employeeId").value;
        const companyStampInput = document.getElementById("companyStamp");
        const signatureImgInput = document.getElementById("signatureImg");
        if (!employeeName || !employeeId) {
            alert("Please enter both employee name and ID.");
            return;
        }
        const date_1 = document.getElementById("date_1").value;
        const date_2 = document.getElementById("date_2").value;
        const bank_name = document.getElementById("bank_name").value;

        doc.setFont("helvetica", "normal");
        doc.setFontSize(16);
        const textWidth = doc.getTextWidth(companyName);
        const x = (pageWidth - textWidth) / 2;
        doc.text(`${companyName}`, x, 20);
        doc.setDrawColor(180, 180, 180);
        doc.setLineWidth(0.5);
        doc.line(x, 22, x + textWidth, 22);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        const descY = Math.floor(pageHeight / 3);
        const description =
            `Dear Sir/Madam,\n\n` +
            `I, ${managerName} holding account number ${account_number} in ${bank_name},\n` +
            `hereby allow ${employeeName} to act on my behalf for the purpose of managing my account,\n` +
            `performing transactions, and handling any issues related to my account.\n` +
            `This Authorization will be valid from ${date_1} to ${date_2}.\n` +
            `${employeeName} bearing ID number ${employeeId} is hereby granted \n` +
            `the following privileges for my account:\n\n` +
            `1. Withdrawal and deposit of funds.\n` +
            `2. Check issuance and clearance.\n` +
            `3. Requesting account statement and balance inquiry.\n` +
            `4. Demand Draft can be requested.\n\n` +
            `Kindly provide ${employeeName} with access to all necessary account information and grant permission\n` +
            `to perform the above mentioned transactions during the specified period. Any transactions and requests\n` +
            `made by ${employeeName} within the scope of this authorization \n` +
            `should be treated as legitimate and processed accordingly.\n\n` +
            `Thank you for your cooperation and understanding.`;
        const descriptionLines = doc.splitTextToSize(description, pageWidth - 20);
        doc.text(descriptionLines, 15, descY);

        // --- Generate barcode (bottom left) ---
        const barcodeCanvas = document.createElement("canvas");
        barcodeCanvas.id = "barcode";
        const n1 = random8Hex();
        JsBarcode(barcodeCanvas, n1, {
            format: "CODE128",
            width: 2,
            height: 40,
        });
        const barcodeImage = barcodeCanvas.toDataURL("image/png");

        // --- Generate QR code, show in DOM, and add to PDF ---
        generateQR(employeeId, employeeName, function(qrDataUrl) {
            // Add QR code to PDF (above barcode)
            doc.addImage(qrDataUrl, "PNG", 10, pageHeight - 90, 30, 30);
            doc.addImage(barcodeImage, "PNG", 10, pageHeight - 50, 50, 30);

            // --- Add signature box (bottom right) ---
            const sigBoxWidth = 70;
            const sigBoxHeight = 30;
            const sigBoxX = 110;
            const sigBoxY = pageHeight - 50;

            doc.setDrawColor(100, 100, 100);
            doc.setLineWidth(0.5);
            doc.rect(sigBoxX, sigBoxY, sigBoxWidth, sigBoxHeight);

            doc.setFontSize(10);
            doc.text("Signature", sigBoxX + 5, sigBoxY + 8);
            doc.text(managerName || "Manager Name", sigBoxX + 5, sigBoxY + sigBoxHeight - 5);

            function finishAndSave() {
                if (companyStampInput.files && companyStampInput.files[0]) {
                    const reader = new FileReader();
                    reader.onload = function (e) {
                        doc.addImage(e.target.result, "PNG", 10, 10, 30, 30);
                        doc.save("letterhead.pdf");
                    };
                    reader.readAsDataURL(companyStampInput.files[0]);
                } else {
                    doc.save("letterhead.pdf");
                }
            }
            if (signatureImgInput.files && signatureImgInput.files[0]) {
                const sigReader = new FileReader();
                sigReader.onload = function (e) {
                    doc.addImage(
                        e.target.result,
                        "PNG",
                        sigBoxX + 20,
                        sigBoxY + 10,
                        sigBoxWidth - 30,
                        sigBoxHeight - 18
                    );
                    finishAndSave();
                };
                sigReader.readAsDataURL(signatureImgInput.files[0]);
            } else {
                finishAndSave();
            }
        });
    }

    const button = document.createElement("button");
    button.textContent = "Generate PDF";
    button.type = "button";
    button.addEventListener("click", () => {
        if (document.getElementById("companyName").value === "") {
            alert("Please enter a company name.");
            return;
        }
        generateLetterhead();
    });
    form.appendChild(button);

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        generateLetterhead();
    });
});