package com.processserve.auth.repository;

import com.processserve.auth.entity.GlobalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GlobalUserRepository extends JpaRepository<GlobalUser, String> {

    Optional<GlobalUser> findByEmail(String email);

    boolean existsByEmail(String email);
}
