const AddComment = require('../AddComment');

describe('AddComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      threadId: 'thread-123',
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      threadId: [],
      content: true,
      owner: 123,
    };

    expect(() => new AddComment(payload)).toThrowError('ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment thread object correctly', () => {
    const payload = {
      threadId: 'thread-123',
      content: 'isi comment',
      owner: 'user-123',
    };

    const { threadId, content, owner } = new AddComment(payload);

    expect(threadId).toEqual(payload.threadId);
    expect(content).toEqual(payload.content);
    expect(owner).toEqual(payload.owner);
  });
});
