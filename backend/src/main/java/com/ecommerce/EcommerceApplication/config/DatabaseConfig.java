package com.ecommerce.EcommerceApplication.config;

import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URISyntaxException;

@Configuration
@Profile("prod")
public class DatabaseConfig {

    @Bean
    public DataSource dataSource() {
        String databaseUrl = System.getenv("DATABASE_URL");
        
        if (databaseUrl != null && !databaseUrl.isEmpty()) {
            try {
                // Parse DATABASE_URL from Render format: postgres://user:password@host:port/database
                URI dbUri = new URI(databaseUrl);
                
                String username = dbUri.getUserInfo().split(":")[0];
                String password = dbUri.getUserInfo().split(":")[1];
                String dbUrl = "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();
                
                // Add SSL parameters if needed
                if (!dbUrl.contains("?")) {
                    dbUrl += "?sslmode=require";
                }
                
                return DataSourceBuilder.create()
                        .url(dbUrl)
                        .username(username)
                        .password(password)
                        .driverClassName("org.postgresql.Driver")
                        .build();
            } catch (URISyntaxException e) {
                throw new RuntimeException("Invalid DATABASE_URL format", e);
            }
        }
        
        // Fallback to default configuration
        return DataSourceBuilder.create()
                .url(System.getenv("SPRING_DATASOURCE_URL") != null ? 
                    System.getenv("SPRING_DATASOURCE_URL") : 
                    "jdbc:postgresql://localhost:5432/ecommerce_prod")
                .username(System.getenv("DATABASE_USER") != null ? 
                    System.getenv("DATABASE_USER") : "postgres")
                .password(System.getenv("DATABASE_PASSWORD") != null ? 
                    System.getenv("DATABASE_PASSWORD") : "password")
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}
