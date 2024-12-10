package com.example.budgettracker.service;

import com.example.budgettracker.model.User;
import com.example.budgettracker.util.JwtUtil;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private final JwtUtil jwtUtil;

    public JwtTokenService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Generate a token for the given user.
     *
     * @param user the user for whom the token is generated
     * @return the JWT token
     */
    public String generateToken(User user) {
        return jwtUtil.generateToken(user);
    }

    /**
     * Extract email from the provided JWT token.
     *
     * @param token the JWT token
     * @return the email extracted from the token
     */
    public String extractEmailFromToken(String token) {
        return jwtUtil.extractEmail(token);
    }

    /**
     * Validate the token against a specific email.
     *
     * @param token the JWT token
     * @param email the email to validate against
     * @return true if the token is valid and the email matches
     */
    public boolean validateToken(String token, String email) {
        return jwtUtil.validateToken(token) && email.equals(extractEmailFromToken(token));
    }

    /**
     * Validate the token against the provided UserDetails.
     *
     * @param token the JWT token
     * @param userDetails the user details to validate against
     * @return true if the token is valid and matches the user details
     */
    public boolean validateTokenWithUser(String token, UserDetails userDetails) {
        return jwtUtil.validateTokenWithUser(token, userDetails);
    }
}
