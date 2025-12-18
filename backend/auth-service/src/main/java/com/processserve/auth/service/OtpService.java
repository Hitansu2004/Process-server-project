package com.processserve.auth.service;

import com.processserve.auth.entity.EmailVerification;
import com.processserve.auth.repository.EmailVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailVerificationRepository emailVerificationRepository;
    private final EmailService emailService;

    @Transactional
    public void sendOtp(String email, String firstName, String lastName) {
        // Generate 6-digit OTP
        String otp = generateOtp();
        
        // Delete any existing OTPs for this email
        emailVerificationRepository.deleteByEmail(email);
        
        // Create new verification record
        EmailVerification verification = new EmailVerification();
        verification.setEmail(email);
        verification.setOtp(otp);
        verification.setIsVerified(false);
        
        emailVerificationRepository.save(verification);
        
        // Send OTP email
        String userName = firstName + " " + lastName;
        emailService.sendOtpEmail(email, otp, userName);
        
        log.info("OTP sent to email: {}", email);
    }

    @Transactional
    public boolean verifyOtp(String email, String otp) {
        var verificationOpt = emailVerificationRepository
                .findByEmailAndOtpAndIsVerifiedFalse(email, otp);
        
        if (verificationOpt.isEmpty()) {
            log.warn("Invalid OTP attempt for email: {}", email);
            return false;
        }
        
        EmailVerification verification = verificationOpt.get();
        
        // Check if OTP is expired
        if (verification.getExpiresAt().isBefore(LocalDateTime.now())) {
            log.warn("Expired OTP attempt for email: {}", email);
            return false;
        }
        
        // Mark as verified
        verification.setIsVerified(true);
        emailVerificationRepository.save(verification);
        
        log.info("OTP verified successfully for email: {}", email);
        return true;
    }

    public boolean isEmailVerified(String email) {
        var verificationOpt = emailVerificationRepository
                .findFirstByEmailOrderByCreatedAtDesc(email);
        
        return verificationOpt.isPresent() && verificationOpt.get().getIsVerified();
    }

    private String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000); // 6-digit OTP
        return String.valueOf(otp);
    }
}
