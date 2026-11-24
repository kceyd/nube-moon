package com.moonsoon.usuarios;

import com.moonsoon.usuarios.Dtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UsuarioService service;

    public AuthController(UsuarioService service) { this.service = service; }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest r) { return service.login(r); }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioResponse> registro(@Valid @RequestBody RegistroRequest r) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.registrar(r));
    }

    /** Renueva el JWT. Exige un token vigente (regla en SecurityConfig): sin token o vencido -> 401. */
    @PostMapping("/refresh")
    @io.swagger.v3.oas.annotations.security.SecurityRequirement(name = "bearerAuth")
    public AuthResponse refresh(Authentication auth) {
        return service.renovar(auth.getName());
    }
}
