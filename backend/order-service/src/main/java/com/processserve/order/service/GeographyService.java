package com.processserve.order.service;

import com.processserve.order.dto.CityResponse;
import com.processserve.order.dto.StateResponse;
import com.processserve.order.entity.City;
import com.processserve.order.entity.State;
import com.processserve.order.repository.CityRepository;
import com.processserve.order.repository.StateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class GeographyService {

    private final StateRepository stateRepository;
    private final CityRepository cityRepository;

    // Get all states
    public List<StateResponse> getAllStates() {
        log.info("Fetching all USA states");
        return stateRepository.findAllOrderedByName().stream()
                .map(this::convertToStateResponse)
                .collect(Collectors.toList());
    }

    // Get state by ID
    public StateResponse getStateById(Integer id) {
        log.info("Fetching state with ID: {}", id);
        State state = stateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("State not found with ID: " + id));
        return convertToStateResponse(state);
    }

    // Get cities by state ID
    public List<CityResponse> getCitiesByState(Integer stateId) {
        log.info("Fetching cities for state ID: {}", stateId);
        // Verify state exists
        stateRepository.findById(stateId)
                .orElseThrow(() -> new RuntimeException("State not found with ID: " + stateId));

        return cityRepository.findByStateIdOrderedByName(stateId).stream()
                .map(this::convertToCityResponse)
                .collect(Collectors.toList());
    }

    // Get city by ID (includes zip code)
    public CityResponse getCityById(Integer id) {
        log.info("Fetching city with ID: {}", id);
        City city = cityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("City not found with ID: " + id));
        return convertToCityResponse(city);
    }

    // Search cities by name
    public List<CityResponse> searchCitiesByName(String name) {
        log.info("Searching cities by name: {}", name);
        return cityRepository.searchByName(name).stream()
                .map(this::convertToCityResponse)
                .collect(Collectors.toList());
    }

    // Get cities by zip code
    public List<CityResponse> getCitiesByZipCode(String zipCode) {
        log.info("Fetching cities with zip code: {}", zipCode);
        return cityRepository.findByZipCode(zipCode).stream()
                .map(this::convertToCityResponse)
                .collect(Collectors.toList());
    }

    // Helper: Convert State entity to StateResponse
    private StateResponse convertToStateResponse(State state) {
        StateResponse response = new StateResponse();
        response.setId(state.getId());
        response.setName(state.getName());
        response.setAbbreviation(state.getAbbreviation());
        return response;
    }

    // Helper: Convert City entity to CityResponse
    private CityResponse convertToCityResponse(City city) {
        CityResponse response = new CityResponse();
        response.setId(city.getId());
        response.setName(city.getName());
        response.setZipCode(city.getZipCode());
        response.setCounty(city.getCounty());
        response.setLatitude(city.getLatitude());
        response.setLongitude(city.getLongitude());

        // Include state information
        if (city.getState() != null) {
            response.setStateId(city.getState().getId());
            response.setStateName(city.getState().getName());
            response.setStateAbbreviation(city.getState().getAbbreviation());
        }

        return response;
    }
}
