package msps.back.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import msps.back.dto.request.MarkVersionSeenRequest;
import msps.back.dto.request.UserSignupRequest;
import msps.back.dto.response.UserSignupResponse;
import msps.back.entity.User;
import msps.back.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/user")
public class UserController {

    private final UserRepository userRepository;

    @Value("${app.version}")
    private String appVersion;

    @PostMapping("/signup")
    public UserSignupResponse UserSignup(
            @AuthenticationPrincipal User user,
            @RequestBody UserSignupRequest dto) {
        user.completeSignup(dto.name());
        // 방금 가입한 사람한테는 가입 시점의 버전을 "이미 본 것"으로 처리해서,
        // 로그인하자마자 업데이트 배너가 뜨지 않게 한다.
        user.setLastSeenVersion(appVersion);
        userRepository.save(user);

        return new UserSignupResponse(user.getId());
    }

    @PostMapping("/version")
    public void markVersionSeen(
            @AuthenticationPrincipal User user,
            @RequestBody MarkVersionSeenRequest dto) {
        user.setLastSeenVersion(dto.version());
        userRepository.save(user);
    }
}
