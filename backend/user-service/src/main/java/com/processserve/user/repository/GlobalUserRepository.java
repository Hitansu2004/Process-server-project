package com.processserve.user.repository;

import com.processserve.user.entity.GlobalUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GlobalUserRepository extends JpaRepository<GlobalUser, String> {
}
