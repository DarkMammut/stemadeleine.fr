package com.stemadeleine.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String requestURI = request.getRequestURI();
        logger.debug("[JWT FILTER] Request URI: {}", requestURI);

        if (requestURI.startsWith("/api/auth/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String jwt = null;

        // D'abord essayer de récupérer le token depuis les cookies
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("authToken".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                    logger.debug("[JWT FILTER] Token trouvé dans le cookie authToken");
                    break;
                }
            }
        }

        // Fallback: essayer l'header Authorization pour la compatibilité
        if (jwt == null) {
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                jwt = authHeader.substring(7);
                logger.debug("[JWT FILTER] Token trouvé dans Authorization header");
            }
        }

        if (jwt != null && jwtUtil.validateToken(jwt)) {
            String username = jwtUtil.extractUsername(jwt);
            logger.debug("[JWT FILTER] Username extrait du token: {}", username);

            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                var userDetails = userDetailsService.loadUserByUsername(username);
                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("[JWT FILTER] Authentication configurée pour l'utilisateur: {}", username);
            }

        } else {
            logger.warn("[JWT FILTER] Aucun token valide trouvé pour cette requête");
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Token invalide ou absent");
            return;
        }

        filterChain.doFilter(request, response);
    }
}