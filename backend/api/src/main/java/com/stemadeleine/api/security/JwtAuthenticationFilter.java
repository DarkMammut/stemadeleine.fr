package com.stemadeleine.api.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
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
        String method = request.getMethod();
        logger.debug("[JWT FILTER] Request URI: {} Method: {}", requestURI, method);

        // Ignorer complètement les endpoints publics
        if (requestURI.startsWith("/api/auth/") ||
                requestURI.startsWith("/api/public/")) {
            logger.debug("[JWT FILTER] Endpoint public détecté, pas de vérification JWT");
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

        // If a non-anonymous authentication is already present (e.g. @WithMockUser in tests), skip JWT check
        var existingAuth = SecurityContextHolder.getContext().getAuthentication();
        if (existingAuth != null && existingAuth.isAuthenticated() && !(existingAuth instanceof AnonymousAuthenticationToken)) {
            logger.debug("[JWT FILTER] Existing non-anonymous authentication present, skip JWT validation");
            filterChain.doFilter(request, response);
            return;
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

                // Vérifier que le compte est actif / non locké / non expiré
                if (!userDetails.isAccountNonExpired() || !userDetails.isAccountNonLocked() || !userDetails.isEnabled()) {
                    logger.warn("[JWT FILTER] Compte inactif/locké/expiré pour l'utilisateur: {} - refuser l'authentication via JWT", username);
                    response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Account disabled or locked");
                    return;
                }

                var authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                );
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.info("[JWT FILTER] Authentication configurée pour l'utilisateur: {}", username);
            }

        } else {
            // Invalid or missing JWT — do not send an error here. Let Spring Security handle authentication enforcement
            if (jwt == null) {
                logger.debug("[JWT FILTER] Aucun token fourni pour cette requête (will proceed without JWT)");
            } else {
                logger.warn("[JWT FILTER] Token fourni non valide (will proceed without JWT): {}", jwt);
            }
        }

        // Continue filter chain; Spring Security will enforce authentication/authorization as configured
        filterChain.doFilter(request, response);
    }
}