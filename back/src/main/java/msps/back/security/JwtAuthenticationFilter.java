package msps.back.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import msps.back.entity.User;
import msps.back.repository.UserRepository;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

/**
 * Authorization: Bearer <token> 헤더를 읽어서 SecurityContext에 인증 정보를 채운다.
 *
 * 토큰이 없거나 유효하지 않아도 여기서 요청을 막지 않고 그냥 인증 안 된 채로 다음
 * 필터로 넘긴다 - 실제 차단은 SecurityConfig의 authorizeHttpRequests(anyRequest().authenticated())
 * 가 담당하고, 그때 401이 내려간다. (/oauth2/**, /login/** 처럼 인증이 필요 없는 경로도 있어서
 * 이 필터 단계에서 강제로 막으면 안 됨)
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring("Bearer ".length());
            Long userId = jwtService.parseUserId(token);

            if (userId != null) {
                Optional<User> user = userRepository.findById(userId);
                user.ifPresent(u -> {
                    var authentication = new UsernamePasswordAuthenticationToken(u, null, List.of());
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                });
            }
        }

        filterChain.doFilter(request, response);
    }
}
