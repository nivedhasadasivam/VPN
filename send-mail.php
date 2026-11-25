<?php

if ($_SERVER["REQUEST_METHOD"] == "POST") {

    $to = "support@vpnexues.com";

    $fullname = isset($_POST['fullname']) ? trim(strip_tags($_POST['fullname'])) : '';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $company = isset($_POST['company']) ? trim(strip_tags($_POST['company'])) : '';
    $phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
    $subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : '';
    $message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

    if (empty($fullname) || empty($email) || empty($message)) {
        http_response_code(400);
        echo "error";
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo "error";
        exit;
    }

    $email_subject = "New Contact Form Message: " . $subject;

    $email_body = "
    Name: $fullname

    Email: $email

    Company: $company

    Phone: $phone

    Subject: $subject

    Message:
    $message
    ";

    $headers = "From: noreply@vpnexues.com\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    if(mail($to, $email_subject, $email_body, $headers)){

        echo "success";

    } else {

        http_response_code(500);
        echo "error";

    }

} else {

    http_response_code(403);
    echo "error";

}

?>