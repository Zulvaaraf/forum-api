const NewThread = require('../../Domains/threads/entities/NewThread');

class ThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async addThread(useCasePayload) {
    const newThread = new NewThread(useCasePayload);
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = ThreadUseCase;
