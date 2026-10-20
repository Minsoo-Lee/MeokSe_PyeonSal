package msps.back.service;

import lombok.RequiredArgsConstructor;
import msps.back.dto.response.CommentGetResponse;
import msps.back.dto.response.CommentSaveResponse;
import msps.back.entity.Comment;
import msps.back.repository.CommentRepository;
import msps.back.repository.MenuRepository;
import msps.back.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final MenuRepository menuRepository;

    public CommentGetResponse getComment(Long userId, Long menuId) {
        String content = commentRepository.findContentByUserIdAndMenuId(userId, menuId);
        return new CommentGetResponse(content);
    }

    @Transactional
    public CommentSaveResponse updateComment(Long userId, Long menuId, String content) {
        String trimmedContent = content.trim();
        commentRepository.findByUserIdAndMenuId(userId, menuId).ifPresentOrElse(
                comment -> comment.updateContent(content),
                () -> commentRepository.save(new Comment(
                        userRepository.getReferenceById(userId),
                        menuRepository.getReferenceById(menuId),
                        trimmedContent
                ))
        );
        return new CommentSaveResponse(content);
    }

    @Transactional
    public void deleteComment(Long userId, Long menuId) {
        commentRepository.findByUserIdAndMenuId(userId, menuId).ifPresent(
                commentRepository::delete
        );
    }
}
