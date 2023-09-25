const AddComment = require('../../Domains/comments/entities/AddComment');

class AddCommentUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }
  async execute(useCasePayload) {
    const comment = new AddComment(useCasePayload);
    await this._threadRepository.verifyThreadExist(useCasePayload.threadId);
    return this._commentRepository.addCommentThread(comment);
  }
}

module.exports = AddCommentUseCase;
