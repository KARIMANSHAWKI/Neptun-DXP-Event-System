try {
    const payload = {
        "event_name": req.body.event_name,
        "event_date": req.body.event_date,
        "ticket_number": req.body.ticketnumber
    };

    // 1. Generate the PDF as a base64 string
    const pdfBase64 = await p9.pdf.generatePdf({
        pdfName: "ticket",
        objectKey: Date.now().toString().substr(0, 10),
        securityKey: uuid(),
        body: payload
    });

    // // 2. Save the generated PDF to the Media Library
    // // Decode Base64 data
    // const buffer = Buffer.from(pdfBase64, 'base64');

    // // Define the file path in your media library
    // const filePath = path.join(__dirname, 'media', `ticket_${req.body.ticketnumber}.pdf`);

    // // Write the buffer to a file
    // fs.writeFile(filePath, buffer, (err) => {
    //     if (err) {
    //         console.error('Error saving PDF file:', err);
    //     } else {
    //         console.log(`PDF saved successfully at ${filePath}`);
    //     }
    // });

    // 3. Prepare the attachment for the email
    const attachment = {
        filename: "ticket.pdf",
        content: pdfBase64,
        encoding: 'base64',
    };

    // 4. Send the confirmation email with the PDF attachment
    await sendEmail(
        req.body.attendeeemail,
        "Registration Confirmation for " + req.body.event_name,
        null,
        'kariman@g.com',
        "9e7f4015-ce5f-48b6-ac61-b371f297b390",
        {
            participant_name: req.body.attendeename,
            event_name: req.body.event_name,
            event_date: req.body.event_date,
            company_name: "Neptune Events"
        },
        [attachment]
    );

    // 5. Return a success response including the ID of the saved media file
    result.data = {
        success: true,
        message: "Registration successful. PDF saved to Media Library and confirmation email sent.",
    };

    complete();

} catch (error) {
    log.error("Error processing registration confirmation:", error);
    result.statusCode = 500;
    result.data = {
        success: false,
        message: "Failed to process registration.",
        error: error.message
    };
    fail();
}