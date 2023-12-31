const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const GetComment = require('../../../Domains/comments/entities/GetComment');

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
    it('should return added comment correctly', async () => {
      const addComment = new AddComment({
        threadId: 'thread-123',
        content: 'isi comment',
        owner: 'user-123',
      });
      const fakeIdGenerator = () => '123';
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, fakeIdGenerator);

      const addedComment = await commentRepositoryPostgres.addCommentThread(addComment);
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: 'comment-123',
          content: addComment.content,
          owner: addComment.owner,
        })
      );
    });
  });

  describe('verifyCommentAccess function', () => {
    it('should throw AuthorizationError when not owner', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', 'user-321')).rejects.toThrowError(AuthorizationError);
    });

    it('should return not throw error when owner is valid', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await expect(commentRepositoryPostgres.verifyCommentAccess('comment-123', 'user-123')).resolves.not.toThrowError(AuthorizationError);
    });
  });

  describe('getCommentById function', () => {
    it('should throw NotFoundError when comments not found', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.getCommentById('comment-312')).rejects.toThrowError(NotFoundError);
    });

    it('should return get comment by id correctly', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const commentId = await commentRepositoryPostgres.getCommentById('comment-123');
      expect(commentId).toEqual('comment-123');
    });
  });

  describe('getComment function', () => {
    it('should throw NotFoundError when comment not found', async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.getComment('thread-000')).rejects.toThrowError(NotFoundError);
    });

    it('should return get comment correctly', async () => {
      await UsersTableTestHelper.addUser({ id: 'user-321', username: 'zulva' });
      await CommentTableTestHelper.addComment({ id: 'comment-123', threadId: 'thread-123', owner: 'user-123', isDelete: false });
      await CommentTableTestHelper.addComment({ id: 'comment-321', username: 'zulva', owner: 'user-321', isDelete: true });

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      const comment = await commentRepositoryPostgres.getComment('thread-123');
      expect(comment[0]).toStrictEqual(
        new GetComment({
          id: 'comment-123',
          username: 'dicoding',
          date: '2023-09-25T11:52:48.150Z',
          content: 'isi comment',
          isDelete: false,
        })
      );
      expect(comment[1]).toStrictEqual(
        new GetComment({
          id: 'comment-321',
          username: 'zulva',
          date: '2023-09-25T11:52:48.150Z',
          content: '**komentar telah dihapus**',
          isDelete: true,
        })
      );
    });
  });

  describe('deleteComment function', () => {
    it('should throw AuthorizationError when deleting comment is not by owner', async () => {
      const comment = {
        threadId: 'thread-321',
        commentId: 'comment-321',
        owner: 'dicoding',
      };

      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await expect(commentRepositoryPostgres.verifyCommentAccess(comment)).rejects.toThrowError(AuthorizationError);
    });

    it('should return delete comment function correctly', async () => {
      await CommentTableTestHelper.addComment({ id: 'comment-123', owner: 'user-123' });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool);

      await commentRepositoryPostgres.deleteComment('comment-123');

      const comment = await CommentTableTestHelper.findCommentById('comment-123');
      expect(comment[0].is_delete).toEqual(true);
    });
  });
});
