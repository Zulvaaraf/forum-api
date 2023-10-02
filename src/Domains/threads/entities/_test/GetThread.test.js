const GetThread = require('../GetThread');

describe('a getThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'judul',
    };

    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: 'judul',
      body: true,
      date: '2023-09-25T11:52:48.150Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023-09-25T11:52:48.150Z',
          content: 'isi comment',
          isDelete: false,
        },
      ],
    };

    expect(() => new GetThread(payload)).toThrowError('GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create getThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'judul',
      body: 'isi body',
      date: '2023-09-25T11:52:48.150Z',
      username: 'dicoding',
      comments: [
        {
          id: 'comment-123',
          username: 'dicoding',
          date: '2023-09-25T11:52:48.150Z',
          content: 'isi comment',
          isDelete: false,
        },
      ],
    };

    const getThread = new GetThread(payload);
    expect(getThread.id).toEqual(payload.id);
    expect(getThread.title).toEqual(payload.title);
    expect(getThread.body).toEqual(payload.body);
    expect(getThread.date).toEqual(payload.date);
    expect(getThread.username).toEqual(payload.username);
    expect(getThread.comments).toEqual(payload.comments);
  });
});
