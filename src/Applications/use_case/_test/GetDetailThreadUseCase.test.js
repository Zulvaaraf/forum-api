const GetDetailThreadUseCase = require('../../use_case/GetDetailThreadUseCase');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');
const GetThread = require('../../../Domains/threads/entities/GetThread');
const GetComment = require('../../../Domains/comments/entities/GetComment');

describe('GetDetailThreadUseCase', () => {
  it('should orchestrating the get detail thread action correctly', async () => {
    const useCasePayload = {
      threadId: 'thread-123',
    };

    const expectGetComment = [
      new GetComment({
        id: 'comment-123',
        username: 'dicoding',
        date: '2023-09-25T11:52:48.150Z',
        content: 'isi comment',
        isDelete: false,
      }),
      new GetComment({
        id: 'comment-321',
        username: 'johndoe',
        date: '2023-09-25T11:52:48.150Z',
        content: 'isi comment',
        isDelete: true,
      }),
    ];

    const expectGetThread = new GetThread({
      id: 'thread-123',
      title: 'judul',
      body: 'isi body',
      date: '2023-09-25T11:52:48.150Z',
      username: 'dicoding',
      comments: expectGetComment,
    });

    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();

    mockCommentRepository.getComment = jest.fn().mockImplementation(() => Promise.resolve(expectGetComment));
    mockThreadRepository.getDetailThread = jest.fn().mockImplementation(() => Promise.resolve(expectGetThread));

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
    });

    const thread = await getDetailThreadUseCase.execute(useCasePayload);

    expect(mockCommentRepository.getComment).toBeCalledWith('thread-123');
    expect(mockThreadRepository.getDetailThread).toBeCalledWith('thread-123');
    expect(thread).toEqual(new GetThread({ ...expectGetThread, comments: expectGetComment }));
  });
});
