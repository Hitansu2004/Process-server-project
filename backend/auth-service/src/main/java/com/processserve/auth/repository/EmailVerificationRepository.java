package com.processserve.auth.repository;

import com.processserve.auth.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
    
    Optional<EmailVerification> findByEmailAndOtpAndIsVerifiedFalse(String email, String otp);
    
    Optional<EmailVerification> findFirstByEmailOrderByCreatedAtDesc(String email);
    
    void deleteByEmail(String email);
}
