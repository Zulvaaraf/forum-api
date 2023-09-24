const AddThread = require('../AddThread');

describe('a addThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'judul',
      body: 'isi body',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: true,
      owner: 'abc',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contain more than 50 character', () => {
    const payload = {
      title: 'threadsthreadsthreadsthreadsthreadsthreadsthreadsthreadsthreads',
      body: 'abc',
      owner: 'abc',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create newThread object correctly', () => {
    const payload = {
      title: 'judul',
      body: 'isi body',
      owner: 'user-123',
    };

    const { title, body, owner } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
