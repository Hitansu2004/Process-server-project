package com.processserve.order.controller;

import com.processserve.order.dto.CityResponse;
import com.processserve.order.dto.StateResponse;
import com.processserve.order.service.GeographyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/geography")
@RequiredArgsConstructor
@Slf4j
public class GeographyController {

    private final GeographyService geographyService;

    // Get all states
    @GetMapping("/states")
    public ResponseEntity<List<StateResponse>> getAllStates() {
        log.info("GET /api/geography/states - Fetching all states");
        List<StateResponse> states = geographyService.getAllStates();
        return ResponseEntity.ok(states);
    }

    // Get state by ID
    @GetMapping("/states/{id}")
    public ResponseEntity<StateResponse> getStateById(@PathVariable Integer id) {
        log.info("GET /api/geography/states/{} - Fetching state", id);
        StateResponse state = geographyService.getStateById(id);
        return ResponseEntity.ok(state);
    }

    // Get cities by state ID
    @GetMapping("/states/{stateId}/cities")
    public ResponseEntity<List<CityResponse>> getCitiesByState(@PathVariable Integer stateId) {
        log.info("GET /api/geography/states/{}/cities - Fetching cities for state", stateId);
        List<CityResponse> cities = geographyService.getCitiesByState(stateId);
        return ResponseEntity.ok(cities);
    }

    // Get city by ID (includes zip code)
    @GetMapping("/cities/{id}")
    public ResponseEntity<CityResponse> getCityById(@PathVariable Integer id) {
        log.info("GET /api/geography/cities/{} - Fetching city", id);
        CityResponse city = geographyService.getCityById(id);
        return ResponseEntity.ok(city);
    }

    // Search cities by name
    @GetMapping("/cities/search")
    public ResponseEntity<List<CityResponse>> searchCities(@RequestParam String name) {
        log.info("GET /api/geography/cities/search?name={} - Searching cities", name);
        List<CityResponse> cities = geographyService.searchCitiesByName(name);
        return ResponseEntity.ok(cities);
    }

    // Get cities by zip code
    @GetMapping("/zip/{zipCode}")
    public ResponseEntity<List<CityResponse>> getCitiesByZipCode(@PathVariable String zipCode) {
        log.info("GET /api/geography/zip/{} - Fetching cities by zip", zipCode);
        List<CityResponse> cities = geographyService.getCitiesByZipCode(zipCode);
        return ResponseEntity.ok(cities);
    }

    // Health check
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Geography service is UP");
    }
}
