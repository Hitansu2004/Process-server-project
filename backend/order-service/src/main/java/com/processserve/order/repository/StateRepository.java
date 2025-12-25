package com.processserve.order.repository;

import com.processserve.order.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StateRepository extends JpaRepository<State, Integer> {

    Optional<State> findByAbbreviation(String abbreviation);

    @Query("SELECT s FROM State s ORDER BY s.name ASC")
    java.util.List<State> findAllOrderedByName();
}
