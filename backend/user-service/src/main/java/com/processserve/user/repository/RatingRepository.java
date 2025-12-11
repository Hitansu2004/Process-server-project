package com.processserve.user.repository;

import com.processserve.user.entity.Rating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RatingRepository extends JpaRepository<Rating, String> {

    List<Rating> findByProcessServerId(String processServerId);

    List<Rating> findByCustomerId(String customerId);
}
