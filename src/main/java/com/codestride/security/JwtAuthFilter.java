package com.codestride.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.security.SecurityException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String uri = request.getRequestURI();
        String path = request.getServletPath();
        return isPublicPath(uri) || isPublicPath(path);
    }

    private boolean isPublicPath(String path) {
        if (path == null) {
            return false;
        }
        return path.startsWith("/api/v1/auth/login")
                || path.startsWith("/api/v1/auth/register")
                || path.startsWith("/api/v1/auth/refresh")
                || path.startsWith("/api/v1/auth/logout")
                || path.startsWith("/actuator/health")
                || path.startsWith("/error");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null) {
            log.debug("No Authorization header present for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        if (!authHeader.startsWith("Bearer ")) {
            log.debug("Authorization header does not start with Bearer prefix for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(7).trim();
        if (token.isEmpty()) {
            log.debug("Bearer token is empty after extraction for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtService.parseToken(token);
            if ("refresh".equals(claims.get("tokenType", String.class))) {
                log.debug("Refresh token rejected on access-token protected endpoint");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Refresh token cannot be used as access token\"}");
                return;
            }

            String email = claims.getSubject();
            if (email != null && !email.isBlank()) {
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    String role = claims.get("role", String.class);
                    if (role == null || role.isBlank()) {
                        role = "USER";
                    }
                    String authority = role.startsWith("ROLE_") ? role : "ROLE_" + role;

                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    Collections.singletonList(
                                            new SimpleGrantedAuthority(authority)
                                    )
                            );
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContext context = SecurityContextHolder.createEmptyContext();
                    context.setAuthentication(authentication);
                    SecurityContextHolder.setContext(context);
                    log.debug("Authentication successfully placed in SecurityContext for subject");
                } else {
                    log.debug("SecurityContext already contains authentication; skipping overwrite");
                }
            } else {
                log.debug("JWT claims do not contain a valid subject");
            }

        } catch (ExpiredJwtException ex) {
            log.debug("JWT validation failed: token expired");
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Token has expired\"}");
            return;
        } catch (SecurityException ex) {
            log.debug("JWT validation failed: invalid signature");
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Invalid JWT signature\"}");
            return;
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT validation failed: malformed or invalid token ({})", ex.getClass().getSimpleName());
            SecurityContextHolder.clearContext();
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Invalid or expired JWT token\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
