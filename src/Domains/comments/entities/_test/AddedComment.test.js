const AddedComment = require('../AddedComment');

describe('AddedComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      id: 'comment-123',
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: [],
      content: 123,
      owner: true,
    };

    expect(() => new AddedComment(payload)).toThrowError('ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create comment thread object correctly', () => {
    const payload = {
      id: 'comment-123',
      content: 'isi comment',
      owner: 'user-123',
    };

    const addedComment = new AddedComment(payload);
    expect(addedComment.id).toEqual(payload.id);
    expect(addedComment.content).toEqual(payload.content);
    expect(addedComment.owner).toEqual(payload.owner);
  });
});
