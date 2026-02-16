// PDF Generator for MAXCOOP Subscription Form - COMPLETE VERSION
// ================================================================
// This file contains complete PDF generation with ALL documents
// Make sure this loads BEFORE maxcoop-form.js

async function generatePDF(data, passportImageData, idDocuments, otherDocuments) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // ========================================
    // CUSTOMIZE COLORS HERE
    // ========================================
    const colors = {
        primaryBlue: [30, 58, 138],        // Dark Blue
        lightBlue: [59, 130, 246],          // Light Blue
        accentGold: [251, 191, 36],         // Gold/Yellow
        primaryRed: [220, 38, 38],          // Red
        darkRed: [185, 28, 28],             // Dark Red
        darkGray: [51, 51, 51],             // Text Gray
        lightGray: [156, 163, 175],         // Light Gray
        white: [255, 255, 255],             // White
        background: [240, 249, 255],         // Light Blue Background
        green: [34, 197, 94]                // Green for checkmarks
    };

    let yPos = 20;

    // ========================================
    // HEADER SECTION (with gradient)
    // ========================================
    
    // Gradient background (simulated with rectangles)
    for (let i = 0; i < 40; i++) {
        const ratio = i / 40;
        const r = colors.primaryBlue[0] + (colors.lightBlue[0] - colors.primaryBlue[0]) * ratio;
        const g = colors.primaryBlue[1] + (colors.lightBlue[1] - colors.primaryBlue[1]) * ratio;
        const b = colors.primaryBlue[2] + (colors.lightBlue[2] - colors.primaryBlue[2]) * ratio;
        doc.setFillColor(r, g, b);
        doc.rect(0, i, 210, 1, 'F');
    }

    // Add decorative border
    doc.setDrawColor(...colors.accentGold);
    doc.setLineWidth(2);
    doc.rect(5, 5, 200, 35, 'S');

    // Company Name
    doc.setFontSize(26);
    doc.setTextColor(...colors.white);
    doc.setFont(undefined, 'bold');
    doc.text('MAXCOOP', 105, 18, { align: 'center' });
    
    // Subtitle
    doc.setFontSize(20);
    doc.text('COOP CITY, ANAMBRA', 105, 28, { align: 'center' });
    
    // Form Title
    doc.setFontSize(14);
    doc.setTextColor(...colors.accentGold);
    doc.text('SUBSCRIPTION FORM', 105, 36, { align: 'center' });

    // Add passport photo if available
    if (passportImageData) {
        try {
            const format = passportImageData.includes('png') ? 'PNG' : 'JPEG';
            doc.addImage(passportImageData, format, 175, 8, 25, 30);
            doc.setDrawColor(...colors.white);
            doc.setLineWidth(0.5);
            doc.rect(175, 8, 25, 30, 'S');
        } catch (error) {
            console.log('Could not add passport photo to PDF');
        }
    }

    yPos = 50;

    // ========================================
    // HELPER FUNCTIONS
    // ========================================
    
    function addSectionHeader(title) {
        // Add some spacing before section
        yPos += 3;
        
        // Check if we need a new page
        if (yPos > 260) {
            doc.addPage();
            yPos = 20;
        }
        
        // Gradient header background
        doc.setFillColor(...colors.primaryRed);
        doc.rect(10, yPos, 190, 12, 'F');
        
        // Add decorative line on left
        doc.setFillColor(...colors.accentGold);
        doc.rect(10, yPos, 3, 12, 'F');
        
        doc.setFontSize(11);
        doc.setTextColor(...colors.white);
        doc.setFont(undefined, 'bold');
        doc.text(title, 18, yPos + 8);
        
        yPos += 17;
        doc.setTextColor(...colors.darkGray);
    }

    function addField(label, value, fullWidth = false) {
        // Check if we need a new page
        if (yPos > 265) {
            doc.addPage();
            yPos = 20;
        }

        // Alternate background for rows
        const rowHeight = fullWidth ? 12 : 7;
        if (Math.floor((yPos - 50) / 7) % 2 === 0) {
            doc.setFillColor(...colors.background);
            doc.rect(10, yPos - 4, 190, rowHeight, 'F');
        }

        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.primaryBlue);
        doc.text(label + ':', 15, yPos);
        
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.darkGray);
        const valueText = String(value || 'N/A');
        
        if (fullWidth) {
            const splitText = doc.splitTextToSize(valueText, 170);
            doc.text(splitText, 15, yPos + 5);
            yPos += 5 + (splitText.length * 5);
        } else {
            // Truncate if too long
            const maxWidth = 110;
            const truncated = doc.splitTextToSize(valueText, maxWidth);
            doc.text(truncated[0], 80, yPos);
            yPos += 7;
        }
    }

    function addCheckmark(isChecked) {
        if (isChecked) {
            return '✓ Yes';
        }
        return 'No';
    }

    function addDocumentImage(docData, docName) {
        yPos += 5;
        
        // Check if we need a new page
        if (yPos > 200) {
            doc.addPage();
            yPos = 20;
        }
        
        // Add document label
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.primaryBlue);
        doc.text(docName + ':', 15, yPos);
        yPos += 7;
        
        try {
            // Add the image
            if (docData.type && docData.type.startsWith('image/')) {
                const format = docData.type.includes('png') ? 'PNG' : 'JPEG';
                doc.addImage(docData.data, format, 15, yPos, 180, 100);
                doc.setDrawColor(...colors.lightGray);
                doc.setLineWidth(1);
                doc.rect(15, yPos, 180, 100, 'S');
                yPos += 108;
            } else if (docData.name) {
                // For PDF files, show filename
                doc.setFont(undefined, 'normal');
                doc.setTextColor(...colors.darkGray);
                doc.setFontSize(9);
                doc.text('📄 PDF Document: ' + docData.name, 15, yPos);
                yPos += 10;
            }
        } catch (error) {
            console.error('Error adding document to PDF:', error);
            doc.setFont(undefined, 'normal');
            doc.setTextColor(...colors.darkRed);
            doc.setFontSize(9);
            doc.text('⚠ Error displaying document', 15, yPos);
            yPos += 10;
        }
    }

    // ========================================
    // SECTION 1: SUBSCRIBER'S DETAILS
    // ========================================
    addSectionHeader('SECTION 1: SUBSCRIBER\'S DETAILS');
    
    addField('Full Name', data.subscriber.fullName);
    addField('Spouse Name', data.subscriber.spouseName);
    addField('Address', data.subscriber.address, true);
    addField('Date of Birth', data.subscriber.dob);
    addField('Gender', data.subscriber.gender);
    addField('Marital Status', data.subscriber.maritalStatus);
    addField('Nationality', data.subscriber.nationality);
    addField('Occupation', data.subscriber.occupation);
    addField('Employer\'s Name', data.subscriber.employerName);
    addField('Nature of Business', data.subscriber.businessNature);
    addField('Years of Employment', data.subscriber.yearsOfEmployment);
    addField('Country of Residence', data.subscriber.countryOfResidence);
    addField('Language Spoken', data.subscriber.languageSpoken);
    addField('Email Address', data.subscriber.email);
    addField('Mobile Number', data.subscriber.mobileNumber);
    addField('Other Income Source', data.subscriber.otherIncome);
    addField('ID Type', data.subscriber.idType);
    addField('Politically Exposed', data.subscriber.pep);
    addField('PEP Category', data.subscriber.pepCategory);

    yPos += 5;

    // ========================================
    // SECTION 2: ID DOCUMENTS
    // ========================================
    
    if (data.subscriber.idType && data.subscriber.idType !== 'N/A') {
        addSectionHeader('SECTION 2: IDENTIFICATION DOCUMENTS');
        
        // Split ID types by comma
        const idTypes = data.subscriber.idType.split(',').map(s => s.trim());
        
        for (let idKey of idTypes) {
            if (idDocuments && idDocuments[idKey] && idDocuments[idKey].data) {
                addDocumentImage(idDocuments[idKey], idKey.replace(/_/g, ' '));
            }
        }
        
        yPos += 5;
    }

    // ========================================
    // OTHER UPLOADED DOCUMENTS
    // ========================================
    
    if (data.otherDocuments.selected && data.otherDocuments.selected !== 'None') {
        addSectionHeader('OTHER UPLOADED DOCUMENTS');
        
        const otherDocTypes = data.otherDocuments.selected.split(',').map(s => s.trim());
        
        for (let docKey of otherDocTypes) {
            if (otherDocuments && otherDocuments[docKey] && otherDocuments[docKey].data) {
                addDocumentImage(otherDocuments[docKey], docKey.replace(/_/g, ' '));
            }
        }
        
        yPos += 5;
    }

    // Salary Range
    if (data.banking.salaryRange && data.banking.salaryRange !== 'N/A') {
        addField('Salary Range', data.banking.salaryRange);
        yPos += 5;
    }

    // ========================================
    // SECTION 3: NEXT OF KIN
    // ========================================
    addSectionHeader('SECTION 3: NEXT OF KIN');
    
    addField('Name', data.nextOfKin.name);
    addField('Phone Number', data.nextOfKin.phone);
    addField('Email Address', data.nextOfKin.email);
    addField('Address', data.nextOfKin.address, true);

    yPos += 5;

    // ========================================
    // SECTION 4: PLOTS AND PAYMENT PLAN
    // ========================================
    addSectionHeader('SECTION 4: PLOTS AND PAYMENT PLAN');
    
    addField('Type of Plot', data.declaration.plotType);
    addField('Number of Plots', data.declaration.numberOfPlots);
    addField('Plot Size', data.declaration.plotSize);
    addField('Corner Piece', data.declaration.cornerPiece);
    addField('Payment Plan', data.declaration.paymentPlan);
    addField('Building Timeline', data.declaration.buildingTimeline);
    addField('Signature', data.declaration.signature);
    addField('Date', data.declaration.date);

    yPos += 5;

    // ========================================
    // SECTION 5: REFERRAL DETAILS
    // ========================================
    if (data.referral.name !== 'N/A') {
        addSectionHeader('SECTION 5: REFERRAL DETAILS');
        addField('Referral Name', data.referral.name);
        addField('Referral Phone', data.referral.phone);
        addField('Referral Email', data.referral.email);
        addField('Referral Date', data.referral.date);
        yPos += 5;
    }

    // ========================================
    // SECTION 6: BANKING DETAILS
    // ========================================
    if (data.banking) {
        addSectionHeader('SECTION 6: SUBSCRIBER\'S BANK DETAILS');
        addField('Account Number', data.banking.accountNumber);
        addField('Account Name', data.banking.accountName);
        addField('Bank Name', data.banking.bankName);
        addField('RC Number', data.banking.rcNumber);
        yPos += 5;
    }

    // ========================================
    // TIPS CONFIRMATION & OFFICE LOCATION
    // ========================================
    addSectionHeader('CONFIRMATIONS');
    addField('Tips Read & Understood', addCheckmark(data.tipsRead));
    addField('Office Location', data.officeLocation.replace(/_/g, ' '));
    yPos += 5;

    // ========================================
    // ACCOUNT PAYMENT DETAILS
    // ========================================
    doc.addPage();
    yPos = 20;

    addSectionHeader('PAYMENT ACCOUNT DETAILS');
    
    doc.setFillColor(254, 243, 199); // Light yellow background
    doc.rect(10, yPos, 190, 60, 'F');
    
    doc.setDrawColor(...colors.accentGold);
    doc.setLineWidth(2);
    doc.rect(10, yPos, 190, 60, 'S');
    
    yPos += 10;
    
    doc.setFontSize(14);
    doc.setTextColor(...colors.primaryRed);
    doc.setFont(undefined, 'bold');
    doc.text('MAX CONSTRUCTION HOUSING COOP', 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(20);
    doc.setTextColor(...colors.primaryBlue);
    doc.text('Account Number: 5402057281', 105, yPos, { align: 'center' });
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(...colors.darkGray);
    doc.text('Bank: POLARIS BANK', 105, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.darkRed);
    doc.text('Office Location Selected: ' + data.officeLocation.replace(/_/g, ' '), 105, yPos, { align: 'center' });
    
    yPos += 20;

    // ========================================
    // OFFICE ADDRESSES
    // ========================================
    addSectionHeader('POINT OF SALE OFFICE LOCATIONS');
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.primaryRed);
    doc.text('🏢 PWAN MAX NNEWI:', 15, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...colors.darkGray);
    const nnewi = doc.splitTextToSize('1ST FLOOR, EDOZIE/EMEKENYA OPP POLARIS BANK, BANK ROAD, NNEWI, ANAMBRA STATE', 180);
    doc.text(nnewi, 15, yPos);
    yPos += nnewi.length * 5 + 5;
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.primaryRed);
    doc.text('🏢 PWAN MAX AWKA OFFICE:', 15, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...colors.darkGray);
    const awka = doc.splitTextToSize('1ST FLOOR, GRACE ANNE FAITH HOUSE BEHIND BANK, UNIZIK/NAWGU ROAD, EXPRESSWAY AWKA, ANAMBRA STATE', 180);
    doc.text(awka, 15, yPos);
    yPos += awka.length * 5 + 5;
    
    doc.setFont(undefined, 'bold');
    doc.setTextColor(...colors.primaryRed);
    doc.text('🏢 PWAN MAX CENTRAL:', 15, yPos);
    yPos += 5;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(...colors.darkGray);
    const central = doc.splitTextToSize('NO 207 UGWUNABANKPA ROAD, BEHIND MAINLAND FILLING STATION, RIVERS JUNCTION, ONITSHA', 180);
    doc.text(central, 15, yPos);
    yPos += central.length * 5 + 10;

    // ========================================
    // SUBSCRIBER'S DECLARATION
    // ========================================
    addSectionHeader('SUBSCRIBER\'S DECLARATION');
    
    doc.setFontSize(9);
    doc.setTextColor(...colors.darkGray);
    const affirmText = `I, ${data.declaration.affirmationName}, hereby affirm that all information provided as a requirement for the purchase of the Coop City, Anambra state, situated at Ozubulu, Anambra state is true and any false or inaccurate information given by me may decline my application.`;
    const splitAffirm = doc.splitTextToSize(affirmText, 180);
    doc.text(splitAffirm, 15, yPos);
    yPos += 5 + (splitAffirm.length * 5);
    
    addField('Terms Agreement', addCheckmark(data.declaration.agreeToTerms));
    yPos += 10;

    // ========================================
    // FAQ SECTION
    // ========================================
    doc.addPage();
    yPos = 20;
    
    // FAQ Header
    doc.setFillColor(...colors.primaryBlue);
    doc.rect(10, yPos, 190, 15, 'F');
    doc.setFontSize(14);
    doc.setTextColor(...colors.white);
    doc.setFont(undefined, 'bold');
    doc.text('SECTION B - TIPS TO NOTE ABOUT MAXCOOP', 105, yPos + 10, { align: 'center' });
    yPos += 22;

    const faqs = [
        {
            q: 'Q1. WHERE IS COOP CITY, ANAMBRA LOCATED?',
            a: 'COOP CITY, ANAMBRA is a prime piece of land situated and lying at Ozubulu, Anambra State. Applicants or their representatives are advised to inspect the site as the company shall not be held liable for claims/issues arising from clients\' failure to inspect the said property before purchase. Free inspections hold Mondays to Saturdays, from 10 a.m., and Sundays on special arrangement.'
        },
        {
            q: 'Q2. WHY SHOULD I BUY COOP CITY, ANAMBRA?',
            a: 'COOP CITY, ANAMBRA enjoys proximity to major commercial investments and landmarks, such as Pentecost University, University Teaching Hospital, Rojenny Stadium and many more guaranteeing high returns on investment.'
        },
        {
            q: 'Q3. WHO ARE THE OWNERS/DEVELOPERS OF COOP CITY, ANAMBRA?',
            a: 'COOP CITY, ANAMBRA is owned and developed by MAX CONSTRUCTION HOUSING COOPERATIVE.'
        },
        {
            q: 'Q4. WHAT TYPE OF TITLE DOES COOP CITY, ANAMBRA HAVE?',
            a: 'Survey and Deed of Assignment. The company has the long-term responsibility to ensure/facilitate further perfection of the estate\'s title subject to subscribers\' payment of title perfection fees to be determined and communicated at a future date.'
        },
        {
            q: 'Q5. ARE THERE ANY ENCUMBRANCES ON THE LAND?',
            a: 'The land is free from every known government acquisition or interests, and adverse claims.'
        },
        {
            q: 'Q6. WHAT IS THE PAYMENT PLAN?',
            a: 'A. Outright payment of ₦2,500,000 only per 464sqm within the first three (3) months, with a minimum deposit of ₦500,000 per plot.\n\nN.B: The Company reserves the right to repudiate, void or defer/transfer processing of transactions that violate the initial deposit threshold or payments that are made after the official announcement of close of sales.\n\nB. 12 months installment payment can be arranged, and attracts additional charges of 20%.\n\nN.B: Non-payment of the monthly installments as at when due shall be treated as a fundamental breach of the contract.'
        },
        {
            q: 'Q7. WHAT IS THE SIZE OF THE PLOT?',
            a: '464SQM'
        },
        {
            q: 'Q8. IS THE ROAD TO THE ESTATE MOTOR-ABLE?',
            a: 'Yes.'
        },
        {
            q: 'Q9. WHAT OTHER PAYMENTS DO I MAKE ASIDE THE PAYMENT FOR THE LAND?',
            a: '• Deed of Assignment: ₦100,000 only per plot\n• Registered Survey Fee: ₦300,000 only per plot\n• Plot Demarcation Fee: ₦100,000 only per plot\n• Development Levy: ₦500,000 only per plot (covers perimeter fencing, gate house, earth road, infrastructure)\n\nN.B: Development fee unpaid within 12 months attracts 2.5% monthly appreciation.'
        },
        {
            q: 'Q10. WHEN DO I MAKE THE OTHER PAYMENTS?',
            a: '(i) Deed of Assignment, provisional Survey and Plot Demarcation payments can be made immediately before physical allocation.\n\n(ii) Development fee can be made either outright or on installments after physical allocation of plot.'
        }
    ];

    // Add first set of FAQs
    faqs.forEach((faq, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        // Question
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.primaryRed);
        const qLines = doc.splitTextToSize(faq.q, 180);
        doc.text(qLines, 15, yPos);
        yPos += qLines.length * 5 + 3;

        // Answer
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.darkGray);
        const aLines = doc.splitTextToSize(faq.a, 180);
        doc.text(aLines, 15, yPos);
        yPos += aLines.length * 5 + 6;
    });

    // Continue with remaining FAQs on new page
    doc.addPage();
    yPos = 20;

    const moreFaqs = [
        {
            q: 'Q11. WHAT DO I GET AFTER THE INITIAL DEPOSIT AND FOR FURTHER INSTALLMENTS?',
            a: 'A letter of acknowledgment of subscription, receipt of payment and/or provisional allocation letter for initial deposit; and installment payment receipts for further installments.'
        },
        {
            q: 'Q12. WHAT DO I GET AFTER COMPLETING PAYMENT FOR THE LAND?',
            a: '(a) Completion Payment Receipt, Allocation Notification Letter, Contract of Sales and Plot Allocation Document\n\n(b) Deed of Assignment & Survey Plan after physical allocation is done. Allocation document would be issued within three (3) months after payment.'
        },
        {
            q: 'Q13. CAN I START CONSTRUCTION OR BUILDING ON THE LAND IMMEDIATELY?',
            a: 'You can start building on the land after physical allocation provided development fee has been paid. Fencing & Gatehouse would be constructed within the first year of introducing the estate.'
        },
        {
            q: 'Q14. IS THERE A TIME LIMIT TO COMMENCE WORK ON MY LAND AFTER ALLOCATION?',
            a: 'Yes. There must be evidence of active possession on your land within six months of physical allocation i.e fencing of plot(s). Where an allocated plot is not fenced within the stipulated timeframe, the company reserves the right to reallocate subscriber to another part of the estate.'
        },
        {
            q: 'Q15. IS THERE ANY RESTRICTION REGARDING THE TYPE OF BUILDING I CAN CONSTRUCT?',
            a: 'Yes. The estate layout is in sections, and you are expected to build in conformity with the required setback, building control and designated plan for that section. Note: Face-me-I-face-you (tenement building) and high-rise houses will not be approved.'
        },
        {
            q: 'Q16. CAN I RE-SELL MY PLOT/PROPERTY?',
            a: 'Yes. Subscribers who have paid for their land in full can re-sell their plot(s). A charge of 10% of the land consideration (covering transfer documentation fee) shall be paid to the company by the buyer.'
        },
        {
            q: 'Q17. CAN I PAY CASH TO YOUR AGENT?',
            a: 'No, cash payments should ONLY be made to Max coop at its designated banks. Otherwise, cheque(s) should be issued in favour of Max Construction and Building Corporation.'
        },
        {
            q: 'Q18. WHAT HAPPENS IF I CANNOT CONTINUE WITH MY PAYMENT? CAN I REQUEST A REFUND?',
            a: 'Yes, you can apply for refund only if you have NOT been allocated your plot(s). You are required to give the company ninety (90) days\' notice to process your request. The refund shall be processed and paid less 40% (administrative fee, logistics, agency fee and others).'
        },
        {
            q: 'Q19. IS MAX CONSTRUCTION AND MAXCOOP AML/CFT COMPLIANT?',
            a: 'Yes'
        }
    ];

    moreFaqs.forEach((faq, index) => {
        if (yPos > 250) {
            doc.addPage();
            yPos = 20;
        }

        // Question
        doc.setFontSize(9);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(...colors.primaryRed);
        const qLines = doc.splitTextToSize(faq.q, 180);
        doc.text(qLines, 15, yPos);
        yPos += qLines.length * 5 + 3;

        // Answer
        doc.setFont(undefined, 'normal');
        doc.setTextColor(...colors.darkGray);
        const aLines = doc.splitTextToSize(faq.a, 180);
        doc.text(aLines, 15, yPos);
        yPos += aLines.length * 5 + 6;
    });

    // ========================================
    // FOOTER WITH DECORATIVE BORDER (on last page)
    // ========================================
    doc.setFillColor(...colors.primaryBlue);
    doc.rect(0, 280, 210, 17, 'F');
    
    doc.setFontSize(8);
    doc.setTextColor(...colors.white);
    doc.text('Submitted on: ' + data.submissionDate, 105, 286, { align: 'center' });
    
    doc.setTextColor(...colors.accentGold);
    doc.setFont(undefined, 'bold');
    doc.text('MAXCOOP ESTATE | For inquiries: maxcoopforms@gmail.com', 105, 292, { align: 'center' });

    // Convert to blob
    return doc.output('blob');
}

// Make function globally available
window.generatePDF = generatePDF;
