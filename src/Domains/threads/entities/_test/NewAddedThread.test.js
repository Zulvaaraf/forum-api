const NewAddedThread = require('../NewAddedThread');

describe('a NewAddedThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'abc',
      owner: 'test',
    };

    expect(() => new NewAddedThread(payload)).toThrowError('NEW_ADDED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      id: 123,
      title: {},
      owner: true,
    };

    expect(() => new NewAddedThread(payload)).toThrowError('NEW_ADDED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create newAddedThread object correctly', () => {
    const payload = {
      id: 'thread-123',
      title: 'Backend Developer',
      owner: 'zulva',
    };

    const { id, title, owner } = new NewAddedThread(payload);

    expect(id).toEqual(payload.id);
    expect(title).toEqual(payload.title);
    expect(owner).toEqual(payload.owner);
  });
});
