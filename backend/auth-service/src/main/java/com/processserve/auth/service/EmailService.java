package com.processserve.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    public void sendOtpEmail(String toEmail, String otp, String userName) {
        try {
            log.info("=== OTP EMAIL DEBUG ===");
            log.info("To: {}", toEmail);
            log.info("OTP: {}", otp);
            log.info("Username: {}", userName);
            log.info("=====================");
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hitansu0007@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("ProcessServe - Email Verification OTP");

            String htmlContent = buildOtpEmailTemplate(otp, userName);
            helper.setText(htmlContent, false);

            mailSender.send(message);
            log.info("OTP email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send OTP email to: {}", toEmail, e);
            log.info("OTP for {} (not sent via email): {}", toEmail, otp);
            // Don't throw exception - allow registration to continue
        }
    }

    public void sendWelcomeEmail(String toEmail, String userName) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("hitansu0007@gmail.com");
            helper.setTo(toEmail);
            helper.setSubject("Welcome to ProcessServe Platform!");

            String htmlContent = buildWelcomeEmailTemplate(userName);
            helper.setText(htmlContent, false);

            mailSender.send(message);
            log.info("Welcome email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send welcome email to: {}", toEmail, e);
        }
    }

    private String buildOtpEmailTemplate(String otp, String userName) {
        return "ProcessServe Platform - Email Verification\n\n" +
                "Hello " + userName + "!\n\n" +
                "Thank you for registering with ProcessServe. To complete your registration, please verify your email address using the OTP below:\n\n" +
                "Your verification code: " + otp + "\n\n" +
                "Valid for 10 minutes\n\n" +
                "WARNING - Security Notice: Never share this OTP with anyone. ProcessServe will never ask for your OTP via phone or email.\n\n" +
                "If you didn't request this verification, please ignore this email.\n\n" +
                "Best regards,\n" +
                "ProcessServe Team\n\n" +
                "(c) 2025 ProcessServe Platform. All rights reserved.";
    }

    private String buildWelcomeEmailTemplate(String userName) {
        return "Welcome to ProcessServe!\n\n" +
                "Hello " + userName + "!\n\n" +
                "Congratulations! Your email has been successfully verified and your account is now active.\n\n" +
                "You can now enjoy all the features of ProcessServe:\n\n" +
                "[+] Manage Orders - Create and track process service orders\n" +
                "[+] Process Server Network - Connect with verified process servers\n" +
                "[+] Real-time Tracking - Monitor delivery status in real-time\n" +
                "[+] Secure Platform - Your data is protected with enterprise-grade security\n\n" +
                "Ready to get started? Log in to your account and explore!\n\n" +
                "If you have any questions, feel free to reach out to our support team.\n\n" +
                "Best regards,\n" +
                "ProcessServe Team\n\n" +
                "(c) 2025 ProcessServe Platform. All rights reserved.";
    }
}
