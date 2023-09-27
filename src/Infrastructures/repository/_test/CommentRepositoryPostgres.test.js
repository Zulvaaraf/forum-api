const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentTableTestHelper = require('../../../../tests/CommentTableTestHelper');
const CommentRepositoryPostgres = require('../CommentRepositoryPostgres');

const AddComment = require('../../../Domains/comments/entities/AddComment');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');

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
