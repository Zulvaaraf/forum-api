const ThreadUseCase = require('../ThreadUseCase');
const NewThread = require('../../../Domains/threads/entities/NewThread');
const NewAddedThread = require('../../../Domains/threads/entities/NewAddedThread');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');

describe('ThreadUseCase', () => {
  describe('Add Thread', () => {
    it('should orchestrating the add thread action correctly', async () => {
      const useCasePayload = {
        title: 'judul',
        body: 'isi body',
        owner: 'test',
      };

      const mockNewAddedThread = new NewAddedThread({
        id: 'thread-123',
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      });

      const mockThreadRepository = new ThreadRepository();

      mockThreadRepository.addThread = jest.fn(() => Promise.resolve(mockNewAddedThread));

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
      });

      const newAddedThread = await threadUseCase.addThread(useCasePayload);

      expect(newAddedThread).toStrictEqual(
        new NewAddedThread({
          id: 'thread-123',
          title: useCasePayload.title,
          owner: useCasePayload.owner,
        })
      );

      expect(mockThreadRepository.addThread).toBeCalledWith(
        new NewThread({
          title: useCasePayload.title,
          body: useCasePayload.body,
          owner: useCasePayload.owner,
        })
      );
    });
  });
});
