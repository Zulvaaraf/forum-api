const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

const pool = require('../../database/postgres/pool');
const AddThread = require('../../../Domains/threads/entities/AddThread');
const AddedThread = require('../../../Domains/threads/entities/AddedThread');
const ThreadRepositoryPostgres = require('../ThreadRepositoryPostgres');

const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('ThreadRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
  });
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addThread function', () => {
    it('should persist add thread and return added thread correctly', async () => {
      const newThread = new AddThread({
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await threadRepositoryPostgres.addThread(newThread);

      const threads = await ThreadsTableTestHelper.findThreadById('thread-123');
      expect(threads).toHaveLength(1);
    });

    it('should return added thread correctly', async () => {
      const newThread = new AddThread({
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      const addedThread = await threadRepositoryPostgres.addThread(newThread);
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'judul',
          owner: 'user-123',
        })
      );
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread id not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      await expect(threadRepositoryPostgres.getThreadById('thread-321')).rejects.toThrowError(NotFoundError);
    });

    it('should return thread by id correctly', async () => {
      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });

      const fakeIdGenerator = () => '123';
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, fakeIdGenerator);

      await expect(threadRepositoryPostgres.getThreadById('thread-123')).resolves.not.toThrowError(NotFoundError);
    });
  });

  describe('getDetailThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool);

      await expect(threadRepositoryPostgres.getDetailThread('thread-111')).rejects.toThrowError(NotFoundError);
    });

    it('should return detail thread correctly', async () => {
      const expectedThread = {
        id: 'thread-123',
        title: 'title thread',
        body: 'body thread',
        date: '2023-09-25T11:52:48.150Z',
        username: 'dicoding',
      };

      await ThreadsTableTestHelper.addThread({ id: 'thread-123', owner: 'user-123' });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const getDetailThread = await threadRepositoryPostgres.getDetailThread('thread-123');

      expect(getDetailThread).toStrictEqual(expectedThread);
      expect(getDetailThread).toHaveProperty('id', 'thread-123');
      expect(getDetailThread).toHaveProperty('title', 'title thread');
      expect(getDetailThread).toHaveProperty('body', 'body thread');
      expect(getDetailThread).toHaveProperty('date', '2023-09-25T11:52:48.150Z');
      expect(getDetailThread).toHaveProperty('username', 'dicoding');
    });
  });
});
