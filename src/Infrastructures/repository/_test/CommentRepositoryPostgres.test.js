const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');

describe('CommentRepositoryPostgres', () => {
  beforeEach(async () => {
    await UsersTableTestHelper.addUser({});
    await ThreadsTableTestHelper.addThread({});
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
    await CommentTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('addComment function', () => {
    it('should presist and comment return added comment correctly', async () => {
      const newComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      await commentRepositoryPostgres.addCommentThread(newComment);

      const comments = await CommentTableTestHelper.findCommentById('comment-123');
      expect(comments).toHaveLength(1);
    });

    it('should return added comment correctly', async () => {
      const newComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addCommentThread(newComment);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: 'isi comment',
          owner: 'user-123',
        })
      );
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError when not owner', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', 'user-321')).rejects.toThrowError(AuthorizationError);
    });

    it('should return not throw error when owner is valid', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', 'user-123')).resolves.toBeUndefined();
    });
  });

  describe('getCommentByThreadId function', () => {
    it('should throw NotFoundError when comments not found', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.getCommentByThreadId('comment-312')).rejects.toThrowError(NotFoundError);
    });

    it('should not throw NotFoundError when comment found', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      const commentId = await commentRepositoryPostgres.getCommentByThreadId('comment-123');
      expect(commentId).toEqual('comment-123');
    });
  });

  describe('deleteComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.deleteComment('comment-321')).rejects.toThrowError(NotFoundError);
    });

    it('should return delete function correctly', async () => {
      await CommentTableTestHelper.addComment({
        id: 'comment-123',
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
        date: '2023-09-25T11:52:48.150Z',
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await commentRepositoryPostgres.deleteComment('comment-123');

      const comment = await CommentTableTestHelper.findCommentById('comment-123');
      expect(comment[0].is_delete).toEqual(true);
    });
  });
});
