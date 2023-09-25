const CommentRepository = require('../CommentRepository');

describe('CommentRepository interfacce', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const commentRepository = new CommentRepository();

    await expect(commentRepository.addCommentThread({})).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.verifyCommentAccess('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.getCommentByThreadId('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(commentRepository.deleteComment('')).rejects.toThrowError('COMMENT_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
