class GetDetailThreadUseCase {
  constructor({ threadRepository, commentRepository }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
  }

  async execute(useCasePayload) {
    const { threadId } = useCasePayload;
    const thread = await this._threadRepository.getDetailThread(threadId);
    const comments = await this._commentRepository.getComment(threadId);
    return { ...thread, comments };
  }
}

module.exports = GetDetailThreadUseCase;
