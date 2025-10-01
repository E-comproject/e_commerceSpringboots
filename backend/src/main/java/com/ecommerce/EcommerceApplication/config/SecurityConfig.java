package com.ecommerce.EcommerceApplication.config;

import com.ecommerce.EcommerceApplication.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfiguration;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // ปิด CSRF เพราะใช้ JWT และเปิด CORS
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            // อนุญาตให้ iframe สำหรับ H2 Console / เครื่องมือ dev
            .headers(h -> h.frameOptions(frame -> frame.disable()))
            // ใช้ JWT แบบไร้สถานะ
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // public health/error
                .requestMatchers("/health", "/error").permitAll()

                // auth/sign-in/sign-up
                .requestMatchers("/auth/**").permitAll()

                // websocket endpoint (จาก Dol_Backend)
                .requestMatchers("/ws-chat/**").permitAll()

                // H2 console (เฉพาะ dev)
                .requestMatchers("/h2-console/**").permitAll()

                // public GET ตัวอย่าง
                .requestMatchers(HttpMethod.GET, "/shops/**").permitAll()

                // ตัวอย่าง role-based
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/seller/**").hasRole("SELLER")
                .requestMatchers(HttpMethod.POST, "/seller/apply").authenticated()

                // ที่เหลือต้อง auth
                .anyRequest().authenticated()
            );

        // ใส่ JWT filter ก่อน UsernamePasswordAuthenticationFilter
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ใช้ AuthenticationManager ของ Spring
    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration cfg) throws Exception {
        return cfg.getAuthenticationManager();
    }

    // CORS ตามที่คุณกำหนดไว้เดิม
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of(
            "http://localhost:3000",
            "http://localhost:5173",
            "http://localhost:4200",
            "http://localhost:8081"
        ));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","PATCH","OPTIONS"));
        c.setAllowedHeaders(List.of("Authorization","Content-Type","X-Requested-With"));
        c.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", c);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
