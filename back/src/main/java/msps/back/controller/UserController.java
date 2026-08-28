package msps.back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.request.UserSignupRequest;
import msps.back.dto.response.UserSignupResponse;
import msps.back.entity.User;
import msps.back.repository.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    @PostMapping("/signup")
    public UserSignupResponse UserSignup(
            @AuthenticationPrincipal User user,
            UserSignupRequest dto) {
        user.completeSignup(dto.name());
        userRepository.save(user);

        return new UserSignupResponse(user.getId());
    }
}
