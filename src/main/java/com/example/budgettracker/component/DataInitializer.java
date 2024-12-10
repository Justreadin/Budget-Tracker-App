package com.example.budgettracker.component;

import com.example.budgettracker.model.Role;
import com.example.budgettracker.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;


@Component
public class DataInitializer {

    @Autowired
    private RoleRepository roleRepository;

    @PostConstruct
    public void init() {
        // Check and create ROLE_USER if it doesn't exist
        roleRepository.findByName("ROLE_USER").orElseGet(() -> {
            Role userRole = new Role();
            userRole.setName("ROLE_USER");
            return roleRepository.save(userRole);
        });

        // Check and create ROLE_ADMIN if it doesn't exist
        roleRepository.findByName("ROLE_ADMIN").orElseGet(() -> {
            Role adminRole = new Role();
            adminRole.setName("ROLE_ADMIN");
            return roleRepository.save(adminRole);
        });
    }
}
