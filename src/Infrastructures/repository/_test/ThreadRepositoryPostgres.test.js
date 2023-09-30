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

      const newAddedThread = await threadRepositoryPostgres.addThread(newThread);

      expect(newAddedThread).toStrictEqual(
        new AddedThread({
          id: 'thread-123',
          title: 'judul',
          owner: 'user-123',
        })
      );
    });
  });

  describe('getThreadById function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getThreadById('thread-321')).rejects.toThrowError(NotFoundError);
    });

    it('should return not throw error when thread found', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const threadId = await threadRepositoryPostgres.getThreadById('thread-123');
      expect(threadId).toEqual('thread-123');
    });
  });

  describe('getDetailThread function', () => {
    it('should throw NotFoundError when thread not found', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await expect(threadRepositoryPostgres.getDetailThread('thread-111')).rejects.toThrowError(NotFoundError);
    });

    it('should return not throw error when thread found', async () => {
      await ThreadsTableTestHelper.addThread({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const threadId = await threadRepositoryPostgres.getDetailThread('thread-123');

      expect(threadId).toStrictEqual({
        id: 'thread-123',
        title: 'judul',
        body: 'isi body',
        date: '2023-09-25T11:52:48.150Z',
        username: 'dicoding',
      });
    });
  });
});
