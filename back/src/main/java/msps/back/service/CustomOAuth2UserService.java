package msps.back.service;

import msps.back.auth.CustomOAuth2User;
import msps.back.entity.User;
import msps.back.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class CustomOAuth2UserService extends OidcUserService {

    private final UserRepository userRepository;
    private final String allowedEmailsRaw;

    public CustomOAuth2UserService(
            UserRepository userRepository,
            @Value("${app.auth.allowed-emails}") String allowedEmailsRaw) {
        this.userRepository = userRepository;
        this.allowedEmailsRaw = allowedEmailsRaw;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String email = oidcUser.getEmail();
        Set<String> allowedEmails = Arrays.stream(allowedEmailsRaw.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toSet());

        if (!allowedEmails.contains(email)) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("not_allowed"),
                    "허용되지 않은 계정입니다: " + email
            );
        }

        String googleSub = oidcUser.getSubject();
        User user = userRepository.findByProviderAndProviderId("google", googleSub)
                .orElseGet(() -> userRepository.save(User.builder()
                        .provider("google")
                        .providerId(googleSub)
                        .email(email)
                        .name(oidcUser.getFullName())
                        .build()));

        return new CustomOAuth2User(user.getId(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }
}
