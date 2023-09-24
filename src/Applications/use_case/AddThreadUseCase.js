const AddThread = require('../../Domains/threads/entities/AddThread');

class ThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    const newThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(newThread);
  }
}

module.exports = ThreadUseCase;
