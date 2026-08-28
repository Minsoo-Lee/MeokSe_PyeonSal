package msps.back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.response.AuthResponse;
import msps.back.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/auth/me")
public class AuthController {

    @GetMapping
    public AuthResponse auth(@AuthenticationPrincipal User user) {
        return new AuthResponse(user.getEmail(), user.getName(), user.isNicknameSet());
    }
}
