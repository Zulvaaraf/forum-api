const GetComment = require('../GetComment');

describe('GetComment entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      content: 'isi comment',
    };

    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      username: ['johndoe'],
      date: 2022,
      content: 'test content',
      isDelete: false,
    };

    expect(() => new GetComment(payload)).toThrowError('GET_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create getComment object correctly', () => {
    const payload = {
      id: 'comment-123',
      username: 'zulva',
      content: 'isi comment',
      date: '2023-09-25T11:52:48.150Z',
      isDelete: false,
    };

    const getComment = new GetComment(payload);
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.username).toEqual(payload.username);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.content).toEqual(payload.content);
  });

  it('should create getComment object correctly when property isDelete is true', () => {
    const payload = {
      id: 'comment-123',
      username: 'zulva',
      content: 'isi comment',
      date: '2023-09-25T11:52:48.150Z',
      isDelete: true,
    };

    const getComment = new GetComment(payload);
    expect(getComment.id).toEqual(payload.id);
    expect(getComment.username).toEqual(payload.username);
    expect(getComment.date).toEqual(payload.date);
    expect(getComment.content).toEqual('**komentar telah dihapus**');
  });
});
