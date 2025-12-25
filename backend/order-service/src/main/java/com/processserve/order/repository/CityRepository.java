package com.processserve.order.repository;

import com.processserve.order.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {

    @Query("SELECT c FROM City c WHERE c.state.id = :stateId ORDER BY c.name ASC")
    List<City> findByStateIdOrderedByName(@Param("stateId") Integer stateId);

    @Query("SELECT c FROM City c WHERE c.zipCode = :zipCode")
    List<City> findByZipCode(@Param("zipCode") String zipCode);

    @Query("SELECT c FROM City c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')) ORDER BY c.name ASC")
    List<City> searchByName(@Param("name") String name);
}
