package msps.back.service;

import lombok.RequiredArgsConstructor;
import msps.back.dto.response.CommentGetResponse;
import msps.back.dto.response.CommentSaveResponse;
import msps.back.entity.Comment;
import msps.back.entity.Menu;
import msps.back.entity.User;
import msps.back.repository.CommentRepository;
import msps.back.repository.MenuRepository;
import msps.back.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
        User userReference = userRepository.getReferenceById(userId);
        Menu menuReference = menuRepository.getReferenceById(menuId);
        List<Comment> commentList = commentRepository.findCommentByUserAndMenu(userReference, menuReference);
        CommentSaveResponse commentSaveResponse = new CommentSaveResponse(content);
        if (commentList.isEmpty()) {
            Comment savedComment = commentRepository.save(
                    new Comment(userReference, menuReference, content));
        } else {
            Comment comment = commentList.getFirst();
            comment.updateContent(content);
        }
        return commentSaveResponse;
    }

    @Transactional
    public void deleteComment(Long userId, Long menuId) {
        Comment comment = commentRepository.findByUserIdAndMenuId(userId, menuId);
        commentRepository.delete(comment);
    }
}
